import { Component,
         EventEmitter,
         Input,
         Output,
         ViewChild }               from '@angular/core';

import { environment }             from '../../environments/environment';

import { Gender }                  from '../models/participants';
import { User }                    from '../models/user';

import { ApiService }              from '../services/api.service';
import { AuthService }             from '../services/auth.service';
import { ParticipantsListService } from '../services/participants-list.service';
import { SamplesListService }      from '../services/samples-list.service';

import { IDataTableLabels }   from '../ui-modules/data-table/components/types';


@Component({
  selector: 'lr-participant-lookup',
  templateUrl: './participant-lookup.component.html',
  providers: [SamplesListService]
})
export class ParticipantLookupComponent {

  public environment = environment;
  public genders = Gender;
  public errorMessage: any;
  public filters;
  public submittedByUser: User;

  public labels: IDataTableLabels = {
    indexColumn: 'Index column',
    expandColumn: 'Expand column',
    selectColumn: 'Select column'
  };

  @Input() okayButtonHtml = '<i class="fa fa-plus"></i> Add selected participants to sample.';
  @Input() noItemsMsgHtml = '<p class="no-items-msg">No participants found!</p>';

  @Output() onOkayClicked: EventEmitter<any> = new EventEmitter();

  @ViewChild('submittedByToggle') submittedByToggle;
  @ViewChild('samplesPreviewPanel') samplesPreviewPanel;

  constructor(
    public participantsListService: ParticipantsListService,
    private apiService: ApiService,
    private authService: AuthService,
    private samplesListService: SamplesListService) {

    this.filters = this.participantsListService.filters = {
      'type': 'students',
      'submittedBy': this.authService.loggedInUser.uuid
    };

    // this.participantsListService.updated.subscribe(
    //   data => this.participantsUpdated(data)
    // );
  }

  setType(type: 'students' | 'adults') {
    this.filters.type = type;
  }

  getParticipants() {
    switch (this.submittedByToggle.value) {
      case 'all':
        this.filters.submittedBy = '';
        this.participantsListService.update();
      break;

      case 'own':
        this.filters.submittedBy = this.authService.loggedInUser.uuid;
        this.participantsListService.update();
      break;

      case 'other':
        if (this.submittedByUser === undefined) {
          this.filters.submittedBy = null;
          this.participantsListService.clear()
        } else {
          this.filters.submittedBy = this.submittedByUser.uuid;
          this.participantsListService.update();
        }
     break;
    }
  }

  okayClicked(selectedRows) {
    this.onOkayClicked.emit({
      type: this.filters.type,
      participants: selectedRows.map((row) => row.item)
    });
  }

  getSuggestions(query) {
    return this.apiService.getUsers({limit: 5, hasSamples: true, search: query}).map(
      data => data.results
    );
  }

  showPreview($event, participant) {
    console.log(participant);
    this.samplesPreviewPanel.displayModal($event);
    this.samplesListService.filters.person = participant.uuid;
    this.samplesListService.update()
    $event.stopPropagation();
  }
}
