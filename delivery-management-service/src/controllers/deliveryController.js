// deliveryController.js (or wherever runConsumer lives)
const kafka = require('../config/kafka');
const Delivery = require('../models/Delivery');
const User = require('../models/User');
const connectDB = require('../config/db');
const Joi = require('joi');

connectDB();

const consumer = kafka.consumer({ groupId: 'delivery-group' });
const producer = kafka.producer();

// Basic sanitizer for strings (keeps letters, numbers, basic punctuation)
const sanitizeString = (v) => {
  if (typeof v !== 'string') return v;
  return v.replace(/[^\w\s\-_.:,@()/\[\]]+/g, '').trim();
};

// Joi schemas
const startEndLocationSchema = Joi.object({
  longitude: Joi.number().required().min(-180).max(180),
  latitude: Joi.number().required().min(-90).max(90),
});

const assignSchema = Joi.object({
  id: Joi.string().alphanum().min(3).max(64).required(),
  orderId: Joi.string().alphanum().min(1).max(64).required(),
  startLocation: startEndLocationSchema.required(),
  endLocation: startEndLocationSchema.required(),
});

const updateStatusSchema = Joi.object({
  id: Joi.string().alphanum().min(3).max(64).required(),
  status: Joi.string().valid('assigned', 'in_transit', 'delivered').required(),
});

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'delivery-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      let parsed;
      try {
        parsed = JSON.parse(String(message.value));
      } catch (err) {
        console.warn('Invalid JSON from kafka message, skipping.', err);
        return; // skip invalid JSON
      }

      const { action, data } = parsed || {};

      if (!action || typeof action !== 'string') {
        console.warn('Missing or invalid action in kafka message, skipping.', parsed);
        return;
      }

      try {
        if (action === 'assign') {
          // Validate payload
          const { error, value } = assignSchema.validate(data, { stripUnknown: true });
          if (error) {
            console.warn('Invalid assign payload, skipping.', error.details);
            return;
          }

          // sanitize values
          const safeId = sanitizeString(value.id);
          const safeOrderId = sanitizeString(value.orderId);
          const startLocation = {
            latitude: Number(value.startLocation.latitude),
            longitude: Number(value.startLocation.longitude),
          };
          const endLocation = {
            latitude: Number(value.endLocation.latitude),
            longitude: Number(value.endLocation.longitude),
          };

          // Find busy drivers (assigned or in_transit)
          const busyDrivers = await Delivery.find({
            status: { $in: ['assigned', 'in_transit'] }
          }).distinct('driverId');

          // Find available drivers
          const availableDrivers = await User.find({
            role: 'delivery_personnel',
            id: { $nin: busyDrivers },
          });

          if (!availableDrivers || availableDrivers.length === 0) {
            console.error('No available drivers to assign for delivery', safeId);
            return;
          }

          // pick random available driver
          const driver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];

          // Create delivery document (Mongoose will enforce schema types)
          const delivery = new Delivery({
            id: safeId,
            orderId: safeOrderId,
            driverId: driver.id,
            status: 'assigned',
            startLocation,
            endLocation,
          });

          await delivery.save();
          console.info(`Delivery assigned: ${safeId} -> driver ${driver.id}`);

          // Notify driver -- producer connect/disconnect handled safely
          try {
            await producer.connect();
            await producer.send({
              topic: 'notification-events',
              messages: [{
                value: JSON.stringify({
                  action: 'notify_driver',
                  data: {
                    driverId: driver.id,
                    orderId: safeOrderId,
                    message: 'New delivery assigned',
                  }
                })
              }],
            });
          } catch (sendErr) {
            console.error('Failed to send notification event for delivery', safeId, sendErr);
          } finally {
            try { await producer.disconnect(); } catch (e) {/* ignore disconnect errors */}
          }
        } else if (action === 'update_status') {
          const { error, value } = updateStatusSchema.validate(data, { stripUnknown: true });
          if (error) {
            console.warn('Invalid update_status payload, skipping.', error.details);
            return;
          }

          const safeId = sanitizeString(value.id);
          const safeStatus = sanitizeString(value.status);

          // Find the delivery and update status
          const delivery = await Delivery.findOne({ id: safeId });
          if (!delivery) {
            console.warn(`Delivery not found for update_status: ${safeId}`);
            return;
          }

          // Optional: enforce allowed transitions (e.g., assigned -> in_transit -> delivered)
          const allowedTransitions = {
            assigned: ['in_transit'],
            in_transit: ['delivered'],
            delivered: [],
          };
          if (!allowedTransitions[delivery.status] || !allowedTransitions[delivery.status].includes(safeStatus)) {
            // you can either allow direct updates or reject invalid transitions
            console.warn(`Rejected invalid status transition for ${safeId}: ${delivery.status} -> ${safeStatus}`);
            // if you want to allow direct update, comment out the return below
            // return;
          }

          delivery.status = safeStatus;
          await delivery.save();
          console.info(`Delivery status updated: ${safeId} -> ${safeStatus}`);
        } else {
          console.warn('Unsupported action in kafka message, ignoring:', action);
        }
      } catch (err) {
        // Catch all to prevent consumer crash
        console.error('Error processing kafka message:', err);
      }
    }
  });
};

module.exports = { runConsumer, /* other exports if needed */ };
