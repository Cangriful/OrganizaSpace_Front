import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FotosService } from '../../services/fotos-service';
import { Fotos } from '../../../models/fotos';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-subir-fotos',
  standalone: false,
  templateUrl: './subir-fotos-component.html',
  styleUrls: ['./subir-fotos-component.css']
})
export class SubirFotosComponent implements OnInit {
  foto: Fotos = {
    idFotos: 0,
    nombreFotos: '',
    archivo: null,
    idPeticion: 0
  };

  nombreCliente: string = '';
  selectedFile: File | null = null;
  guardandoImagen: boolean = false;
  previewUrl: string | null = null;

  constructor(
    private fotosService: FotosService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.nombreCliente = this.authService.getNombreCliente();
    }
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
      this.foto.archivo = file;
      this.foto.nombreFotos = file.name;
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

  async subirFoto(): Promise<void> {
    if (!this.foto.nombreFotos || !this.foto.archivo) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      alert('No se puede subir archivos en el servidor.');
      return;
    }

    try {
      this.guardandoImagen = true;
      
      // Usar el nuevo método del servicio
      const imagenUrl = await this.fotosService.guardarImagen(this.foto.archivo!);
      
      // Crear un objeto Fotos con la información guardada
      const fotoGuardada: Fotos = {
        idFotos: Date.now(), // ID único
        nombreFotos: this.foto.nombreFotos,
        archivo: this.foto.archivo,
        idPeticion: this.foto.idPeticion
      };

      alert('Foto subida con éxito.');
      
      // Limpiar los campos después de subir la foto
      this.foto.nombreFotos = '';
      this.selectedFile = null;
      this.previewUrl = null;
      
    } catch (error) {
      console.error('Error al subir foto:', error);
      alert('Error al subir la foto. ' + (error as Error).message);
    } finally {
      this.guardandoImagen = false;
    }
  }

  // Método para obtener estadísticas de imágenes
  obtenerEstadisticas(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stats = this.fotosService.obtenerEstadisticas();
      alert(`Total de imágenes: ${stats.total}\nTamaño total: ${(stats.tamañoTotal / 1024 / 1024).toFixed(2)} MB`);
    }
  }

  // Método para limpiar imágenes antiguas
  limpiarImagenesAntiguas(): void {
    if (isPlatformBrowser(this.platformId)) {
      const eliminadas = this.fotosService.limpiarImagenesAntiguas();
      alert(`Se eliminaron ${eliminadas} imágenes antiguas.`);
    }
  }
}
