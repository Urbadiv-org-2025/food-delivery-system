const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();
const routes = require("./routes");

const app = express();
const ALLOWLIST = (process.env.CORS_ORIGINS || "http://localhost:8080").split(",");
app.use(cors({
   origin: (origin, cb) => (!origin || ALLOWLIST.includes(origin) ? cb(null, true) : cb(new Error("Not allowed"), false)),
   credentials: true
 }));
 // Security headers incl. CSP
app.use(helmet({
   contentSecurityPolicy: {
     useDefaults: true,
     directives: {
       "default-src": ["'self'"],
       "script-src": ["'self'"],
       "style-src": ["'self'"],
       "img-src": ["'self'", "data:", "blob:"],
       "connect-src": ["'self'", "ws:", "wss:"],
       "frame-ancestors": ["'none'"],
       "object-src": ["'none'"],
       "base-uri": ["'self'"]
     }
   },
   referrerPolicy: { policy: "no-referrer" }
 }));
app.use(cookieParser());
app.use(express.json());
// Serve static images from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", routes);

app.listen(3000, () => {
  console.log("API Gateway running on port 3000");
});
