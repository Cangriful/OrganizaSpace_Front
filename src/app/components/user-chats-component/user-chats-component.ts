import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChatService } from '../../services/chat-service';
import { AuthService } from '../../services/auth-service';
import { Peticion } from '../../../models/peticion';

@Component({
  selector: 'app-user-chats-component',
  standalone: false,
  templateUrl: './user-chats-component.html',
  styleUrl: './user-chats-component.css'
})
export class UserChatsComponent implements OnInit {
  misChats: Peticion[] = [];
  idActual: number | null = null;
  isLoading: boolean = true;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.idActual = currentUser.id;
        this.cargarMisChats();
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.isLoading = false;
    }
  }

  cargarMisChats() {
    if (isPlatformBrowser(this.platformId) && this.idActual) {
      try {
        console.log('ID del usuario actual:', this.idActual);
        const todosLosChats = this.chatService.getAllChats();
        console.log('Todos los chats:', todosLosChats);
        this.misChats = this.chatService.getChatsPorUsuario(this.idActual);
        console.log('Mis chats filtrados:', this.misChats);
      } catch (error) {
        console.error('Error al cargar chats:', error);
        this.misChats = [];
      }
    }
  }

  obtenerEstadoChat(chat: Peticion): string {
    if (chat.estado === 'disponible') {
      return 'Esperando diseñador';
    } else if (chat.estado === 'asignado' && chat.idDisenador) {
      return `Asignado a ${chat.idDisenador.nombreDisenador} ${chat.idDisenador.apellidoDisenador}`;
    }
    return chat.estado;
  }

  obtenerColorEstado(chat: Peticion): string {
    if (chat.estado === 'disponible') {
      return 'orange';
    } else if (chat.estado === 'asignado') {
      return 'green';
    }
    return 'gray';
  }
} 
/*user */
