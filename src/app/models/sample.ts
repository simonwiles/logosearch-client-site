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

  languageUsages: any[];

  turns: any[];
  numTurns: number;

  transcription: string;

  d1Avg: number;
  d2Avg: number;
  numScores: number;

  recording: any;
}


export const SubjectArea = {
  science:         { label: 'Science',                   value: 'science' },
  biology:         { label: 'Science | Biology',         value: 'biology' },
  chemistry:       { label: 'Science | Chemistry',       value: 'chemistry' },
  physics:         { label: 'Science | Physics',         value: 'physics' },
  science_other:   { label: 'Science | Other',           value: 'science_other' },
  art:             { label: 'Art',                       value: 'art' },
  math:            { label: 'Mathematics',               value: 'math' },
  algebra:         { label: 'Mathematics | Algebra',     value: 'algebra' },
  geometry:        { label: 'Mathematics | Geometry',    value: 'geometry' },
  ela:             { label: 'English Language Arts',     value: 'ela' },
  hss:             { label: 'History / Social Studies',  value: 'hss' },
  eld:             { label: 'ESL / ELD etc.',            value: 'eld' },
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
  public uuid: string;

  public context: string;
  public subjectArea: string[];
  public objective: string;
  public prompt: string;

  public submittedAt: string;
  public submittedBy: string;

  public students: StudentParticipant[];
  public adults: AdultParticipant[];

  public languageUsages: any[];

  public turns: Turn[];
  public numTurns: number;

  public transcription: string;

  public numScores: number;
  public d1Avg: number;
  public d2Avg: number;

  public recording: any;

  constructor(obj?: ISample) {

    this.uuid = (obj) ? obj.uuid : uuid.v4();
    this.context = (obj) ? obj.context : '';
    if (obj) { this.subjectArea = obj.subjectArea; }
    this.objective = (obj) ? obj.objective : '';
    this.prompt = (obj) ? obj.prompt : '';
    this.submittedAt = (obj) ? obj.submittedAt : '';
    this.submittedBy = (obj) ? obj.submittedBy : '';

    this.students = (obj) ? obj.students.map(student => new StudentParticipant(student)) : [];
    this.adults = (obj) ? obj.adults.map(adult => new AdultParticipant(adult)) : [];

    this.languageUsages = (obj) ? obj.languageUsages : [new LanguageUsage({lang: 'eng', usage: 'all'})];
    this.turns = (obj) ? obj.turns : [new Turn()];
    this.numTurns = (obj) ? obj.numTurns : null;

    this.transcription = (obj) ? obj.transcription : '';

    this.numScores = (obj) ? obj.numScores : null;
    this.d1Avg = (obj) ? obj.d1Avg : null;
    this.d2Avg = (obj) ? obj.d2Avg : null;

    this.recording = (obj) ? obj.recording : null;

  }

  render(field): any {
    if (field === 'subjectArea') {
      return this.subjectArea.map(subjectArea => ({key: subjectArea, label: SubjectArea[subjectArea].label}));
    }
    return this[field];
  }
}

export class Turn {

  public speaker: AdultParticipant|StudentParticipant;
  public content: string;

  public isEmpty() {
    return (typeof this.speaker === 'undefined' && typeof this.content === 'undefined');
  }
}

export class LanguageUsage {
  public lang: string;
  public usage: number;

  constructor(obj?) {
    this.lang = (obj) ? obj.lang : null;
    this.usage = (obj) ? obj.usage : null;
  }
}
