import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { User } from '../../models/user';
import { Token } from '../../models/token';
import { tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserService {

 constructor(@Inject(PLATFORM_ID) private platformId: Object) {
   if (this.isBrowser()) {
     this.initializeTestData();
   }
 }

 // Inicializar datos de prueba
 private initializeTestData() {
   const existingUsers = localStorage.getItem('users');
   if (!existingUsers || existingUsers === '[]') {
     const testUsers: User[] = [
       {
         id: 1,
         username: 'admin@test.com',
         password: '123456',
         authorities: ['ADMIN'],
         nombre: 'Administrador',
         apellido: 'Sistema',
         telefono: '555555555'
       }
     ];
     localStorage.setItem('users', JSON.stringify(testUsers));
   }
 }

login(user: User): boolean {
  if (!this.isBrowser()) {
    return false;
  }
  
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const foundUser = users.find(u => u.username === user.username && u.password === user.password);

  if (foundUser) {
    localStorage.setItem('jwtToken', 'FAKE-TOKEN');
    localStorage.setItem('user_id', foundUser.id.toString());
    localStorage.setItem('authorities', JSON.stringify(foundUser.authorities));

    // ✅ Guarda el usuario completo
    localStorage.setItem('currentUser', JSON.stringify(foundUser));
    return true;
  }

  return false;
}
  // Simular registro
  register(newUser: User): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    
    let users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

    // Verificar si el username ya existe
    const exists = users.some(u => u.username === newUser.username);
    if (exists) return false;

    // Asignar ID automáticamente
    const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
    newUser.id = maxId + 1;

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }

  logout() {
  if (this.isBrowser()) {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user_id');
    localStorage.removeItem('authorities');
  }
}

  isLogged() {
    return this.getUserIdActual() !== 0;
  }

  getUserIdActual() {
    if (!this.isBrowser()) {
      return 0;
    }
    return parseInt(localStorage.getItem('user_id') || '0');
  }

  geAuthoritiesActual() {
    if (!this.isBrowser()) {
      return '';
    }
    return localStorage.getItem('authorities') || '';
  }

  getTokenActual() {
    if (!this.isBrowser()) {
      return '';
    }
    return localStorage.getItem('jwtToken') || '';
  }

  getCurrentUser() {
    if (!this.isBrowser()) {
      return '';
    }
    return localStorage.getItem('authorities') || '';
  }

  hasRole(stringRole: string): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    const authorities = JSON.parse(localStorage.getItem('authorities') || '[]');
    return authorities.includes(stringRole);
  }

  // Obtener todos los usuarios
  getAllUsers(): User[] {
    if (!this.isBrowser()) {
      return [];
    }
    try {
      return JSON.parse(localStorage.getItem('users') || '[]');
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }

  // Actualizar un usuario
  updateUser(updatedUser: User): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    
    try {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const index = users.findIndex(u => u.id === updatedUser.id);
      
      if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return false;
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}