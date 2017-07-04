import { Injectable }      from '@angular/core';

import { ApiService }      from '../services/api.service';
import { ApiDataService }  from '../services/api-data.service';
import { IApiDataService } from '../services/api-data.service.interface';


@Injectable()
export class EvaluationsListService extends ApiDataService implements IApiDataService {

  constructor(private apiService: ApiService) {
    super();
    // not quite sure why, but this method needs to be manually bound to the correct context...
    this._getItemsFunction = this.apiService.getEvaluations.bind(this.apiService);
  }

  reset() {
    this.params = {
      offset: 0,
      limit: 10,
      sortBy: null,
      sortAsc: true
    };

    this.filters = {};
  }
}
