import { Observable }                 from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

import { Injectable }                 from '@angular/core';
import { Http,
         Headers,
         RequestOptions,
         URLSearchParams }            from '@angular/http';

import { environment }                from '../../environments/environment';
import { AuthConfig }                 from '../auth.config';
import { JwtHelper }                  from '../utils/jwt';

import { User, IUser }                from '../models/user';

import { MessageBusService }          from '../services/message-bus.service';
import { NotificationsService }       from '../services/notifications.service';



@Injectable()
export class AuthService {

  public isLoggedIn = false;
  public loggedInViaLms = false;
  public loggedInUser: User = new User();
  public redirect_uri: string = environment.baseURL + 'login/social';

  private jwtHelper: JwtHelper = new JwtHelper();
  private csrfToken: string;
  private oauthProvider: string;

  private requestOptions: RequestOptions = new RequestOptions({
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });

  constructor(
    private http: Http,
    private authConfig: AuthConfig,
    private messageBusService: MessageBusService,
    private notificationsService: NotificationsService) {

    // check if there's a valid session and a logged-in user
    this.getJWT().subscribe(
      jwt => {
        try {
          if (!this.jwtHelper.isTokenExpired(jwt, null)) {
            const tokenValidity: number = (+this.jwtHelper.getTokenExpirationDate(jwt) - +new Date()) / 1000;
            // TODO: set some kind of timer that lets the user know when the token is running down?
            this.refreshJWT(jwt).subscribe(
              newJwt => this.login(newJwt, localStorage.getObject('user'), false)
            );
          } else {
            // token has expired -- user must be logged out!
            this.logout(false);
            this.handleError('JWT has expired!');
          }
        } catch (err) {
          // problem with the stored token
          this.logout();
          this.handleError('JWT is invalid!');
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  siteLogin(email: string, password: string): Observable<any> {
    // login using email and password to a Django-based account

    const apiURI: string = environment.apiURL + 'auth/jwt/';
    const body: string = JSON.stringify({
      'email': email,
      'password': password
    });

    return this.http.post(apiURI, body, this.requestOptions)
                    .map(data => data.json())
                    .do(data => {
                      const jwt: string = data.token;
                      delete data.token;
                      this.login(jwt, data);
                    })
                    .catch(error => this.handleError(error));
  }

  lmsBridgeLogin(email: string, username: string, displayName: string, extra: any = {}): Observable<any> {
    // login using email and password to a Django-based account

    const apiURI: string = environment.apiURL + 'auth/lms-login/';
    const body: string = JSON.stringify({
      email: email,
      lmsUsername: username,
      displayName: displayName,
      extra: extra
    });

    return this.http.post(apiURI, body, this.requestOptions)
                    .map(data => data.json())
                    .do(data => {
                      const jwt: string = data.token;
                      delete data.token;
                      this.loggedInViaLms = true;
                      this.login(jwt, data, false);
                    })
                    .catch(error => this.handleError(error));
  }

  socialLogin(provider: string): void {
    // launch a popup to begin the OAuth flow.

    const oauthConfig = this.authConfig.oauthProviders[provider];
    this.oauthProvider = provider.toKebabCase();
    this.csrfToken = this.generateToken(50);

    const params: URLSearchParams = new URLSearchParams();
    Object.keys(oauthConfig.authParams).forEach(
      key => { params.set(key, oauthConfig.authParams[key]); });
    params.set('redirect_uri', this.redirect_uri);
    params.set('state', this.csrfToken);

    const oauthRedirect: string = oauthConfig.apiEndpoint + '?' + params.toString();

    const options = 'width=972,height=660,modal=yes,alwaysRaised=yes';
    window.open(oauthRedirect, 'Oauth Negotiation', options);
  }

  exchangeAuthCodeForJWT(code): Observable<any> {
    // send authentication code from OAuth provider to Django
    //  and receive a JWT and user response in return.

    const apiURI: string = environment.apiURL + 'auth/jwt-social/';
    const body: string = JSON.stringify({
      'provider': this.oauthProvider,
      'code': code,
      'redirect_uri': this.redirect_uri
    });

    return this.http.post(apiURI, body, this.requestOptions)
                    .map(data => data.json())
                    .catch(error => this.handleError(error));
  }

  processAuthCode(authData): Observable<any> {
    if (!('state' in authData)) { return; }
    // check that the CSRF token is valid.
    if (this.csrfTokenIsValid(authData.state)) {
      // and then exchange the OAuth code for a JWT.
      return this.exchangeAuthCodeForJWT(authData.code)
        .do(data => {
          const jwt: string = data.token;
          delete data.token;
          this.login(jwt, data);

          // clear the CSRF token and OAuthProvider string
          this.csrfToken = null;
          this.oauthProvider = null;
        })
        .catch(error => this.handleError(error));
    } else {
      // if the CSRF token is invalid, we have a click-jacking attempt,
      //  or similar -- abort!
      if (!environment.production) {
        this.notificationsService.error(
          'CSRF is invalid!',
          'CSRF token mismatch -- authentication cancelled.');
      }
      // clear the CSRF token and OAuthProvider string
      this.csrfToken = null;
      this.oauthProvider = null;

      return this.handleError('CSRF token mismatch -- authentication cancelled.');
    }
  }

  login(jwt, userData, notify = true): void {
    // we have the JWT and the user data; store them and inform the application.

    const user: User = new User(<IUser>userData);

    localStorage.setItem('jwt', jwt);
    localStorage.setObject('user', user);
    this.loggedInUser = user;
    this.isLoggedIn = true;
    this.messageBusService.emit('userLoggedIn', user);
    if (!notify) { return; }
    this.notificationsService.success(
      'Successfully Logged In!',
      'User `' + user.displayAs() + '` has successfully logged in!',
      {timeout: 2000}
    );
  }

  logout(notify = true): void {
    // destroy the session and inform the application.

    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    // this.notificationsService.emitter.emit('userLoggedOut', null);
    if (notify) { this.notificationsService.info('Logged Out!', 'You have been logged out!'); }
  }

  generateToken(length): string {
    // generate a random string of length @length (for use as a CSRF token).

    const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    // TypeScript (at least as of v1.8) transpiles the ES6 spread operater incorrectly
    // in this statement (see: https://github.com/Microsoft/TypeScript/issues/8856)
    // return [...Array(50)].map(
    //   () => validChars.charAt(Math.floor(Math.random() * validChars.length))
    //  ).join('');
    return Array.apply(null, Array(length)).map(
      () => validChars.charAt(Math.floor(Math.random() * validChars.length))
     ).join('');
  }

  csrfTokenIsValid(token): boolean {
    return token === this.csrfToken;
  }

  getJWT(): Observable<any> {
    const jwt: string = localStorage.getItem('jwt');
    if (jwt === null) { return this.handleError('JWT not present!'); }

    return new Observable<string>(
      (observer: any) => {
        observer.next(jwt);
        observer.complete();
      }
    );
  }

  refreshJWT(currentToken): Observable<any> {
    // exchange an about-to-expire token for a new one with an renewed lease.

    const apiURI: string = environment.apiURL + 'auth/jwt-refresh/';
    const body: string = JSON.stringify({ 'token': currentToken });
    return this.http.post(apiURI, body, this.requestOptions)
                    .map(
                      data => {
                        let newJwt = data.json().token;
                        localStorage.setItem('jwt', newJwt);
                        return newJwt;
                      }
                    )
                    .catch(error => this.handleError(error));
  }


  private handleError(error: any): Observable<any> {
    let errString: string;
    if (error.status === 0) {
      errString = 'No response from server!';
    } else {
      try {
        errString = (
          (typeof error === 'string') ?
            error : error.json().error || error.json().nonFieldErrors[0]);
      } catch (err) {
        errString = 'Unknown server error (' + error.status + ')!';
      }
    }
    if (!environment.production) { console.warn(errString); }
    return new Observable<string>(
      (observer: any) => {
        observer.error(new Error(errString));
        observer.complete();
      }
    );
  }


}
