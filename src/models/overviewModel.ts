import { Pool, RowDataPacket } from "mysql2/promise";
import pool from "../config/database";

interface CountResult extends RowDataPacket {
  count: number;
}

export const getOverviewData = async () => {
  const connection = await (pool as Pool).getConnection();

  try {
    // Get total number of bikes
    const [bikesCount] = await connection.execute<CountResult[]>(
      "SELECT COUNT(*) as count FROM bicicletas"
    );

    // Get available bikes
    const [availableBikes] = await connection.execute<CountResult[]>(
      "SELECT COUNT(*) as count FROM bicicletas WHERE estado = 'Available'"
    );

    // Get in-use bikes
    const [inUseBikes] = await connection.execute<CountResult[]>(
      "SELECT COUNT(*) as count FROM bicicletas WHERE estado = 'InUse'"
    );

    // Get bikes in maintenance
    const [inMaintenanceBikes] = await connection.execute<CountResult[]>(
      "SELECT COUNT(*) as count FROM bicicletas WHERE estado = 'Maintenance'"
    );

    // Get active stations (stations that are operational)
    const [activeStations] = await connection.execute<CountResult[]>(
      "SELECT COUNT(*) as count FROM Estaciones WHERE estado = 'Operational'"
    );

    return {
      totalBikes: bikesCount[0]?.count || 0,
      Available: availableBikes[0]?.count || 0,
      InUse: inUseBikes[0]?.count || 0,
      InMaintenance: inMaintenanceBikes[0]?.count || 0,
      activeStation: activeStations[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error getting overview data:", error);
    throw error;
  } finally {
    connection.release();
  }
};

interface StationCapacity {
  id_estacion: number;
  nombre: string;
  estado: string;
  capacidad_max: number;
  bicicletas: number;
}

export const getStationsCapacityData = async () => {
  const connection = await (pool as Pool).getConnection();

  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        e.id as id_estacion,
        e.nombre,
        e.estado,
        e.capacidad_max,
        e.bicicletas
      FROM Estaciones e
      LEFT JOIN bicicletas b ON e.id = b.estacion 
        AND b.estado = 'Available'
      WHERE e.estado = 'Operational'
      GROUP BY e.id, e.nombre, e.estado, e.capacidad_max`
    );

    const stations = rows as unknown as StationCapacity[];

    return stations.map((station) => ({
      id_estacion: station.id_estacion,
      nombre: station.nombre,
      estado: station.estado,
      capacidad_max: Number(station.capacidad_max) || 1, // Avoid division by zero
      bicicletas: Number(station.bicicletas) || 0,
    }));
  } catch (error) {
    console.error("Error getting stations capacity data:", error);
    throw error;
  } finally {
    connection.release();
  }
};

export interface BikeUsageData {
  hour: string;
  count: number;
}

export const getBikesUsedLast24Hours = async (): Promise<BikeUsageData[]> => {
  const connection = await (pool as Pool).getConnection();

  try {
    // Get the current time and calculate exactly 24 hours ago
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    console.log(`Fetching bike usage data from ${twentyFourHoursAgo.toISOString()} to ${now.toISOString()}`);

    // Query to get bike usage count per hour for the last 24 hours
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT  
            HOUR(CONVERT_TZ(fecha_uso, '+00:00', 'America/Mexico_City')) AS hour,
            COUNT(*) AS count
        FROM viajes
        WHERE fecha_uso >= ?
          AND fecha_uso <= ?
        GROUP BY HOUR(CONVERT_TZ(fecha_uso, '+00:00', 'America/Mexico_City'))
        ORDER BY hour;`,
      [
        twentyFourHoursAgo.toISOString().slice(0, 19).replace('T', ' '),
        now.toISOString().slice(0, 19).replace('T', ' ')
      ]
    );

    console.log(`Found ${rows.length} hours with bike usage data`);

    // Create a map of all 24 hours with count 0
    const hourlyData = new Map<number, number>();
    for (let i = 0; i < 24; i++) {
      hourlyData.set(i, 0);
    }

    // Update the map with actual data
    rows.forEach((row) => {
      hourlyData.set(row.hour, Number(row.count) || 0);
    });

    // Get the current hour to determine the rolling 24-hour window
    const currentHour = now.getHours();
    const result: BikeUsageData[] = [];

    // Generate hours in the correct order (from 24 hours ago to now)
    for (let i = 0; i < 24; i++) {
      // Calculate the hour in the rolling 24-hour window
      const hourInDay = (currentHour + i + 1) % 24;
      const hourLabel = hourInDay.toString().padStart(2, '0') + ':00';
      
      result.push({
        hour: hourLabel,
        count: hourlyData.get(hourInDay) || 0
      });
    }
    
    return result;
  } catch (error) {
    console.error("Error getting bikes used in last 24 hours:", error);
    throw error;
  } finally {
    connection.release();
  }
};
