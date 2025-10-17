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
    const tz = "America/Mexico_City";

    const now = new Date();
    const nowMX = new Date(now.toLocaleString("en-US", { timeZone: tz }));

    const floorToHour = (d: Date) => {
      const x = new Date(d);
      x.setMinutes(0, 0, 0);
      return x;
    };

    const currentHourStartMX = floorToHour(nowMX);
    const endMX = new Date(currentHourStartMX.getTime() + 60 * 60 * 1000);
    const startMX = new Date(endMX.getTime() - 24 * 60 * 60 * 1000);

    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
    };


    const [rows] = await connection.execute<RowDataPacket[]>(
      `
      SELECT
        DATE_FORMAT(
          CONVERT_TZ(fecha_uso, '+00:00', 'America/Mexico_City'),
          '%Y-%m-%d %H:00:00'
        ) AS bucket_cdmx,
        COUNT(*) AS count
      FROM viajes
      WHERE fecha_uso >= CONVERT_TZ(?, 'America/Mexico_City', '+00:00')
        AND fecha_uso <  CONVERT_TZ(?, 'America/Mexico_City', '+00:00')  -- [start, end)
      GROUP BY bucket_cdmx
      ORDER BY bucket_cdmx;
      `,
      [fmt(startMX), fmt(endMX)]
    );

    const map = new Map<string, number>();
    rows.forEach(r => map.set(r.bucket_cdmx, Number(r.count) || 0));

    const result: BikeUsageData[] = [];
    for (let i = 0; i < 24; i++) {
      const t = new Date(currentHourStartMX.getTime() - i * 60 * 60 * 1000);
      const label = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")} ${String(t.getHours()).padStart(2, "0")}:00:00`;
      result.push({
        hour: label.slice(11, 16),
        count: map.get(label) ?? 0,
      });
    }

    return result;
  } finally {
    connection.release();
  }
};
