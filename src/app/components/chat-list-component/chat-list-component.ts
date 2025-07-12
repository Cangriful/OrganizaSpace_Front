import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChatService } from '../../services/chat-service';
import { AuthService } from '../../services/auth-service';
import { SuscripcionService } from '../../services/suscripcion-service';
import { Peticion } from '../../../models/peticion';
import { Suscripcion } from '../../../models/suscripcion';

@Component({
  selector: 'app-chat-list-component',
  standalone: false,
  templateUrl: './chat-list-component.html',
  styleUrl: './chat-list-component.css'
})
export class ChatListComponent implements OnInit {
  chats: Peticion[] = [];
  chatsFiltrados: Peticion[] = [];
  esUsuario: boolean = false;
  esDisenador: boolean = false;
  idActual: number | null = null;
  filtroSeleccionado: string = 'todos';
  filtroEstado: string = 'todos';

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private suscripcionService: SuscripcionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      this.idActual = currentUser.id;
      const roles = currentUser.authorities || [];
      this.esUsuario = roles.includes('USER');
      this.esDisenador = roles.includes('DESIGNER');
      this.cargarChats();
    }
  }

  cargarChats() {
    if (this.esUsuario) {
      this.chats = this.chatService.getChatsPorUsuario(this.idActual!);
      this.chatsFiltrados = [...this.chats];
    } else if (this.esDisenador) {
      // Mostrar los disponibles y los asignados a este diseñador
      const disponibles = this.chatService.getChatsDisponibles();
      const asignados = this.chatService.getChatsPorDisenador(this.idActual!);
      this.chats = [...disponibles, ...asignados];
      this.chatsFiltrados = [...this.chats];
    }
  }

  aplicarFiltro() {
    this.chatsFiltrados = this.chats.filter(chat => {
      // Filtro por tipo de cliente
      const cumpleFiltroCliente = this.cumpleFiltroCliente(chat);
      // Filtro por estado
      const cumpleFiltroEstado = this.cumpleFiltroEstado(chat);
      
      return cumpleFiltroCliente && cumpleFiltroEstado;
    });
  }

  cumpleFiltroCliente(chat: Peticion): boolean {
    const suscripcion = this.getSuscripcionCliente(chat);
    
    switch (this.filtroSeleccionado) {
      case 'todos':
        return true;
      case 'con-suscripcion':
        return suscripcion !== null;
      case 'sin-suscripcion':
        return suscripcion === null;
      case 'premium':
        return suscripcion !== null && (suscripcion.nombre.includes('mensual') || suscripcion.nombre.includes('anual'));
      case 'free':
        return suscripcion !== null && suscripcion.nombre.includes('free');
      default:
        return true;
    }
  }

  cumpleFiltroEstado(chat: Peticion): boolean {
    switch (this.filtroEstado) {
      case 'todos':
        return true;
      case 'disponible':
        return chat.estado === 'disponible';
      case 'asignado':
        return chat.estado === 'asignado';
      default:
        return true;
    }
  }

  limpiarFiltros() {
    this.filtroSeleccionado = 'todos';
    this.filtroEstado = 'todos';
    this.chatsFiltrados = [...this.chats];
  }

  getSuscripcionCliente(chat: Peticion): Suscripcion | null {
    if (chat.idCliente && (chat.idCliente as any).id) {
      return this.suscripcionService.getSuscripcionActual((chat.idCliente as any).id);
    }
    return null;
  }

  getTipoSuscripcion(chat: Peticion): string {
    const suscripcion = this.getSuscripcionCliente(chat);
    if (!suscripcion) return '';
    
    if (suscripcion.nombre.includes('mensual') || suscripcion.nombre.includes('anual')) {
      return 'premium';
    } else if (suscripcion.nombre.includes('free')) {
      return 'free';
    }
    return 'otro';
  }

  getNombreSuscripcion(chat: Peticion): string {
    const suscripcion = this.getSuscripcionCliente(chat);
    if (!suscripcion) return '';
    
    if (suscripcion.nombre.includes('mensual')) {
      return 'Premium Mensual';
    } else if (suscripcion.nombre.includes('anual')) {
      return 'Premium Anual';
    } else if (suscripcion.nombre.includes('free')) {
      return 'Free';
    }
    return suscripcion.nombre;
  }

  getDiasRestantes(chat: Peticion): number {
    if (chat.idCliente && (chat.idCliente as any).id) {
      return this.suscripcionService.getDiasRestantes((chat.idCliente as any).id);
    }
    return 0;
  }

  getClaseFila(chat: Peticion): string {
    const suscripcion = this.getSuscripcionCliente(chat);
    if (suscripcion && chat.idCliente && (chat.idCliente as any).id && this.suscripcionService.isSuscripcionActiva((chat.idCliente as any).id)) {
      return 'fila-premium';
    }
    return 'fila-normal';
  }

  tomarChat(chat: Peticion) {
    if (isPlatformBrowser(this.platformId) && this.esDisenador && chat.estado === 'disponible') {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      this.chatService.asignarChat(chat.idPeticion, currentUser);
      // Solo recargar la lista de chats
      this.cargarChats();
    }
  }
}
