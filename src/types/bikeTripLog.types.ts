import { RowDataPacket } from 'mysql2';

export interface BikeTripLog extends RowDataPacket {
    id: number;
    id_usuario: number;
    id_bicicleta: number;
    fecha_uso: Date;
    tiempo_uso: number;
    distancia: number;
    nombre_usuario: string;
    apellido_usuario: string;
}

export interface FormattedBikeTripLog {
    id: number;
    fecha: string;
    tiempo: number;
    distancia: number;
    usuario: string;
}
