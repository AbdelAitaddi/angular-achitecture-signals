import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RedirectCommand, Router, UrlTree } from '@angular/router';

// services
import { ApartmentFacadeService } from '../facades';
import { NotFoundError } from '../../../core/helpers';

// rxjs
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

import { App_Route } from '../../../core/config';

export const apartmentExistsGuards: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const apartmentExistsGuard = inject(ApartmentExistsGuardService);
  const { apartmentId } = route.params;

  return apartmentExistsGuard.checkStore(apartmentId).pipe(
    switchMap(() => of(true)),
    catchError(() => of(false)),
  );
};

@Injectable({
  providedIn: 'root',
})
export class ApartmentExistsGuardService {
  readonly #router = inject(Router);
  readonly #facade = inject(ApartmentFacadeService);

  checkStore(apartmentId: string) {
    const loaded = this.#facade.loaded$();
    if (!loaded) {
      return this.getApartmentById(apartmentId);
    }

    return this.hasApartment(apartmentId);
  }

  getApartmentById(apartmentId: string): Observable<boolean | UrlTree | RedirectCommand> {
    return this.#facade.getApartment(apartmentId).pipe(
      switchMap(() => of(true)),
      catchError((error) => {
        if (error instanceof NotFoundError) {
          this.#router.navigate([App_Route.apartment_List]);
          const urlTree: UrlTree = this.#router.parseUrl(App_Route.apartment_List);
          return of(urlTree);
        } else {
          // const urlTree: UrlTree = this.router.parseUrl('/app-unavailable');
          //return new RedirectCommand(urlTree, { skipLocationChange: true });
          this.#router.navigateByUrl('/app-unavailable', { skipLocationChange: true }).then();
        }
        return of(false);
      }),
    );
  }

  hasApartment(apartmentId: string): Observable<boolean | UrlTree | RedirectCommand> {
    const apartments = this.#facade.apartments$();

    const apartmentExists = apartments.find((apartment) => apartment.id === apartmentId);
    if (apartmentExists) {
      this.#facade.selectedApartment = apartmentExists;
      return of(true);
    }

    return this.getApartmentById(apartmentId);
  }
}
