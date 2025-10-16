import { Request, Response } from "express";
import * as overviewModel from "../models/overviewModel";

export const getOverview = async (req: Request, res: Response) => {
  try {
    const overviewData = await overviewModel.getOverviewData();
    res.json(overviewData);
  } catch (error) {
    console.error("Error fetching overview data:", error);
    res.status(500).json({ error: "Error al obtener los datos de resumen" });
  }
};

export const getBikesUsedLast24Hours = async (req: Request, res: Response) => {
  try {
    const bikesData = await overviewModel.getBikesUsedLast24Hours();
    res.json(bikesData);
  } catch (error) {
    console.error("Error fetching bikes used in last 24 hours:", error);
    res
      .status(500)
      .json({ error: "Error al obtener el conteo de bicicletas usadas" });
  }
};

export const getStationPercent = async (req: Request, res: Response) => {
  try {
    const stations = await overviewModel.getStationsCapacityData();

    if (!Array.isArray(stations)) {
      throw new Error('Invalid data format received from database');
    }

    const stationsWithPercentage = stations.map((station) => {
      if (typeof station.bicicletas !== 'number' || typeof station.capacidad_max !== 'number') {
        console.error('Invalid station data:', station);
        throw new Error('Invalid station data: missing or invalid required fields');
      }

      const percentage = station.capacidad_max > 0 
        ? Math.min(100, Math.round((station.bicicletas / station.capacidad_max) * 100))
        : 0;

      return {
        id_estacion: station.id_estacion,
        nombre: station.nombre,
        estado: station.estado,
        porcentaje_ocupacion: percentage,
        bicicletas_disponibles: station.bicicletas,
        capacidad_total: station.capacidad_max,
        last_updated: new Date().toISOString()
      };
    });

    res.json({
      success: true,
      data: stationsWithPercentage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error in getStationPercent:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      success: false,
      error: 'Error al obtener el porcentaje de ocupación de las estaciones',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      timestamp: new Date().toISOString()
    });
  }
};
