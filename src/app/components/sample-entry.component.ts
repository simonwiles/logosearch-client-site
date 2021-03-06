import * as uuid from 'uuid';

import { Observable }                 from 'rxjs/Observable';

import { AfterViewInit,
         ChangeDetectorRef,
         Component,
         ComponentFactory,
         ComponentFactoryResolver,
         ComponentRef,
         ElementRef,
         OnInit,
         ViewChild,
         ViewChildren,
         ViewContainerRef }           from '@angular/core';

import { FormArray,
         FormBuilder,
         FormControl,
         FormGroup,
         Validators }                 from '@angular/forms';

import { ActivatedRoute,
         NavigationExtras,
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

import { LinguagramComponent }        from '../components/linguagram.component';

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
  public gradeLevels: any = Object.keys(GradeLevel)
                              .filter(key => !key.startsWith('unknown'))
                              .map(key => ({ label: GradeLevel[key], value: key }));
  public languages: any = Language;
  public languageOptions: any = Object.values(Language).filter(obj => obj.value !== 'unk');
  public subjectAreas: any = Object.values(SubjectArea);
  public langKnowns: any = this.languageOptions.map(obj => ({ label: obj.label, value: obj.value }));

  public submitAttempted = false;
  public busy = false;

  public linguagramComponentRef: ComponentRef<LinguagramComponent>;

  public step = 'about';
  private stepDirection = 'forward';

  @ViewChild('stepChooser') stepChooser;

  @ViewChild('languageSkillPanel') languageSkillPanel;
  @ViewChild('linguagramComponentContainer', { read: ViewContainerRef }) linguagramComponentContainer;

  @ViewChild('participantLookup') participantLookup;
  @ViewChild('participantLookupPanel') participantLookupPanel;

  @ViewChild('fileInput') fileInput;

  // Get references to dynamically-generated elements, mainly for DOM-manipulation purposes:
  @ViewChildren('languageUsageSelect') languageUsageSelects;
  @ViewChildren('languageUsageRangeInput') languageUsageRangeInputs;

  // FormGroup objects (one per 'page' of the sample-entry component)
  aboutForm: FormGroup = this.formBuilder.group({
    uuid: new FormControl(uuid.v4(), Validators.required),
    collectionSource: new FormControl(''),
    context: new FormControl('', Validators.required),
    subjectArea: new FormControl('', Validators.required),
    objective: new FormControl('', Validators.required),
    prompt: new FormControl('', Validators.required),
    languagesUsed: new FormArray([
      this.formBuilder.group({
        language: new FormControl('eng', Validators.required),
        usage: new FormControl('all', Validators.required)
      })
    ], Validators.minLength(1)),
    supportingFiles: new FormArray([]),
  });

  participantsForm: FormGroup = this.formBuilder.group({
    students: new FormArray([], Validators.compose([Validators.required, Validators.minLength(2)])),
    adults: new FormArray([])
  });

  conversationForm: FormGroup = this.formBuilder.group({
    recording: this.formBuilder.group({
      file: this.formBuilder.group({
        file: new FormControl(null),
        title: new FormControl(null),
        name: new FormControl(null, Validators.required),
        url: new FormControl(null),
      }),
      includesAdditionalContext: new FormControl(null),
      noAudioAvailable: new FormControl(false, Validators.required),
      noAudioExplanation: new FormControl(null)
    }),
    turns: new FormArray([
      this.formBuilder.group({
        speaker: new FormControl(null, Validators.required),
        content: new FormControl(null, Validators.required)
      })
      // note: includes the blank one at the bottom which will be stripped
    ], Validators.compose([Validators.required, Validators.minLength(17)])),
    fewTurns: new FormControl(false)
  });

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private elementRef: ElementRef,

    private route: ActivatedRoute,
    private router: Router,

    private formBuilder: FormBuilder,

    private authConfig: AuthConfig,
    private apiService: ApiService,
    private messageBusService: MessageBusService,
    private notificationsService: NotificationsService) { }

  ngOnInit() {
    if (this.route.snapshot.queryParams.hasOwnProperty('collectionSource')) {
      this.aboutForm.get('collectionSource').setValue(JSON.parse(this.route.snapshot.queryParams['collectionSource']));
    }

    this.aboutForm.get('languagesUsed').valueChanges.subscribe(
      languagesUsed => {
        // seems to cause "RangeError: Maximum call stack size exceeded at callWithDebugContext"
        //  if not wrapped in setTimeout... don't fully understand why
        setTimeout(() => this.enforceLangUsagePolicies());
      }
    );

    // toggle the 'required' status of the recording file and the explanation when the
    //  checkbox is toggled
    this.conversationForm.get('recording').get('noAudioAvailable').valueChanges.subscribe(
      (noAudioAvailable: boolean) => {
        const noAudioExplanation = this.conversationForm.get('recording').get('noAudioExplanation');
        const file = this.conversationForm.get('recording').get('file');

        if (noAudioAvailable) {
          noAudioExplanation.enable();
          noAudioExplanation.setValidators(Validators.required);

          file.setValidators(null);
          file.disable();

        } else {
          file.enable();
          file.setValidators(Validators.required);

          noAudioExplanation.setValidators(null);
          noAudioExplanation.disable();
        }

        noAudioExplanation.updateValueAndValidity();
        file.updateValueAndValidity();
      }
    );

    // ensure there is always a blank turn at the bottom of the list
    //  (and that all turns but the last are required)
    this.conversationForm.get('turns').valueChanges.subscribe(
      turns => {
        let turnFormGroups = (this.conversationForm.get('turns') as FormArray).controls;
        for (let i = 0, il = turnFormGroups.length - 1; i < il; i++) {
          Object.keys((turnFormGroups[i] as FormGroup).controls).forEach(
            key => (turnFormGroups[i] as FormGroup).controls[key].setValidators(Validators.required)
          )
        }
        if (turns[turns.length - 1].content && turns[turns.length - 1].speaker) {
          this.addTurn();
          // this.changeDetectorRef.detectChanges();
        }

        if (turnFormGroups.length < 17) { // note: includes the blank one at the bottom which will be stripped
          this.conversationForm.get('fewTurns').setValidators(Validators.requiredTrue);
        } else {
          this.conversationForm.get('fewTurns').clearValidators();
        }
      }
    );

    this.conversationForm.get('fewTurns').valueChanges.subscribe(
      fewTurns => {
        // note: Validators.minLength includes the blank one at the bottom which will be stripped
        if (fewTurns) {
          this.conversationForm.get('turns').setValidators([Validators.required, Validators.minLength(5)]);
        } else {
          this.conversationForm.get('turns').setValidators([Validators.required, Validators.minLength(17)]);
        }
        this.conversationForm.get('turns').updateValueAndValidity();
      }
    );
  }

  addTurn() {
    (this.conversationForm.get('turns') as FormArray).push(
      this.formBuilder.group({
        speaker: new FormControl(null),
        content: new FormControl(null)
      })
    );
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

  doStepChange(nextStep) {

    if (nextStep === null) { return false; }

    if (!this.doStepValidation(this.step)) {
      // this.notificationsService.error(
      //   'Form is not complete!',
      //   'Please complete the necessary information before moving on!',
      //   {showCloseButton: true}
      // );

      return false;
    }

    if (nextStep === 'conversation' && this.step === 'about') {
      if (!this.doStepValidation('participants')) {
        this.step = 'participants';
        return false;
      }
    }

    if (['about', 'participants', 'conversation'].indexOf(nextStep) > ['about', 'participants', 'conversation'].indexOf(this.step)) {
      this.stepDirection = 'forward';
    } else {
      this.stepDirection = 'back';
    }
    this.step = nextStep;
    return true;
  }

  doStepValidation(value): boolean {

    const markAllTouched = function(control) {
      Object.keys(control.controls).forEach(
        field => {
          const innerControl = control.get(field);
          innerControl.markAsTouched();
          if (innerControl.controls) { markAllTouched(innerControl); }
        }
      );
    }

    if (value === 'about') {
      markAllTouched(this.aboutForm);
      return this.aboutForm.valid;
    }

    if (value === 'participants') {
      markAllTouched(this.participantsForm);
      return this.participantsForm.valid;
    }

    if (value === 'conversation') {
      this.submitAttempted = true;
      markAllTouched(this.conversationForm);
      return this.conversationForm.valid;
    }
    return true;
  }

  removeValue(arr: any[], value: any) {
    return arr.filter(e => e !== value);
  }

  createLinguagram(languageSkillForm) {
    this.linguagramComponentContainer.clear();
    const componentFactory: ComponentFactory<LinguagramComponent> =
      this.componentFactoryResolver.resolveComponentFactory(LinguagramComponent);
    this.linguagramComponentRef = this.linguagramComponentContainer.createComponent(componentFactory);
    this.linguagramComponentRef.instance.newLinguagram(languageSkillForm);
  }

  markAllTouched(control) {
    Object.keys(control.controls).forEach(
      field => {
        const innerControl = control.get(field);
        innerControl.markAsTouched();
        if (innerControl.controls) { this.markAllTouched(innerControl); }
      }
    );
  }

  editLanguageSkill($event, option, participant) {
    // Populate and pop-up the languageSkillPanel when a language 'pill' is clicked.
    $event.stopPropagation();

    let languageSkillForm = participant.get('languageSkills').controls.find(
      _languageSkillForm => _languageSkillForm.get('language').value === option.value
    );

    // update validation status so that indicators show
    this.markAllTouched(languageSkillForm.get('assessedLevel'));

    if (this.linguagramComponentRef && languageSkillForm === this.linguagramComponentRef.instance.linguagramForm) {
      this.createLinguagram(languageSkillForm);
      this.languageSkillPanel.toggle($event);
    } else {
      this.createLinguagram(languageSkillForm);
      this.languageSkillPanel.show($event);
    }
    return false;
  }

  createLanguageSkill(language) {
    return this.formBuilder.group({
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

    let languageSkillForm: FormGroup = this.createLanguageSkill(language);
    (participant.controls.languageSkills as FormArray).push(languageSkillForm);
    this.createLinguagram(languageSkillForm);
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
      this.formBuilder.group({
        language: new FormControl(null, Validators.required),
        usage: new FormControl(null, Validators.required)
      })
    );
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


  newStudentParticipantFormGroup() {
    return this.formBuilder.group({
      uuid: new FormControl(uuid.v4(), Validators.required),
      nickname: new FormControl(null, Validators.compose([Validators.required, Validators.maxLength(150)])),
      avatar: new FormControl(StudentParticipant.getRandomAvatar(), Validators.required),
      gender: new FormControl(null, Validators.required),
      gradeLevel: new FormControl(null, Validators.required),
      languageKeys: new FormControl(null, Validators.minLength(1)),
      languageSkills: new FormArray([], Validators.minLength(1))
    });
  }

  addStudentParticipant($event?) {
    const formGroup = this.newStudentParticipantFormGroup();

    (this.aboutForm.get('languagesUsed') as FormArray).controls.forEach(
      langUsed => {
        (formGroup.get('languageSkills') as FormArray).push(
          this.createLanguageSkill((langUsed as FormGroup).get('language').value)
        );
      }
    );

    formGroup.get('languageKeys').setValue(
      (this.aboutForm.get('languagesUsed') as FormArray).controls.map(
        langUsed => (langUsed as FormGroup).get('language').value
      )
    );

    (this.participantsForm.get('students') as FormArray).push(formGroup);

    if ($event) { $event.target.blur(); }
    return false;
  }


  newAdultParticipantFormGroup() {
    return this.formBuilder.group({
      uuid: new FormControl(uuid.v4(), Validators.required),
      nickname: new FormControl(null, Validators.compose([Validators.required, Validators.maxLength(150)])),
      avatar: new FormControl(AdultParticipant.getRandomAvatar(), Validators.required),
      gender: new FormControl(null, Validators.required),
      isSubmitter: new FormControl(null, Validators.required),
      isTeacher: new FormControl(null, Validators.required)
    });
  }

  addAdultParticipant($event?) {
    const formGroup = this.newAdultParticipantFormGroup();
    (this.participantsForm.get('adults') as FormArray).push(formGroup);

    if ($event) { $event.target.blur(); }
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

    if (data.type === 'students') {
      data.participants.forEach(
        participant => {
          if (!(this.participantsForm.get('students') as FormArray).controls.some(
              participantForm => participantForm.get('uuid').value === participant.uuid)) {

            const formGroup = this.newStudentParticipantFormGroup();
            formGroup.patchValue(participant);

            // add the languages
            participant.languageSkills.forEach(
              langSkill => {
                let langSkillFormGroup = this.createLanguageSkill(langSkill.language);
                langSkillFormGroup.patchValue(langSkill);
                (formGroup.get('languageSkills') as FormArray).push(langSkillFormGroup);
              }
            );
            formGroup.get('languageKeys').setValue(participant.languageSkills.map(langSkill => langSkill.language));

            (this.participantsForm.get('students') as FormArray).push(formGroup);
          }
        }
      );
    }

    if (data.type === 'adults') {
      data.participants.forEach(
        participant => {
          if (!(this.participantsForm.get('adults') as FormArray).controls.some(
              participantForm => participantForm.get('uuid').value === participant.uuid)) {
            const formGroup = this.newAdultParticipantFormGroup();
            formGroup.patchValue(participant);
            (this.participantsForm.get('adults') as FormArray).push(formGroup);
          }
        }
      );
    }
  }

  clearParticipantLanguage(event: Event, student: FormGroup) {
    event.stopPropagation();
    const langToRemove = (event.target as HTMLElement).getAttribute('data-value');

    const languagesOfInstruction = (this.aboutForm.get('languagesUsed') as FormArray).controls.map(
      langUsed => (langUsed as FormGroup).get('language').value
    );

    if (languagesOfInstruction.indexOf(langToRemove) > -1) {
      this.notificationsService.error(
        'Invalid Action!',
        'You may not remove a language used in the conversation!');
      return false;
    }

    // make sure to remove the corresponding languageSkill first!
    const langSkillControls = (student.get('languageSkills') as FormArray).controls;
    for (let i = 0, il = langSkillControls.length; i < il; i++) {
      if (langSkillControls[i].get('language').value === langToRemove) {
        (student.get('languageSkills') as FormArray).removeAt(i);
        break;
      }
    }

    student.get('languageKeys').setValue(student.get('languageKeys').value.filter(lang => lang !== langToRemove));
    this.languageSkillPanel.hide();
  }

  recordingSelected($event) {
    const acceptedFileTypes: string[] = [
      // Audio
      'audio/aac',      // aac
      'audio/flac',     // flac
      'audio/mpeg',     // mp3
      'audio/mp3',      // mp3
      'audio/mp4',      // mp4 audio
      'audio/ogg',      // OGG Vorbis
      'audio/vnd.wav',  // wav
      'audio/webm',     // webm
      'audio/x-m4a',    // m4a
      'audio/x-ms-wma'  // wma
    ];
    const acceptedFileTypesString = 'audio files';
    const maximumFileSizeInBytes = environment.maxRecordingFileSize;

    if ($event.target.files && $event.target.files[0]) {

      let file =  this.validateSelectedFiles(
        $event.target.files, acceptedFileTypes, maximumFileSizeInBytes, acceptedFileTypesString)[0];

      if (file) {
        this.conversationForm.get('recording').get('file').patchValue({
          file: file,
          name: file.name,
          url: URL.createObjectURL(file)
        });
      } else {
        // reset the control, so that it reactivates if the user selects the same file again
        //  (otherwise, if an invalid file is re-selected, nothing happens!)
        this.fileInput.nativeElement.value = null;
      }
    }

    $event.target.blur();
  }

  getRecordingFromDropbox() {
    const sampleEntryComponent = this;
    const recordingFormGroup = this.conversationForm.get('recording');

    const handleFiles = function(files) {
      const file = sampleEntryComponent.validateFilesFromDropbox(files, environment.maxRecordingFileSize)[0];
      if (file) {
        recordingFormGroup.get('file').patchValue({
          url: file.link,
          name: file.name
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
    (this.conversationForm.controls.recording as FormGroup).controls.file.reset()
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

    const supportingFiles = <FormArray>this.aboutForm.get('supportingFiles');
    this.validateSelectedFiles(filesList, acceptedFileTypes, maximumFileSizeInBytes, acceptedFileTypesString).forEach(
      supportingFile => {
        if (supportingFiles.length < environment.maxSupportingFileCount) {
          supportingFiles.push(
            this.formBuilder.group({
              file: new FormControl(supportingFile),
              title: new FormControl(null, Validators.compose([Validators.required, Validators.maxLength(255)])),
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
    const supportingFiles = <FormArray>this.aboutForm.get('supportingFiles');

    const handleFiles = function(files) {
      const rejectedTooMany = [];
      sampleEntryComponent.validateFilesFromDropbox(files, environment.maxSupportingFileSize).forEach(
        supportingFile => {
          if (supportingFiles.length < sampleEntryComponent.environment.maxSupportingFileCount) {
            supportingFiles.push(
              sampleEntryComponent.formBuilder.group({
                title: new FormControl(null, Validators.required),
                name: new FormControl(supportingFile.name, Validators.required),
                url: new FormControl(supportingFile.link)
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

    let sample = Object.assign({}, this.aboutForm.value, this.participantsForm.value, this.conversationForm.value);

    delete sample.fewTurns;
    sample.students.forEach(student => delete student['languageKeys']);

    if (!this.conversationForm.get('recording').get('noAudioAvailable').value
        && this.conversationForm.get('recording').get('file').get('file').value) {
      validated.recordingFile = this.conversationForm.get('recording').get('file').get('file').value;
      delete sample.recording.file.url;
    }

    (this.aboutForm.get('supportingFiles') as FormArray).controls.forEach(
      (supportingFile: FormGroup) => {
        if (supportingFile.get('file')) {
          validated.supportingFiles.push(supportingFile.get('file').value);
        } else {
          validated.supportingFiles.push(supportingFile.get('url').value);
        }
      }
    );

    const removeEmpty = (obj) => {
      Object.keys(obj).forEach(key => {
        if (obj[key] === null
            || (Array.isArray(obj[key]) && obj[key].length === 0)
            || (typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0)) {

          delete obj[key];

        } else if (obj[key] && typeof obj[key] === 'object') {
          removeEmpty(obj[key]);
        }
      });
      return obj;
    };

    sample = removeEmpty(sample);
    sample.turns = sample.turns.filter(turn => turn.hasOwnProperty('speaker') && turn['content']);

    validated.sampleJSON = JSON.stringify(sample);

    return validated;
  }

  saveSample() {

    if (!this.doStepValidation('about') || !this.doStepValidation('participants') || !this.doStepValidation('conversation')) {
      // this.notificationsService.error(
      //     'Form is not complete!',
      //     'Please complete the necessary information before moving on!',
      //     {showCloseButton: true}
      // );
      return false;
    }

    let validated = this.validateSample();

    this.busy = true;
    this.apiService.putSample(validated.sampleJSON, validated.recordingFile, validated.supportingFiles).subscribe(
      sample => {
        this.busy = false;
        this.messageBusService.emit('sampleSaved', sample);
        if (this.route.snapshot.queryParams.routing === 'selfEvaluation') {
          let navigationExtras: NavigationExtras = {
            queryParams: {
              sampleUuid: sample.uuid
            },
            queryParamsHandling: 'merge',
            relativeTo: this.route,
            skipLocationChange: true,
            replaceUrl: false
          };
          this.router.navigate(['../evaluate'], navigationExtras)
          return;
        }
        this.router.navigate(['../sample', sample.uuid], {relativeTo: this.route});
      },
      error => {
        this.busy = false;
        console.log(error);
        this.notificationsService.error('Error!', error.message);
      }
    );
  }

  loadSample(sampleObj: Sample, update = false) {
    // TODO:
    // if (update) {
    //   this.sample = Object.assign(this.sample, new Sample(sampleObj));
    // } else {
    //   this.sample = new Sample(sampleObj);
    // }
  }

  languageSkillIsValid(participant, language) {
    let ls = participant.controls.languageSkills.controls.find(
      langSkillFormGroup => langSkillFormGroup.controls.language.value === language
    );
    return ls && ls.valid;
  }
}
