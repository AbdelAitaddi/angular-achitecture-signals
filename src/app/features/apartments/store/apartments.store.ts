import { Injectable } from '@angular/core';

// services
import { SignalStore } from '../../../shared/core/store';

// models
import { ApartmentsState } from './apartments.state';

// config
import { All_Cities } from '../config';

// Initial state
export const initialState: ApartmentsState = {
  statistics: null,
  apartments: [],
  favourites: [],
  selectedApartment: null,
  selectedBorough: All_Cities,
  selectedCity: All_Cities,
  loaded: false,
  loading: false,
  pageNumber: 1,
  allDataLoaded: false,
};

@Injectable({
  providedIn: 'root',
})
export class ApartmentsSignalStore extends SignalStore<ApartmentsState> {
  constructor() {
    super(initialState);
  }
}
