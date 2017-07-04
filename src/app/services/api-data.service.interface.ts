import { Observable }   from 'rxjs/Observable';

export interface IApiDataService {

  updated: Observable<any>;
  newItem: Observable<any>;

  items: any[];
  itemCount: number;
  itemTotal: number;

  offset: number;
  limit: number;
  page: number;
  lastPage: number;

  sortBy: string;
  sortAsc: boolean;

  selectedItem: any;
  selectedItemIndex: number;

  reloading: boolean;

  update(forceReload?): void;

  reloadItems(forceReload?: boolean): void;
  reset(): void;

  hasPreviousItem(): boolean ;
  hasNextItem(): boolean;

  previousItem(): void;
  nextItem(): void;

  hasPreviousPage(): boolean;
  hasNextPage(): boolean;

  // return true on success and false on failure
  toPreviousPage(): boolean;
  toNextPage(): boolean;

  toFirstPage(): void;
  toLastPage(): void;

}
