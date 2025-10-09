import { RowDataPacket } from 'mysql2';

export interface Station extends RowDataPacket {
    id: number;
    longitud: number;
    latitud: number;
    nombre: string;
    bicicletas: number;
    capacidad_max: number;
    estado: 'Operational' | 'Maintenance';
}

export type StationStatus = 'Operational' | 'Maintenance';
