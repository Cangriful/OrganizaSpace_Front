export interface Disenador {
  idDisenador: number;
  nombreDisenador: string;
  apellidoDisenador: string;
  telefono: string;
  correo: string;
  disponible: boolean;
  fotoPerfil?: string; // URL de la foto de perfil
}