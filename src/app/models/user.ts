
export interface IUser {
  email: string;
  uuid: string;
  displayName: string;
  givenName: string;
  familyName: string;
  groups: string[];
  displayAs(): string;
}


export class User {
  public email: string;
  public uuid: string;
  public displayName: string;
  public givenName: string;
  public familyName: string;
  public groups: string[];

  constructor(obj?: IUser) {
    Object.assign(this, obj);
  }

  displayAs(): string {
    return (this.displayName || (this.givenName + ' ' + this.familyName).trim() || this.email);
  }
}

