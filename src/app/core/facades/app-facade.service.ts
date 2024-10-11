import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { TranslateService } from '@ngx-translate/core';

// config
import { Breakpoints } from '../config';
import { BROWSER_LOCATION, STORAGE } from '../../app.config';
import { Language_Selection_Collection } from '../../shared/functional/translation/config';

// components
import AboutComponent from '../containers/about/about.component';
import ModalComponent from '../../shared/core/components/information-modal/information-modal.components';

// services
import { GlobalLoadingIndicatorService } from '../services/global-loading-indicator.service';

// models
import { StorageProvider } from '../models';
import { LanguageSelection } from '../../shared/functional/translation/models';

// rxjs
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class AppFacadeService {
  #location = inject(BROWSER_LOCATION) as Location;
  #storage = inject(STORAGE) as StorageProvider;
  #loadingIndicatorService = inject(GlobalLoadingIndicatorService);
  #breakpointObserver = inject(BreakpointObserver);
  #translate = inject(TranslateService);
  #dialog = inject(MatDialog);

  #currentLanguageSignal = signal(this.#translate.currentLang);

  $currentLanguage: Signal<string> = this.#currentLanguageSignal.asReadonly();

  $currentLanguageItem: Signal<LanguageSelection> = computed(() => {
    const selectedLang = Language_Selection_Collection.find(
      (item: LanguageSelection) => item.code === this.$currentLanguage(),
    );

    if (!selectedLang) {
      throw new Error('selected language not completely installed');
    }

    return selectedLang as LanguageSelection;
  });

  get $isOpened(): Signal<boolean> {
    return toSignal(this.#breakpointObserver.observe([Breakpoints.smallScreen]).pipe(map((result) => result.matches)), {
      requireSync: true,
    });
  }

  $loading: Signal<boolean> = this.#loadingIndicatorService.$loading;

  get $sidenavMode(): Signal<MatDrawerMode> {
    return toSignal(
      this.#breakpointObserver
        .observe([Breakpoints.largeScreen])
        .pipe(map((result) => (result.matches ? 'over' : 'side') as MatDrawerMode)),
      { requireSync: true },
    );
  }

  selectLanguage(selectedLang: LanguageSelection) {
    this.#storage.localStore.setItem('preferredLanguage', selectedLang.code);
    this.#location.reload();
  }

  showDialog() {
    const dialogConfig: MatDialogConfig<{ component: typeof AboutComponent }> = {
      id: 'about-page',
      autoFocus: false,
      disableClose: true,
      data: { component: AboutComponent },
    };
    this.#dialog.open(ModalComponent, dialogConfig);
  }
}
