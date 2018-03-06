import { Location }                       from '@angular/common';

import { ChangeDetectorRef,
         Component,
         Input }                          from '@angular/core';

import { animate,
         style,
         transition,
         trigger }                        from '@angular/core';

// import { ActivatedRoute,
//          Router,
//          UrlTree }                        from '@angular/router';

import { environment }                    from '../../environments/environment';

import { SamplesListService }             from '../services/samples-list.service';
import { TranscriptionRendererService }   from '../services/transcription-renderer.service';

import { Language }                       from '../models/common';
import { SubjectArea,
         LangUsageUsages }                from '../models/sample';
import { Gender,
         GradeLevel }                     from '../models/participants';

import { FormatThousands }                from '../ui-modules/ui-pipes/format-thousands.pipe';


@Component({
  selector: 'lr-sample-browser',
  templateUrl: './sample-browser.component.html',
  styles: [`
  .ui-button-bar { justify-content: flex-end; }
  `],
  animations: [
    trigger('slideForwardBack', [
      transition('void => back', [    // ---> Entering --->
        style({transform: 'translate3d(-100%, 0, 0)'}),
        animate('.2s', style({transform: 'translate3d(0, 0, 0)' }))
      ]),
      transition('back => void', [   // ---> Leaving --->
        animate('.2s', style({transform: 'translate3d(100%, 0, 0)', opacity: .2}))
      ]),
      transition('void => forward', [    // <--- Entering <---
        style({transform: 'translate3d(100%, 0, 0)'}),
        animate('.2s', style({transform: 'translate3d(0, 0, 0)'}))
      ]),
      transition('forward => void', [   // <--- Leaving <---
        animate('.2s', style({transform: 'translate3d(-100%, 0, 0)', opacity: .2}))
      ])
    ]),
    trigger('fadeInOut', [
      transition('void => *', [
        style({opacity: 0}),
        animate('.2s', style({opacity: 1}))
      ]),
      transition('* => void', [
        animate('.2s', style({opacity: 0}))
      ])
    ]),
    trigger('expandInOutHorizontal', [
      transition('void => *', [
        style({width: 0}),
        animate('.2s', style({width: 110}))
      ]),
      transition('* => void', [
        animate('.2s', style({width: 0}))
      ])
    ])
  ],
  providers: [SamplesListService]
})
export class SampleBrowserComponent {

  @Input() noItemsMsgHtml = '<p class="no-items-msg">No samples found that match the current criteria!</p>';

  public environment = environment;

  public genders: any = Object.values(Gender);
  public gradeLevels: any = Object.keys(GradeLevel).map(_ => ({ label: GradeLevel[_], value: _ }));
  public languages: any = Object.values(Language);
  public languagesWithAny: any = [{'label': '[Any Language]', 'value': 'any'}].concat(this.languages);
  public langUsageUsages: any = Object.values(LangUsageUsages);
  public subjectAreas: any = Object.values(SubjectArea);
  public subjectAreaItems: any = this.subjectAreas;

  public samplesBrowser = this;
  public expandFilters = false;
  public slideDirection = 'forward';

  public get displayType() {
    return this._displayType;
  }

  public set displayType(displayType) {
    if (['table', 'cards', 'carousel', 'analysis'].indexOf(displayType) > ['table', 'cards', 'carousel', 'analysis'].indexOf(this._displayType)) {
      this.slideDirection = 'forward';
    } else {
      this.slideDirection = 'back';
    }
    this.changeDetectorRef.detectChanges();

    this._displayType = displayType;
  }

  public uiFormatThousands = FormatThousands.prototype.transform;

  public filters;
  private _subjectAreaCounts: any = {};
  private _displayType = 'table';


