import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ResenaDto } from '../../../models/resena';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-resena-component',
  standalone: false,
  templateUrl: './resena-component.html',
  styleUrl: './resena-component.css'
})
export class ResenaComponent implements OnInit {
  reviewForm: FormGroup;
  stars: number = 0;
  currentUser: any;
  resenas: ResenaDto[] = [];

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.reviewForm = this.fb.group({
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const userData = localStorage.getItem('currentUser');
        this.currentUser = userData ? JSON.parse(userData) : null;
        
        const guardadas = localStorage.getItem('resenas');
        this.resenas = guardadas ? JSON.parse(guardadas) : [];
      } catch (error) {
        console.error('Error al cargar reseñas:', error);
        this.resenas = [];
      }
    }
  }

  seleccionarEstrellas(n: number) {
    this.stars = n;
  }

  subirResena() {
    if (!this.currentUser) {
      alert('Debes iniciar sesión para dejar una reseña.');
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      try {
        const nuevaResena: ResenaDto = {
          user: {
            id: this.currentUser.id,
            nombre: this.currentUser.nombre || this.currentUser.username
          },
          descripcion: this.reviewForm.value.descripcion,
          producto: { idProducto: 3 },
          estrellas: this.stars
        };

        // Guardar en localStorage
        const resenasGuardadas = JSON.parse(localStorage.getItem('resenas') || '[]');
        resenasGuardadas.push(nuevaResena);
        localStorage.setItem('resenas', JSON.stringify(resenasGuardadas));

        // Actualizar en pantalla
        this.resenas.push(nuevaResena);
        alert('Reseña enviada correctamente.');
        this.reviewForm.reset();
        this.stars = 0;
      } catch (error) {
        console.error('Error al subir reseña:', error);
        alert('Error al enviar la reseña.');
      }
    }
  }
}
/*reseña *7
