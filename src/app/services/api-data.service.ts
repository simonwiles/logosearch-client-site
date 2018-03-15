import { Observable }   from 'rxjs/Observable';
import { Subject }      from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/first';

import { Injectable }   from '@angular/core';

import { IApiDataService } from './api-data.service.interface';

@Injectable()
export class ApiDataService implements IApiDataService {

  updated: Observable<any>;
  newItem: Observable<any>;

  get offset() { return this.params.offset; }
  get limit() { return this.params.limit; }

  get sortBy() { return this.params.sortBy; }
  get sortAsc() { return this.params.sortAsc; }


  set offset(value) {
    this.params.offset = value;
    this.update();
  }

  set limit(value) {
    this.params.limit = value;
    this.update();
  }

  set sortBy(value) {
    this.params.sortBy = value;
    this.update();
  }

  set sortAsc(value) {
    this.params.sortAsc = value;
    this.update();
  }

  items: any[] = [];
  itemCount: number;
  itemTotal: number;

  reloading = false;

  params: any;
  filters: any;
  searchTerm: string;

  currentFilters: string = null;
  currentParams: string = null;

  get page() {
    return Math.floor(this.offset / this.limit) + 1;
  }

  set page(value) {
    this.offset = (value - 1) * this.limit;
  }

  get lastPage() {
    return Math.ceil(this.itemCount / this.limit);
  }

  get selectedItem() {
    return this._selectedItem;
  }

  set selectedItem(item) {
    this._selectedItem = item;
    if (this.items.indexOf(item) >= 0) {
      this.selectedItemIndex = this.items.indexOf(item);
    }
    this._newItem.next(item);
  }

  selectedItemIndex: number;

  private _update: Subject<boolean> = new Subject<boolean>();
  private _updated: Subject<any> = new Subject<any>();
  private _newItem: Subject<any> = new Subject<any>();

  private _selectedItem;

  _getItemsFunction: Function = (params) => new Observable<any>(params);

  constructor() {

    // the public interface should be "read-only" (i.e. observables, not subjects)
    this.updated = this._updated.asObservable();
    this.newItem = this._newItem.asObservable();

    this.reset();

    this._update.subscribe((forceReload?) => { this.reloadItems(forceReload); });
  }

  update(forceReload?) {
    // hide the subject from the public interface
    this._update.next(forceReload);
  }

  reloadItems(forceReload?) {

    let combinedFilters = JSON.stringify(Object.assign({}, this.filters, {'search': this.searchTerm}));

    if (this.currentFilters !== combinedFilters) {
      // reset the pagination to zero if the dataset may have changed in extent
      //  (prevents pagination set beyond the extent of the dataset, which is embarrassing)
      this.currentFilters = combinedFilters;
      this.params.offset = 0;
    }

    let allParams = Object.assign({}, this.params, this.filters, {'search': this.searchTerm});

    if (forceReload || this.currentParams !== JSON.stringify(allParams)) {
      this.reloading = true;
      this._getItemsFunction(allParams).subscribe(
        data => {
          this.items = data.results;
          this.itemCount = data.count;
          this.itemTotal = data.total;

          this.currentParams = JSON.stringify(allParams);

          // Any reason to check if a selectedItem already exists?
          this.selectedItem = (this.items.length) ? this.items[0] : null;

          this._updated.next(data);

          this.reloading = false;
        }
      );
    }
  }

  reset() {
    delete this.searchTerm;
    this.filters = {};
    this.params = {};
  }

  clear() {
    this.items = [];
    this.selectedItem = null;
    this.currentParams = null;
    this._updated.next({results: [], count: 0});
  }

  hasPreviousItem(): boolean {
    return this.selectedItemIndex + this.offset > 0;
  }

  previousItem(): void {
    if (this.hasPreviousItem()) {
      if (this.selectedItemIndex === 0) {
        if (this.toPreviousPage()) { this.updated.first().subscribe(() => this.selectedItem = this.items[this.items.length - 1]); }
      } else {
        this.selectedItem = this.items[this.selectedItemIndex - 1];
      }
    }
  }

  hasNextItem(): boolean {
    return this.selectedItemIndex < this.itemCount - 1;
  }

  nextItem(): void {
    if (this.hasNextItem()) {
      if (this.selectedItemIndex === this.items.length - 1) {
        if (this.toNextPage()) { this.updated.first().subscribe(() => this.selectedItem = this.items[0]); }
      } else {
        this.selectedItem = this.items[this.selectedItemIndex + 1];
      }
    }
  }

  hasPreviousPage(): boolean {
    return this.offset > 0;
  }

  toPreviousPage(): boolean {
    if (this.hasPreviousPage()) {
      this.offset -= Math.min(this.limit, this.offset);
      return true;
    }
    return false;
  }

  hasNextPage(): boolean {
    return (this.offset + this.limit) < this.itemCount;
  }

  toNextPage(): boolean {
    if (this.hasNextPage()) {
      this.offset += this.limit;
      return true;
    }
    return false;
  }

  toFirstPage(): void {
    this.offset = 0;
  }

  toLastPage(): void {
    this.offset = (this.lastPage - 1) * this.limit;
  }
}
