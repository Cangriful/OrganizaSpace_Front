import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Suscripcion } from '../../models/suscripcion';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class SuscripcionService {
  private storageKey = 'suscripciones';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (this.isBrowser()) {
      this.migrarDatosSuscripcion();
    }
  }

  // Verificar si estamos en el navegador
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Obtener suscripción actual del usuario
  getSuscripcionActual(userId: number): Suscripcion | null {
    if (!this.isBrowser()) return null;
    
    try {
      // Buscar en la lista de usuarios
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.id === userId);
      
      if (user && user.suscripcion) {
        return user.suscripcion;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener suscripción actual:', error);
      return null;
    }
  }

  // Verificar si la suscripción está activa
  isSuscripcionActiva(userId: number): boolean {
    if (!this.isBrowser()) return false;
    
    try {
      const suscripcion = this.getSuscripcionActual(userId);
      if (!suscripcion) return false;
      
      const fechaVencimiento = new Date(suscripcion.fechaVencimiento);
      const fechaActual = new Date();
      
      return fechaVencimiento > fechaActual;
    } catch (error) {
      console.error('Error al verificar suscripción activa:', error);
      return false;
    }
  }

  // Crear nueva suscripción
  crearSuscripcion(userId: number, plan: string, metodoPago: string): boolean {
    if (!this.isBrowser()) return false;
    
    try {
      const fechaHoy = new Date();
      const fechaInicio = fechaHoy.toISOString().split('T')[0];
      const fechaVencimiento = new Date(fechaHoy);

      // Calcular fecha de vencimiento según el plan
      switch (plan) {
        case 'anual':
          fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
          break;
        case 'mensual':
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
          break;
        case 'free':
          fechaVencimiento.setDate(fechaVencimiento.getDate() + 7);
          break;
        default:
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
      }

      const vencimiento = fechaVencimiento.toISOString().split('T')[0];

      const nuevaSuscripcion: Suscripcion = {
        idSuscripcion: Date.now(),
        nombre: `${plan}-${metodoPago}`,
        pago: this.obtenerPago(plan),
        fechaInicio,
        fechaVencimiento: vencimiento
      };

      // Actualizar usuario actual
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      currentUser.suscripcion = nuevaSuscripcion;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      // Actualizar en la lista de usuarios
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map(u =>
        u.id === userId ? { ...u, suscripcion: nuevaSuscripcion } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Guardar en historial de suscripciones con userId
      this.guardarEnHistorial(nuevaSuscripcion, userId);

      console.log('Suscripción creada exitosamente:', nuevaSuscripcion);
      return true;
    } catch (error) {
      console.error('Error al crear suscripción:', error);
      return false;
    }
  }

  // Obtener precio según el plan
  private obtenerPago(plan: string): number {
    switch (plan) {
      case 'mensual': return 10;
      case 'anual': return 100;
      case 'free': return 0;
      default: return 0;
    }
  }

  // Guardar en historial de suscripciones
  private guardarEnHistorial(suscripcion: Suscripcion, userId: number): void {
    if (!this.isBrowser()) return;
    
    try {
      const historial = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const suscripcionConUsuario = {
        ...suscripcion,
        userId: userId
      };
      historial.push(suscripcionConUsuario);
      localStorage.setItem(this.storageKey, JSON.stringify(historial));
    } catch (error) {
      console.error('Error al guardar en historial:', error);
    }
  }

  // Obtener historial de suscripciones
  getHistorialSuscripciones(): Suscripcion[] {
    if (!this.isBrowser()) return [];
    
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch (error) {
      console.error('Error al obtener historial:', error);
      return [];
    }
  }

  // Obtener historial de suscripciones de un usuario específico
  getHistorialSuscripcionesUsuario(userId: number): Suscripcion[] {
    if (!this.isBrowser()) return [];
    
    try {
      const historial = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      return historial.filter((s: any) => s.userId === userId);
    } catch (error) {
      console.error('Error al obtener historial del usuario:', error);
      return [];
    }
  }

  // Cancelar suscripción
  cancelarSuscripcion(userId: number): boolean {
    if (!this.isBrowser()) return false;
    
    try {
      // Actualizar usuario actual
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      delete currentUser.suscripcion;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      // Actualizar en la lista de usuarios
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map(u =>
        u.id === userId ? { ...u, suscripcion: undefined } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      console.log('Suscripción cancelada exitosamente');
      return true;
    } catch (error) {
      console.error('Error al cancelar suscripción:', error);
      return false;
    }
  }

  // Obtener días restantes de suscripción
  getDiasRestantes(userId: number): number {
    if (!this.isBrowser()) return 0;
    
    try {
      const suscripcion = this.getSuscripcionActual(userId);
      if (!suscripcion) return 0;
      
      const fechaVencimiento = new Date(suscripcion.fechaVencimiento);
      const fechaActual = new Date();
      const diferencia = fechaVencimiento.getTime() - fechaActual.getTime();
      const diasRestantes = Math.ceil(diferencia / (1000 * 3600 * 24));
      
      return Math.max(0, diasRestantes);
    } catch (error) {
      console.error('Error al calcular días restantes:', error);
      return 0;
    }
  }

  // Limpiar datos duplicados y organizar localStorage
  limpiarDatosDuplicados(): void {
    if (!this.isBrowser()) return;
    
    try {
      // Obtener datos actuales
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const historial = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      
      // Crear mapa de suscripciones únicas por usuario
      const suscripcionesPorUsuario = new Map<number, any>();
      
      // Procesar usuarios con suscripciones
      users.forEach(user => {
        if (user.suscripcion) {
          suscripcionesPorUsuario.set(user.id, {
            ...user.suscripcion,
            userId: user.id
          });
        }
      });
      
      // Procesar historial y mantener solo las más recientes
      historial.forEach((suscripcion: any) => {
        const userId = suscripcion.userId;
        if (userId) {
          const existente = suscripcionesPorUsuario.get(userId);
          if (!existente || suscripcion.idSuscripcion > existente.idSuscripcion) {
            suscripcionesPorUsuario.set(userId, suscripcion);
          }
        }
      });
      
      // Crear nuevo historial limpio
      const historialLimpio = Array.from(suscripcionesPorUsuario.values());
      
      // Actualizar localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(historialLimpio));
      
      console.log('Limpieza de datos duplicados completada');
      console.log('Suscripciones únicas:', historialLimpio.length);
    } catch (error) {
      console.error('Error en limpieza de datos:', error);
    }
  }

  // Migrar y limpiar datos de suscripción existentes
  migrarDatosSuscripcion(): void {
    if (!this.isBrowser()) return;
    
    try {
      // Obtener usuarios con suscripciones
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const historialActual = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      
      // Crear nuevo historial con userId asociado
      const nuevoHistorial: any[] = [];
      
      // Procesar usuarios que tienen suscripción
      users.forEach(user => {
        if (user.suscripcion) {
          const suscripcionConUsuario = {
            ...user.suscripcion,
            userId: user.id
          };
          nuevoHistorial.push(suscripcionConUsuario);
        }
      });
      
      // Agregar suscripciones del historial actual que no estén en usuarios
      historialActual.forEach((suscripcion: any) => {
        if (!suscripcion.userId) {
          // Buscar si esta suscripción pertenece a algún usuario
          const usuarioConSuscripcion = users.find(u => 
            u.suscripcion && u.suscripcion.idSuscripcion === suscripcion.idSuscripcion
          );
          
          if (usuarioConSuscripcion) {
            const suscripcionConUsuario = {
              ...suscripcion,
              userId: usuarioConSuscripcion.id
            };
            nuevoHistorial.push(suscripcionConUsuario);
          }
        } else {
          nuevoHistorial.push(suscripcion);
        }
      });
      
      // Guardar el nuevo historial
      localStorage.setItem(this.storageKey, JSON.stringify(nuevoHistorial));
      
      // Limpiar duplicados
      this.limpiarDatosDuplicados();
      
      console.log('Migración de datos de suscripción completada');
    } catch (error) {
      console.error('Error en migración de datos:', error);
    }
  }

  // Verificar si puede enviar mensajes (para usuarios sin suscripción)
  puedeEnviarMensajes(userId: number, cantidadMensajes: number): boolean {
    if (!this.isBrowser()) return false;
    
    // Si tiene suscripción activa, puede enviar mensajes ilimitados
    if (this.isSuscripcionActiva(userId)) {
      return true;
    }
    
    // Si no tiene suscripción, límite de 5 mensajes
    return cantidadMensajes < 5;
  }
}
