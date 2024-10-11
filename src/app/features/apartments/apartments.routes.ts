import { Routes } from '@angular/router';

// guards
import { apartmentExistsGuards } from './guard/apartment-exists.guard';
import { apartmentsGuard } from './guard/apartments.guard';

const apartmentsRoutes: Routes = [
  {
    path: '',
    title: 'i18n.core.pageTitle.apartments',
    canActivate: [apartmentsGuard],
    loadComponent: () => import('./containers/apartment-list/apartment-list.component'),
  },
  {
    path: 'detail/:apartmentId',
    title: 'i18n.core.pageTitle.apartmentDetail',
    canActivate: [apartmentExistsGuards],
    loadComponent: () => import('./containers/apartment-detail/apartment-detail.component'),
  },
  {
    path: 'favourites',
    title: 'i18n.core.pageTitle.favourites',
    loadComponent: () => import('./containers/apartment-favourites/apartment-favourites.component'),
  },
];

export default apartmentsRoutes;
