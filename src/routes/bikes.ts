import { Router } from "express";
import { 
    getBikes, 
    getBike, 
    updateBikeStatus, 
    updateBikeStation,
    getBikeTripLogs,
    addBike
} from "../controller/bikesController";

const router = Router();

    
router.get("/getBikes", getBikes);
router.get("/:id", getBike);
router.patch("/:id/status", updateBikeStatus);
router.patch("/:id/station", updateBikeStation);
router.get("/:id/logs", getBikeTripLogs);
router.post("/addBike", addBike);

export default router;
