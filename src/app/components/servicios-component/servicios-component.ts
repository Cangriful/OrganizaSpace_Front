import { Component, OnInit } from '@angular/core';
import { Servicios } from '../../../models/servicios';
import { ServiciosService } from '../../services/servicios-service';

@Component({
  selector: 'app-servicios-component',
  standalone: false,
  templateUrl: './servicios-component.html',
  styleUrl: './servicios-component.css'
})
export class ServiciosComponent implements OnInit {
  servicios: Servicios[] = [];

  constructor(private serviciosService: ServiciosService) {}

  ngOnInit(): void {
    this.serviciosService.obtenerServicios().subscribe(data => this.servicios = data);
  }
}
