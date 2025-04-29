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
router.get("/users", authenticate, restrictTo("admin"), async (req, res) => {
  try {
    const response = await axios.get("http://localhost:3001/api/users");
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete(
  "/users/:id",
  authenticate,
  restrictTo("admin"),
  async (req, res) => {
    try {
      const response = await axios.delete(
        `http://localhost:3001/api/users/${req.params.id}`
      );

      res.json(response.data);
    } catch (err) {
      console.log("hit");

      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/users/:id",
  authenticate,
  restrictTo("admin"),
  async (req, res) => {
    try {
      const response = await axios.put(
        `http://localhost:3001/api/users/${req.params.id}`,
        req.body
      );
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);
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

      // ✅ Parse ingredients if needed
      let ingredients = req.body.ingredients;
      if (typeof ingredients === "string") {
        try {
          ingredients = JSON.parse(ingredients);
        } catch (err) {
          return res.status(400).json({ error: "Invalid ingredients format." });
        }
      }

      // ✅ Parse dietaryRestrictions if needed
      let dietaryRestrictions = req.body.dietaryRestrictions;
      if (typeof dietaryRestrictions === "string") {
        try {
          dietaryRestrictions = JSON.parse(dietaryRestrictions);
        } catch (err) {
          return res
            .status(400)
            .json({ error: "Invalid dietaryRestrictions format." });
        }
      }

      // ✅ Validation
      const validRestrictions = ["vegetarian", "vegan", "Non-Veg", "nut-free"];
      if (
        dietaryRestrictions.some(
          (restriction) => !validRestrictions.includes(restriction)
        )
      ) {
        return res
          .status(400)
          .json({ error: "Invalid dietary restriction value" });
      }

      await producer.connect();
      const menuData = {
        ...req.body,
        id: Date.now().toString(),
        image: `/uploads/menu-items/${req.file.filename}`,
        ingredients: ingredients,
        dietaryRestrictions: dietaryRestrictions,
      };

      console.log("Creating menu item with data:", menuData);

      if (!menuData.name || !menuData.price || !menuData.category) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      if (isNaN(menuData.price) || menuData.price <= 0) {
        return res
          .status(400)
          .json({ error: "Price must be a positive number" });
      }

      await producer.send({
        topic: "menu-events",
        messages: [
          { value: JSON.stringify({ action: "create", data: menuData }) },
        ],
      });

      await producer.disconnect();
      res
        .status(201)
        .json({ message: "Menu item creation request sent", data: menuData });
    } catch (err) {
      console.error("Error creating menu item:", err);
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
      const { amount, currency, orderId } = req.body;
      if (!amount || !currency || !orderId) {
        return res
          .status(400)
          .json({ error: "Amount, currency, and orderId required" });
      }
      const response = await axios.post("http://localhost:3005/api/payments", {
        amount,
        currency,
        orderId,
      });
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
      const { paymentId, orderId } = req.body;
      if (!paymentId || !orderId) {
        return res
          .status(400)
          .json({ error: "Payment ID and orderId required" });
      }
      const response = await axios.post("http://localhost:3005/api/refunds", {
        paymentId,
        orderId,
      });
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

      console.log("Request body:", req.body); // Debug log

      // Handle both nested and flat location data structures
      let location = {};

      // Check for nested location object
      if (req.body.location && typeof req.body.location === "string") {
        try {
          location = JSON.parse(req.body.location);
        } catch (err) {
          console.error("Error parsing location:", err);
        }
      } else if (req.body.location && typeof req.body.location === "object") {
        location = req.body.location;
      } else {
        // Try flat structure
        location = {
          address: req.body["location.address"],
          latitude: req.body["location.latitude"],
          longitude: req.body["location.longitude"],
        };
      }

      // Ensure location values are properly formatted
      const formattedLocation = {
        address: location.address || "",
        latitude: parseFloat(location.latitude) || 0,
        longitude: parseFloat(location.longitude) || 0,
      };

      // Validate location data
      if (
        !formattedLocation.address ||
        !formattedLocation.latitude ||
        !formattedLocation.longitude
      ) {
        console.log("Invalid location data:", formattedLocation); // Debug log
        return res.status(400).json({
          error:
            "Missing required location fields: address, latitude, and longitude",
          receivedData: formattedLocation,
        });
      }

      // Validate other required fields
      const requiredFields = ["name", "cuisine", "openingHours"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const restaurantData = {
        ...req.body,
        id: Date.now().toString(),
        restaurantAdminId: req.user.id,
        image: `/uploads/restaurants/${req.file.filename}`,
        available: true,
        location: formattedLocation,
      };

      // Remove any flat location fields if they exist
      delete restaurantData["location.address"];
      delete restaurantData["location.latitude"];
      delete restaurantData["location.longitude"];

      console.log("Final restaurant data:", restaurantData); // Debug log

      await producer.connect();
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
      console.log("Update request for restaurant:", req.params.id);
      console.log("Update data:", req.body);

      // Prepare update data
      const updateData = { ...req.body };

      // Handle location data if present
      if (
        req.body["location.address"] ||
        req.body["location.latitude"] ||
        req.body["location.longitude"]
      ) {
        updateData.location = {
          address: req.body["location.address"],
          latitude: req.body["location.latitude"],
          longitude: req.body["location.longitude"],
        };

        // Remove the dot notation fields to avoid duplicates
        delete updateData["location.address"];
        delete updateData["location.latitude"];
        delete updateData["location.longitude"];
      }

      // Handle image if present
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
                updateData: updateData,
              },
            }),
          },
        ],
      });
      await producer.disconnect();
      res.json({
        message: "Restaurant update request sent",
        data: updateData,
      });
    } catch (err) {
      console.error("Error updating restaurant:", err);
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

router.get("/restaurants/filter", async (req, res) => {
  try {
    const { cuisine, available, menuCategory } = req.query;

    console.log("Filter request params:", {
      cuisine,
      available,
      menuCategory,
    });

    // Build params cleanly: only include non-empty ones
    const params = {};

    if (cuisine) params.cuisine = cuisine;
    if (available) params.available = available;
    if (menuCategory) params.menuCategory = menuCategory;

    console.log("Final params sent to restaurant-service:", params);

    // The restaurant service API has the structure /api/restaurants/filter
    const response = await axios.get(
      "http://localhost:3002/api/restaurants/filter",
      { params }
    );

    // Return the response data from the restaurant service
    res.json(response.data);
  } catch (err) {
    console.error("Error in filter restaurants:", err);
    if (err.response?.data) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to filter restaurants",
        details: err.message,
      });
    }
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

// Add this new route after the restaurant routes
router.put(
  "/restaurants/:id/approve",
  authenticate,
  restrictTo("admin"),
  async (req, res) => {
    try {
      await producer.connect();
      const approvalData = {
        id: req.params.id,
        adminAccept: true,
      };

      await producer.send({
        topic: "restaurant-events",
        messages: [
          {
            value: JSON.stringify({
              action: "admin_approve",
              data: approvalData,
            }),
          },
        ],
      });

      await producer.disconnect();
      res.json({
        message: "Restaurant approval request sent",
        data: approvalData,
      });
    } catch (err) {
      console.error("Error approving restaurant:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Delivery Management
router.post(
  "/deliveries",
  authenticate,
  restrictTo("customer", "delivery_personnel"),
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

router.get(
  "/deliveriesorder/:orderId",
  authenticate,
  restrictTo("customer", "delivery_personnel"),
  async (req, res) => {
    try {
      const response = await axios.get(
        `http://localhost:3004/api/deliveriesorder/${req.params.orderId}`
      );
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get(
  "/deliveriesdriver/:driverId",
  authenticate,
  restrictTo("customer", "delivery_personnel"),
  async (req, res) => {
    try {
      const response = await axios.get(
        `http://localhost:3004/api/deliveriesdriver/${req.params.driverId}`
      );
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get(
  "/deliveriesdriver/current/:driverId",
  authenticate,
  restrictTo("customer", "delivery_personnel"),
  async (req, res) => {
    try {
      const response = await axios.get(
        `http://localhost:3004/api/deliveriesdriver/current/${req.params.driverId}`
      );
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/deliveries/:id/status",
  authenticate,
  restrictTo("delivery_personnel"),
  async (req, res) => {
    try {
      await producer.connect();
      const deliveryData = { id: req.params.id, status: req.body.status };
      await producer.send({
        topic: "delivery-events",
        messages: [
          {
            value: JSON.stringify({
              action: "update_status",
              data: deliveryData,
            }),
          },
        ],
      });
      await producer.disconnect();
      res.json({ message: "Delivery status update request sent" });
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
  "/notifications",
  authenticate,
  restrictTo("admin"),
  async (req, res) => {
    try {
      await producer.connect();
      const notificationData = { ...req.body, id: Date.now().toString() };
      await producer.send({
        topic: "notification-events",
        messages: [
          {
            value: JSON.stringify({
              action: req.body.action,
              data: notificationData,
            }),
          },
        ],
      });
      await producer.disconnect();
      res.status(201).json({ message: "Notification request sent" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
