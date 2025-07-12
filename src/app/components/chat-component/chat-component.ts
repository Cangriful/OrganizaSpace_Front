import { Component, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { ChatService } from '../../services/chat-service';
import { SuscripcionService } from '../../services/suscripcion-service';
import { FotosService } from '../../services/fotos-service';
import { PerfilFotosService } from '../../services/perfil-fotos-service';
import { Peticion, MensajeChat } from '../../../models/peticion';

@Component({
  selector: 'app-chat-component',
  standalone: false,
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.css'
})
export class ChatComponent {
  textValue: string = "";
  chatInputValue: string = "";
  userName: string = "";
  designerName: string = "Diseñador";
  page: number = 1;
  chatTextList: { name: string; text: string; imagen?: string; nombreArchivo?: string; fotoPerfil?: string | null }[] = [];
  fileName: string = '';
  filePreviewUrl: string | ArrayBuffer | null = null;
  isImage: boolean = false;
  idPeticionActual: number | null = null;
  chatCargado: Peticion | null = null;
  esUsuario: boolean = false;
  esDisenador: boolean = false;
  cantidadMensajes: number = 0;
  puedeEnviarMensajes: boolean = true;
  userData: any = null;
  archivoSeleccionado: File | null = null;
  guardandoImagen: boolean = false;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private suscripcionService: SuscripcionService,
    @Optional() private fotosService: FotosService,
    @Optional() private perfilFotosService: PerfilFotosService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userName = this.authService.getNombreCliente();
    // Detectar rol
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.userData = currentUser;
    const roles = currentUser.authorities || [];
    this.esUsuario = roles.includes('USER');
    this.esDisenador = roles.includes('DESIGNER');
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        // Cargar el chat existente
        const chat = this.chatService.getChatPorId(Number(id));
        if (chat) {
          this.chatCargado = chat;
          this.idPeticionActual = chat.idPeticion;
          this.page = 2;
          // Mostrar los mensajes existentes con fotos de perfil
          this.chatTextList = chat.mensajes.map(m => ({
            name: m.remitente === 'usuario' ? this.userName : this.designerName,
            text: m.texto,
            imagen: m.imagen,
            nombreArchivo: m.nombreArchivo,
            fotoPerfil: this.obtenerFotoPerfilUsuario(m.remitente, chat)
          }));
          this.cantidadMensajes = chat.mensajes.filter(m => m.remitente === 'usuario').length;
          this.verificarLimiteMensajes();
        }
      }
    });
  }

  // Obtener foto de perfil del usuario
  obtenerFotoPerfilUsuario(remitente: string, chat: Peticion): string | null {
    if (!this.perfilFotosService) return null;
    
    if (remitente === 'usuario') {
      // Buscar foto del cliente
      if (chat.idCliente && typeof chat.idCliente === 'object') {
        const clienteId = (chat.idCliente as any).id || (chat.idCliente as any).idCliente;
        if (clienteId) {
          return this.perfilFotosService.obtenerFotoPorUsuario(clienteId, 'cliente');
        }
      }
    } else if (remitente === 'diseñador') {
      // Buscar foto del diseñador
      if (chat.idDisenador && typeof chat.idDisenador === 'object') {
        const disenadorId = (chat.idDisenador as any).id || (chat.idDisenador as any).idDisenador;
        if (disenadorId) {
          return this.perfilFotosService.obtenerFotoPorUsuario(disenadorId, 'disenador');
        }
      }
    }
    return null;
  }

  verificarLimiteMensajes(): void {
    if (this.esUsuario && this.userData && this.userData.id) {
      this.puedeEnviarMensajes = this.suscripcionService.puedeEnviarMensajes(
        this.userData.id, 
        this.cantidadMensajes
      );
    }
  }

  async changeToSecondDisplay() {
    if (!this.textValue.trim() && !this.archivoSeleccionado) {
      alert('Por favor ingresa una descripción o selecciona una imagen');
      return;
    }

    this.page = 2;
    try {
      // Guardar imagen si hay archivo seleccionado
      let imagenUrl: string | undefined;
      let nombreArchivo: string | undefined;

      if (this.archivoSeleccionado && this.fotosService) {
        this.guardandoImagen = true;
        try {
          imagenUrl = await this.fotosService.guardarImagen(this.archivoSeleccionado);
          nombreArchivo = this.archivoSeleccionado.name;
        } catch (error) {
          console.error('Error al guardar imagen:', error);
          alert('Error al guardar la imagen. Inténtalo de nuevo.');
          this.guardandoImagen = false;
          return;
        } finally {
          this.guardandoImagen = false;
        }
      }

      // Crear la petición (chat) y guardarla en localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const nuevaPeticion: Peticion = {
        idPeticion: Date.now(),
        idCliente: currentUser,
        idEspacio: { idEspacio: 0, nombreEspacio: '', descripcion: '', imagenUrl: '' },
        idServicio: { idServicio: 0, descripcion: '' },
        idDisenador: null,
        descripcion: this.textValue,
        recomendacion: '',
        estado: 'disponible',
        mensajes: [
          {
            remitente: 'usuario',
            texto: this.textValue,
            fecha: new Date().toISOString(),
            imagen: imagenUrl,
            nombreArchivo: nombreArchivo
          }
        ]
      };
      
      this.chatService.crearChat(nuevaPeticion);
      this.idPeticionActual = nuevaPeticion.idPeticion;
      
      // Obtener foto de perfil del usuario actual
      const fotoPerfil = this.perfilFotosService ? 
        this.perfilFotosService.obtenerFotoPorUsuario(currentUser.id, 'cliente') : null;
      
      this.chatTextList = [{ 
        name: this.userName, 
        text: this.textValue,
        imagen: imagenUrl,
        nombreArchivo: nombreArchivo,
        fotoPerfil: fotoPerfil
      }];
      this.cantidadMensajes = 1;
      this.verificarLimiteMensajes();
      
      // Limpiar archivo seleccionado
      this.archivoSeleccionado = null;
      this.filePreviewUrl = null;
      this.fileName = '';
      
      setTimeout(() => {
        let firstResponseText = {
          name: this.designerName,
          text: "Primera respuesta automática",
          fotoPerfil: null // El diseñador no tiene foto por defecto
        };
        this.chatTextList.push(firstResponseText);
      }, 1000);
    } catch (error) {
      console.error('Error al crear chat:', error);
      alert('Error al crear el chat. Inténtalo de nuevo.');
    }
  }

  async addChat() {
    // Verificar límite de mensajes para usuarios
    if (this.esUsuario && !this.puedeEnviarMensajes) {
      alert('Has alcanzado el límite de 5 mensajes. Suscríbete para mensajes ilimitados.');
      return;
    }

    if (!this.chatInputValue.trim() && !this.archivoSeleccionado) {
      alert('Por favor ingresa un mensaje o selecciona una imagen');
      return;
    }

    try {
      // Guardar imagen si hay archivo seleccionado
      let imagenUrl: string | undefined;
      let nombreArchivo: string | undefined;

      if (this.archivoSeleccionado && this.fotosService) {
        this.guardandoImagen = true;
        try {
          imagenUrl = await this.fotosService.guardarImagen(this.archivoSeleccionado);
          nombreArchivo = this.archivoSeleccionado.name;
        } catch (error) {
          console.error('Error al guardar imagen:', error);
          alert('Error al guardar la imagen. Inténtalo de nuevo.');
          this.guardandoImagen = false;
          return;
        } finally {
          this.guardandoImagen = false;
        }
      }

      // Determinar remitente según el rol
      let remitente: 'usuario' | 'diseñador' = this.esUsuario ? 'usuario' : 'diseñador';
      let nombreRemitente = this.esUsuario ? this.userName : this.designerName;
      
      // Obtener foto de perfil del remitente
      const fotoPerfil = this.perfilFotosService ? 
        (this.esUsuario 
          ? this.perfilFotosService.obtenerFotoPorUsuario(this.userData.id, 'cliente')
          : this.perfilFotosService.obtenerFotoPorUsuario(this.userData.id, 'disenador')
        ) : null;
      
      let newChatText = {
        name: nombreRemitente,
        text: this.chatInputValue,
        imagen: imagenUrl,
        nombreArchivo: nombreArchivo,
        fotoPerfil: fotoPerfil
      };
      this.chatTextList.push(newChatText);
      
      // Incrementar contador de mensajes si es usuario
      if (this.esUsuario) {
        this.cantidadMensajes++;
        this.verificarLimiteMensajes();
      }
      
      // Guardar mensaje en el chat actual
      if (this.idPeticionActual) {
        this.chatService.agregarMensaje(this.idPeticionActual, {
          remitente: remitente,
          texto: this.chatInputValue,
          fecha: new Date().toISOString(),
          imagen: imagenUrl,
          nombreArchivo: nombreArchivo
        });
      }

      // Limpiar inputs
      this.chatInputValue = "";
      this.archivoSeleccionado = null;
      this.filePreviewUrl = null;
      this.fileName = '';
    } catch (error) {
      console.error('Error al agregar mensaje:', error);
      alert('Error al enviar el mensaje. Inténtalo de nuevo.');
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.files) {
      const file = input.files[0];
      this.archivoSeleccionado = file;
      this.fileName = file.name;
      this.previewFile(file);
    }
  }

  // Función para generar la previsualización del archivo
  previewFile(file: File) {
    const reader = new FileReader();

    // Comprobar si el archivo es una imagen
    this.isImage = file.type.startsWith('image/');

    // Leer el archivo
    reader.onload = () => {
      this.filePreviewUrl = reader.result;
    };

    // Leer el archivo como URL de objeto
    reader.readAsDataURL(file);
  }

  // Obtener URL de imagen para mostrar
  getImagenUrl(imagenUrl: string | undefined): string | null {
    if (!imagenUrl || !this.fotosService) return null;
    return this.fotosService.obtenerImagen(imagenUrl);
  }

  // Obtener foto de perfil para mostrar
  getFotoPerfilUrl(fotoPerfilUrl: string | undefined): string | null {
    if (!fotoPerfilUrl || !this.perfilFotosService) return null;
    return this.perfilFotosService.obtenerFotoPerfil(fotoPerfilUrl);
  }

  // Obtener avatar por defecto (SVG)
  getDefaultAvatar(isUser: boolean): string {
    if (isUser) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2Qzc1N0QiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMzJDMTAuMjA5MSAzMiAxMiAzMC4yMDkxIDEyIDI4QzEyIDI1Ljc5MDkgMTAuMjA5MSAyNCA4IDI0QzUuNzkwODYgMjQgNCAyNS43OTA5IDQgMjhDNCAzMC4yMDkxIDUuNzkwODYgMzIgOCAzMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zMiAzMkMzNC4yMDkxIDMyIDM2IDMwLjIwOTEgMzYgMjhDMzYgMjUuNzkwOSAzNC4yMDkxIDI0IDMyIDI0QzI5Ljc5MDkgMjQgMjggMjUuNzkwOSAyOCAyOEMyOCAzMC4yMDkxIDI5Ljc5MDkgMzIgMzIgMzJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
    } else {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMwMDdCRkYiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMzJDMTAuMjA5MSAzMiAxMiAzMC4yMDkxIDEyIDI4QzEyIDI1Ljc5MDkgMTAuMjA5MSAyNCA4IDI0QzUuNzkwODYgMjQgNCAyNS43OTA5IDQgMjhDNCAzMC4yMDkxIDUuNzkwODYgMzIgOCAzMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zMiAzMkMzNC4yMDkxIDMyIDM2IDMwLjIwOTEgMzYgMjhDMzYgMjUuNzkwOSAzNC4yMDkxIDI0IDMyIDI0QzI5Ljc5MDkgMjQgMjggMjUuNzkwOSAyOCAyOEMyOCAzMC4yMDkxIDI5Ljc5MDkgMzIgMzIgMzJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
    }
  }

  // Manejar error de carga de imagen
  onImageError(event: any, isUser: boolean): void {
    const img = event.target as HTMLImageElement;
    // Usar avatares SVG inline en lugar de archivos PNG
    if (isUser) {
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2Qzc1N0QiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMzJDMTAuMjA5MSAzMiAxMiAzMC4yMDkxIDEyIDI4QzEyIDI1Ljc5MDkgMTAuMjA5MSAyNCA4IDI0QzUuNzkwODYgMjQgNCAyNS43OTA5IDQgMjhDNCAzMC4yMDkxIDUuNzkwODYgMzIgOCAzMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zMiAzMkMzNC4yMDkxIDMyIDM2IDMwLjIwOTEgMzYgMjhDMzYgMjUuNzkwOSAzNC4yMDkxIDI0IDMyIDI0QzI5Ljc5MDkgMjQgMjggMjUuNzkwOSAyOCAyOEMyOCAzMC4yMDkxIDI5Ljc5MDkgMzIgMzIgMzJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
    } else {
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMwMDdCRkYiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMzJDMTAuMjA5MSAzMiAxMiAzMC4yMDkxIDEyIDI4QzEyIDI1Ljc5MDkgMTAuMjA5MSAyNCA4IDI0QzUuNzkwODYgMjQgNCAyNS43OTA5IDQgMjhDNCAzMC4yMDkxIDUuNzkwODYgMzIgOCAzMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zMiAzMkMzNC4yMDkxIDMyIDM2IDMwLjIwOTEgMzYgMjhDMzYgMjUuNzkwOSAzNC4yMDkxIDI0IDMyIDI0QzI5Ljc5MDkgMjQgMjggMjUuNzkwOSAyOCAyOEMyOCAzMC4yMDkxIDI5Ljc5MDkgMzIgMzIgMzJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
    }
  }
}