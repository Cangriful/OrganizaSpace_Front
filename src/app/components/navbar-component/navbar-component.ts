import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';
/*sandunga*/
@Component({
  selector: 'app-navbar-component',
  standalone: false,
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.css'
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}
/*para ocultar o mostrar botones en el navbar*/
  tieneRol(roles: string | string[]): boolean {
    return this.authService.tieneRol(roles);
  }
}
