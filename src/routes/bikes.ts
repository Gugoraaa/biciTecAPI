import { Router } from "express";
import { 
    getBikes, 
    getBike, 
    updateBikeStatus, 
    updateBikeStation,
    getBikeTripLogs
} from "../controller/bikesController";

const router = Router();

    
router.get("/getBikes", getBikes);
router.get("/:id", getBike);
router.patch("/:id/status", updateBikeStatus);
router.patch("/:id/station", updateBikeStation);
router.get("/:id/logs", getBikeTripLogs);

export default router;
