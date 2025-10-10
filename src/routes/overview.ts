import { Router } from "express";
import { getOverview, getStationPercent, getBikesUsedLast24Hours } from '../controller/overviewController';

const router = Router();


router.get("/cardsOverview", getOverview);
router.get('/stationPercent', getStationPercent);
router.get('/bikes-used-24h', getBikesUsedLast24Hours);

export default router;
