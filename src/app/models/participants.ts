import * as uuid from 'uuid';

import { Language } from './common';


export const Gender = {
  F: { label: 'Female', value: 'F' },
  M: { label: 'Male', value: 'M' },
  O: { label: 'Other', value: 'O' },
  null: { label: 'Unknown', value: null }
};

export const GradeLevel = {
  unknown_elementary:   'Unknown (Elementary-School)',
  unknown_middleschool: 'Unknown (Middle-School)',
  unknown_highschool:   'Unknown (High-School)',
  unknown:              'Unknown',
  pre_k:                'Pre-Kindergarden',
  k:                    'Kindergarden',
  one:                  'First Grade',
  two:                  'Second Grade',
  three:                'Third Grade',
  four:                 'Fourth Grade',
  five:                 'Fifth Grade',
  six:                  'Sixth Grade',
  seven:                'Seventh Grade',
  eight:                'Eighth Grade',
  nine:                 'Ninth Grade',
  ten:                  'Tenth Grade',
  eleven:               'Eleventh Grade',
  twelve:               'Twelfth Grade',
  twelve_plus:          'Beyond Twelfth Grade'
};

export const LanguageStandardLevels = {
  'access': [
    'Entering',
    'Beginning',
    'Developing',
    'Expanding',
    'Bridging'
  ],
  'azella': [
    'Pre-Emergent',
    'Emergent',
    'Basic',
    'Intermediate',
    'Proficient'
  ],
  'celdt': [
    'Beginning',
    'Early Intermediate',
    'Intermediate',
    'Early Advanced',
    'Advanced'
  ],
  'cella': [
    'Beginning',
    'Low Intermediate',
    'High Intermediate',
    'Proficient'
  ],
  'elpa21': [
    'Level 1 (Beginning)',
    'Level 2 (Early Intermediate)',
    'Level 3 (Intermediate)',
    'Level 4 (Early Advanced)',
    'Level 5 (Advanced)'
  ],
  'las': [
    'Beginning',
    'Early Intermediate',
    'Intermediate',
    'Proficient',
    'Above Proficient'
  ],
  'nyseslat': [
    'Entering',
    'Emerging',
    'Transitioning',
    'Expanding',
    'Commanding'
  ],
  'selp': [
    'Pre-Emergent',
    'Emergent',
    'Basic',
    'Intermediate',
    'Proficient'
  ],
  'telpas': [
    'Beginning',
    'Intermediate',
    'Advanced',
    'Advanced High'
  ]
};

interface IParticipant {
  uuid: string;
  nickname: string;
  avatar: string;
  gender: string;
}

interface IAdultParticipant extends IParticipant {
  isSubmitter: boolean;
  isTeacher: boolean;
}

interface IStudentParticipant extends IParticipant {
  languageKeys: string[];
  languageSkills: LanguageSkill[];
  gradeLevel: number;
}

export class Participant implements IParticipant {
  public uuid: string = uuid.v4();
  public nickname = '';
  public avatar: string = Participant.getRandomAvatar();
  public gender = null;
  public samples?: any[];


  static getRandomAvatar(): string {
    const colorSets = ['Black', 'Blue', 'Green', 'Violet', 'White', 'Yellow'];
    const maxIndex = 80;
    const max = 480, min = 1;
    let participantIndex = Math.floor(Math.random() * (max - min + 1)) + min;
    let colorSet = colorSets[(participantIndex % colorSets.length)];
    let imageIndex = Array.from(Array(maxIndex + 1).keys()).slice(1)[(Math.floor((participantIndex - 1) / colorSets.length))];
    return `/media/avatars/${colorSet}/${('00' + imageIndex).slice(-2)}.png`;
  }

  constructor(obj?: IParticipant) { Object.assign(this, obj); }
}

export class AdultParticipant extends Participant implements IAdultParticipant {
  public isSubmitter: boolean;
  public isTeacher: boolean;
};


export class StudentParticipant extends Participant implements IStudentParticipant {
  public gradeLevel: number;
  public languageSkills: LanguageSkill[] = [];
  public languageKeys: string[] = [];

  constructor(obj?: IStudentParticipant) {
    super(obj);
    if (obj && obj.languageSkills) {
      this.languageKeys = obj.languageSkills.map(lang => lang.language);
      this.languageSkills = obj.languageSkills.map(lang => new LanguageSkill(lang));
    }
  }

  languageSkillIsValid(language) {
    let languageSkill = this.languageSkills.find(lang => lang.language === language);
    return languageSkill && languageSkill.isValid();
  }
};

export class LanguageSkill {
  public language: string;
  public readingProficiency?: number;
  public writingProficiency?: number;
  public speakingProficiency?: number;
  public listeningProficiency?: number;
  public participantIsLearner?: boolean = null;
  public isPrimaryLanguage?: boolean = null;
  public assessedLevel?: any[] = []; // TODO: typings?

  constructor(obj?) { Object.assign(this, obj); }

  isValid(): boolean {
    return (this.speakingProficiency != null && this.listeningProficiency != null);
  }
}
