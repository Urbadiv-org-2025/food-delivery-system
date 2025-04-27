const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurantController");

router.get("/restaurant/:id", restaurantController.getRestaurantById);
router.get("/restaurants", restaurantController.getAllRestaurants);
router.get(
  "/restaurants/available",
  restaurantController.getAvailableRestaurants
);

module.exports = router;
