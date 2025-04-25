const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurantController");
const upload = require("../middlewares/upload");
const authenticate = require("../middleware/auth");

// Protected Routes (with JWT auth)
router.post(
  "/restaurant",
  authenticate,
  upload.single("image"),
  restaurantController.createRestaurant
);
router.put(
  "/restaurant/:id",
  authenticate,
  upload.single("image"),
  restaurantController.updateRestaurant
);
router.delete(
  "/restaurant/:id",
  authenticate,
  restaurantController.deleteRestaurant
);

// Public Routes (no auth needed)
router.get("/restaurant/:id", restaurantController.getRestaurantById);
router.get("/restaurants", restaurantController.getAllRestaurants);

module.exports = router;
