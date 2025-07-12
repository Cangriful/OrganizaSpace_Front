import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './components/inicio-component/inicio-component';
import { SuscripcionComponent } from './components/suscripcion-component/suscripcion-component';
import { ResenaComponent } from './components/resena-component/resena-component';
import { LoginComponent } from './components/login-component/login-component';
import { PerfilComponent } from './components/perfil-component/perfil-component';
import { RegisterComponent } from './components/register-component/register-component';
import { adminviewGuard } from './guard/adminview-guard';
import { AdminviewComponent } from './components/adminview-component/adminview-component';
import { userviewGuardGuard } from './guard/userview-guard-guard';
import { EspaciosCasaComponent } from './components/espacios-casa-component/espacios-casa-component';
import { ServiciosComponent } from './components/servicios-component/servicios-component';
import { ChatComponent } from './components/chat-component/chat-component';
import { ChatListComponent } from './components/chat-list-component/chat-list-component';
import { designerGuard } from './guard/designer-guard';
import { DesignerInicioComponent } from './components/designer-inicio-component/designer-inicio-component';
import { UserChatsComponent } from './components/user-chats-component/user-chats-component';

const routes: Routes = [
  { path: "", component: LoginComponent},
  { path: "inicio", component: InicioComponent,canActivate: [userviewGuardGuard]},
  { path: "suscripcion", component: SuscripcionComponent,canActivate: [userviewGuardGuard]},
  { path: "resena", component: ResenaComponent,canActivate: [userviewGuardGuard]},
  { path: "perfil", component: PerfilComponent},
  { path: "login", component: LoginComponent},
  { path: "register", component: RegisterComponent},
   {path: "admin",component: AdminviewComponent,canActivate: [adminviewGuard]},
   { path:"espacios",component: EspaciosCasaComponent,canActivate: [userviewGuardGuard]},
  { path: 'servicios', component: ServiciosComponent ,canActivate: [userviewGuardGuard]},
  { path: 'home-spaces', component: ChatComponent ,canActivate: [userviewGuardGuard]},
  { path: 'home-spaces/:id', component: ChatComponent ,canActivate: [userviewGuardGuard]},
  { path: 'chat-list', component: ChatListComponent, canActivate: [designerGuard]},
  { path: 'designer', component: DesignerInicioComponent, canActivate: [designerGuard]},
  { path: 'chat', component: UserChatsComponent, canActivate: [userviewGuardGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
