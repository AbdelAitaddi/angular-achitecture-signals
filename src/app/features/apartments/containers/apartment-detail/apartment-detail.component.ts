import { ChangeDetectionStrategy, Component, computed, inject, OnInit, Signal } from '@angular/core';
import { Location } from '@angular/common';

// services
import { ApartmentFacadeService } from '../../facades';

// models
import { Apartment } from '../../models';
import ApartmentItemComponent from '../../components/apartment-item/apartment-item.component';

interface ViewModel {
  apartment: Apartment | null;
  selected: boolean;
}

@Component({
  imports: [ApartmentItemComponent],
  standalone: true,
  templateUrl: './apartment-detail.component.html',
  styleUrls: ['./apartment-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ApartmentDetailComponent implements OnInit {
  readonly #facade = inject(ApartmentFacadeService);
  readonly #location = inject(Location);

  $viewModel: Signal<ViewModel>;

  ngOnInit() {
    this.$viewModel = computed(() => {
      const apartment = this.#facade.selectedApartment$();
      const favouriteIds = this.#facade.favouritesIds$();
      return {
        apartment,
        selected: !!(apartment?.id && favouriteIds.includes(apartment.id)),
      };
    });
  }

  onSave(apartment: Apartment) {
    this.#facade.addToFavourites(apartment);
  }

  onRemove(apartment: Apartment) {
    this.#facade.removeFromFavourites(apartment);
  }

  onBack() {
    this.#location.back();
  }
}
