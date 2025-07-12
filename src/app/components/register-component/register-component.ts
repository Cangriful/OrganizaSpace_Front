import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from '../../services/user-service';
import { PerfilFotosService } from '../../services/perfil-fotos-service';
import { Router } from '@angular/router';
import { User } from '../../../models/user';

@Component({
  selector: 'app-register-component',
  standalone: false,
  templateUrl: './register-component.html',
  styleUrl: './register-component.css'
})
export class RegisterComponent {
  registerForm!: FormGroup;
  hidePassword = true;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  guardandoFoto: boolean = false;

  roles = [
    { value: 'USER', label: 'Usuario' },
    { value: 'DESIGNER', label: 'Diseñador' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private perfilFotosService: PerfilFotosService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
/*el form se inicializa vacio cuando se va cargar justo despues de lo elementos visuales*/
  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER', Validators.required],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required]
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
      this.previewFile(file);
    }
  }

  previewFile(file: File): void {
    if (isPlatformBrowser(this.platformId)) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async Registrar(): Promise<void> {
    if (this.registerForm.invalid) {
      alert('Por favor completa todos los campos correctamente.');
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      alert('No se puede registrar en el servidor.');
      return;
    }

    try {
      const rolSeleccionado = this.registerForm.get('role')?.value;
      const nuevoUsuario: User = {
        id: 0, // será asignado en el servicio
        username: this.registerForm.get('username')?.value,
        password: this.registerForm.get('password')?.value,
        authorities: [rolSeleccionado],
        nombre: this.registerForm.get('nombre')?.value,
        apellido: this.registerForm.get('apellido')?.value,
        telefono: this.registerForm.get('telefono')?.value
      };

      const success = this.userService.register(nuevoUsuario);

      if (success) {
        // Si el registro fue exitoso y hay una foto seleccionada, guardarla
        if (this.selectedFile) {
          this.guardandoFoto = true;
          try {
            // Obtener el ID del usuario recién registrado
            const usuarios = this.userService.getAllUsers();
            const usuarioRegistrado = usuarios.find(u => u.username === nuevoUsuario.username);
            
            if (usuarioRegistrado) {
              const userType = rolSeleccionado === 'USER' ? 'cliente' : 'disenador';
              const fotoUrl = await this.perfilFotosService.guardarFotoPerfil(
                this.selectedFile, 
                usuarioRegistrado.id, 
                userType
              );

              // Actualizar el usuario con la foto de perfil
              usuarioRegistrado.fotoPerfil = fotoUrl;
              this.userService.updateUser(usuarioRegistrado);
            }
          } catch (error) {
            console.error('Error al guardar foto de perfil:', error);
            alert('Usuario registrado exitosamente, pero hubo un error al guardar la foto de perfil.');
          } finally {
            this.guardandoFoto = false;
          }
        }

        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      } else {
        alert('Este usuario ya está registrado.');
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      alert('Error durante el registro. Inténtalo de nuevo.');
    }
  }

  // Limpiar foto seleccionada
  limpiarFoto(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }
}
/*register*/
