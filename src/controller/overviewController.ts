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

    const stationsWithPercentage = stations.map((station) => ({
      id_estacion: station.id_estacion,
      nombre: station.nombre,
      estado: station.estado,
      porcentaje_ocupacion: Math.min(
        100,
        Math.round((station.bicicletas / station.capacidad_max) * 100)
      ),
      bicicletas_disponibles: station.bicicletas,
      capacidad_total: station.capacidad_max,
    }));

    res.json(stationsWithPercentage);
  } catch (error) {
    console.error("Error fetching stations percentage:", error);
    res
      .status(500)
      .json({
        error: "Error al obtener el porcentaje de ocupación de las estaciones",
      });
  }
};
