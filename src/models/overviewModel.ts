import { Pool, RowDataPacket } from "mysql2/promise";
import pool from "../config/database";

interface CountResult extends RowDataPacket {
  count: number;
}

export const getOverviewData = async () => {
  const connection = await (pool as Pool).getConnection();

  try {
    const [bikesCount] = await connection.execute<CountResult[]>(
      "SELECT COUNT(*) as count FROM bicicletas"
    );
    const [availableBikes] = await connection.execute<CountResult[]>(
      "SELECT COUNT(*) as count FROM bicicletas WHERE estado = 'Available'"
    );
    const [inUseBikes] = await connection.execute<CountResult[]>(
      "SELECT COUNT(*) as count FROM bicicletas WHERE estado = 'InUse'"
    );
    const [inMaintenanceBikes] = await connection.execute<CountResult[]>(
      "SELECT COUNT(*) as count FROM bicicletas WHERE estado = 'Maintenance'"
    );

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
      capacidad_max: Number(station.capacidad_max) || 1,
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
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    console.log(`Fetching bike usage data from ${twentyFourHoursAgo.toISOString()} to ${now.toISOString()}`);

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

    const hourlyData = new Map<number, number>();
    for (let i = 0; i < 24; i++) {
      hourlyData.set(i, 0);
    }
    rows.forEach((row) => {
      hourlyData.set(row.hour, Number(row.count) || 0);
    });

    const currentHour = now.getHours();
    const result: BikeUsageData[] = [];

    for (let i = 0; i < 24; i++) {
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
