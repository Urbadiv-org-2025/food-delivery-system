const kafka = require("../config/kafka");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const connectDB = require("../config/db");

connectDB();

// Add this helper function at the top of the file
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

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
                restaurantAdminId: restaurantData.restaurantAdminId, // Add this field
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
              try {
                console.log("Update restaurant data received:", restaurantData);

                // Extract the correct ID directly from restaurantData
                const restaurantId = restaurantData.id;
                console.log("Restaurant ID:", restaurantId);

                // Find the restaurant first
                const restaurantToUpdate = await Restaurant.findOne({
                  id: restaurantId,
                });

                if (!restaurantToUpdate) {
                  console.error(
                    `Restaurant not found with id: ${restaurantId}`
                  );
                  break;
                }

                // Extract update data directly from restaurantData
                const { updateData } = restaurantData;
                console.log("Update data:", updateData);

                // Create update object with schema validation
                const updateObject = {};

                // Handle location object correctly
                if (updateData.location) {
                  updateObject.location = {
                    address:
                      updateData.location.address ||
                      restaurantToUpdate.location.address,
                    latitude:
                      Number(updateData.location.latitude?.trim()) ||
                      restaurantToUpdate.location.latitude,
                    longitude:
                      Number(updateData.location.longitude?.trim()) ||
                      restaurantToUpdate.location.longitude,
                  };
                }

                // Handle other fields
                const allowedFields = [
                  "name",
                  "cuisine",
                  "openingHours",
                  "rating",
                  "reviews",
                  "image",
                ];

                allowedFields.forEach((field) => {
                  if (updateData[field] !== undefined) {
                    updateObject[field] = updateData[field];
                  }
                });

                // Handle boolean available field separately
                if (updateData.available !== undefined) {
                  updateObject.available = updateData.available === "true";
                }

                console.log("Final update object:", updateObject);

                // Perform the update with validation
                const updatedRestaurant = await Restaurant.findOneAndUpdate(
                  { id: restaurantId },
                  { $set: updateObject },
                  { new: true, runValidators: true }
                );

                if (!updatedRestaurant) {
                  console.error(
                    "Update failed - restaurant not found or validation error"
                  );
                  break;
                }

                console.log(
                  "Restaurant updated successfully:",
                  updatedRestaurant
                );
              } catch (error) {
                console.error("Error in restaurant update:", error);
                console.error(error.stack);
              }
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

const getFilteredRestaurants = async (req, res) => {
  try {
    const { cuisine, available, menuCategory } = req.query;
    let query = {};

    // Build the filter query
    if (cuisine) {
      query.cuisine = cuisine;
    }

    if (available !== undefined) {
      query.available = available === "true";
    }

    let restaurants = await Restaurant.find(query);

    // If menu category is specified, filter restaurants that have menu items in that category
    if (menuCategory) {
      const restaurantIds = restaurants.map((r) => r.id);
      const menuItems = await MenuItem.find({
        restaurantId: { $in: restaurantIds },
        category: menuCategory,
        available: true,
      });

      const restaurantsWithMenuCategory = new Set(
        menuItems.map((item) => item.restaurantId)
      );
      restaurants = restaurants.filter((r) =>
        restaurantsWithMenuCategory.has(r.id)
      );
    }

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error("Error filtering restaurants:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add the getNearbyRestaurants function
const getNearbyRestaurants = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: "Latitude and longitude are required",
      });
    }

    const currentLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    // Get all restaurants first
    const allRestaurants = await Restaurant.find({ available: true });

    // Calculate distance for each restaurant and filter
    const nearbyRestaurants = allRestaurants
      .map((restaurant) => {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          restaurant.location.latitude,
          restaurant.location.longitude
        );
        return { ...restaurant.toObject(), distance };
      })
      .filter((restaurant) => restaurant.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      count: nearbyRestaurants.length,
      data: nearbyRestaurants,
    });
  } catch (error) {
    console.error("Error finding nearby restaurants:", error);
    res.status(500).json({ error: error.message });
  }
};

const getRestaurantsByAdminId = async (req, res) => {
  try {
    const { adminId } = req.params;
    const restaurants = await Restaurant.find({ restaurantAdminId: adminId });
    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error("Error fetching admin's restaurants:", error);
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
  getFilteredRestaurants,
  getNearbyRestaurants,
  getRestaurantsByAdminId,
};
