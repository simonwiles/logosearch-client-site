import { Subject }     from 'rxjs/Subject';

import { Injectable }  from '@angular/core';


@Injectable()
export class MessageBusService {

  private subjects: any;

  constructor() {
    this.subjects = {};
  }

  emit(event, data) {
    if (!this.subjects.hasOwnProperty('$' + event)) { this.subjects['$' + event] = new Subject(); }
    return this.subjects['$' + event].next(data);
  }

  listen(event, handler) {
    if (!this.subjects.hasOwnProperty('$' + event)) { this.subjects['$' + event] = new Subject(); }
    return this.subjects['$' + event].subscribe(handler);
  }

  destroy() {
    // destroy all subjects
    for (const event in this.subjects) {
      if (this.subjects.hasOwnProperty(event)) {
        this.subjects[event].unsubscribe();
      }
    }
    this.subjects = {};
  }

}
