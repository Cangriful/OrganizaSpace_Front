import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { RouterModule } from '@angular/router';
import { App } from './app';
import { NavbarComponent } from './components/navbar-component/navbar-component';
import { MaterialModule } from './modules/material/material-module';
import { InicioComponent } from './components/inicio-component/inicio-component';
import { FooterComponent } from './components/footer-component/footer-component';
import { SuscripcionComponent } from './components/suscripcion-component/suscripcion-component';
import { MetodopagoComponent } from './components/metodopago-component/metodopago-component';
import { HttpClientModule } from '@angular/common/http';
import { ResenaComponent } from './components/resena-component/resena-component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login-component/login-component';
import { PerfilComponent } from './components/perfil-component/perfil-component';
import { RegisterComponent } from './components/register-component/register-component';
import { AdminviewComponent } from './components/adminview-component/adminview-component';
import { SubirFotosComponent } from './components/subir-fotos-component/subir-fotos-component';
import { EspaciosCasaComponent } from './components/espacios-casa-component/espacios-casa-component';
import { ServiciosComponent } from './components/servicios-component/servicios-component';
import { ChatComponent } from './components/chat-component/chat-component';
import { ChatListComponent } from './components/chat-list-component/chat-list-component';
import { DesignerInicioComponent } from './components/designer-inicio-component/designer-inicio-component';
import { UserChatsComponent } from './components/user-chats-component/user-chats-component';

@NgModule({
  declarations: [
    App,
    NavbarComponent,
    InicioComponent,
    FooterComponent,
    SuscripcionComponent,
    MetodopagoComponent,
    ResenaComponent,
    LoginComponent,
    PerfilComponent,
    RegisterComponent,
    AdminviewComponent,
    SubirFotosComponent,
    EspaciosCasaComponent,
    ServiciosComponent,
    ChatComponent,
    ChatListComponent,
    DesignerInicioComponent,
    UserChatsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [App]
})
export class AppModule { }
