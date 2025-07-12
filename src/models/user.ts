import { Suscripcion } from "./suscripcion";

export interface User{
    id: number,
    username: string,
    password: string,
    authorities: string[];
    nombre?: string;
    apellido?: string;
    telefono?: string;
    fotoPerfil?: string; // URL de la foto de perfil
    suscripcion?: Suscripcion;
}