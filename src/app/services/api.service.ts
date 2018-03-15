import { Observable }                 from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { Injectable }                 from '@angular/core';
import { Headers,
         Http,
         Response,
         RequestOptions,
         URLSearchParams }            from '@angular/http';

import { environment }                from '../../environments/environment';

import { User,
         IUser }                      from '../models/user';
import { Sample }                     from '../models/sample';
import { Evaluation }                 from '../models/evaulation';
import { AdultParticipant,
         StudentParticipant }         from '../models/participants';

import { AuthService }                from './auth.service';
import { NotificationsService }       from './notifications.service';

import { DjangoQueryEncoder }         from '../utils/django-query-encoder';


@Injectable()
export class ApiService {

  private headers: Headers = new Headers({
    // 'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  constructor(
    private http: Http,
    private authService: AuthService,
    private notificationsService: NotificationsService) { }


  public getUsers(params?): Observable<any> {

    const getUsersURI: string = environment.apiURL + 'users/';

    let _params: URLSearchParams = new URLSearchParams('', new DjangoQueryEncoder());
    if (params) {

      if (params.offset) { _params.set('offset', params.offset); }

      if (params.limit) { _params.set('limit', params.limit); }

      if (params.sortBy) {
        _params.set('ordering', ((params.sortAsc) ? '' : '-') + params.sortBy);
      }

      if (params.search) { _params.set('search', params.search); }

      if (params.hasSamples) { _params.set('hasSamples', params.hasSamples); }
    }

    // const options: RequestOptions = new RequestOptions({
    //   headers: this.getHeadersWithAuth(this.headers),
    //   search: _params
    // });
    const options: RequestOptions = new RequestOptions({ headers: this.headers, search: _params });

    return this.http.get(getUsersURI, options)
                    .map(
                      (response: Response) => {
                        const data = response.json();
                        data.results = data.results.map(
                          (result) => {
                            return new User(<IUser>result);
                          }
                        );
                        return data;
                      }
                    )
                    .catch(error => this.handleError(error));
  }


  public getUser(uuid: string): Observable<any> {

    const getUserURI: string = environment.apiURL + 'users/' + uuid;
    const options: RequestOptions = new RequestOptions({ headers: this.headers });

    return this.http.get(getUserURI, options)
                    .map(response => new User(<IUser>response.json()))
                    .catch(error => this.handleError(error));
  };

  public getUserSocial(uuid: string): Observable<any> {

    const userSocialURI: string = environment.apiURL + 'users/' + uuid + '/social/';
    const options: RequestOptions = new RequestOptions({
      headers: this.getHeadersWithAuth(this.headers)
    });

    return this.http.get(userSocialURI, options)
                    .map(response => response.json().socialAuth)
                    .catch(error => this.handleError(error));
  }


  public deleteUserSocial(uuid: string, provider: string) {
    const userSocialURI = `${environment.apiURL}users/${uuid}/social/${provider}/`;
    const options: RequestOptions = new RequestOptions({
      headers: this.getHeadersWithAuth(this.headers)
    });

    return this.http.delete(userSocialURI, options)
                    .catch(error => this.handleError(error));
  }


  public getSample(uuid: string): Observable<any> {

    const sampleURI: string = environment.apiURL + 'samples/' + uuid + '/';
    const options: RequestOptions = new RequestOptions({ headers: this.headers });

    return this.http.get(sampleURI, options)
                    .map(response => new Sample(response.json()))
                    .catch(error => this.handleError(error));
  }


  public getSamples(params?): Observable<any> {
    const samplesURI: string = environment.apiURL + 'samples/';
    params = this.buildSamplesFilteringParams(params);
    const options: RequestOptions = new RequestOptions({ headers: this.headers, search: params });

    return this.http.get(samplesURI, options)
                    .map(
                      (response: Response) => {
                        let data = response.json();
                        data.results = (data.results) ? data.results.map(sample => new Sample(sample)) : [];
                        return data;
                      }
                    )
                    .catch(error => this.handleError(error));
  }

  public getSampleStats(params?): Observable<any> {
    const samplesURI: string = environment.apiURL + 'samples/stats/';
    params = this.buildSamplesFilteringParams(params);
    const options: RequestOptions = new RequestOptions({ headers: this.headers, search: params });

    return this.http.get(samplesURI, options)
                    .map((response: Response) => response.json())
                    .catch(error => this.handleError(error));
  }

  public getParticipants(params): Observable<any> {
    const participantsURI: string = environment.apiURL + 'participants/';

    let participantType = params.type;

    let _params: URLSearchParams = new URLSearchParams('', new DjangoQueryEncoder());

    if (params.offset) { _params.set('offset', params.offset); }

    if (params.limit) { _params.set('limit', params.limit); }

    if (params.sortBy) {
      _params.set('ordering', ((params.sortAsc) ? '' : '-') + params.sortBy);
    }

    if (params.submittedBy) { _params.set('submittedBy', params.submittedBy); }

    if (params.search) { _params.set('search', params.search); }

    // const options: RequestOptions = new RequestOptions({ headers: this.headers, search: _params });
    const options: RequestOptions = new RequestOptions({
      headers: this.getHeadersWithAuth(this.headers),
      search: _params
    });

    return this.http.get(participantsURI + participantType + '/', options)
                    .map(
                      (response: Response) => {
                        let data = response.json();
                        data.results = data.results.map(
                          (participant) => new {'students': StudentParticipant, 'adults': AdultParticipant}[participantType](participant)
                        );
                        data.params = _params;
                        return data;
                      }
                    )
                    .catch(error => this.handleError(error));

  }

  public getEvaluations(params?): Observable<any> {
    const evaluationssURI: string = environment.apiURL + 'evaluations/';

    let _params: URLSearchParams = new URLSearchParams('', new DjangoQueryEncoder());
    if (params) {

      if (params.offset) { _params.set('offset', params.offset); }

      if (params.limit) { _params.set('limit', params.limit); }

      if (params.sortBy) {
        _params.set('ordering', ((params.sortAsc) ? '' : '-') + params.sortBy);
      }

      if (params.sample) { _params.set('sample', params.sample); }
      if (params.tool) { _params.set('tool', params.tool); }
      if (params.submittedBy) { _params.set('submittedBy', params.submittedBy); }
      if (params.bySubmitter) { _params.set('bySubmitter', (params.bySubmitter === true) ? 'True' : 'False') }

    }
    const options: RequestOptions = new RequestOptions({ headers: this.headers, search: _params });

    return this.http.get(evaluationssURI, options)
                    .map(
                      (response: Response) => {
                        let data = response.json();
                        data.results = data.results.map(
                          evaluation => new Evaluation(evaluation)
                        );
                        data.params = _params;
                        return data;
                      }
                    )
                    .catch(error => this.handleError(error));
  }


  public getPeerReview(sampleUuid: string, required: number, skippedEvaluations: Set<string>): Observable<any> {

    const getPeerReviewURI: string = environment.apiURL + 'peer-review/';

    const params: URLSearchParams = new URLSearchParams('', new DjangoQueryEncoder());
    params.set('sampleUuid', sampleUuid);
    params.set('required', required.toString());
    params.set('skippedEvaluations', Array.from(skippedEvaluations).join(','));

    const options: RequestOptions = new RequestOptions({ headers: this.headers, search: params});

    return this.http.get(getPeerReviewURI, options)
                    .map(response => response.json())
                    .catch(error => this.handleError(error));
  }


  public putSample(sampleJSON, recordingFile, supportingFiles): Observable<any> {
    const samplesURI: string = environment.apiURL + 'samples/';
    const options: RequestOptions = new RequestOptions({
      headers: this.getHeadersWithAuth(this.headers)
    });

    let formData = new FormData();
    formData.append('sample', sampleJSON);
    formData.append('recordingFile', recordingFile);
    supportingFiles.forEach(
      supportingFile => formData.append('supportingFiles', supportingFile));

    return this.http.put(samplesURI, formData, options)
                    .map(response => response.json())
                    .catch(error => this.handleError(error));
  }


  public putEvaluation(evaluationJSON): Observable<any> {
    const evaluationsURI: string = environment.apiURL + 'evaluations/';
    const options: RequestOptions = new RequestOptions({
      headers: this.getHeadersWithAuth(
        new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        })
      )
    });

