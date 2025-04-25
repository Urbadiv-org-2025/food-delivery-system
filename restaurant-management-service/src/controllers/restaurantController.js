const kafka = require("../config/kafka");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const connectDB = require("../config/db");
const path = require("path");

connectDB();

const consumer = kafka.consumer({ groupId: "restaurant-group" });

// Existing Kafka Consumer - keep this!
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
        if (action === "update_availability") {
          await Restaurant.updateOne(
            { id: data.id },
            { available: data.available }
          );
          console.log(`Restaurant availability updated: ${data.id}`);
        }
      }
    },
  });
};

// ✅ Role Checker Function
const checkRole = (roles, userRole) => {
  return roles.includes(userRole);
};

// ✅ Create Restaurant (Admin & Restaurant Admin Only)
const createRestaurant = async (req, res) => {
  try {
    if (!checkRole(["admin", "restaurant_admin"], req.user.role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { id, name, location, cuisine, rating, reviews, openingHours } =
      req.body;
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required!" });
    }

    const imagePath = `/uploads/restaurants/${req.file.filename}`;

    const restaurant = new Restaurant({
      id,
      name,
      location: JSON.parse(location),
      cuisine,
      rating,
      reviews,
      openingHours,
      image: imagePath,
    });

    const savedRestaurant = await restaurant.save();
    res
      .status(201)
      .json({
        message: "Restaurant created successfully",
        data: savedRestaurant,
      });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Restaurant (Admin & Restaurant Admin Only)
const updateRestaurant = async (req, res) => {
  try {
    if (!checkRole(["admin", "restaurant_admin"], req.user.role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const {
      name,
      location,
      cuisine,
      rating,
      reviews,
      openingHours,
      available,
    } = req.body;
    const updateData = {
      name,
      location: location ? JSON.parse(location) : undefined,
      cuisine,
      rating,
      reviews,
      openingHours,
      available,
    };

    // Add image if file exists
    if (req.file) {
      updateData.image = `/uploads/restaurants/${req.file.filename}`;
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      { id },
      updateData,
      { new: true }
    );
    if (!updatedRestaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res
      .status(200)
      .json({
        message: "Restaurant updated successfully",
        data: updatedRestaurant,
      });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Restaurant by ID (Public)
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

// ✅ Get All Restaurants (Public)
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json({ data: restaurants });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete Restaurant (Admin & Restaurant Admin Only)
const deleteRestaurant = async (req, res) => {
  try {
    if (!checkRole(["admin", "restaurant_admin"], req.user.role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const deletedRestaurant = await Restaurant.findOneAndDelete({ id });

    if (!deletedRestaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res
      .status(200)
      .json({
        message: "Restaurant deleted successfully",
        data: deletedRestaurant,
      });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  runConsumer, // Keep your consumer!
  createRestaurant,
  updateRestaurant,
  getRestaurantById,
  getAllRestaurants,
  deleteRestaurant,
};
