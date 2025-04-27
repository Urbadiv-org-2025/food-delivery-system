const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads/restaurants");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Clean the original filename and add timestamp
    const cleanFileName = path
      .parse(file.originalname)
      .name.replace(/[^a-z0-9]/gi, "-")
      .toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(
      null,
      `${cleanFileName}-${uniqueSuffix}${path
        .extname(file.originalname)
        .toLowerCase()}`
    );
  },
});

// File validation
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif/;
  // Maximum file size (5MB)
  const maxSize = 5 * 1024 * 1024;

  // Validate mime type
  const isMimeTypeValid = allowedTypes.test(file.mimetype);
  // Validate extension
  const isExtNameValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (!isMimeTypeValid || !isExtNameValid) {
    return cb(
      new Error("Only image files (jpeg, jpg, png, gif) are allowed!"),
      false
    );
  }

  if (file.size > maxSize) {
    return cb(new Error("File size cannot exceed 5MB!"), false);
  }

  cb(null, true);
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB in bytes
    files: 1, // Maximum number of files
  },
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size cannot exceed 5MB!" });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

module.exports = {
  upload,
  handleUploadError,
};
