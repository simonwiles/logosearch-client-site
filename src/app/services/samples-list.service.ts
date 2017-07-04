import { Injectable }      from '@angular/core';

import { ApiService }      from '../services/api.service';
import { ApiDataService }  from '../services/api-data.service';
import { IApiDataService } from '../services/api-data.service.interface';


@Injectable()
export class SamplesListService extends ApiDataService implements IApiDataService {

  constructor(private apiService: ApiService) {
    super();
    // not quite sure why, but this method needs to be manually bound to the correct context...
    this._getItemsFunction = this.apiService.getSamples.bind(this.apiService);
  }

  reset() {
    delete this.searchTerm;

    this.filters = {
      gradeLevel: null,
      gradeLevelOperator: false,
      subjectArea: null,
      subjectAreaOperator: false,
      participantFilters: [],
      langUsageFilters: [],
      numTurns: {
        valid: false,
        operator: null,
        count: null
      },
      hasEll: null,
      hasRecording: null
    };

    this.params = {
      offset: 0,
      limit: 10,
      sortBy: null,
      sortAsc: true
    };

  }
}
