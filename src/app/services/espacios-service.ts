import { Injectable } from '@angular/core';
import { Espacios } from '../../models/espacios';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EspaciosService {
private espacios: Espacios[] = [
  ];

  obtenerEspacios(): Observable<Espacios[]> {
    return of(this.espacios);
  }
}
