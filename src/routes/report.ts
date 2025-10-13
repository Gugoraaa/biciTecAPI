import { Router } from "express";
import { createReport, getReports } from "../controller/reportController";
const router = Router();

router.post("/createReport", createReport);
router.get("/getReports", getReports);

export default router;
