import { Request, Response } from "express";
import { 
    createReport as createReportModel, 
    getReportById,
    getReports as getReportsModel 
} from "../models/reportModel";

export const createReport = async (req: Request, res: Response) => {
    try {
        const { id_usuario, id_bici, descripcion } = req.body;

        if (!id_usuario || !descripcion) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: id_usuario and descripcion are required"
            });
        }

        const report = await createReportModel(id_usuario, id_bici, descripcion);

        res.status(201).json({
            success: true,
            message: "Report created successfully",
            data: report
        });

    } catch (error) {
        console.error("Error creating report:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create report",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const getReport = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const report = await getReportById(Number(id));
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {
        console.error("Error fetching report:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch report",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const getReports = async (req: Request, res: Response) => {
    try {
        const reports = await getReportsModel();
            
        res.status(200).json({
            success: true,
            data: reports
        });

    } catch (error) {
        console.error("Error fetching user reports:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user reports",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
