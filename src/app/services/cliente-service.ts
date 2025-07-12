import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClienteDto } from '../../models/cliente';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private baseUrl = 'http://localhost:8080/cliente';

  constructor(private http: HttpClient) {}

  obtenerPorCorreo(correo: string): Observable<ClienteDto> {
    return this.http.get<ClienteDto>(`${this.baseUrl}/por-correo?correo=${correo}`);
  }

  getClientePorId(id: number): Observable<ClienteDto> {
  return this.http.get<ClienteDto>(`http://localhost:8080/cliente/cliente/${id}`);
  }
  
  actualizarSuscripcion(clienteId: string, plan: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${clienteId}/suscripcion`, { plan: plan });
  }
}
