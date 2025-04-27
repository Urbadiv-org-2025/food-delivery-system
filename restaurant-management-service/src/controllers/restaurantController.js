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
      // Parse the message only once
      const parsedMessage = JSON.parse(message.value);
      const { action, data: rawData } = parsedMessage;

      if (topic === "menu-events") {
        try {
          // Parse the message only once
          const menuData =
            typeof rawData === "string" ? JSON.parse(rawData) : rawData;

          console.log(
            "Received message:",
            JSON.stringify(parsedMessage, null, 2)
          );
          console.log("Processed data:", JSON.stringify(menuData, null, 2));

          switch (action) {
            case "create":
              // Parse ingredients if it's a string
              if (typeof menuData.ingredients === "string") {
                try {
                  menuData.ingredients = JSON.parse(menuData.ingredients);
                } catch (err) {
                  console.error(
                    "Error parsing ingredients array:",
                    err.message
                  );
                  menuData.ingredients = [];
                }
              }

              const menuItem = new MenuItem({
                id: menuData.id,
                restaurantId: String(menuData.restaurantId),
                name: menuData.name || "Unnamed Item",
                price: menuData.price || 0,
                description: menuData.description || "",
                image: menuData.image || "",
                available:
                  menuData.available !== undefined ? menuData.available : true,
                category: menuData.category || "main-course", // Set a default category
                ingredients: menuData.ingredients || [],
                dietaryRestrictions: menuData.dietaryRestrictions || [],
              });

              // Add validation logging
              console.log("Creating menu item:", menuItem);

              await menuItem.save();
              console.log(`Menu item created: ${menuItem.name}`);
              break;

            case "update":
              if (typeof menuData.ingredients === "string") {
                try {
                  menuData.ingredients = JSON.parse(menuData.ingredients);
                } catch (err) {
                  console.error(
                    "Error parsing ingredients array:",
                    err.message
                  );
                  menuData.ingredients = [];
                }
              }
              await MenuItem.findOneAndUpdate(
                { id: menuData.id },
                {
                  name: menuData.name,
                  price: menuData.price,
                  description: menuData.description,
                  image: menuData.image,
                  available: menuData.available,
                  category: menuData.category,
                  ingredients: menuData.ingredients,
                  dietaryRestrictions: menuData.dietaryRestrictions,
                },
                { new: true }
              );
              console.log(`Menu item updated: ${menuData.id}`);
              break;

            case "delete":
              await MenuItem.findOneAndDelete({ id: menuData.id });
              console.log(`Menu item deleted: ${menuData.id}`);
              break;
          }
        } catch (error) {
          console.error(`Error processing menu event: ${error.message}`);
          console.error(error.stack);
        }
      } else if (topic === "restaurant-events") {
        try {
          // Parse the message only once
          const restaurantData =
            typeof rawData === "string" ? JSON.parse(rawData) : rawData;

          console.log(
            "Received restaurant event:",
            JSON.stringify(parsedMessage, null, 2)
          );
          console.log(
            "Processed restaurant data:",
            JSON.stringify(restaurantData, null, 2)
          );

          switch (action) {
            case "create":
              const restaurantLocation = {
                address:
                  restaurantData.location?.address ||
                  restaurantData["location.address"],
                latitude: parseFloat(
                  restaurantData.location?.latitude ||
                    restaurantData["location.latitude"]
                ),
                longitude: parseFloat(
                  restaurantData.location?.longitude ||
                    restaurantData["location.longitude"]
                ),
              };

              const restaurant = new Restaurant({
                id: restaurantData.id,
                name: restaurantData.name,
                location: restaurantLocation,
                cuisine: restaurantData.cuisine,
                rating: restaurantData.rating || 0,
                reviews: restaurantData.reviews || 0,
                openingHours: restaurantData.openingHours,
                image: restaurantData.image,
                available:
                  restaurantData.available !== undefined
                    ? restaurantData.available
                    : true,
              });

              console.log("Creating restaurant:", restaurant);
              await restaurant.save();
              console.log(`Restaurant created: ${restaurantData.name}`);
              break;

            case "update":
              const updatedRestaurant = await Restaurant.findOneAndUpdate(
                { id: restaurantData.id },
                restaurantData.updateData,
                { new: true }
              );
              console.log(`Restaurant updated: ${restaurantData.id}`);
              break;

            case "delete":
              await Restaurant.findOneAndDelete({ id: restaurantData.id });
              console.log(`Restaurant deleted: ${restaurantData.id}`);
              break;

            case "update_availability":
              await Restaurant.updateOne(
                { id: restaurantData.id },
                { available: restaurantData.available }
              );
              console.log(
                `Restaurant availability updated: ${restaurantData.id}`
              );
              break;
          }
        } catch (error) {
          console.error(`Error processing restaurant event: ${error.message}`);
          console.error(error.stack);
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

const getAvailableRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ available: true });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: "Error fetching available restaurants" });
  }
};

const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({ id: req.params.id });
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.status(200).json({ data: menuItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRestaurantMenu = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      restaurantId: req.params.restaurantId,
    });
    res.status(200).json({ data: menuItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAvailableRestaurantMenu = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      restaurantId: req.params.restaurantId,
      available: true,
    });
    res.status(200).json({ data: menuItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  runConsumer,
  getRestaurantById,
  getAllRestaurants,
  getAvailableRestaurants,
  getMenuItemById,
  getRestaurantMenu,
  getAvailableRestaurantMenu,
};
