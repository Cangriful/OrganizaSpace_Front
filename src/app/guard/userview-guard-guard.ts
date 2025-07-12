import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user-service';
import { Router } from '@angular/router';

export const userviewGuardGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  
  if (!userService.isLogged()) {
    router.navigate(['/login']);
    return false;
  }
  
  // Permitir acceso a usuarios y diseñadores
  if (!userService.hasRole('USER') && !userService.hasRole('DESIGNER')) {
    router.navigate(['/inicio']);
    return false;
  }
  
  return true;
};
