const kafka = require("../config/kafka");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const connectDB = require("../config/db");

connectDB();

const consumer = kafka.consumer({ groupId: "restaurant-group" });

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: ["menu-events", "restaurant-events"],
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const { action, data } = JSON.parse(message.value);

      if (topic === "menu-events") {
        if (action === "create") {
          const menuItem = new MenuItem({
            id: data.id,
            restaurantId: data.restaurantId,
            name: data.name,
            price: data.price,
            description: data.description,
          });
          await menuItem.save();
          console.log(`Menu item created: ${data.name}`);
        } else if (action === "update") {
          await MenuItem.updateOne(
            { id: data.id },
            {
              name: data.name,
              price: data.price,
              description: data.description,
            }
          );
          console.log(`Menu item updated: ${data.id}`);
        } else if (action === "delete") {
          await MenuItem.deleteOne({ id: data.id });
          console.log(`Menu item deleted: ${data.id}`);
        }
      } else if (topic === "restaurant-events") {
        try {
          switch (action) {
            case "create":
              const restaurantLocation = {
                address: data["location.address"],
                latitude: parseFloat(data["location.latitude"]),
                longitude: parseFloat(data["location.longitude"]),
              };

              const restaurant = new Restaurant({
                id: data.id,
                name: data.name,
                location: restaurantLocation,
                cuisine: data.cuisine,
                rating: data.rating,
                reviews: data.reviews,
                openingHours: data.openingHours,
                image: data.image,
              });
              await restaurant.save();
              console.log(`Restaurant created: ${data.name}`);
              break;

            case "update":
              const updatedRestaurant = await Restaurant.findOneAndUpdate(
                { id: data.id },
                data.updateData,
                { new: true }
              );
              console.log(`Restaurant updated: ${data.id}`);
              break;

            case "delete":
              await Restaurant.findOneAndDelete({ id: data.id });
              console.log(`Restaurant deleted: ${data.id}`);
              break;

            case "update_availability":
              await Restaurant.updateOne(
                { id: data.id },
                { available: data.available }
              );
              console.log(`Restaurant availability updated: ${data.id}`);
              break;
          }
        } catch (error) {
          console.error(`Error processing restaurant event: ${error.message}`);
        }
      }
    },
  });
};

const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findOne({ id });
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.status(200).json({ data: restaurant });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json({ data: restaurants });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  runConsumer,
  getRestaurantById,
  getAllRestaurants,
};
