import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { User } from '../../../models/user';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-adminview-component',
  standalone: false,
  templateUrl: './adminview-component.html',
  styleUrl: './adminview-component.css'
})
export class AdminviewComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nombre', 'correo', 'telefono', 'rol', 'suscripcion', 'acciones'];
  dataSource = new MatTableDataSource<User>();
  users: User[] = [];
  currentAdmin?: User;
  filtroRol: string = 'todos';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        // Mostrar todos los usuarios excepto el admin actual
        const currentUserData = localStorage.getItem('currentUser');
        if (currentUserData) {
          this.currentAdmin = JSON.parse(currentUserData);
          this.dataSource.data = users.filter(u => u.id !== this.currentAdmin?.id);
        } else {
          this.dataSource.data = users;
        }
        
        this.users = users;
      } catch (error) {
        console.error('Error al cargar datos de administración:', error);
        this.users = [];
      }
    }
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = value;
  }

  filtrarPorRol(rol: string): void {
    this.filtroRol = rol;
    if (isPlatformBrowser(this.platformId)) {
      try {
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        let usuariosFiltrados = users.filter(u => u.id !== this.currentAdmin?.id);
        
        if (rol !== 'todos') {
          usuariosFiltrados = usuariosFiltrados.filter(u => u.authorities.includes(rol));
        }
        
        this.dataSource.data = usuariosFiltrados;
      } catch (error) {
        console.error('Error al filtrar por rol:', error);
      }
    }
  }

  cambiarRol(user: User, nuevoRol: string): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex !== -1) {
          users[userIndex].authorities = [nuevoRol];
          localStorage.setItem('users', JSON.stringify(users));
          
          // Actualizar la tabla
          this.dataSource.data = users.filter(u => u.id !== this.currentAdmin?.id);
          
          this.snackBar.open(`Rol de ${user.nombre} cambiado a ${nuevoRol}`, 'Cerrar', { duration: 3000 });
        }
      } catch (error) {
        console.error('Error al cambiar rol:', error);
        this.snackBar.open('Error al cambiar rol', 'Cerrar', { duration: 3000 });
      }
    }
  }

  eliminar(id: number): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const userToDelete = users.find(u => u.id === id);
        
        if (userToDelete && userToDelete.authorities.includes('ADMIN')) {
          this.snackBar.open('No se puede eliminar un administrador', 'Cerrar', { duration: 3000 });
          return;
        }
        
        const actualizados = users.filter(u => u.id !== id);
        localStorage.setItem('users', JSON.stringify(actualizados));
        this.dataSource.data = actualizados.filter(u => u.id !== this.currentAdmin?.id);
        this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 3000 });
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        this.snackBar.open('Error al eliminar usuario', 'Cerrar', { duration: 3000 });
      }
    }
  }

  getSuscripcionInfo(user: User): string {
    if (user.suscripcion) {
      const diasRestantes = this.calcularDiasRestantes(user.suscripcion.fechaVencimiento);
      return `${user.suscripcion.nombre} (${diasRestantes} días)`;
    }
    return 'Sin suscripción';
  }

  private calcularDiasRestantes(fechaVencimiento: string): number {
    const fechaVenc = new Date(fechaVencimiento);
    const fechaActual = new Date();
    const diferencia = fechaVenc.getTime() - fechaActual.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  getEstadisticas() {
    const totalUsuarios = this.users.filter(u => u.authorities.includes('USER')).length;
    const totalDisenadores = this.users.filter(u => u.authorities.includes('DESIGNER')).length;
    const totalAdmins = this.users.filter(u => u.authorities.includes('ADMIN')).length;
    const usuariosConSuscripcion = this.users.filter(u => u.suscripcion).length;
    
    return {
      totalUsuarios,
      totalDisenadores,
      totalAdmins,
      usuariosConSuscripcion
    };
  }
}