  constructor(
    public samplesListService: SamplesListService,
    private changeDetectorRef: ChangeDetectorRef,
    private location: Location,
    private transcriptionRendererService: TranscriptionRendererService) {

    this.filters = this.samplesListService.filters;  // grab a local ref for ease;

    // if (this.activatedRoute.snapshot.data['displayType']) {
    //   this.displayType = this.activatedRoute.snapshot.data['displayType'];
    // }

    // if (this.activatedRoute.snapshot.data['filter'] === 'currentUser') {
    //   this.showFilters = false;
    //   this.filters.submittedBy = '115742ab-dc20-435f-9533-f57c41a4efd0';
    // }

    if (this.location.path().indexOf('?') > -1) {
      // const tree: UrlTree = this.router.parseUrl(this.location.path());
      // const q = tree.queryParams;
      this.samplesListService.update();
    } else {
      this.samplesListService.update();
    }

    this.samplesListService.updated.subscribe(
      data => this.samplesUpdated(data)
    );
  }


  samplesUpdated(data) {

    // const path = this.location.path();
    // const newUri = path.slice(0, path.indexOf('?')) + Location.normalizeQueryParams(data.params.toString();
    // this.location.replaceState(newUri);

    if (data.facets) {
      this.subjectAreaItems = this.subjectAreas.map(
        item => ({
          label: `${item.label} <span class="item-count">[${this._subjectAreaCounts[item.value]}]</span>`,
          value: item.value,
          disabled: this._subjectAreaCounts[item.value] < 1
        })
      );
    }

  }

  filterSubjectArea(key) {
    this.filters.subjectArea = [key];
    this.samplesListService.update();
  }

  participantTypeUpdated(filter, languageSelect) {
    if (filter.ptype === 'a') {
      languageSelect.clear();
      languageSelect.select('any');
    }
    this.updateFilterValidity(filter);
  }

  updateFilterValidity(filter) {
    filter.valid = Object.keys(filter).every(key => filter[key] !== null && filter[key] !== '');
    if (filter.valid) { this.samplesListService.update(); }
  }

  newParticipantFilter() {
    this.filters.participantFilters.push({'ptype': '', 'gender': 'any', 'lang': 'any', 'operator': 'gte', 'count': null, 'valid': false});
  }

  newLangUsageFilter() {
    this.filters.langUsageFilters.push({'operator': null, 'usage': 'all', 'lang': null, 'valid': false});
  }

  removeParticipantFilter(filter) {
    this.filters.participantFilters = this.filters.participantFilters.filter(_filter => _filter !== filter);
    if (filter.valid) { this.samplesListService.update(); }
  }

  removeLangUsageFilter(filter) {
    this.filters.langUsageFilters = this.filters.langUsageFilters.filter(_filter => _filter !== filter);
    if (filter.valid) { this.samplesListService.update(); }
  }

  highlight(text, term) {
    if (text && term) {
      return text.replace(new RegExp('(' + term + ')', 'gi'), '<mark>$1</mark>');
    }
    return text;
  }

  highlightTranscription(item, searchTerm) {
    let renderedTranscription = this.transcriptionRendererService.renderTranscription(item);
    let template: HTMLTemplateElement = document.createElement('template') as HTMLTemplateElement;
    template.innerHTML = renderedTranscription;
    // TODO: this could still "highlight" text in <span class="note"></span> markup...
    for (let td of Array.from(template.content.querySelectorAll('td:not(.transcription-participant)')) as HTMLTableCellElement[]) {
      td.innerHTML = this.highlight(td.innerHTML, searchTerm);
    };
    return template.innerHTML;
  }

  getGradeLevels(item) {
    return Array.from(new Set(item.students.map(student => GradeLevel[student.gradeLevel]))).join(', ');
  }

  clearNumTurns() {
    this.filters.numTurns = {
      valid: false,
      operator: null,
      count: null
    };
    this.samplesListService.update();
  }

  resetFilters() {
    this.samplesListService.reset();
    this.filters = this.samplesListService.filters;
    this.samplesListService.update();
  }

  buildExpansion(item, searchTerm?) {
    searchTerm = searchTerm || this.samplesListService.searchTerm;
    return `
      <p><strong>Context</strong><br>${this.highlight(item.context, searchTerm)}</p>
      <p><strong>Objective</strong><br>${this.highlight(item.objective, searchTerm)}</p>
      <p><strong>Prompt</strong><br>${this.highlight(item.prompt, searchTerm)}</p>
      <p><strong>Sample</strong><br>${this.highlightTranscription(item, searchTerm)}</p>
    `;
  }

}
