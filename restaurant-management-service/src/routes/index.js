const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurantController");

router.get("/restaurants/:id", restaurantController.getRestaurantById);
router.get("/restaurants", restaurantController.getAllRestaurants);
router.get(
  "/restaurants/available",
  restaurantController.getAvailableRestaurants
);
router.get("/restaurants/filter", restaurantController.getFilteredRestaurants);
router.get("/restaurants/nearby", restaurantController.getNearbyRestaurants);
router.get(
  "/restaurants/admin/:adminId",
  restaurantController.getRestaurantsByAdminId
);

// Menu routes
router.get("/menu/:id", restaurantController.getMenuItemById);
router.get(
  "/restaurants/:restaurantId/menu",
  restaurantController.getRestaurantMenu
);
router.get(
  "/restaurants/:restaurantId/menu/available",
  restaurantController.getAvailableRestaurantMenu
);

module.exports = router;
