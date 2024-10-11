import { computed, Inject, Injectable, InjectionToken, Signal, signal, WritableSignal } from '@angular/core';

export const initial_State = new InjectionToken('initialState');

@Injectable()
export abstract class SignalStore<T> {
  readonly #store: WritableSignal<T>;

  protected constructor(@Inject(initial_State) private initialState: T) {
    this.#store = signal<T>(this.initialState) as WritableSignal<T>;
  }

  get storeSignal(): Signal<T> {
    return this.#store.asReadonly();
  }

  get value(): T {
    return this.#store();
  }

  select<G>(name: keyof T): Signal<G> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return computed(() => this.storeSignal()[name]);
  }

  set<G>(name: keyof T, state: G) {
    this.#store.update(() => ({
      ...this.value,
      [name]: state,
    }));
  }

  patch(state: Partial<T>) {
    this.#store.update(() => ({
      ...this.value,
      ...state,
    }));
  }

  reset() {
    this.patch(this.initialState);
  }
}
