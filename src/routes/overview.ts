import { Router } from "express";
import { getOverview, getStationPercent, getBikesUsedLast24Hours } from '../controller/overviewController';

const router = Router();

// GET /api/overview - Get system overview statistics
router.get("/cardsOverview", getOverview);
router.get('/stationPercent', getStationPercent);
router.get('/bikes-used-24h', getBikesUsedLast24Hours);

export default router;
