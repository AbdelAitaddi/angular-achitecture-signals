import { computed, inject, Injectable, linkedSignal, Signal, signal } from '@angular/core';

// models
import { Apartment, CityTypes, CityTypesFilter, Statistics } from '../models';

// config
import { All_Cities, Cities } from '../config';

// services
import { ApartmentsSignalStore } from '../store/apartments.store';
import { ApartmentsService } from '../services/apartments.service';
import { StatisticsService } from '../services/statistics.service';
import { GlobalLoadingIndicatorService } from '../../../core/services/global-loading-indicator.service';
import { ApartmentHelperService } from '../helpers/apartment-helper.service';

// rxjs
import { filter, finalize, Observable, retry, switchMap, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, map, take, tap } from 'rxjs/operators';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ShareReplayLatest } from '../../../../support/rxjs-operators';
import { Params } from '@angular/router';

interface Query {
  nextPage: number;
  selectedCity: CityTypesFilter;
}

@Injectable({
  providedIn: 'root',
})
export class ApartmentFacadeService {
  #store = inject(ApartmentsSignalStore);
  #apartmentsService = inject(ApartmentsService);
  #apartmentHelper = inject(ApartmentHelperService);
  #statisticsService = inject(StatisticsService);
  #loadingIndicatorService = inject(GlobalLoadingIndicatorService);

