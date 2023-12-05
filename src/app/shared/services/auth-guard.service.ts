import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

// Auth Guard Function
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = getAuth();

  return new Promise<boolean>((resolve) => {
    onAuthStateChanged(auth, (user: User | null) => {
      if (user && user.emailVerified) {
        resolve(true);
      } else {
        router.navigate(['/login']);
        resolve(false);
      }
    });
  });
};
