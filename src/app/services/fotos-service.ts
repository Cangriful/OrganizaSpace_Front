import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Fotos } from '../../models/fotos';

@Injectable({
  providedIn: 'root'
})
export class FotosService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Verificar si estamos en el navegador
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Guardar imagen en localStorage (simulación de guardado en servidor)
  async guardarImagen(file: File): Promise<string> {
    if (!this.isBrowser()) {
      throw new Error('No se puede guardar archivos en el servidor');
    }

    // Validar archivo
    this.validarArchivo(file);

    try {
      // Generar nombre único para el archivo
      const nombreArchivo = this.generarNombreArchivo(file.name);
      
      // Convertir archivo a base64 para almacenamiento
      const base64 = await this.convertirABase64(file);
      
      // Guardar en localStorage con metadata
      const imagenData = {
        nombre: nombreArchivo,
        tipo: file.type,
        tamaño: file.size,
        data: base64,
        fecha: new Date().toISOString()
      };

      // Obtener imágenes existentes
      const imagenes = JSON.parse(localStorage.getItem('imagenes_chat') || '[]');
      imagenes.push(imagenData);
      localStorage.setItem('imagenes_chat', JSON.stringify(imagenes));

      // Retornar URL simulada
      return `assets/images/chat/${nombreArchivo}`;
    } catch (error) {
      console.error('Error al guardar imagen:', error);
      throw new Error('No se pudo guardar la imagen');
    }
  }

  // Validar archivo
  private validarArchivo(file: File): void {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('El archivo es demasiado grande. Máximo 5MB');
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, GIF, WebP)');
    }
  }

  // Generar nombre único para el archivo
  private generarNombreArchivo(nombreOriginal: string): string {
    const timestamp = Date.now();
    const extension = nombreOriginal.split('.').pop();
    const nombreSinExtension = nombreOriginal.replace(/\.[^/.]+$/, '');
    const nombreLimpio = nombreSinExtension.replace(/[^a-zA-Z0-9]/g, '_');
    
    return `${nombreLimpio}_${timestamp}.${extension}`;
  }

  // Convertir archivo a base64
  private convertirABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }

  // Obtener imagen por URL
  obtenerImagen(url: string): string | null {
    if (!this.isBrowser()) return null;

    try {
      const imagenes = JSON.parse(localStorage.getItem('imagenes_chat') || '[]');
      const nombreArchivo = url.split('/').pop();
      const imagen = imagenes.find((img: any) => img.nombre === nombreArchivo);
      
      return imagen ? imagen.data : null;
    } catch (error) {
      console.error('Error al obtener imagen:', error);
      return null;
    }
  }

  // Eliminar imagen
  eliminarImagen(url: string): boolean {
    if (!this.isBrowser()) return false;

    try {
      const imagenes = JSON.parse(localStorage.getItem('imagenes_chat') || '[]');
      const nombreArchivo = url.split('/').pop();
      const imagenesFiltradas = imagenes.filter((img: any) => img.nombre !== nombreArchivo);
      
      localStorage.setItem('imagenes_chat', JSON.stringify(imagenesFiltradas));
      return true;
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      return false;
    }
  }

  // Obtener estadísticas de imágenes
  obtenerEstadisticas(): { total: number; tamañoTotal: number } {
    if (!this.isBrowser()) return { total: 0, tamañoTotal: 0 };

    try {
      const imagenes = JSON.parse(localStorage.getItem('imagenes_chat') || '[]');
      const tamañoTotal = imagenes.reduce((total: number, img: any) => total + img.tamaño, 0);
      
      return {
        total: imagenes.length,
        tamañoTotal: tamañoTotal
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { total: 0, tamañoTotal: 0 };
    }
  }

  // Limpiar imágenes antiguas (más de 30 días)
  limpiarImagenesAntiguas(): number {
    if (!this.isBrowser()) return 0;

    try {
      const imagenes = JSON.parse(localStorage.getItem('imagenes_chat') || '[]');
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30);
      
      const imagenesNuevas = imagenes.filter((img: any) => {
        const fechaImagen = new Date(img.fecha);
        return fechaImagen > fechaLimite;
      });
      
      const eliminadas = imagenes.length - imagenesNuevas.length;
      localStorage.setItem('imagenes_chat', JSON.stringify(imagenesNuevas));
      
      return eliminadas;
    } catch (error) {
      console.error('Error al limpiar imágenes:', error);
      return 0;
    }
  }
}
