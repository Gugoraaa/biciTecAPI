import { RowDataPacket } from 'mysql2';

export interface Bike extends RowDataPacket {
    id: number;
    estado: BikeStatusType;
    tamaño: string;
    estacion: number | null;
    vel_prom: number;
    total_km: number;
    prioridad: BikePriorityType;
}

export enum BikeStatus {
    Available = 'Available',
    InUse = 'InUse',
    Maintenance = 'Maintenance'
}

export enum BikePriority {
    Alta = 'alta',
    Media = 'media',
    Baja = 'baja'
}

// Type versions for when you just need the type
export type BikeStatusType = keyof typeof BikeStatus;
export type BikePriorityType = keyof typeof BikePriority;
