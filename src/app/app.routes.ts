import {
  PreloadAllModules,
  provideRouter,
  Router,
  Routes,
  withComponentInputBinding,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
  withNavigationErrorHandler,
  withPreloading,
  withRouterConfig,
} from '@angular/router';
import {
  EnvironmentProviders,
  importProvidersFrom,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { provideHttpClient, withInterceptors, withRequestsMadeViaParent } from '@angular/common/http';

//interceptors
import { loggerInterceptor } from './core/interceptors/logger.interceptor';

import { ApartmentsSignalStore } from './features/apartments/store/apartments.store';
import { ApartmentsService } from './features/apartments/services/apartments.service';
import { ApartmentHelperService } from './features/apartments/helpers/apartment-helper.service';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: () => 'apartments',
    pathMatch: 'full',
  },
  {
    path: 'apartments',
    providers: [
      provideEnvironmentInitializer(() => inject(ApartmentsSignalStore).reset()),
      provideHttpClient(withRequestsMadeViaParent(), withInterceptors([loggerInterceptor])),
      importProvidersFrom([ApartmentsSignalStore, ApartmentsService, ApartmentHelperService]),
    ],
    loadChildren: () => import('./features/apartments/apartments.routes'),
    data: {
      name: 'apartments',
    },
  },
  {
    path: 'app-unavailable',
    title: 'i18n.core.pageTitle.appUnavailable',
    loadComponent: () => import('./core/containers/app-unavailable/app-unavailable.component'),
  },
  {
    path: '**',
    loadComponent: () => import('./core/containers/page-not-found/page-not-found.component'),
  },
];

export function provideRouterConfig(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideRouter(
      appRoutes,
      // withDebugTracing(),
      // withTransitionViews({ skipInitialTransition: true }),
      withEnabledBlockingInitialNavigation(),
      withComponentInputBinding(),
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withRouterConfig({
        defaultQueryParamsHandling: 'merge',
        paramsInheritanceStrategy: 'always',
        onSameUrlNavigation: 'reload',
      }),
      withNavigationErrorHandler(() => inject(Router).navigate(['/**'])),
    ),
  ]);
}
