import { Observable }                 from 'rxjs/Observable';

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
         LanguageSkill,
         LanguageStandardLevels }     from '../models/participants';

import { Sample,
         LanguageUsage,
         Turn,
         SubjectArea }                from '../models/sample';

import { ApiService }                 from '../services/api.service';
import { NotificationsService }       from '../services/notifications.service';

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

  // A model for the languageSkillPanel:
  public selectedParticipant: StudentParticipant | AdultParticipant;
  public languageSkill = new LanguageSkill({language: 'eng'});
  @ViewChild('languageSkillPanel') languageSkillPanel;

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
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService ) { }

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

  removeValue(arr: any[], value: any) {
    return arr.filter(e => e !== value);
  }

  editLanguageSkill(event, option, participant) {
    // Populate and pop-up the languageSkillPanel when a language 'pill' is clicked.
    event.stopPropagation();
    this.selectedParticipant = participant;
    this.languageSkill = participant.languageSkills.find(lang => lang.language === option.value);
    this.languageSkillPanel.toggle(event);
  }

  newLanguageSkill(option, participant, selectComponent) {
    // Populate and pop-up the languageSkillPanel when a new language is first added.
    // First, find the 'pill' <li/> to align the languageSkillPanel to:
    const targetEl = selectComponent.el.nativeElement
                    .querySelector(`li.select2-selection__choice[data-value^=${option.value}]`);
    this.selectedParticipant = participant;
    this.languageSkill = new LanguageSkill({language: option.value});
    participant.languageSkills.push(this.languageSkill);
    this.languageSkillPanel.show(null, targetEl);
  }

  isLanguageUsageFocussed() {
    // TODO: check usage range-sliders too?
    return this.languageUsageSelects !== undefined && (
      this.languageUsageSelects.toArray().some(x => x.hasFocus || x.isOpen) ||
      this.languageUsageRangeInputs.toArray().some(x => x.nativeElement === document.activeElement)
    );
  }

  addLanguageUsage() {
    this.sample.languagesUsed.push(new LanguageUsage());
    this.changeDetectorRef.detectChanges();
    this.enforceLangUsagePolicies();
  }

  removeLanguageUsage(langUsage) {
    this.sample.languagesUsed = this.sample.languagesUsed.filter(item => item !== langUsage);
    this.enforceLangUsagePolicies();
  }

  enforceLangUsagePolicies() {
    if (this.sample.languagesUsed.length > 1 ) {
      for (let langUsage of this.sample.languagesUsed) {
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
      this.sample.languagesUsed[0].usage = 'all';
    }
  }

  addStudentParticipant($event) {
    let participant = new StudentParticipant();
    this.sample.languagesUsed.forEach(langUsage => {
      participant.languageSkills.push(new LanguageSkill({language: langUsage.lang}));
    });
    participant.languageKeys = participant.languageSkills.map(lang => lang.language);
    this.sample.students.push(participant);
    $event.target.blur();
  }

  addAdultParticipant($event) {
    this.sample.adults.push(new AdultParticipant());
    $event.target.blur();
  }

  lookupParticipants($event, type) {
    $event.stopPropagation();
    this.participantLookup.setType(type);
    this.participantLookupPanel.displayModal();
    $event.target.blur();
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

  clearParticipantLanguage(event: Event, participant: StudentParticipant) {
    // <HTMLElement>.dataset.value, quite apart from the typescript issues, doesn't work on IE < 11
    event.stopPropagation();
    const langToRemove = (event.target as HTMLElement).getAttribute('data-value');
    participant.languageSkills = participant.languageSkills.filter(lang => lang.language !== langToRemove);
    participant.languageKeys = participant.languageKeys.filter(lang => lang !== langToRemove);
    this.languageSkillPanel.hide();
  }

  addLanguageStandard(languageSkill) {
    languageSkill.assessedLevel.push({standard: '', level: ''});
  }

  removeLanguageStandard(event: Event, languageSkill, assessedLevel) {
    event.stopPropagation();
    languageSkill.assessedLevel = languageSkill.assessedLevel.filter(item => item !== assessedLevel);

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

  supportingFilesSelected(filesList: FileList) {

    const acceptedFileTypes: string[] = [
      // Images
      'image/png',
      'image/jpeg',
      'image/gif',

      // PDF
      'application/pdf',

      // MS Word
      'application/msword',  // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  // .docx

      // MS Excel
      'application/vnd.ms-excel',  // .xsl, .xla, .xlt
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  // .xslx

      // MS PowerPoint
      'application/vnd.ms-powerpoint',  // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',  // .pptx
      'application/vnd.openxmlformats-officedocument.presentationml.slideshow',  // .ppsx

      // OpenOffice / LibreOffice
      'application/vnd.oasis.opendocument.text',  // .odt
      'application/vnd.oasis.opendocument.spreadsheet',  // .ods
      'application/vnd.oasis.opendocument.presentation',  // .odp

      // Others
      'text/plain',
      'text/csv',
      'application/rtf',
    ];
    const maximumFileSizeInBytes = 2e+6;
    const rejectedFileType: File[] = [];
    const rejectedFileSize: File[] = [];

    for (let i = 0; i < filesList.length; ++i) {
      if (acceptedFileTypes.indexOf(filesList[i].type) === -1) {
          // note: browsers just set the mime-type on the basis of the
          //       file extension, so this is just a sanity check, really
          rejectedFileType.push(filesList[i]);
          continue;
      }
      if (maximumFileSizeInBytes < filesList[i].size) {
          rejectedFileSize.push(filesList[i]);
          continue;
      }
      this.sample.supportingFiles.push(filesList[i]);
    }


    if (rejectedFileType.length) {
      const html = `
        <div class="notification-title">Files Rejected (wrong type):</div>
        <div class="notification-content">Allowed types are image files and document files.</div>
        <div class="notification-content">
          <ul>
            ${
              rejectedFileType.map(
                f => `<li><i class="fa fa-fw fa-ban"></i> ${f.name} (${f.type})</li>`
              ).join('')
            }
          </ul>
        </div>
      `;
      this.notificationsService.html(html, 'error', {timeout: 0, showCloseButton: true});
    }

    if (rejectedFileSize.length) {
      const html = `
        <div class="notification-title">Files Rejected (too large):</div>
        <div class="notification-content">
          Files may be no bigger than ${maximumFileSizeInBytes.siUnits()} / ${maximumFileSizeInBytes.iecUnits()}.
        </div>
        <div class="notification-content">
          <ul>
            ${
              rejectedFileSize.map(
                f => `<li><i class="fa fa-fw fa-ban"></i> ${f.name} (${f.size.siUnits()} / ${f.size.iecUnits()})</li>`
              ).join('')
            }
          </ul>
        </div>
      `;
      this.notificationsService.html(html, 'error', {timeout: 0, showCloseButton: true});
    }
  }

  saveSample() {
    this.apiService.putSample(this.sample).subscribe(
      response => console.log(response)
    );
  }

  dump(value) {
    console.log(value);
  }

}

