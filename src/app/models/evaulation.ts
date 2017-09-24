import * as uuid from 'uuid';


export interface IEvaluation {
  uuid: string;

  submittedAt: string;
  submittedBy: string;
}

export class Evaluation {
  public uuid: string = uuid.v4();

  public submittedAt: string;
  public submittedBy: string;

  public evaluatorIsSubmitter: boolean;

  public sample: string;

  public tool: string;
  public scores: Score[] = [];


  constructor(obj?: IEvaluation) {
    Object.assign(this, obj);
    this.scores = this.scores.map(score => new Score(score));
  }
}


export class Score {
  public rationale: string = '';
  public dimension: string;
  public score: number = 0;

  constructor(obj?) {
    Object.assign(this, obj);
    // this.score = Number(this.score);
  }
}
