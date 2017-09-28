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
import { GradeLevel }                     from '../models/participants';

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

  gradeLevels = GradeLevel;
  languages = Language;
  subjectAreas = SubjectArea;

  // evaluations: any[];

  public environment = environment;

  private errorMessage: any;
  private renderedTranscription: any;

  constructor(
    private route: ActivatedRoute,
    private elementRef: ElementRef,
    private apiService: ApiService,
    private renderer: Renderer,
    private transcriptionRendererService: TranscriptionRendererService) {
  }

  ngOnInit() {
    const key = 'uuid';
    if (this.sample) {
      this.sampleUuid = this.sample.uuid;
    } else {
      const uuid = this.route.snapshot.params[key];
      if (uuid) { this.sampleUuid = uuid; this.loadSample(); }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('sample' in changes && typeof(this.sample) !== 'undefined') {
      this.sample = (changes as any).sample.currentValue;
      this.onSampleLoaded();
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
      item => Object.keys(item).map(
        key => `Proficiency: ${item[key]} (${(key === 'informal') ? 'Submitter\'s informal assessement' : key})`
      )
    ).join('\n');
  }

}

