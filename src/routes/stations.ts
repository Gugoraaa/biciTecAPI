
import {Router} from "express";
import { getStations } from "../controller/stationsController";

const router = Router();

router.get("/getStations", getStations);



export default router;