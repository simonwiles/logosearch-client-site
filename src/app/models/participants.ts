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
  languages: Linguagram[];
}

interface IAdultParticipant extends IParticipant {
  role: string;
  experience: string;
}

interface IStudentParticipant extends IParticipant {
  gradeLevel: number;
}

export class Participant implements IParticipant {
  public uuid: string = uuid.v4();
  public nickname = '';
  public avatar: string = Participant.getRandomAvatar();
  public gender = '';
  public languages: Linguagram[] = [];
  public languageKeys: string[] = [];
  public samples: any[] = [];


  static getRandomAvatar(): string {
    const colorSets = ['Black', 'Blue', 'Green', 'Violet', 'White', 'Yellow'];
    const maxIndex = 80;
    const max = 480, min = 1;
    let participantIndex = Math.floor(Math.random() * (max - min + 1)) + min;
    let colorSet = colorSets[(participantIndex % colorSets.length)];
    let imageIndex = Array.from(Array(maxIndex + 1).keys()).slice(1)[(Math.floor((participantIndex - 1) / colorSets.length))];
    return `/media/avatars/${colorSet}/${('00' + imageIndex).slice(-2)}.png`;
  }

  constructor(obj?: IParticipant) {
    Object.assign(this, obj);
    this.languageKeys = this.languages.map(lang => lang.language);
    this.languages = this.languages.map(lang => new Linguagram(lang));

    // this.uuid = (obj) ? obj.uuid : window.uuid.v4();
    // this.nickname = (obj) ? obj.nickname : '';
    // this.avatar = (obj) ? obj.avatar : Participant.getRandomAvatar();
    // this.gender = (obj) ? obj.gender : '';
    // // this.languages = (obj && obj.languages) ? obj.languages : [];
    // this.languages = (obj && obj.languages) ? obj.languages.map(lang => new Linguagram(lang)) : [];
    // this.samples = (obj && obj.samples) ? obj.samples : [];
  }

  linguagramIsValid(language) {
    let linguagram = this.languages.find(lang => lang.language === language);
    return linguagram && linguagram.isValid();
  }
}

export class AdultParticipant extends Participant implements IAdultParticipant {
  public role: string;
  public experience: string;

  constructor(obj?: IAdultParticipant) {
    super(obj);
    this.role = (obj) ? obj.role : '';
    this.experience = (obj) ? obj.experience : '';
  }
};


export class StudentParticipant extends Participant implements IStudentParticipant {
  public gradeLevel: number;

  constructor(obj?: IStudentParticipant) {
    super(obj);
    this.gradeLevel = (obj) ? obj.gradeLevel : null;
  }
};

// this rather ugly stringBoolean business is because passing `true` and `false` around
//  between ngModel and HTMLInputElement.value is a pain in the arse...
type stringBoolean = ( 'true' | 'false' | true | false | null );
export class Linguagram {
  public language: string;
  public readingProficiency?: number;
  public writingProficiency?: number;
  public speakingProficiency?: number;
  public listeningProficiency?: number;
  public participantIsLearner?: stringBoolean = null;
  public isPrimaryLanguage?: stringBoolean = null;
  public assessedLevel?: any[] = []; // TODO: typings!

  constructor(obj?) {
    Object.assign(this, obj);
    if (this.assessedLevel === null) { this.assessedLevel = []; }
    if (this.participantIsLearner === true) { this.participantIsLearner = 'true'; }
    if (this.participantIsLearner === false) { this.participantIsLearner = 'false'; }
    if (this.isPrimaryLanguage === true) { this.isPrimaryLanguage = 'true'; }
    if (this.isPrimaryLanguage === false) { this.isPrimaryLanguage = 'false'; }
  }

  isValid(): boolean {
    return (this.speakingProficiency != null && this.listeningProficiency != null);
  }
}
