import { Component,
         ElementRef,
         Input,
         OnChanges,
         OnInit,
         Renderer,
         SimpleChanges }                  from '@angular/core';
import { ActivatedRoute }                 from '@angular/router';

import { environment }                    from '../../environments/environment';

import { Language }                       from '../models/common';
import { Sample,
         SubjectArea }                    from '../models/sample';
import { Gender,
         GradeLevel }                     from '../models/participants';

import { ApiService }                     from '../services/api.service';
import { TranscriptionRendererService }   from '../services/transcription-renderer.service';


@Component({
  selector: 'lr-sample-view',
  templateUrl: './sample-view.component.html'
})
export class SampleViewComponent implements OnInit, OnChanges {

  @Input() sampleUuid: string;
  @Input() sample: Sample;
  @Input() panelClass = 'panel';
  @Input() highlight: string;
  @Input() showEvaluations = true;
  @Input() showRecording = true;

  gender = Gender;
  gradeLevels = GradeLevel;
  languages = Language;
  subjectAreas = SubjectArea;

  // evaluations: any[];

  public environment = environment;

  private errorMessage: any;
  private renderedTranscription: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private elementRef: ElementRef,
    private apiService: ApiService,
    private renderer: Renderer,
    private transcriptionRendererService: TranscriptionRendererService) {
  }

  ngOnInit() {
    if (this.activatedRoute.snapshot.queryParams['showEvaluations'] === 'false') {
      this.showEvaluations = false;
    }
    if (this.sample) {
      this.sampleUuid = this.sample.uuid;
    } else if (this.sampleUuid) {
      this.apiService.getSample(this.sampleUuid).subscribe(
        sample => {
          this.sample = sample;
          this.onSampleLoaded();
        }
      );
    } else {
      const uuid = this.activatedRoute.snapshot.params['uuid'];
      if (uuid) { this.sampleUuid = uuid; this.loadSample(); }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('sample' in changes && typeof(this.sample) !== 'undefined') {
      this.sample = (changes as any).sample.currentValue;
      this.onSampleLoaded();
    }
    if ('sampleUuid' in changes && typeof(this.sample) !== 'undefined') {
      this.sampleUuid = (changes as any).sampleUuid.currentValue;
      this.loadSample();
    }
  }

  onSampleLoaded() {
    this.renderedTranscription = this.transcriptionRendererService.renderTranscription(this.sample);
    // delete this.evaluations;
    // this.getEvaluations();
  }

  loadSample(): void {
    this.sample = null;
    // TODO: implement some kind of loading indicator, in case the API response is slow?
    this.apiService.getSample(this.sampleUuid).subscribe(
      sample => { this.sample = sample; this.onSampleLoaded(); },
      // TODO: there is no visible error indication as yet.
      error => { this.errorMessage = error.message; }
    );
  }

  highlightParticipant(uuid) {
    let rows = this.elementRef.nativeElement.getElementsByClassName(`p_${uuid}`);
    for (let row of rows) {
      this.renderer.setElementClass(row, 'highlight', true);
    }
  }

  removeHighlight() {
    let rows = this.elementRef.nativeElement.getElementsByTagName('tr');
    for (let row of rows) {
      this.renderer.setElementClass(row, 'highlight', false);
    }
  }

  renderAssessedLevel(assessedLevel) {
    return assessedLevel.map(
      item =>
        (item['standard'] == 'informal') ?
          `${item['level']} (Submitter’s informal assessement)` :
          `${item['standard'].toUpperCase()}: ${item['level']}`
    ).join('\n');
  }

}

