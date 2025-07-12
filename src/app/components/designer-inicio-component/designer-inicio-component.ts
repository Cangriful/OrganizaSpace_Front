import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChatService } from '../../services/chat-service';
import { AuthService } from '../../services/auth-service';
import { Peticion } from '../../../models/peticion';

@Component({
  selector: 'app-designer-inicio-component',
  standalone: false,
  templateUrl: './designer-inicio-component.html',
  styleUrl: './designer-inicio-component.css'
})
export class DesignerInicioComponent implements OnInit {
  chatsDisponibles: Peticion[] = [];
  chatsAsignados: Peticion[] = [];
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
        this.cargarChats();
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.isLoading = false;
    }
  }

  cargarChats() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.chatsDisponibles = this.chatService.getChatsDisponibles();
        this.chatsAsignados = this.chatService.getChatsPorDisenador(this.idActual!);
      } catch (error) {
        console.error('Error al cargar chats:', error);
        this.chatsDisponibles = [];
        this.chatsAsignados = [];
      }
    }
  }

  tomarChat(chat: Peticion) {
    if (isPlatformBrowser(this.platformId) && chat.estado === 'disponible') {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.chatService.asignarChat(chat.idPeticion, currentUser);
        this.cargarChats();
      } catch (error) {
        console.error('Error al tomar chat:', error);
      }
    }
  }
} 