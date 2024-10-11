import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// models
import { CityTypes, CityTypesFilter } from '../../models';

// rxjs
import { distinctUntilChanged } from 'rxjs/operators';

import { All_Cities } from '../../config';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-apartment-filter',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './apartment-filter.component.html',
  styleUrls: ['./apartment-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ApartmentFilterComponent {
  boroughs = input([], { transform: (boroughs: string[]) => boroughs ?? [] });
  cities = input([], { transform: (cities: CityTypes[] | undefined) => cities ?? [] });
  selectedCity = input<CityTypesFilter>(All_Cities);
  selectedBorough = input<string | typeof All_Cities>(All_Cities);

  citySelected = output<CityTypesFilter>();
  boroughSelected = output<string | typeof All_Cities>();

  #destroyRef = inject(DestroyRef);
  #fb = new FormBuilder();

  constructor() {
    effect(() => {
      this.cityControl.setValue(this.selectedCity(), { emitEvent: false });
      this.boroughControl.setValue(this.selectedBorough(), { emitEvent: false });

      this.cityControl.valueChanges
        .pipe(takeUntilDestroyed(this.#destroyRef), distinctUntilChanged())
        .subscribe((selectedCity) => this.citySelected.emit(selectedCity));

      this.boroughControl.valueChanges
        .pipe(takeUntilDestroyed(this.#destroyRef), distinctUntilChanged())
        .subscribe((value) => this.boroughSelected.emit(value));
    });
  }

  form = this.#fb.group<{
    city: CityTypesFilter;
    borough: string | typeof All_Cities;
  }>({
    city: All_Cities,
    borough: All_Cities,
  });

  get cityControl() {
    return this.form.get('city') as FormControl;
  }

  get boroughControl() {
    return this.form.get('borough') as FormControl;
  }
}
