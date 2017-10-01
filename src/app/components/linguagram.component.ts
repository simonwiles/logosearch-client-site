import { Component }                  from '@angular/core';

import { FormArray,
         FormBuilder,
         FormControl,
         FormGroup,
         Validators }                 from '@angular/forms';

import { Language }                   from '../models/common';
import { LanguageStandardLevels }     from '../models/participants';

@Component({
  selector: 'lr-linguagram',
  templateUrl: './linguagram.component.html'
})
export class LinguagramComponent {
  linguagramForm: FormGroup;
  participantNickname: string;

  public languages: any = Language;
  public languageStandardLevels = LanguageStandardLevels;

  constructor(private formBuilder: FormBuilder) { }

  newLinguagram(linguagramForm: FormGroup, participantNickname?: string) {
    if (participantNickname) { this.participantNickname = participantNickname; }
    this.linguagramForm = linguagramForm;
  }

  reset() {
    this.linguagramForm = null;
    this.participantNickname = null;
  }

  addLanguageStandard() {
    (this.linguagramForm.get('assessedLevel') as FormArray).push(
      this.formBuilder.group({
        standard: new FormControl(null, Validators.required),
        level: new FormControl(null, Validators.required)
      })
    );
  }
}
