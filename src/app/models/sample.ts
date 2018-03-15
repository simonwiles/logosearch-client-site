import * as uuid from 'uuid';

import { AdultParticipant,
         StudentParticipant }   from './participants';

export interface ISample {
  uuid: string;
  context: string;
  subjectArea: string[];
  objective: string;
  prompt: string;

  submittedAt: string;
  submittedBy: string;

  students: StudentParticipant[];
  adults: AdultParticipant[];

  languagesUsed: any[];

  turns: any[];
  numTurns: number;

  transcription: string;

  numEvaluations: number;

  recording: Recording;
  supportingFiles: FileUpload[];

  collectionSource: any;
}


export const SubjectArea = {
  art:             { label: 'Art',                       value: 'art' },
  ela:             { label: 'English Language Arts',     value: 'ela' },
  eld:             { label: 'ESL / ELD',                 value: 'eld' },
  hss:             { label: 'History / Social Studies',  value: 'hss' },
  math:            { label: 'Mathematics',               value: 'math' },
  algebra:         { label: 'Mathematics | Algebra',     value: 'algebra' },
  geometry:        { label: 'Mathematics | Geometry',    value: 'geometry' },
  science:         { label: 'Science',                   value: 'science' },
  biology:         { label: 'Science | Biology',         value: 'biology' },
  chemistry:       { label: 'Science | Chemistry',       value: 'chemistry' },
  physics:         { label: 'Science | Physics',         value: 'physics' },
  'science|other': { label: 'Science | Other',           value: 'science|other' },
  spanish:         { label: 'Spanish',                   value: 'spanish' },
  other:           { label: 'Other',                     value: 'other' }
};

export const LangUsageUsages = {
  min:   {label: 'Minimal',     value: 'min'},
  some:  {label: 'Some',        value: 'some'},
  subst: {label: 'Substantial', value: 'subst'},
  all:   {label: 'All',         value: 'all'},
};


export class Sample implements ISample {
  public uuid: string = uuid.v4();

  public context: string;
  public subjectArea: string[];
  public objective: string;
  public prompt: string;

  public submittedAt: string;
  public submittedBy: string;

  public students: StudentParticipant[] = [];
  public adults: AdultParticipant[] = [];

  public languagesUsed: LanguageUsage[] = [];

  public turns: Turn[] = [new Turn()];
  public numTurns: number;

  public transcription: string;

  public numEvaluations: number;

  public recording: Recording = new Recording();
  public supportingFiles: FileUpload[] = [];

  public collectionSource: any;

  constructor(obj?: ISample) {
    Object.assign(this, obj);
    this.languagesUsed = this.languagesUsed.map(langUsed => new LanguageUsage(langUsed));
    if (this.languagesUsed.length === 0) { this.languagesUsed = [new LanguageUsage({language: 'eng', usage: 'all'})]; }
    this.students = this.students.map(student => new StudentParticipant(student));
    this.adults = this.adults.map(adult => new AdultParticipant(adult));
  }
}

export class Turn {

  public speaker: AdultParticipant|StudentParticipant;
  public content = '';

  public isEmpty() {
    return (typeof this.speaker === 'undefined' && !this.content);
  }
}

export class LanguageUsage {
  public language: string;
  public usage: string;

  constructor(obj?) { Object.assign(this, obj); }
}

export class FileUpload {
  public file: File | string;
  public title: string;
  public name: string;
  public url: string;

  constructor(obj?) { Object.assign(this, obj); }
}

export class Recording {
  public file: FileUpload;
  public includesAdditionalContext: boolean;
  public noAudioAvailable: boolean;
  public noAudioExplanation: string;
}
