import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDrawerMode, MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatLineModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatDialogModule } from '@angular/material/dialog';

// components
import LanguageSelectionComponent from '../../components/language-selection/language-selection.component';
import NavItemComponent from '../../components/nav-item/nav-item.component';

// service
import { AppFacadeService } from '../../facades/app-facade.service';

// models
import { NavItem } from '../../models';
import { LanguageSelection } from '../../../shared/functional/translation/models';

// config
import { Icons, nav_List } from '../../config';
import { Language_Selection_Collection } from '../../../shared/functional/translation/config';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatButtonModule,
    MatLineModule,
    MatSelectModule,
    MatTooltipModule,
    RouterModule,
    MatIconModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatListModule,
    NavItemComponent,
    LanguageSelectionComponent,
    MatDialogModule,
    TranslatePipe,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppComponent {
  readonly #document = inject(DOCUMENT) as Document;
  readonly #appFacade = inject(AppFacadeService) as AppFacadeService;

  readonly $icons = signal(Icons);
  readonly $navList: Signal<NavItem[]> = signal(nav_List);
  readonly $languageCollection: Signal<LanguageSelection[]> = signal(Language_Selection_Collection);
  readonly $currentLanguageItem: Signal<LanguageSelection> = this.#appFacade.$currentLanguageItem;
  readonly $loading: Signal<boolean> = this.#appFacade.$loading;
  readonly $isOpened: Signal<boolean> = this.#appFacade.$isOpened;
  readonly $sidenavMode: Signal<MatDrawerMode> = this.#appFacade.$sidenavMode;

  matSidenavRef = viewChild(MatSidenav);

  constructor() {
    afterNextRender({
      write: () => {
        untracked(() => {
          this.#document.documentElement.lang = this.#appFacade.$currentLanguage();
        });
      },
    });
  }

  selectLanguage(selectedLang: LanguageSelection) {
    this.#appFacade.selectLanguage(selectedLang);
  }

  onItemClicked(event) {
    if (event === 'popup') {
      this.#appFacade.showDialog();
    }
  }
}
