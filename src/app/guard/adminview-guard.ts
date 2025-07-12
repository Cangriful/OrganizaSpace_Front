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
  
  if (!userService.hasRole('ADMIN')) {
    router.navigate(['/inicio']);
    return false;
  }
  
  return true;
};
