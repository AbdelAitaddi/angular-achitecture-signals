import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// services
import { ApartmentFacadeService } from '../facades';

// rxjs
import { of, Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

export const apartmentsGuard: CanActivateFn = () => inject(ApartmentsGuardService).checkStatistics();

@Injectable({
  providedIn: 'root',
})
export class ApartmentsGuardService {
  readonly facade = inject(ApartmentFacadeService);
  readonly router = inject(Router);

  checkStatistics(): Observable<boolean> {
    return this.facade.getStatistics$.pipe(
      switchMap(() => of(true)),
      catchError(() => {
        this.router.navigateByUrl('/app-unavailable', { skipLocationChange: true }).then();
        return of(false);
      }),
    );
  }
}
