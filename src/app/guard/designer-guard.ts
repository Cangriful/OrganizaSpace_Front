import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user-service';
import { Router } from '@angular/router';

export const designerGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  
  // Verificar si el usuario está autenticado
  if (!userService.isLogged()) {
    router.navigate(['/login']);
    return false;
  }

  // Verificar si el usuario tiene el rol DESIGNER
  const hasDesignerRole = userService.hasRole('DESIGNER');
  
  if (!hasDesignerRole) {
    router.navigate(['/inicio']);
    return false;
  }
  
  return true;
};
