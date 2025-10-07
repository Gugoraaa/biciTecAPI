import express from "express";
import StationRoutes from "./routes/stations";
const app = express();

app.use(express.json());

app.use("/stations", StationRoutes);

app.listen(4000, () => {
    console.log("Server is running on port 4000");
});

