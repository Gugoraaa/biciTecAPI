
import {Router} from "express";
import { getStations,updateStationStatus } from "../controller/stationsController";

const router = Router();

router.get("/getStations", getStations);
 router.patch("/updateStatus/:id", updateStationStatus);


export default router;