  #loadMoreSignal = signal<Query | null>(null, {
    equal: (a: Query | null, b: Query | null) => a?.nextPage === b?.nextPage && a?.selectedCity == b?.selectedCity,
  });

  constructor() {
    toObservable(this.#loadMoreSignal)
      .pipe(
        distinctUntilChanged(),
        filter(Boolean),
        switchMap(({ selectedCity, nextPage }: Query) => this.getApartments(selectedCity, nextPage)),
      )
      .subscribe();
  }

  set apartments(apartments: Apartment[]) {
    this.#store.set<Apartment[]>('apartments', apartments);
  }

  apartments$: Signal<Apartment[]> = computed(() => this.#store.storeSignal().apartments);

  set pageNumber(pageNumber: number) {
    this.#store.set<number>('pageNumber', pageNumber);
  }

  get pageNumber$(): Signal<number> {
    return this.#store.select<number>('pageNumber');
  }

  set allDataLoaded(allDataLoaded: boolean) {
    this.#store.set<boolean>('allDataLoaded', allDataLoaded);
  }

  get allDataLoaded$(): Signal<boolean> {
    return this.#store.select<boolean>('allDataLoaded');
  }

  set favourites(favourites: Apartment[]) {
    this.#store.set<Apartment[]>('favourites', favourites);
  }

  get favourites$(): Signal<Apartment[]> {
    return this.#store.select<Apartment[]>('favourites');
  }

  set selectedCity(selectedCity: CityTypesFilter) {
    this.#store.set<CityTypesFilter>('selectedCity', selectedCity);
  }

  get selectedCity$(): Signal<CityTypesFilter> {
    return this.#store.select<CityTypesFilter>('selectedCity');
  }

  set selectedBorough(selectedBorough: string | typeof All_Cities) {
    this.#store.set<string | typeof All_Cities>('selectedBorough', selectedBorough);
  }

  get selectedBorough$(): Signal<string | typeof All_Cities> {
    return this.#store.select<string | typeof All_Cities>('selectedBorough');
  }

  set selectedApartment(selectedApartment: Apartment | null) {
    this.#store.set<Apartment | null>('selectedApartment', selectedApartment);
  }

  get selectedApartment$(): Signal<Apartment | null> {
    return this.#store.select<Apartment | null>('selectedApartment');
  }

  set loading(loading: boolean) {
    this.#store.set<boolean>('loading', loading);
  }

  get loading$(): Signal<boolean> {
    return this.#store.select<boolean>('loading');
  }

  set loaded(loaded: boolean) {
    this.#store.set<boolean>('loaded', loaded);
  }

  get loaded$(): Signal<boolean> {
    return this.#store.select<boolean>('loaded');
  }

  set statistics(statistics: Statistics) {
    this.#store.set<Statistics>('statistics', statistics);
  }

  get statistics$(): Signal<Statistics | null> {
    return this.#store.select<Statistics | null>('statistics');
  }

  boroughs$ = computed<string[]>(() => {
    const selectedCity = this.selectedCity$();
    const apartments = this.apartments$();

    return this.#apartmentHelper.getMappedBoroughs(apartments, selectedCity);
  });

  get cities$(): Signal<CityTypes[]> {
    return signal(Object.values(Cities)).asReadonly();
  }

  favouritesIds$: Signal<string[]> = linkedSignal<string[]>(() =>
    this.favourites$().map((apartment: Apartment) => apartment.id as string),
  );

  // reducers
  updateSelectedBorough(selectedBorough: string | typeof All_Cities) {
    this.selectedBorough = selectedBorough;
  }

  updateSelectedCity(queryParams: Observable<Params>) {
    const selectedCityParam = toSignal<CityTypesFilter>(
      queryParams.pipe(
        distinctUntilChanged(),
        map((params: Params) => params['city'] || All_Cities),
      ),
    );

    if (selectedCityParam() !== this.selectedCity$() || !this.loaded$()) {
      this.onCitySelected(selectedCityParam() as CityTypesFilter);
    }
  }

  onCitySelected(selectedCity: CityTypesFilter, selectedBorough = All_Cities, pageNumber = 1) {
    this.#store.patch({
      loaded: false,
      loading: false,
      allDataLoaded: false,
      pageNumber,
      selectedCity,
      selectedBorough,
    });

    this.#loadMoreSignal.set({ nextPage: pageNumber, selectedCity });
  }

  addToFavourites(apartment: Apartment) {
    this.favourites = [...this.favourites$(), apartment];
  }

  removeFromFavourites(apartment: Apartment) {
    this.favourites = this.favourites$().filter((favourite: Apartment) => favourite.id !== apartment.id);
  }

  loadMore() {
    const nextPage = this.pageNumber$() + 1;

    this.#loadMoreSignal.set({ nextPage, selectedCity: this.selectedCity$() });
  }

  // side effects
  getApartments(city: CityTypesFilter = All_Cities, nextPage = 1): Observable<Apartment[]> {
    this.loaded = false;
    this.loading = true;
    this.#loadingIndicatorService.loadingOn();
    return this.#apartmentsService.getApartments(city, nextPage).pipe(
      take(1),
      map((apartments: Apartment[]) => apartments.filter((apartment: Apartment) => apartment.availableFromNowOn)),
      tap((LoadedApartments: Apartment[]) => {
        const apartments = nextPage === 1 ? LoadedApartments : [...this.#store.value.apartments, ...LoadedApartments];

        this.#store.patch({
          apartments,
          loaded: true,
          pageNumber: nextPage,
          selectedCity: city,
          allDataLoaded: !LoadedApartments.length,
        });
      }),
      catchError((error) => throwError(() => error)),
      retry({
        count: 2,
        delay: 1000,
        resetOnSuccess: true,
      }),
      finalize(() => {
        this.loading = false;
        this.#loadingIndicatorService.loadingOff();
      }),
    );
  }

  getApartment(id: string): Observable<Apartment> {
    this.#loadingIndicatorService.loadingOn();
    return this.#apartmentsService.getApartment(id).pipe(
      tap((apartment: Apartment) => {
        this.selectedApartment = apartment;
      }),
      catchError((error) => throwError(() => error)),
      retry({
        count: 2,
        delay: 1000,
        resetOnSuccess: true,
      }),
      finalize(() => this.#loadingIndicatorService.loadingOff()),
    );
  }

  getStatistics$: Observable<Statistics> = this.#statisticsService.getStatistics().pipe(
    tap((statistics: Statistics) => (this.statistics = statistics)),
    ShareReplayLatest(),
    retry({
      count: 2,
      delay: 1000,
      resetOnSuccess: true,
    }),
  );
}
