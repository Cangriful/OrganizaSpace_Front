import { ClienteDto} from "./cliente";
import { Disenador } from "./diseñador";
import { Espacios } from "./espacios";
import { Servicios } from "./servicios";

export interface MensajeChat {
  remitente: 'usuario' | 'diseñador';
  texto: string;
  fecha: string;
  imagen?: string; // URL de la imagen guardada
  nombreArchivo?: string; // Nombre original del archivo
}

export interface Peticion {
  idPeticion: number;
  idCliente: ClienteDto;
  idEspacio: Espacios;
  idServicio: Servicios;
  idDisenador: Disenador | null; // null si está disponible
  descripcion: string;
  recomendacion: string;
  estado: 'disponible' | 'asignado';
  mensajes: MensajeChat[];
}