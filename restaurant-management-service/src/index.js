const express = require("express");
const routes = require("./routes");
const cors = require("cors");
const { runConsumer } = require("./controllers/restaurantController");

const app = express();

app.use(
  cors({
    origin: "http://localhost:8080", // 👈 Your frontend URL
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", routes);

runConsumer().catch(console.error);

app.listen(3002, () => {
  console.log("Restaurant Management Service running on port 3002");
});
