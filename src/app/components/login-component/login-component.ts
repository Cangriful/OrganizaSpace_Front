import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user-service';
import { Router } from '@angular/router';
import { User } from '../../../models/user';
import { ClienteService } from '../../services/cliente-service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login-component',
  standalone: false,
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent implements OnInit {
 loginForm!: FormGroup;
  ocultarPassword: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
    this.userService.logout();
    }
    this.CargaFormulario();
  }

  CargaFormulario() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

 Login() {
  const user: User = {
    id: 0,
    username: this.loginForm.get('username')?.value,
    password: this.loginForm.get('password')?.value,
    authorities: []
  };

  const success = this.userService.login(user);

  if (success) {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const rol = currentUser.authorities[0];

    if (rol === 'ADMIN') {
      this.router.navigate(['/admin']);
        } else if (rol === 'DESIGNER') {
          this.router.navigate(['/designer']);
    } else {
      this.router.navigate(['/inicio']);
        }
      } catch (error) {
        console.error('Error al procesar el login:', error);
        this.router.navigate(['/inicio']);
      }
    }
  } else {
    alert('Usuario o contraseña incorrectos');
  }
}
}
