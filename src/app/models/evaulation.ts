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

  public evaluatorIsSampleSubmitter: boolean;

  public sample: string;

  public tool: string;
  public dimensions: Dimension[] = [];


  constructor(obj?: IEvaluation) {
    Object.assign(this, obj);
    this.dimensions = this.dimensions.map(dimension => new Dimension(dimension));
  }
}


export class Dimension {
  public rationale = '';
  public dimension: string;
  public score = 0;

  constructor(obj?) {
    Object.assign(this, obj);
    // this.score = Number(this.score);
  }
}
