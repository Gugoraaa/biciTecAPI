import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import StationRoutes from "./routes/stations";
import authRoutes from "./routes/auth";
import bikeRoutes from "./routes/bikes";
import overviewRoutes from "./routes/overview";
import reportRoutes from "./routes/report";
import tripRoutes from "./routes/trips";
import messageRoutes from "./routes/messages";
import userRoutes from "./routes/user";

dotenv.config();

const app = express();

// Enable CORS before other middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://bici-tec.vercel.app"
];

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["set-cookie"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));

// Parse cookies before other middleware
app.use(cookieParser());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/stations", StationRoutes);
app.use("/auth", authRoutes);
app.use("/bikes", bikeRoutes);
app.use("/overview", overviewRoutes);
app.use("/reports", reportRoutes);
app.use("/trips", tripRoutes);
app.use("/messages", messageRoutes);
app.use("/user", userRoutes);

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
