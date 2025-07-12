import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ClienteDto } from '../../../models/cliente';
import { ClienteService } from '../../services/cliente-service';
import { User } from '../../../models/user';
import { Suscripcion } from '../../../models/suscripcion';
import { SuscripcionService } from '../../services/suscripcion-service';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil-component',
  standalone: false,
  templateUrl: './perfil-component.html',
  styleUrl: './perfil-component.css'
})
export class PerfilComponent implements OnInit {
  currentUser!: User;
  suscripcionActual: Suscripcion | null = null;
  diasRestantes: number = 0;
  tieneSuscripcionActiva: boolean = false;
  historialSuscripciones: Suscripcion[] = [];
  esUsuario: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private suscripcionService: SuscripcionService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const data = localStorage.getItem('currentUser');
        if (data) {
          this.currentUser = JSON.parse(data);
          this.esUsuario = this.currentUser.authorities?.includes('USER') || false;
          this.cargarInformacionSuscripcion();
        } else {
          // Si no hay usuario, redirige al login
          this.router.navigate(['/login']);
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        this.router.navigate(['/login']);
      }
    }
  }

  cargarInformacionSuscripcion(): void {
    if (this.currentUser && this.currentUser.id) {
      this.suscripcionActual = this.suscripcionService.getSuscripcionActual(this.currentUser.id);
      this.tieneSuscripcionActiva = this.suscripcionService.isSuscripcionActiva(this.currentUser.id);
      this.diasRestantes = this.suscripcionService.getDiasRestantes(this.currentUser.id);
      this.historialSuscripciones = this.suscripcionService.getHistorialSuscripcionesUsuario(this.currentUser.id);
    }
  }

  renovarSuscripcion(): void {
    if (this.suscripcionActual) {
      this.router.navigate(['/suscripcion']);
    }
  }

  cancelarSuscripcion(): void {
    if (confirm('¿Estás seguro de que quieres cancelar tu suscripción?')) {
      if (this.currentUser && this.currentUser.id) {
        const cancelado = this.suscripcionService.cancelarSuscripcion(this.currentUser.id);
        if (cancelado) {
          alert('Suscripción cancelada exitosamente');
          this.cargarInformacionSuscripcion();
        } else {
          alert('Error al cancelar la suscripción');
        }
      }
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  cerrarSesion() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        this.router.navigate(['/login']);
      }
    }
  }
}