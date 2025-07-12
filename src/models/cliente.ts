import { Suscripcion } from "./suscripcion";

export interface ClienteDto {
  idCliente: number;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  fotoPerfil?: string; // URL de la foto de perfil
  suscripcion?: Suscripcion;
}