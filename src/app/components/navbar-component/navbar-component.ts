import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-navbar-component',
  standalone: false,
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.css'
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

  tieneRol(roles: string | string[]): boolean {
    return this.authService.tieneRol(roles);
  }
}
