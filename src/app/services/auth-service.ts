import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {}

  // Este método obtiene el nombre del cliente desde el localStorage
  getNombreCliente(): string {
    return this.isBrowser() ? (localStorage.getItem('nombreCliente') || 'Cliente Anónimo') : 'Cliente Anónimo';  // Si no existe, retorna un valor por defecto
  }

  // Este método guarda el nombre del cliente en localStorage
  setNombreCliente(nombre: string): void {
    if (this.isBrowser()) {
      localStorage.setItem('nombreCliente', nombre);  // Guarda el nombre del cliente en localStorage
    }
  }

  // Este método elimina el nombre del cliente desde localStorage
  eliminarNombreCliente(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('nombreCliente');  // Elimina el nombre del cliente de localStorage
    }
  }

  // Verifica si el entorno es un navegador
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Este método obtiene el rol actual desde el localStorage
  getRolesActuales(): string[] {
    if (this.isBrowser()) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return currentUser.authorities || [];
    }
    return [];
  }

  // Este método verifica si el usuario tiene al menos uno de los roles especificados
  tieneRol(roles: string | string[]): boolean {
    if (this.isBrowser()) {
      const userRoles = this.getRolesActuales();
      
      // Si se pasa un string, convertirlo a array
      const rolesToCheck = Array.isArray(roles) ? roles : [roles];
      
      return rolesToCheck.some(role => userRoles.includes(role));
    }
    return false;
  }
}