import { Observable }   from 'rxjs/Observable';

import { AfterViewInit,
         ChangeDetectorRef,
         Component,
         ViewChild,
         ViewChildren }               from '@angular/core';

import { animate,
         style,
         transition,
         trigger }                    from '@angular/core';

import { environment }                from '../../environments/environment';

import { AuthConfig }                 from '../auth.config';

import { Language }                   from '../models/common';

import { AdultParticipant,
         StudentParticipant,
         Gender,
         GradeLevel,
         Linguagram,
         LanguageStandardLevels }     from '../models/participants';

import { Sample,
         LanguageUsage,
         Turn,
         SubjectArea }                from '../models/sample';

import { ApiService }                 from '../services/api.service';

@Component({
  selector: 'lr-sample-entry',
  templateUrl: './sample-entry.component.html',
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
      ]),
    ])
  ]
})
export class SampleEntryComponent implements AfterViewInit {

  public environment = environment;

  // These are for populating the various select elements:
  public genders: any = Object.values(Gender);
  public gradeLevels: any = Object.keys(GradeLevel).map(_ => ({ label: GradeLevel[_], value: _ }));
  public languages: any = Language;
  public languageOptions: any = Object.values(Language);
  public subjectAreas: any = Object.values(SubjectArea);
  public langKnowns: any = Object.values(Language).map(
    _ => ({ label: _.label, value: _.value })
  );

  public get step() { return this._step; }

  public set step(value) {

    if (this.doStepValidation(value)) {
      this.doStepChange(value);
    }
    this.changeDetectorRef.markForCheck();

  }

  public languageStandardLevels = LanguageStandardLevels;

  private _step = 'about';
  private stepDirection = 'forward';

  // Our master model:
  public sample: Sample = new Sample();

  // A model for the linguagramPanel:
  public selectedParticipant: StudentParticipant | AdultParticipant;
  public linguagram = new Linguagram({language: 'eng'});
  @ViewChild('linguagramPanel') linguagramPanel;

  //
  @ViewChild('participantLookup') participantLookup;
  @ViewChild('participantLookupPanel') participantLookupPanel;

  recordingName: any;  // string or object returned from Dropbox
  recordingUrl: any;

  // Get references to dynamically-generated elements, mainly for DOM-manipulation purposes:
  @ViewChildren('participantRow') participantRows;
  @ViewChildren('languageUsageSelect') languageUsageSelects;
  @ViewChildren('languageUsageRangeInput') languageUsageRangeInputs;


  constructor(
    private authConfig: AuthConfig,
    private apiService: ApiService,
    private changeDetectorRef: ChangeDetectorRef ) { }

  ngAfterViewInit() {
    // load the Dropbox script
    if (!window.Dropbox) {
      const dropboxScriptTag = document.createElement('script');
      dropboxScriptTag.type = 'text/javascript';
      dropboxScriptTag.src = '//www.dropbox.com/static/api/2/dropins.js';
      dropboxScriptTag.setAttribute('data-app-key',
        this.authConfig.oauthProviders.dropboxOauth2.authParams.client_id);
      dropboxScriptTag.addEventListener(
        'load', () => window.Dropbox.appKey = this.authConfig.oauthProviders.dropboxOauth2.authParams.client_id);
      document.body.appendChild(dropboxScriptTag);
    }
  }

  doStepChange(value): void {
    if (['about', 'participants', 'transcription'].indexOf(value) > ['about', 'participants', 'transcription'].indexOf(this._step)) {
      this.stepDirection = 'forward';
    } else {
      this.stepDirection = 'back';
    }
    this.changeDetectorRef.detectChanges();  // force change detection to run so that stepDirection is updated properly in the DOM
    this._step = value;
  }

  doStepValidation(value): boolean {
    return true;
  }

  removeValue(arr, value) {
    return arr.filter(e => e !== value);
  }

  editLinguagram(event, option, participant) {
    // Populate and pop-up the linguagramPanel when a language 'pill' is clicked.
    event.stopPropagation();
    this.selectedParticipant = participant;
    this.linguagram = participant.languages.find(lang => lang.language === option.value);
    this.linguagramPanel.toggle(event);
  }

