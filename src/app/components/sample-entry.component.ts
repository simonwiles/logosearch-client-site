import * as uuid from 'uuid';

import { Observable }                 from 'rxjs/Observable';

import { AfterViewInit,
         ChangeDetectorRef,
         Component,
         ElementRef,
         OnInit,
         ViewChild,
         ViewChildren }               from '@angular/core';

import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';

import { ActivatedRoute,
         Router }                     from '@angular/router';

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
         LanguageSkill }              from '../models/participants';

import { Sample,
         FileUpload,
         LanguageUsage,
         SubjectArea,
         Turn }                       from '../models/sample';

import { ApiService }                 from '../services/api.service';
import { MessageBusService }          from '../services/message-bus.service';
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
export class SampleEntryComponent implements OnInit, AfterViewInit {

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

    if (this.doStepValidation(this._step)) {
      this.doStepChange(value);
    } else {
      this.notificationsService.error(
        'Form is not complete!',
        'Please complete the necessary information before moving on!');
    }
  }

  private _step = 'about';
  private stepDirection = 'forward';

  // Our master model:
  public sample: Sample = new Sample();

  // A model for the languageSkillPanel:
  // public selectedParticipant: FormGroup;
  // public languageSkill: FormGroup = this.createLanguageSkill('eng');
  @ViewChild('linguagramComponent') linguagramComponent;
  @ViewChild('languageSkillPanel') languageSkillPanel;

  //
  @ViewChild('participantLookup') participantLookup;
  @ViewChild('participantLookupPanel') participantLookupPanel;

  // Get references to dynamically-generated elements, mainly for DOM-manipulation purposes:
  @ViewChildren('languageUsageSelect') languageUsageSelects;
  @ViewChildren('languageUsageRangeInput') languageUsageRangeInputs;


  aboutForm: FormGroup = this.builder.group({
    context: new FormControl('', Validators.required),
    subjectArea: new FormControl('', Validators.required),
    objective: new FormControl('', Validators.required),
    prompt: new FormControl('', Validators.required),
    languagesUsed: new FormArray([
      this.builder.group({
        language: new FormControl('eng', Validators.required),
        usage: new FormControl('all', Validators.required)
      })
    ], Validators.minLength(1)),
    supportingFiles: new FormArray([]),
  });

  participantsForm: FormGroup = this.builder.group({
    students: new FormArray([], Validators.compose([Validators.required, Validators.minLength(2)])),
    adults: new FormArray([])
  });


  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private elementRef: ElementRef,

    private route: ActivatedRoute,
    private router: Router,

    private builder: FormBuilder,

    private authConfig: AuthConfig,
    private apiService: ApiService,
    private messageBusService: MessageBusService,
    private notificationsService: NotificationsService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.sample.collectionSource = params;
    });
  }

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
    if (['about', 'participants', 'conversation'].indexOf(value) > ['about', 'participants', 'conversation'].indexOf(this._step)) {
      this.stepDirection = 'forward';
    } else {
      this.stepDirection = 'back';
    }
    this.changeDetectorRef.detectChanges();  // force change detection to run so that stepDirection is updated properly in the DOM
    this._step = value;
  }

  doStepValidation(value): boolean {

    const markAllTouched = function(control) {
      Object.keys(control.controls).forEach(
        field => {
          const innerControl = control.get(field);
          innerControl.markAsTouched();
          // if (!innerControl.valid) { console.log('invalid', innerControl); }
          if (innerControl.controls) { markAllTouched(innerControl); }
        }
      );
    }

    // if (value === 'about') {
    //   markAllTouched(this.aboutForm);
    //   return this.aboutForm.valid;
    // }

    if (value === 'participants') {
      markAllTouched(this.participantsForm);
      return this.participantsForm.valid;
    }
    return true;
  }

  removeValue(arr: any[], value: any) {
    return arr.filter(e => e !== value);
  }

  editLanguageSkill(event, option, participant) {
    // Populate and pop-up the languageSkillPanel when a language 'pill' is clicked.
    event.stopPropagation();
    let languageSkill = participant.controls.languageSkills.controls.find(
      langSkillFormGroup => langSkillFormGroup.controls.language.value === option.value
    );
    this.linguagramComponent.newLinguagram(languageSkill);
    this.changeDetectorRef.detectChanges();
    this.languageSkillPanel.toggle(event);
    return false;
  }

  createLanguageSkill(language) {
    return this.builder.group({
      language: new FormControl(language, Validators.required),
      speakingProficiency: new FormControl(null, Validators.required),
      listeningProficiency: new FormControl(null, Validators.required),
      readingProficiency: new FormControl(null),
      writingProficiency: new FormControl(null),
      participantIsLearner: new FormControl(null),
      isPrimaryLanguage: new FormControl(null),
      assessedLevel: new FormArray([])
    });
  }

  newLanguageSkill(language, participant: FormGroup, selectComponent) {
    // Populate and pop-up the languageSkillPanel when a new language is first added.
    // First, find the 'pill' <li/> to align the languageSkillPanel to:
    const targetEl = selectComponent.el.nativeElement
                    .querySelector(`li.select2-selection__choice[data-value^=${language}]`);

    let languageSkill: FormGroup = this.createLanguageSkill(language);
    (participant.controls.languageSkills as FormArray).push(languageSkill);
    this.linguagramComponent.newLinguagram(languageSkill);
    this.changeDetectorRef.detectChanges();
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
    (this.aboutForm.get('languagesUsed') as FormArray).push(
      this.builder.group({
        language: new FormControl(null, Validators.required),
        usage: new FormControl(null, Validators.required)
      })
    );

    this.changeDetectorRef.detectChanges();
    this.enforceLangUsagePolicies();
    return false;
  }

  removeLanguageUsage(i) {
    // TODO: this could be removed
    //   call aboutForm.get('languagesUsed').removeAt(i) directly from the template,
    //   and watch for valuechanges to implement policies
    (this.aboutForm.get('languagesUsed') as FormArray).removeAt(i);
    this.changeDetectorRef.detectChanges();
    this.enforceLangUsagePolicies();
    return false;
  }

  enforceLangUsagePolicies() {
    const languagesUsed: FormArray = (this.aboutForm.get('languagesUsed') as FormArray);
    if (languagesUsed.controls.length > 1) {
      for (let langUsage of languagesUsed.controls) {
        const usageControl = (langUsage as FormGroup).controls.usage;
        if (usageControl.value === 'all') { usageControl.setValue(null); }
      }
      this.languageUsageRangeInputs.forEach(
        input => {
          input.maxRangeWidth = 67;  // actually this could be default, because if "all" is enabled, the range line
                                     //  overwrites this anyway; but this way is explicit, so...
          input.options.find(item => item.value === 'all').disabled = true;
        });
    } else {
      (languagesUsed.controls[0] as FormGroup).controls.usage.setValue('all');
    }
  }

  addStudentParticipant($event) {
    // let participant = new StudentParticipant();
    // this.sample.languagesUsed.forEach(langUsage => {
    //   participant.languageSkills.push(new LanguageSkill({language: langUsage.language}));
    // });
    // participant.languageKeys = participant.languageSkills.map(lang => lang.language);
    // this.sample.students.push(participant);

    const formGroup = this.builder.group({
      uuid: new FormControl(uuid.v4(), Validators.required),
      nickname: new FormControl(null, Validators.required),
      avatar: new FormControl(StudentParticipant.getRandomAvatar(), Validators.required),
      gender: new FormControl(null, Validators.required),
      gradeLevel: new FormControl(null, Validators.required),
      languageKeys: new FormArray([], Validators.minLength(1)),
      languageSkills: new FormArray([], Validators.minLength(1))
    });

    // (this.aboutForm.get('languagesUsed') as FormArray).controls.forEach(
    //   langUsed => {
    //     console.log((langUsed as FormGroup).controls.language.value);
    //     (formGroup.controls.languageSkills as FormArray).push(
    //       this.createLanguageSkill((langUsed as FormGroup).controls.language.value)
    //     )
    //   }
    // );

    // (formGroup.controls.languageKeys as FormArray).push(
    //   new FormControl('spa')
    // );

    (this.participantsForm.get('students') as FormArray).push(formGroup);

    $event.target.blur();
    this.changeDetectorRef.detectChanges();
    return false;
  }

  addAdultParticipant($event) {

    const formGroup = this.builder.group({
      uuid: new FormControl(uuid.v4(), Validators.required),
      nickname: new FormControl(null, Validators.required),
      avatar: new FormControl(AdultParticipant.getRandomAvatar(), Validators.required),
      gender: new FormControl(null, Validators.required),
      isSubmitter: new FormControl(null),
      isTeacher: new FormControl(null)
    });

    (this.participantsForm.get('adults') as FormArray).push(formGroup);

    $event.target.blur();
    return false;
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

  recordingSelected(event) {
    const acceptedFileTypes: string[] = [
      // Audio
      'audio/flac',    // flac
      'audio/mpeg',    // mp3
      'audio/mp3',     // mp3
      'audio/mp4',     // mp4 audio
      'audio/ogg',     // OGG Vorbis
      'audio/vnd.wav'  // wav
    ];
    const acceptedFileTypesString = 'audio files';
    const maximumFileSizeInBytes = environment.maxRecordingFileSize;

    if (event.target.files && event.target.files[0]) {

      let file =  this.validateSelectedFiles(
        event.target.files, acceptedFileTypes, maximumFileSizeInBytes, acceptedFileTypesString)[0];
      if (file) {
        this.sample.recording.file = new FileUpload({file: file, title: file.name});
        this.sample.recording.file.url = URL.createObjectURL(file);
      }
    }
  }

  getRecordingFromDropbox() {
    const sampleEntryComponent = this;
    const recording = this.sample.recording;

    const handleFiles = function(files) {
      const file = sampleEntryComponent.validateFilesFromDropbox(files, environment.maxRecordingFileSize)[0];
      if (file) {
        recording.file = new FileUpload({
          url: file.link,
          title: file.name
        });
      }
    };

    window.Dropbox.choose({
      success: (files) => handleFiles(files),
      //  cancel: function() { },
      linkType: 'direct',
      multiselect: false,
      extensions: ['audio'],
    });
  }

  clearRecording() {
    this.sample.recording = null;
  }

  validateFilesFromDropbox(files, maximumFileSizeInBytes) {
    const validFiles = [];
    const rejectedFileSize = [];

    for (let i = 0; i < files.length; ++i) {
      if (maximumFileSizeInBytes < files[i].bytes) {
          rejectedFileSize.push(files[i]);
          continue;
      }
      validFiles.push(files[i]);
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
                f => `<li><i class="fa fa-fw fa-ban"></i> ${f.name} (${f.bytes.siUnits()} / ${f.bytes.iecUnits()})</li>`
              ).join('')
            }
          </ul>
        </div>
      `;
      this.notificationsService.html(html, 'error', {timeout: 0, showCloseButton: true});
    }

    return validFiles;
  }

  validateSelectedFiles(
    filesList: FileList, acceptedFileTypes: string[], maximumFileSizeInBytes: number, acceptedFileTypesString: string): File[] {

    const validFiles: File[] = [];
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
      validFiles.push(filesList[i]);
    }


    if (rejectedFileType.length) {
      const html = `
        <div class="notification-title">Files Rejected (wrong type):</div>
        <div class="notification-content">Allowed types are ${acceptedFileTypesString}.</div>
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

    return validFiles;
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
    const acceptedFileTypesString = 'image files and document files';
    const maximumFileSizeInBytes = environment.maxSupportingFileSize;
    const rejectedTooMany: File[] = [];

    const supportingFiles: FormArray = (this.aboutForm.get('supportingFiles') as FormArray);
    this.validateSelectedFiles(filesList, acceptedFileTypes, maximumFileSizeInBytes, acceptedFileTypesString).forEach(
      supportingFile => {
        if (supportingFiles.length < environment.maxSupportingFileCount) {
          supportingFiles.push(
            // new FileUpload({file: supportingFile, title: '', name: supportingFile.name})

            this.builder.group({
              file: new FormControl(supportingFile),
              title: new FormControl(null, Validators.required),
              name: new FormControl(supportingFile.name, Validators.required),
            })

          );
        } else {
          rejectedTooMany.push(supportingFile);
        }
      }
    );

    if (rejectedTooMany.length) {
      const html = `
        <div class="notification-title">Files Rejected (too many):</div>
        <div class="notification-content">
          No more than ${environment.maxSupportingFileCount} files may be selected.
        </div>
        <div class="notification-content">
          <ul>
            ${
              rejectedTooMany.map(
                f => `<li><i class="fa fa-fw fa-ban"></i> ${f.name}</li>`
              ).join('')
            }
          </ul>
        </div>
      `;
      this.notificationsService.html(html, 'error', {timeout: 0, showCloseButton: true});
    }
  }

  getSupportingFilesFromDropbox() {
    const sampleEntryComponent = this;
    const supportingFiles = this.sample.supportingFiles;

    const handleFiles = function(files) {
      const rejectedTooMany = [];
      sampleEntryComponent.validateFilesFromDropbox(files, environment.maxSupportingFileSize).forEach(
        supportingFile => {
          if (supportingFiles.length < sampleEntryComponent.environment.maxSupportingFileCount) {
            supportingFiles.push(new FileUpload({name: supportingFile.name, title: '', url: supportingFile.link}));
          } else {
            rejectedTooMany.push(supportingFile);
          }
        }
      );

      if (rejectedTooMany.length) {
        const html = `
          <div class="notification-title">Files Rejected (too many):</div>
          <div class="notification-content">
            No more than ${environment.maxSupportingFileCount} files may be selected.
          </div>
          <div class="notification-content">
            <ul>
              ${
                rejectedTooMany.map(
                  f => `<li><i class="fa fa-fw fa-ban"></i> ${f.name}</li>`
                ).join('')
              }
            </ul>
          </div>
        `;
        sampleEntryComponent.notificationsService.html(html, 'error', {timeout: 0, showCloseButton: true});
      }
    };

    window.Dropbox.choose({
      success: files => handleFiles(files),
      //  cancel: function() { },
      linkType: 'direct',
      multiselect: true,
      extensions: ['images', 'documents', 'text'],
    });
  }

  validateSample() {

    const validated = {
      sampleJSON: null,
      recordingFile: null,
      supportingFiles: [],
    };

    const sampleClone = JSON.parse(JSON.stringify(this.sample));


    // sampleClone.students.forEach(student => delete student['languageKeys']);

    if (this.sample.recording.file && this.sample.recording.file.file) {
      validated.recordingFile = this.sample.recording.file.file;
      delete sampleClone.recording.file.url;
    }

    this.sample.supportingFiles.forEach(
      (supportingFile: FileUpload) => {
        if (supportingFile.file) {
          validated.supportingFiles.push(supportingFile.file);
        } else {
          validated.supportingFiles.push(supportingFile.url);
        }
      }
    );

    sampleClone.turns = sampleClone.turns.filter(turn => turn.hasOwnProperty('speaker') && turn['content']);

    validated.sampleJSON = JSON.stringify(sampleClone);

    return validated;
  }

  saveSample() {
    let validated = this.validateSample();

    this.apiService.putSample(validated.sampleJSON, validated.recordingFile, validated.supportingFiles).subscribe(
      sample => {
        this.messageBusService.emit('sampleSaved', sample);
        this.router.navigate(['../sample', sample.uuid], {relativeTo: this.route});
      },
      error => { console.log(error); this.notificationsService.error('Error!', error.message); }
    );
  }

  loadSample(sampleObj: Sample, update = false) {
    if (update) {
      this.sample = Object.assign(this.sample, new Sample(sampleObj));
    } else {
      this.sample = new Sample(sampleObj);
    }
  }

  formSubmit() {
    console.log(this.aboutForm.value);
  }

  languageSkillIsValid(participant, language) {
    let ls = participant.controls.languageSkills.controls.find(
      langSkillFormGroup => langSkillFormGroup.controls.language.value === language
    );
    return ls && ls.valid;
  }

}
