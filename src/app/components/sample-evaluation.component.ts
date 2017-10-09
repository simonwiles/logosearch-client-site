import * as uuid from 'uuid';

import { Component,
         Input,
         OnInit,
         SimpleChanges }           from '@angular/core';

import { FormArray,
         FormBuilder,
         FormControl,
         FormGroup,
         Validators }              from '@angular/forms';

import { ActivatedRoute,
         Router }                  from '@angular/router';

import { environment }             from '../../environments/environment';

import { Evaluation,
         Dimension }               from '../models/evaulation';
import { EvaluationTools }         from '../models/evaluation-tools';
import { Sample }                  from '../models/sample';

import { ApiService }              from '../services/api.service';
import { MessageBusService }       from '../services/message-bus.service';
import { NotificationsService }    from '../services/notifications.service';





@Component({
  selector: 'lr-sample-evaluation',
  templateUrl: './sample-evaluation.component.html'
})
export class SampleEvaluationComponent implements OnInit {

  public environment = environment;
  public busy = false;

  public evaluationTool;
  public evaluationTools = EvaluationTools;
  public sampleUuid: string;

  public evaluationForm: FormGroup = this.formBuilder.group({
    uuid: new FormControl(uuid.v4(), Validators.required),
    tool: new FormControl('', Validators.required),
    collectionSource: new FormControl(''),
    // evaluatorIsSampleSubmitter: new FormControl('', Validators.required),
    sample: new FormControl('', Validators.required),
    dimensions: new FormArray([]),
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,

    private apiService: ApiService,
    private messageBusService: MessageBusService,
    private notificationsService: NotificationsService) { }

  ngOnInit() {

    let sampleUuid, toolUuid;
    const params = this.activatedRoute.snapshot.queryParams;

    if (params.hasOwnProperty('collectionSource')) {
      this.evaluationForm.get('collectionSource').setValue(params['collectionSource']);
    }

    if (params.hasOwnProperty('toolUuid')) {
      toolUuid = params['toolUuid'];
    } else {
      console.log('no tool specified!');
    }

    sampleUuid = this.activatedRoute.snapshot.params['sampleUuid'];
    if (!sampleUuid) {
      if (params.hasOwnProperty('sampleUuid')) {
        sampleUuid = params['sampleUuid'];
      } else {
        // can't do anything if we don't know what sample we're supposed to be evaluating!
        console.log('no sample specified!');
      }
    }

    if (sampleUuid && toolUuid) {
      this.init(sampleUuid, toolUuid);
    }
  }

  init(sampleUuid, toolUuid) {
    const evaluationTool = this.evaluationTool = this.evaluationTools[toolUuid];
    this.sampleUuid = sampleUuid;

    this.evaluationForm.get('tool').setValue(toolUuid);
    this.evaluationForm.get('sample').setValue(this.sampleUuid);
    // this.evaluationForm.get('evaluatorIsSampleSubmitter').setValue(true);

    Object.keys(this.evaluationTool.dimensions).forEach(
      key => {
        (this.evaluationForm.get('dimensions') as FormArray).push(this.newDimensionForm(key));
      }
    );

    // subscribe to changes to the score of optional dimensions --
    //  if there's a score, the rationale is required.
    (this.evaluationForm.get('dimensions') as FormArray).controls.forEach(
      dimension => {
        if (evaluationTool.dimensions[(dimension as FormGroup).get('dimension').value].isOptional) {
          dimension.get('score').valueChanges.subscribe(
            score => {
              dimension.get('rationale').setValidators(Validators.required);
              dimension.get('rationale').updateValueAndValidity();
            }
          );
        }
      }
    )
  }

  newDimensionForm(dimension) {
    if (this.evaluationTool.dimensions[dimension].isOptional) {
      return this.formBuilder.group({
        dimension: new FormControl(dimension, Validators.required),
        rationale: new FormControl(''),
        score: new FormControl(null)
      });
    }
    return this.formBuilder.group({
      dimension: new FormControl(dimension, Validators.required),
      rationale: new FormControl('', Validators.required),
      score: new FormControl(null, Validators.required)
    });
  }

  submitEvaluation($event) {

    const markAllTouched = function(control) {
      Object.keys(control.controls).forEach(
        field => {
          const innerControl = control.get(field);
          innerControl.markAsTouched();
          if (innerControl.controls) { markAllTouched(innerControl); }
        }
      );
    }

    markAllTouched(this.evaluationForm);

    if (!this.evaluationForm.valid) {
      this.notificationsService.error('Error!', 'form not valid');
      return;
    }

    const removeEmpty = (obj) => {
      Object.keys(obj).forEach(key => {
        if (obj[key] === null
            || (Array.isArray(obj[key]) && obj[key].length === 0)
            || (typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0)
            || (typeof obj[key] === 'string' && obj[key] === '')) {

          delete obj[key];

        } else if (obj[key] && typeof obj[key] === 'object') {
          removeEmpty(obj[key]);
        }
      });
      return obj;
    };

    let value = removeEmpty(this.evaluationForm.value);
    value.dimensions = value.dimensions.filter(dimension => dimension.score && dimension.rationale);

    this.busy = true;
    this.apiService.putEvaluation(JSON.stringify(value)).subscribe(
      evaluation => {
        this.busy = false;
        this.messageBusService.emit('evaluationSaved', evaluation);
        this.router.navigate(['../sample', evaluation.sample], {relativeTo: this.activatedRoute});
      },
      error => {
        this.busy = false;
        console.log(error);
        this.notificationsService.error('Error!', error.message);
      }
    );

    $event.target.blur();
  }

}

