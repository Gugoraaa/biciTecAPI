export interface Report {
    id: number;
    id_usuario: number;
    id_bici: number | null;
    estado: 'Open' | 'InProgress' | 'Done';
    descripcion: string;
    fecha_reporte: Date;
    fecha_entrega: Date | null;
    created_at: Date;
    updated_at: Date;
}