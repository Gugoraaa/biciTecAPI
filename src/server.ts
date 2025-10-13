import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import StationRoutes from "./routes/stations";
import authRoutes from "./routes/auth";
import bikeRoutes from "./routes/bikes";
import overviewRoutes from "./routes/overview";
import reportRoutes from "./routes/report";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://bici-tec.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/stations", StationRoutes);
app.use("/auth", authRoutes);
app.use("/bikes", bikeRoutes);
app.use("/overview", overviewRoutes);


app.use("/reports", reportRoutes);

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
