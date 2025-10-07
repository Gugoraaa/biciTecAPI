import express from "express";
import cors from "cors";
import StationRoutes from "./routes/stations.js";

const app = express();


const corsOptions = {
  origin: [
    "http://localhost:5173",       
    "http://localhost:3000",       
    "https://bici-tec.vercel.app"      
  ],
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,               
};


app.use(express.json());

app.use(cors(corsOptions));

app.use("/stations", StationRoutes);

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
