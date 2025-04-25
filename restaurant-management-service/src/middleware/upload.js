const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/restaurants/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File type filter (accept only images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isMimeTypeValid = allowedTypes.test(file.mimetype);
  const isExtNameValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  if (isMimeTypeValid && isExtNameValid) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
