import { ChangeDetectionStrategy, Component, computed, inject, OnInit, Signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

// services
import { ApartmentFacadeService } from '../../facades';

// models
import { Apartment, CityTypesFilter } from '../../models';

// config
import { All_Cities } from '../../config';
import ApartmentPreviewListComponent from '../../components/apartment-preview-list/apartment-preview-list.component';

interface ViewModel {
  favouritesApartments: Apartment[];
  favouritesIds: string[];
  selectedCity: CityTypesFilter;
  selectedBorough: string | typeof All_Cities;
  loading: boolean;
  loaded: boolean;
}

@Component({
  imports: [ApartmentPreviewListComponent, TranslatePipe],
  standalone: true,
  templateUrl: './apartment-favourites.component.html',
  styleUrls: ['./apartment-favourites.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ApartmentFavouritesComponent implements OnInit {
  readonly #facade = inject(ApartmentFacadeService);
  viewModel$: Signal<ViewModel>;

  ngOnInit() {
    this.viewModel$ = computed(() => ({
      favouritesApartments: this.#facade.favourites$(),
      favouritesIds: this.#facade.favouritesIds$(),
      loading: this.#facade.loading$(),
      loaded: this.#facade.loaded$(),
      selectedCity: this.#facade.selectedCity$(),
      selectedBorough: this.#facade.selectedBorough$(),
    }));
  }
}
