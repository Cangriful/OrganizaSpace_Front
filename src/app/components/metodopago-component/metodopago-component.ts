import { Component, EventEmitter, Input, Output, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SuscripcionService } from '../../services/suscripcion-service';

@Component({
  selector: 'app-metodopago-component',
  standalone: false,
  templateUrl: './metodopago-component.html',
  styleUrl: './metodopago-component.css'
})
export class MetodopagoComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  @Input() planSeleccionado: string = '';
  metodoSeleccionado: string = '';
  userData: any = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private suscripcionService: SuscripcionService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const currentUserData = localStorage.getItem('currentUser');
        if (currentUserData) {
          this.userData = JSON.parse(currentUserData);
        }
      } catch (error) {
        console.error('Error al cargar datos de método de pago:', error);
      }
    }
  }

  seleccionarMetodo(metodo: string) {
    this.metodoSeleccionado = metodo;
  }
/*seleccionar metodo de pago*/
  confirmar() {
    if (!this.metodoSeleccionado) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    if (!this.userData || !this.userData.id) {
      alert('❌ No se encontró el usuario logueado');
      return;
    }

    // Usar el servicio de suscripción
    const suscripcionCreada = this.suscripcionService.crearSuscripcion(
      this.userData.id,
      this.planSeleccionado,
      this.metodoSeleccionado
    );

    if (suscripcionCreada) {
      alert('✅ Suscripción registrada con éxito');
      this.cerrar.emit();
    } else {
      alert('❌ Error al procesar la suscripción');
    }
  }

  cancelar() {
    this.cerrar.emit();
  }
}

