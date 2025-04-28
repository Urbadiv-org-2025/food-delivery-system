const express = require("express");
const axios = require("axios");
const kafka = require("../config/kafka");
const authenticate = require("../middleware/auth");
const restrictTo = require("../middleware/restrict");
const { restaurantUpload, menuUpload } = require("../middleware/upload");

const router = express.Router();
const producer = kafka.producer();

router.post("/users/register", async (req, res) => {
  try {
    await producer.connect();
    const userData = { ...req.body, id: Date.now().toString() };
    await producer.send({
      topic: "user-events",
      messages: [
        { value: JSON.stringify({ action: "register", data: userData }) },
      ],
    });
    await producer.disconnect();
    res.status(201).json({ message: "User registration request sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:3001/api/login",
      req.body
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get(
  "/users/:id",
  authenticate,
  restrictTo("admin"),
  async (req, res) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/users/${req.params.id}`
      );
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post(
  "/menu",
  authenticate,
  restrictTo("restaurant_admin"),
  menuUpload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Image file is required!" });
      }

      await producer.connect();
      const menuData = {
        ...req.body,
        restaurantId: req.user.id,
        id: Date.now().toString(),
        image: `/uploads/menu-items/${req.file.filename}`,
      };

      // Add validation logging
      console.log("Creating menu item with data:", menuData);

      // Ensure all required fields are present
      if (!menuData.name || !menuData.price || !menuData.category) {
        return res.status(400).json({
          error:
            "Missing required fields: name, price, and category are required",
        });
      }

      // Add price validation
      if (isNaN(menuData.price) || menuData.price <= 0) {
        return res.status(400).json({
          error: "Price must be a positive number",
        });
      }

      // Add ingredients validation
      if (
        !Array.isArray(menuData.ingredients) ||
        menuData.ingredients.length === 0
      ) {
        return res.status(400).json({
          error: "At least one ingredient is required",
        });
      }

      // Validate dietary restrictions
      const validRestrictions = ["vegetarian", "vegan", "Non-Veg", "nut-free"];
      if (
        menuData.dietaryRestrictions &&
        !validRestrictions.includes(menuData.dietaryRestrictions)
      ) {
        return res.status(400).json({
          error: "Invalid dietary restriction value",
        });
      }

      await producer.send({
        topic: "menu-events",
        messages: [
          { value: JSON.stringify({ action: "create", data: menuData }) },
        ],
      });
      await producer.disconnect();
      res.status(201).json({
        message: "Menu item creation request sent",
        data: menuData,
      });
    } catch (err) {
      console.error("Error in menu post route:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/menu/:id",
  authenticate,
  restrictTo("restaurant_admin"),
  menuUpload.single("image"),
  async (req, res) => {
    try {
      const menuData = {
        ...req.body,
        id: req.params.id,
        restaurantId: req.user.id,
      };

      if (req.file) {
        menuData.image = `/uploads/menu-items/${req.file.filename}`;
      }

      await producer.connect();
      await producer.send({
        topic: "menu-events",
        messages: [
          { value: JSON.stringify({ action: "update", data: menuData }) },
        ],
      });
      await producer.disconnect();
      res.json({ message: "Menu item update request sent" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/menu/:id",
  authenticate,
  restrictTo("restaurant_admin"),
  async (req, res) => {
    try {
      await producer.connect();
      const menuData = { id: req.params.id, restaurantId: req.user.id };
      await producer.send({
        topic: "menu-events",
        messages: [
          { value: JSON.stringify({ action: "delete", data: menuData }) },
        ],
      });
      await producer.disconnect();
      res.json({ message: "Menu item deletion request sent" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get("/menu/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/api/menu/${req.params.id}`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/restaurants/:restaurantId/menu", async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/api/restaurants/${req.params.restaurantId}/menu`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/restaurants/:restaurantId/menu/available", async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/api/restaurants/${req.params.restaurantId}/menu/available`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put(
  "/restaurants/:id/availability",
  authenticate,
  restrictTo("restaurant_admin"),
  async (req, res) => {
    try {
      // First verify if the restaurant belongs to this admin
      const response = await axios.get(
        `http://localhost:3002/api/restaurants/${req.params.id}`
      );

      const restaurant = response.data.data;
      if (restaurant.restaurantAdminId !== req.user.id) {
        return res.status(403).json({
          error: "You are not authorized to update this restaurant",
        });
      }

      await producer.connect();
      const availabilityData = {
        id: req.params.id,
        restaurantAdminId: req.user.id,
        available: req.body.available,
      };
      await producer.send({
        topic: "restaurant-events",
        messages: [
          {
            value: JSON.stringify({
              action: "update_availability",
              data: availabilityData,
            }),
          },
        ],
      });
      await producer.disconnect();
      res.json({ message: "Restaurant availability update request sent" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post(
  "/orders",
  authenticate,
  restrictTo("customer"),
  async (req, res) => {
    try {
      await producer.connect();
      const orderData = {
        ...req.body,
        customerId: req.user.id,
        id: Date.now().toString(),
        status: "pending",
        email: req.user.email,
      };
      await producer.send({
        topic: "order-events",
        messages: [
          { value: JSON.stringify({ action: "create", data: orderData }) },
        ],
      });
      await producer.disconnect();
      res.status(201).json({
        message: "Order creation request sent",
        orderId: orderData.id,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/orders/:id",
  authenticate,
  restrictTo("customer"),
  async (req, res) => {
    try {
      await producer.connect();
      const orderData = {
        ...req.body,
        id: req.params.id,
        customerId: req.user.id,
        email: req.user.email,
      };
      await producer.send({
        topic: "order-events",
        messages: [
          { value: JSON.stringify({ action: "update", data: orderData }) },
        ],
      });
      await producer.disconnect();
      res.json({ message: "Order update request sent" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/orders/:id",
  authenticate,
  restrictTo("customer"),
  async (req, res) => {
    try {
      await producer.connect();
      const orderData = {
        id: req.params.id,
        customerId: req.user.id,
        email: req.user.email,
      };
      await producer.send({
        topic: "order-events",
        messages: [
          { value: JSON.stringify({ action: "cancel", data: orderData }) },
        ],
      });
      await producer.disconnect();
      res.json({ message: "Order cancellation request sent" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post(
  "/orders/:id/confirm",
  authenticate,
  restrictTo("customer"),
  async (req, res) => {
    try {
      const { paymentId, restaurantId } = req.body;
      if (!paymentId) {
        return res.status(400).json({ error: "Payment ID required" });
      }
      await producer.connect();
      const orderData = {
        id: req.params.id,
        paymentId,
        restaurantId,
        orderId: req.params.id,
      };
      // Trigger payment confirmation
      await producer.send({
        topic: "payment-events",
        messages: [
          {
            value: JSON.stringify({
              action: "confirm",
              data: { paymentId, orderId: req.params.id },
            }),
          },
        ],
      });
      // Trigger order confirmation
      await producer.send({
        topic: "order-events",
        messages: [
          { value: JSON.stringify({ action: "confirm", data: orderData }) },
        ],
      });
      await producer.disconnect();
      res.json({ message: "Order and payment confirmation request sent" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get(
  "/orders/:id",
  authenticate,
  restrictTo("customer", "restaurant_admin", "delivery_personnel"),
  async (req, res) => {
    try {
      const response = await axios.get(
        `http://localhost:3003/api/orders/${req.params.id}`
      );
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post(
  "/orders/:id/prepare",
  authenticate,
  restrictTo("restaurant_admin"),
  async (req, res) => {
    try {
      await producer.connect();
      const orderData = {
        id: req.params.id,
        restaurantId: req.user.id,
        email: req.body.customerEmail,
      };
      await producer.send({
        topic: "order-events",
        messages: [
          { value: JSON.stringify({ action: "prepare", data: orderData }) },
        ],
      });
      await producer.disconnect();
      res.json({ message: "Order preparation request sent" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post(
  "/orders/:id/ready",
  authenticate,
  restrictTo("restaurant_admin"),
  async (req, res) => {
    try {
      await producer.connect();
      const orderData = { id: req.params.id, restaurantId: req.user.id };
      await producer.send({
        topic: "order-events",
        messages: [
          { value: JSON.stringify({ action: "ready", data: orderData }) },
        ],
      });
      await producer.disconnect();
      res.json({ message: "Order ready request sent" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post(
  "/orders/:id/cancel",
  authenticate,
  restrictTo("restaurant_admin"),
  async (req, res) => {
    try {
      await producer.connect();
      const orderData = {
        id: req.params.id,
        restaurantId: req.user.id,
        email: req.body.customerEmail,
      };
      await producer.send({
        topic: "order-events",
        messages: [
          { value: JSON.stringify({ action: "cancel", data: orderData }) },
        ],
      });
      await producer.disconnect();
      res.json({ message: "Order cancellation request sent" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post(
  "/orders/:id/deliver",
  authenticate,
  restrictTo("delivery_personnel"),
  async (req, res) => {
    try {
      await producer.connect();
      const orderData = { id: req.params.id, email: req.body.customerEmail };
      await producer.send({
        topic: "order-events",
        messages: [
          { value: JSON.stringify({ action: "deliver", data: orderData }) },
        ],
      });
      await producer.disconnect();
      res.json({ message: "Order delivery request sent" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get(
  "/orders",
  authenticate,
  restrictTo("customer"),
  async (req, res) => {
    try {
      const { status } = req.query;
      const response = await axios.get("http://localhost:3003/api/orders", {
        params: { customerId: req.user.id, status },
      });
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post(
  "/deliveries",
  authenticate,
  restrictTo("customer"),
  async (req, res) => {
    try {
      await producer.connect();
      const deliveryData = {
        ...req.body,
        orderId: req.body.orderId,
        id: Date.now().toString(),
      };
      await producer.send({
        topic: "delivery-events",
        messages: [
          { value: JSON.stringify({ action: "assign", data: deliveryData }) },
        ],
      });
      await producer.disconnect();
      res.status(201).json({ message: "Delivery assignment request sent" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get(
  "/deliveries/:id",
  authenticate,
  restrictTo("customer", "delivery_personnel"),
  async (req, res) => {
    try {
      const response = await axios.get(
        `http://localhost:3004/api/deliveries/${req.params.id}`
      );
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post(
  "/payments",
  authenticate,
  restrictTo("customer"),
  async (req, res) => {
    try {
      console.log(req.body);
      const response = await axios.post(
        "http://localhost:3005/api/payments",
        req.body
      );
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post(
  "/refunds",
  authenticate,
  restrictTo("restaurant_admin", "admin"),
  async (req, res) => {
    try {
      const response = await axios.post(
        "http://localhost:3005/api/refunds",
        req.body
      );
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post(
  "/restaurants",
  authenticate,
  restrictTo("restaurant_admin"),
  restaurantUpload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Image file is required!" });
      }

      // Validate required fields
      const requiredFields = [
        "name",
        "location.address",
        "location.latitude",
        "location.longitude",
        "cuisine",
        "openingHours",
      ];
      const missingFields = requiredFields.filter((field) => {
        if (field.includes(".")) {
          const [parent, child] = field.split(".");
          return !req.body[parent] || !req.body[parent][child];
        }
        return !req.body[field];
      });

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      await producer.connect();
      const restaurantData = {
        ...req.body,
        id: Date.now().toString(),
        restaurantAdminId: req.user.id,
        image: `/uploads/restaurants/${req.file.filename}`,
        available: true,
      };

      console.log("Creating restaurant with data:", restaurantData);

      await producer.send({
        topic: "restaurant-events",
        messages: [
          { value: JSON.stringify({ action: "create", data: restaurantData }) },
        ],
      });
      await producer.disconnect();
      res.status(201).json({
        message: "Restaurant creation request sent",
        data: restaurantData,
      });
    } catch (err) {
      console.error("Error creating restaurant:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/restaurants/:id",
  authenticate,
  restrictTo("restaurant_admin"),
  restaurantUpload.single("image"),
  async (req, res) => {
    try {
      const response = await axios.get(
        `http://localhost:3002/api/restaurants/${req.params.id}`
      );

      const restaurant = response.data.data;
      if (restaurant.restaurantAdminId !== req.user.id) {
        return res.status(403).json({
          error: "You are not authorized to update this restaurant",
        });
      }

      const updateData = { ...req.body };
      if (req.file) {
        updateData.image = `/uploads/restaurants/${req.file.filename}`;
      }

      await producer.connect();
      await producer.send({
        topic: "restaurant-events",
        messages: [
          {
            value: JSON.stringify({
              action: "update",
              data: {
                id: req.params.id,
                restaurantAdminId: req.user.id,
                updateData,
              },
            }),
          },
        ],
      });
      await producer.disconnect();
      res.json({ message: "Restaurant update request sent" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/restaurants/:id",
  authenticate,
  restrictTo("admin", "restaurant_admin"),
  async (req, res) => {
    try {
      await producer.connect();
      await producer.send({
        topic: "restaurant-events",
        messages: [
          {
            value: JSON.stringify({
              action: "delete",
              data: { id: req.params.id },
            }),
          },
        ],
      });
      await producer.disconnect();
      res.json({ message: "Restaurant deletion request sent" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Add these routes before the existing restaurant routes
router.get("/restaurants/filter", async (req, res) => {
  try {
    const { cuisine, available, menuCategory } = req.query;
    const response = await axios.get(
      "http://localhost:3002/api/restaurants/filter",
      {
        params: {
          cuisine,
          available,
          menuCategory,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/restaurants/nearby", async (req, res) => {
  try {
    const { latitude, longitude, maxDistance } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: "Latitude and longitude are required",
      });
    }

    const response = await axios.get(
      "http://localhost:3002/api/restaurants/nearby",
      {
        params: {
          latitude,
          longitude,
          maxDistance,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add this new route for getting available restaurants
router.get("/restaurants/available", async (req, res) => {
  try {
    const response = await axios.get(
      "http://localhost:3002/api/restaurants/available"
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get(
  "/admin/restaurants",
  authenticate,
  restrictTo("restaurant_admin"),
  async (req, res) => {
    try {
      const response = await axios.get(
        `http://localhost:3002/api/restaurants/admin/${req.user.id}`
      );
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Keep the existing routes for getting restaurants
router.get("/restaurants/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/api/restaurants/${req.params.id}`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/restaurants", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:3002/api/restaurants");
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
