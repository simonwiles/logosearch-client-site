import { Component,
         Input,
         OnChanges,
         OnInit,
         SimpleChanges }                  from '@angular/core';

import { EvaluationTools }                from '../models/evaluation-tools';

import { EvaluationsListService }         from '../services/evaluations-list.service';


@Component({
  selector: 'lr-evaluation-browser',
  templateUrl: './evaluation-browser.component.html',
  providers: [EvaluationsListService]
})
export class EvaluationBrowserComponent implements OnInit, OnChanges {

  @Input() sampleUuid: string;
  @Input() noItemsMsgHtml = '<p class="no-items-msg">No evalutions found that match the current criteria!</p>';

  public evaluationTools = EvaluationTools;

  constructor(public evaluationsListService: EvaluationsListService) { }

  ngOnInit() {
    this.evaluationsListService.limit = 4;
    this.evaluationsListService.params['sample'] = this.sampleUuid;
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('sampleUuid' in changes && typeof(this.sampleUuid) !== 'undefined') {
      this.sampleUuid = (changes as any).sampleUuid.currentValue;
      this.evaluationsListService.params['sample'] = this.sampleUuid;
      this.evaluationsListService.update();
    }
  }

}

