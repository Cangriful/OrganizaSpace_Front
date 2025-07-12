import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user-service';
import { Router } from '@angular/router';

export const adminviewGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  
  if (!userService.isLogged()) {
    router.navigate(['/login']);
    return false;
  }
  /*este guard sirve para darle acceso a el adminm a ciertos componentes*/
  if (!userService.hasRole('ADMIN')) {
    router.navigate(['/inicio']);
    return false;
  }
  
  return true;
};
