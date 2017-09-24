import { Component,
         Input,
         OnChanges,
         OnInit,
         SimpleChanges }                  from '@angular/core';

import { ActivatedRoute }                 from '@angular/router';

import { environment }                    from '../../environments/environment';

import { Evaluation, Score }                     from '../models/evaulation';
import { Sample }                         from '../models/sample';

import { EvaluationTools }                from '../models/evaluation-tools';




@Component({
  selector: 'lr-sample-evaluation',
  templateUrl: './sample-evaluation.component.html'
})
export class SampleEvaluationComponent implements OnInit, OnChanges {

  @Input() sampleUuid: string;
  @Input() sample: Sample;

  public evaluation: Evaluation = new Evaluation();
  public dimensions;
  public evaluationTool;
  public evaluationTools = EvaluationTools;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.evaluation.tool = params['tool'];
      this.evaluationTool = this.evaluationTools[params['tool']];
      Object.keys(this.evaluationTool.dimensions).forEach(
        key => {
          this.evaluation.scores.push(new Score({dimension: key}));
        }
      );
    });
    // const key = 'uuid';
    // if (this.sample) {
    //   this.sampleUuid = this.sample.uuid;
    // } else {
    //   // const uuid = this.route.snapshot.params[key];
    //   // if (uuid) { this.sampleUuid = uuid; }
    // }
  }


  ngOnChanges(changes: SimpleChanges) {
  }

}

