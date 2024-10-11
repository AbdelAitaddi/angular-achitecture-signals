import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

// components

// services
import { BoroughsPipe } from '../../pipes';
import { ApartmentFacadeService } from '../../facades';

// models
import { Apartment, CityTypes, CityTypesFilter, Statistics } from '../../models';

// config
import { All_Cities } from '../../config';

// rxjs
import { CdkScrollable } from '@angular/cdk/scrolling';
import ApartmentFilterComponent from '../../components/apartment-filter/apartment-filter.component';
import ApartmentPreviewListComponent from '../../components/apartment-preview-list/apartment-preview-list.component';
import { TranslatePipe } from '@ngx-translate/core';

export interface ViewModel {
  favouritesIds: string[];
  selectedCity: CityTypesFilter;
  selectedBorough: string | typeof All_Cities;
  loading: boolean;
  loaded: boolean;
  allDataLoaded: boolean;
  boroughs: string[];
  cities: CityTypes[];
  apartmentByCity: Apartment[];
  statistics: Statistics | null;
}

@Component({
  imports: [
    BoroughsPipe,
    TranslatePipe,
    ApartmentPreviewListComponent,
    ApartmentFilterComponent,
    InfiniteScrollDirective,
    CdkScrollable,
  ],
  standalone: true,
  templateUrl: './apartment-list.component.html',
  styleUrls: ['./apartment-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ApartmentListComponent {
  readonly #facade = inject(ApartmentFacadeService);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);

  $viewModel: Signal<ViewModel> = computed(() => ({
    favouritesIds: this.#facade.favouritesIds$(),
    selectedCity: this.#facade.selectedCity$(),
    selectedBorough: this.#facade.selectedBorough$(),
    loading: this.#facade.loading$(),
    loaded: this.#facade.loaded$(),
    allDataLoaded: this.#facade.allDataLoaded$(),
    boroughs: this.#facade.boroughs$(),
    cities: this.#facade.cities$(),
    apartmentByCity: this.#facade.apartments$(),
    statistics: this.#facade.statistics$(),
  }));

  constructor() {
    this.#facade.updateSelectedCity(this.#route.queryParams);
  }
  onScrollDown() {
    this.#facade.loadMore();
  }

  onBoroughSelected(boroughs: string | typeof All_Cities) {
    this.#facade.updateSelectedBorough(boroughs);
  }

  onCitySelected(city: CityTypesFilter) {
    this.#router.navigate([], { queryParams: { city } }).then(() => this.#facade.onCitySelected(city));
  }
}
