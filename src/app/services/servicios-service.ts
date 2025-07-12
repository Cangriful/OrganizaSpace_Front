import { Injectable } from '@angular/core';
import { Servicios } from '../../models/servicios';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
private servicios: Servicios[] = [
  ];

  obtenerServicios(): Observable<Servicios[]> {
    return of(this.servicios);
  }
}


