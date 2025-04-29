const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();
const routes = require("./routes");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static images from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", routes);

app.listen(3000, () => {
  console.log("API Gateway running on port 3000");
});
