// models
import { Apartment, CityTypesFilter, Statistics } from '../models';

// config
import { All_Cities } from '../config';

export interface ApartmentsState {
  statistics: Statistics | null;
  apartments: Apartment[];
  selectedApartment: Apartment | null;
  favourites: Apartment[];
  selectedBorough: string | typeof All_Cities;
  selectedCity: CityTypesFilter;
  loaded: boolean;
  loading: boolean;
  pageNumber: number;
  allDataLoaded: boolean;
}
