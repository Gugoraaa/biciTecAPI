import { Request, Response } from "express";
import {
  createReport as createReportModel,
  getReportById,
  getReports as getReportsModel,
  updateReportStatus as updateReportStatusModel,
  deleteReport as deleteReportModel,
  updateReportPriority as updateReportPriorityModel,
} from "../models/reportModel";


const statusMap: Record<string, string> = {
      Abierta: "Open",
      "En progreso": "InProgress",
      Resuelto: "Done",
    };

const priorityMap: Record<string, string> = {
      Baja: "Low",
      Media: "Medium",
      Alta: "High",
    };


export const createReport = async (req: Request, res: Response) => {
  try {
    const { id_usuario, id_bici, descripcion } = req.body;

    if (!id_usuario || !descripcion) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: id_usuario and descripcion are required",
      });
    }

    const report = await createReportModel(id_usuario, id_bici, descripcion);

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create report",
      error: error instanceof Error ? error.message : "Unknown error",
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
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const reports = await getReportsModel();

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching user reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user reports",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateReportStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    

    status = statusMap[status] || status;

    if (!status || !["Open", "InProgress", "Done"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status is required and must be 'Open', 'InProgress', or 'Done'",
      });
    }

    const updatedReport = await updateReportStatusModel(
      Number(id),
      status as "Open" | "InProgress" | "Done"
    );

    res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update report status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const isDeleted = await deleteReportModel(Number(id));

    if (!isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Report not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete report",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateReportPriority = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { priority } = req.body;

    priority = priorityMap[priority] || priority;

    if (!priority || !["Low", "Medium", "High"].includes(priority)) {
      return res.status(400).json({
        success: false,
        message:
          "Priority is required and must be 'Low', 'Medium', or 'High'",
      });
    }

    const updatedReport = await updateReportPriorityModel(
      Number(id),
      priority as "Low" | "Medium" | "High"
    );

    res.status(200).json({
      success: true,
      message: "Report priority updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    console.error("Error updating report priority:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update report priority",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
