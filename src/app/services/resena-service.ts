import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResenaDto } from '../../models/resena';

@Injectable({
  providedIn: 'root'
})
export class ResenaService {

  ruta_servidor: string = 'http://localhost:8080';
  recurso: string = 'reseña';
  constructor(private http: HttpClient) { }
  listarResenas() {
      return this.http.get<ResenaDto[]>(this.ruta_servidor+"/"+this.recurso+"/"+"mostrar");
    }
  
   
   insertarResena(nueva: ResenaDto) {
    return this.http.post<ResenaDto>(this.ruta_servidor+"/"+this.recurso+"/"+"insertar",nueva);
  }
}
