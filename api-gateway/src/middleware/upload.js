const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create upload directories if they don't exist
const directories = ["restaurants", "menu-items"];
directories.forEach((dir) => {
  const dirPath = path.join(__dirname, "../../uploads", dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const createStorage = (directory) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, `../../uploads/${directory}`));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
};

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB limit
};

module.exports = {
  restaurantUpload: multer({
    storage: createStorage("restaurants"),
    fileFilter,
    limits,
  }),
  menuUpload: multer({
    storage: createStorage("menu-items"),
    fileFilter,
    limits,
  }),
};
