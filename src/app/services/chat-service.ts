import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Peticion, MensajeChat } from '../../models/peticion';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private storageKey = 'chats';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (this.isBrowser()) {
      this.initializeStorage();
    }
  }

  // Verificar si estamos en el navegador
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Inicializar storage si no existe
  private initializeStorage() {
    if (!this.isBrowser()) return;
    
    const existingChats = localStorage.getItem(this.storageKey);
    if (!existingChats) {
      localStorage.setItem(this.storageKey, '[]');
    }
  }

  // Obtener todos los chats
  getAllChats(): Peticion[] {
    if (!this.isBrowser()) return [];
    
    let raw = localStorage.getItem(this.storageKey) || '[]';
    let parsed: any[];
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // Si hay error, limpiar los datos corruptos
      localStorage.setItem(this.storageKey, '[]');
      return [];
    }
    // Validar que cada chat tenga los campos mínimos necesarios
    return parsed.filter(chat =>
      chat && typeof chat.idPeticion === 'number' &&
      chat.idCliente &&
      chat.estado &&
      Array.isArray(chat.mensajes)
    );
  }

  // Guardar todos los chats
  private saveAllChats(chats: Peticion[]) {
    if (this.isBrowser()) {
      localStorage.setItem(this.storageKey, JSON.stringify(chats));
    }
  }

  // Crear un nuevo chat (petición)
  crearChat(peticion: Peticion) {
    if (!this.isBrowser()) return;
    
    const chats = this.getAllChats();
    chats.push(peticion);
    this.saveAllChats(chats);
  }

  // Obtener los chats de un usuario
  getChatsPorUsuario(idCliente: number): Peticion[] {
    if (!this.isBrowser()) return [];
    
    try {
      const chats = this.getAllChats();
      return chats.filter(chat => {
        // Verificar si el chat tiene idCliente con estructura correcta
        if (chat.idCliente && typeof chat.idCliente === 'object') {
          // Si tiene idCliente como número (estructura del modelo)
          if (typeof (chat.idCliente as any).idCliente === 'number') {
            return (chat.idCliente as any).idCliente === idCliente;
          }
          // Si tiene id como número (estructura real de los datos)
          if (typeof (chat.idCliente as any).id === 'number') {
            return (chat.idCliente as any).id === idCliente;
          }
        }
        return false;
      });
    } catch (error) {
      console.error('Error al obtener chats por usuario:', error);
      return [];
    }
  }

  // Obtener los chats de un diseñador
  getChatsPorDisenador(idDisenador: number): Peticion[] {
    if (!this.isBrowser()) return [];
    
    try {
      const chats = this.getAllChats();
      return chats.filter(chat => {
        if (chat.idDisenador && typeof chat.idDisenador === 'object') {
          // Si tiene idDisenador como número (estructura del modelo)
          if (typeof chat.idDisenador.idDisenador === 'number') {
            return chat.idDisenador.idDisenador === idDisenador;
          }
          // Si tiene id como número (estructura real de los datos)
          if (typeof (chat.idDisenador as any).id === 'number') {
            return (chat.idDisenador as any).id === idDisenador;
          }
        }
        return false;
      });
    } catch (error) {
      console.error('Error al obtener chats por diseñador:', error);
      return [];
    }
  }

  // Obtener los chats disponibles (no asignados)
  getChatsDisponibles(): Peticion[] {
    if (!this.isBrowser()) return [];
    return this.getAllChats().filter(chat => chat.estado === 'disponible');
  }

  // Asignar un chat a un diseñador
  asignarChat(idPeticion: number, disenador: any) {
    if (!this.isBrowser()) return;
    
    try {
      const chats = this.getAllChats();
      const chat = chats.find(c => c.idPeticion === idPeticion);
      if (chat && chat.estado === 'disponible') {
        chat.idDisenador = {
          idDisenador: disenador.id,
          nombreDisenador: disenador.nombre || disenador.nombreDisenador || 'Diseñador',
          apellidoDisenador: disenador.apellido || disenador.apellidoDisenador || '',
          telefono: disenador.telefono || '',
          correo: disenador.username || disenador.correo || '',
          disponible: true
        };
        chat.estado = 'asignado';
        this.saveAllChats(chats);
      }
    } catch (error) {
      console.error('Error al asignar chat:', error);
    }
  }

  // Agregar mensaje a un chat
  agregarMensaje(idPeticion: number, mensaje: MensajeChat) {
    if (!this.isBrowser()) return;
    
    const chats = this.getAllChats();
    const chat = chats.find(c => c.idPeticion === idPeticion);
    if (chat) {
      chat.mensajes.push(mensaje);
      this.saveAllChats(chats);
    }
  }

  // Obtener un chat por id
  getChatPorId(idPeticion: number): Peticion | undefined {
    if (!this.isBrowser()) return undefined;
    return this.getAllChats().find(chat => chat.idPeticion === idPeticion);
  }
}
