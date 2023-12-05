import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Observable, of } from 'rxjs';




export function verifiedUserGuard(router: Router): Observable<boolean | string[]> {
  const auth = getAuth();
  
  return new Observable<boolean>(subscriber => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user || !user.emailVerified) {
        router.navigate(['/verify-email']);
        subscriber.next(false);
      } else {
        subscriber.next(true);
      }
      subscriber.complete();
    });

    // Cleanup subscription on unsubscription
    return { unsubscribe };
  });
}


