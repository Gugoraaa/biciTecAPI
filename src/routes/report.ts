import { Router } from "express";
import { createReport, getReports, updateReportStatus, updateReportPriority, deleteReport } from "../controller/reportController";
const router = Router();

router.post("/createReport", createReport);
router.get("/getReports", getReports);
router.patch("/:id/status", updateReportStatus);    
router.patch("/:id/priority", updateReportPriority);  
router.delete("/deleteReport/:id", deleteReport);  



export default router;
