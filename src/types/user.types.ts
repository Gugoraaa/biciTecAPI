export type UserRole = 'admin' | 'usuario';

export interface User {
    id?: number;
    nombre: string;
    apellido: string;
    matricula: string;
    password: string;
    rol: UserRole;
}
