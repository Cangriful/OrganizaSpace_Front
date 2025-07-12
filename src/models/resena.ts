export interface ResenaDto {
  user: {
    id: number;
    nombre: string;
  };
  producto: {
    idProducto: number;
  };
  descripcion: string;
  estrellas: number;
}