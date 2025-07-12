import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { User } from '../../../models/user';
import { Suscripcion } from '../../../models/suscripcion';
import { SuscripcionService } from '../../services/suscripcion-service';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-suscripcion-component',
  standalone: false,
  templateUrl: './suscripcion-component.html',
  styleUrl: './suscripcion-component.css'
})
export class SuscripcionComponent implements OnInit {
  modalAbierto: boolean = false;
  planSeleccionado: string = '';
  userData: any = null;
  suscripcionActual: Suscripcion | null = null;
  diasRestantes: number = 0;
  tieneSuscripcionActiva: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private suscripcionService: SuscripcionService,
    private router: Router
  ) {}
/*Aca puedo visualizar los roles*/
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.userData = currentUser;
        
        // Verificar si es diseñador o administrador
        const roles = currentUser.authorities || [];
        const esDisenador = roles.includes('DESIGNER');
        const esAdmin = roles.includes('ADMIN');
        
        if (esDisenador || esAdmin) {
          alert('Los diseñadores y administradores no necesitan suscripción. Tienen acceso completo.');
          this.router.navigate(['/perfil']);
          return;
        }
        
        if (this.userData && this.userData.id) {
          this.cargarInformacionSuscripcion();
        }
      } catch (error) {
        console.error('Error al cargar datos de suscripción:', error);
      }
    }
  }

  cargarInformacionSuscripcion(): void {
    if (this.userData && this.userData.id) {
      this.suscripcionActual = this.suscripcionService.getSuscripcionActual(this.userData.id);
      this.tieneSuscripcionActiva = this.suscripcionService.isSuscripcionActiva(this.userData.id);
      this.diasRestantes = this.suscripcionService.getDiasRestantes(this.userData.id);
    }
  }

  abrirModal(plan: string) {
    // Si ya tiene suscripción activa, mostrar mensaje
    if (this.tieneSuscripcionActiva) {
      alert('Ya tienes una suscripción activa. Puedes renovarla cuando venza.');
      return;
    }
    
    this.planSeleccionado = plan;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    // Recargar información de suscripción después de cerrar el modal
    this.cargarInformacionSuscripcion();
  }
/*si desea cancelar su suscripcion*/
  cancelarSuscripcion(): void {
    if (confirm('¿Estás seguro de que quieres cancelar tu suscripción?')) {
      if (this.userData && this.userData.id) {
        const cancelado = this.suscripcionService.cancelarSuscripcion(this.userData.id);
        if (cancelado) {
          alert('Suscripción cancelada exitosamente');
          this.cargarInformacionSuscripcion();
        } else {
          alert('Error al cancelar la suscripción');
        }
      }
    }
  }
  
  renovarSuscripcion(): void {
    if (this.suscripcionActual) {
      this.abrirModal(this.suscripcionActual.nombre.split('-')[0]);
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