    return this.http.put(evaluationsURI, evaluationJSON, options)
                    .map(response => response.json())
                    .catch(error => this.handleError(error));
  }


  private buildSamplesFilteringParams(params?): URLSearchParams {
    let _params: URLSearchParams = new URLSearchParams('', new DjangoQueryEncoder());

    if (params) {

      if (params.offset) { _params.set('offset', params.offset); }

      if (params.limit) { _params.set('limit', params.limit); }

      if (params.sortBy) {
        _params.set('ordering', ((params.sortAsc) ? '' : '-') + params.sortBy);
      }

      if (params.submittedBy) { _params.set('submittedBy', params.submittedBy); }

      if (params.subjectArea) {
        _params.set('subjectArea', ((params.subjectAreaOperator === true) ? '+' : '') + params.subjectArea);
      }

      if (params.gradeLevel) {
        _params.set('gradeLevel', ((params.gradeLevelOperator === true) ? '+' : '') + params.gradeLevel);
      }

      if (params.participantFilters && params.participantFilters.length) {
        let _pfilters = params.participantFilters.filter(fobj => fobj.valid)
        .map(
          fobj => Object.keys(fobj)
                    .filter(key => key !== 'count' && key !== 'valid')
                    .map(key => (fobj[key] === 'any') ? '' : fobj[key])
                    .join('_') + ':' + fobj.count
        );
        _params.set('p', _pfilters.join(','));
      }

      if (params.search) { _params.set('search', params.search); }

      if (params.langUsageFilters && params.langUsageFilters.length) {
        let _lufilters = params.langUsageFilters.filter(fobj => fobj.valid).map(
          fobj => `${fobj.lang}_${fobj.operator}_${fobj.usage}`
        );
        _params.set('langUsage', _lufilters.join(','));
      }

      if (params.numTurns && params.numTurns.valid) {
        _params.set('numTurns', `${params.numTurns.operator}:${params.numTurns.count}`);
      }

      if (params.hasEll && params.hasEll !== 'any') { _params.set('hasEll', params.hasEll); }
      if (params.hasRecording) { _params.set('hasRecording', params.hasRecording); }

      if (params.person) { _params.set('person', params.person); }

      if (params.assignment) { _params.set('assignment', params.assignment); }
    }

    return _params;
  }


  private getHeadersWithAuth(headers): Headers {

    if (!this.authService.isLoggedIn) {
      this.notificationsService.error(
        'Not logged in!',
        'Sorry, you must be logged in to perform this operation!');
    }

    this.authService.getJWT().subscribe(
      jwt => {
        headers.set('Authorization', 'JWT ' + jwt);
        return headers;
      },
      error => { this.notificationsService.error('Authentication Error!', error.message); }
    );

    return headers;
  }


  private handleError(error: any): Observable<any> {
    let errString: string;

    if (error.status === 0) {
      errString = 'No response from server!';
    } else if (error.status === 404) {
      errString = 'Resource not found!';
    } else if (error.status === 400) {
      errString = 'Bad Request:' + (error.json().body || error.json().detail || error.json().error);
    } else {
      try {
        errString = (
          (typeof error === 'string') ?
            error : error.json().detail || error.json().error);
      } catch (err) {
        errString = `Unknown server error: ${error.status}!`;
      }
    }

    if (!environment.production) {
      console.warn('error:', error);
      // throw error;
    }

    return new Observable<string>(
      (observer: any) => {
        observer.error(new Error(errString));
        observer.complete();
      }
    );
  }
}
