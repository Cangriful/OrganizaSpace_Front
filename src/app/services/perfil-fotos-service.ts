import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PerfilFotosService {
  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB para fotos de perfil
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Verificar si estamos en el navegador
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Guardar foto de perfil
  async guardarFotoPerfil(file: File, userId: number, userType: 'cliente' | 'disenador'): Promise<string> {
    if (!this.isBrowser()) {
      throw new Error('No se puede guardar archivos en el servidor');
    }

    // Validar archivo
    this.validarArchivo(file);

    try {
      // Generar nombre único para el archivo
      const nombreArchivo = this.generarNombrePerfil(userId, userType, file.name);
      
      // Convertir archivo a base64 para almacenamiento
      const base64 = await this.convertirABase64(file);
      
      // Guardar en localStorage con metadata
      const fotoData = {
        nombre: nombreArchivo,
        tipo: file.type,
        tamaño: file.size,
        data: base64,
        fecha: new Date().toISOString(),
        userId: userId,
        userType: userType
      };

      // Obtener fotos de perfil existentes
      const fotosPerfil = JSON.parse(localStorage.getItem('fotos_perfil') || '[]');
      
      // Eliminar foto anterior del mismo usuario si existe
      const fotosFiltradas = fotosPerfil.filter((foto: any) => 
        !(foto.userId === userId && foto.userType === userType)
      );
      
      fotosFiltradas.push(fotoData);
      localStorage.setItem('fotos_perfil', JSON.stringify(fotosFiltradas));

      // Retornar URL simulada
      return `assets/images/perfil/${nombreArchivo}`;
    } catch (error) {
      console.error('Error al guardar foto de perfil:', error);
      throw new Error('No se pudo guardar la foto de perfil');
    }
  }

  // Validar archivo
  private validarArchivo(file: File): void {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('El archivo es demasiado grande. Máximo 2MB');
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, GIF, WebP)');
    }
  }

  // Generar nombre único para foto de perfil
  private generarNombrePerfil(userId: number, userType: string, nombreOriginal: string): string {
    const timestamp = Date.now();
    const extension = nombreOriginal.split('.').pop();
    const nombreSinExtension = nombreOriginal.replace(/\.[^/.]+$/, '');
    const nombreLimpio = nombreSinExtension.replace(/[^a-zA-Z0-9]/g, '_');
    
    return `${userType}_${userId}_${nombreLimpio}_${timestamp}.${extension}`;
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

  // Obtener foto de perfil por URL
  obtenerFotoPerfil(url: string): string | null {
    if (!this.isBrowser()) return null;

    try {
      const fotosPerfil = JSON.parse(localStorage.getItem('fotos_perfil') || '[]');
      const nombreArchivo = url.split('/').pop();
      const foto = fotosPerfil.find((f: any) => f.nombre === nombreArchivo);
      
      return foto ? foto.data : null;
    } catch (error) {
      console.error('Error al obtener foto de perfil:', error);
      return null;
    }
  }

  // Obtener foto de perfil por usuario
  obtenerFotoPorUsuario(userId: number, userType: 'cliente' | 'disenador'): string | null {
    if (!this.isBrowser()) return null;

    try {
      const fotosPerfil = JSON.parse(localStorage.getItem('fotos_perfil') || '[]');
      const foto = fotosPerfil.find((f: any) => 
        f.userId === userId && f.userType === userType
      );
      
      return foto ? foto.data : null;
    } catch (error) {
      console.error('Error al obtener foto por usuario:', error);
      return null;
    }
  }

  // Eliminar foto de perfil
  eliminarFotoPerfil(userId: number, userType: 'cliente' | 'disenador'): boolean {
    if (!this.isBrowser()) return false;

    try {
      const fotosPerfil = JSON.parse(localStorage.getItem('fotos_perfil') || '[]');
      const fotosFiltradas = fotosPerfil.filter((f: any) => 
        !(f.userId === userId && f.userType === userType)
      );
      
      localStorage.setItem('fotos_perfil', JSON.stringify(fotosFiltradas));
      return true;
    } catch (error) {
      console.error('Error al eliminar foto de perfil:', error);
      return false;
    }
  }

  // Obtener estadísticas de fotos de perfil
  obtenerEstadisticas(): { total: number; tamañoTotal: number } {
    if (!this.isBrowser()) return { total: 0, tamañoTotal: 0 };

    try {
      const fotosPerfil = JSON.parse(localStorage.getItem('fotos_perfil') || '[]');
      const tamañoTotal = fotosPerfil.reduce((total: number, foto: any) => total + foto.tamaño, 0);
      
      return {
        total: fotosPerfil.length,
        tamañoTotal: tamañoTotal
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { total: 0, tamañoTotal: 0 };
    }
  }

  // Limpiar fotos de perfil antiguas (más de 90 días)
  limpiarFotosAntiguas(): number {
    if (!this.isBrowser()) return 0;

    try {
      const fotosPerfil = JSON.parse(localStorage.getItem('fotos_perfil') || '[]');
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 90);
      
      const fotosNuevas = fotosPerfil.filter((foto: any) => {
        const fechaFoto = new Date(foto.fecha);
        return fechaFoto > fechaLimite;
      });
      
      const eliminadas = fotosPerfil.length - fotosNuevas.length;
      localStorage.setItem('fotos_perfil', JSON.stringify(fotosNuevas));
      
      return eliminadas;
    } catch (error) {
      console.error('Error al limpiar fotos de perfil:', error);
      return 0;
    }
  }
} 