  newLinguagram(option, participant, selectComponent) {
    // Populate and pop-up the linguagramPanel when a new language is first added.
    // First, find the 'pill' <li/> to align the linguagramPanel to:
    const targetEl = selectComponent.el.nativeElement
                    .querySelector(`li.select2-selection__choice[data-value^=${option.value}]`);
    this.selectedParticipant = participant;
    this.linguagram = new Linguagram({language: option.value});
    participant.languages.push(this.linguagram);
    this.linguagramPanel.show(null, targetEl);
  }

  isLanguageUsageFocussed() {
    // TODO: check usage range-sliders too?
    return this.languageUsageSelects !== undefined && (
      this.languageUsageSelects.toArray().some(x => x.hasFocus || x.isOpen) ||
      this.languageUsageRangeInputs.toArray().some(x => x.nativeElement === document.activeElement)
    );
  }

  addLanguageUsage() {
    this.sample.languageUsages.push(new LanguageUsage());
    this.changeDetectorRef.detectChanges();
    this.enforceLangUsagePolicies();
  }

  removeLanguageUsage(langUsage) {
    this.sample.languageUsages = this.sample.languageUsages.filter(item => item !== langUsage);
    this.enforceLangUsagePolicies();
  }

  enforceLangUsagePolicies() {
    if (this.sample.languageUsages.length > 1 ) {
      for (let langUsage of this.sample.languageUsages) {
        if (langUsage.usage === 'all') {
          langUsage.usage = null;
        }
      }
      this.languageUsageRangeInputs.forEach(
        input => {
          input.maxRangeWidth = 67;  // actually this could be default, because if "all" is enabled, the range line
                                     //  overwrites this anyway; but this way is explicit, so...
          input.options.find(item => item.value === 'all').disabled = true;
        });
    } else {
      this.sample.languageUsages[0].usage = 'all';
    }
  }

  addStudentParticipant() {
    let participant = new StudentParticipant();
    this.sample.languageUsages.forEach(langUsage => {
      participant.languages.push(new Linguagram({language: langUsage.lang}));
    });
    participant.languageKeys = participant.languages.map(lang => lang.language);
    this.sample.students.push(participant);
  }

  addAdultParticipant() {
    this.sample.adults.push(new AdultParticipant());
  }

  lookupParticipants(event, type) {
    event.stopPropagation();
    this.participantLookup.setType(type);
    this.participantLookupPanel.displayModal();
  }

  addLookedUpParticipants(data) {
    this.participantLookupPanel.removeModal();
    this.sample[data.type].push(...data.participants);
  }

  addTurn() {
    if (! this.sample.turns[this.sample.turns.length - 1].isEmpty()) {
      this.sample.turns.push(new Turn());
    }
  }

  clearParticipantLanguage(event: Event, participant: StudentParticipant | AdultParticipant) {
    // <HTMLElement>.dataset.value, quite apart from the typescript issues, doesn't work on IE < 11
    event.stopPropagation();
    const langToRemove = (event.target as HTMLElement).getAttribute('data-value');
    participant.languages = participant.languages.filter(lang => lang.language !== langToRemove);
    participant.languageKeys = participant.languageKeys.filter(lang => lang !== langToRemove);
    this.linguagramPanel.hide();
  }

  addLanguageStandard(linguagram) {
    linguagram.assessedLevel.push({standard: '', level: ''});
  }

  removeLanguageStandard(event: Event, linguagram, assessedLevel) {
    event.stopPropagation();
    linguagram.assessedLevel = linguagram.assessedLevel.filter(item => item !== assessedLevel);

  }

  readUrl(event) {
    if (event.target.files && event.target.files[0]) {
      this.recordingName = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (_event: any) => {
        this.recordingUrl = _event.target.result;
      };

      reader.readAsDataURL(event.target.files[0]);
    }
  }

  getFromDropbox() {
    const sampleEntryComponent = this;
    const handleFiles = function(files) {
      sampleEntryComponent.recordingUrl = files[0].link;
      sampleEntryComponent.recordingName = files[0].name;
    };
    window.Dropbox.choose({
      success: (files) => handleFiles(files),
      //  cancel: function() { },
      linkType: 'direct',
      multiselect: false,
      extensions: ['audio'],
    });
  }

  getRecordingName() {
    if (!this.recordingName) {
      return '[no file chosen]';
    }
    if (typeof this.recordingName === 'string') {
      return this.recordingName.split(/[\/\\]/).pop();
    }
    return this.recordingName.name;
  }

  clearRecording() {
    this.recordingName = '';
    this.recordingUrl = null;
  }

  saveSample() {
    window.alert('not ready yet!');
  }

}

