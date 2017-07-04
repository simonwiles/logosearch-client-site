import { Component,
         OnDestroy }          from '@angular/core';
import { ActivatedRoute,
         Router }             from '@angular/router';

import { AuthService }        from '../services/auth.service';


@Component({
  selector: 'lr-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnDestroy {

  public email: string;
  public password: string;

  public errorMessage: string;

  private routerParamsSubscription: any;

  constructor(
    public authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {

    // if we're already logged-in, there's nothing to do!
    if (this.authService.isLoggedIn) { return; }

    if (Array.from(this.activatedRoute.snapshot.url, url => url.path).pop() === 'social') {
      // if the url ends with a segment 'social', then check the URL query-string
      //  for Oauth callback values
      this.routerParamsSubscription = this.activatedRoute.queryParams.subscribe(
        (params: any) => {
          if ('state' in params) {
            // and then send it to the parent window before closing this windpw
            window.opener.postMessage(params, this.authService.redirect_uri);
            window.close();
          }
        }
      );

    } else {
      // otherwise set up a postMessage event listener to handle values passed back in

      // in order to be able to remove the anonymous function that handles
      //  the postMessage event, it is necessary to intercept the call to
      //  window.addEventListener and save a reference to it on the global object.
      let windowAddEventListener = window.addEventListener;
      window.addEventListener = function() {
        window.listenerFn = arguments[1];
        windowAddEventListener.apply(this, arguments);
      };

      // add postMessage listener in case we're waiting for a response
      //  from an OAuth pop-up.
      window.addEventListener(
        'message', (event) => this.receivedAuthCode(event.data), false);
    }
  }

  ngOnDestroy() {
    if (this.routerParamsSubscription) { this.routerParamsSubscription.unsubscribe(); };
    window.removeEventListener('message', window.listenerFn);
    window.listenerFn = null;
  }

  receivedAuthCode(authData) {
    if ('error' in authData) {
      this.errorMessage = authData.error;
    } else if ('code' in authData && 'state' in authData) {
      this.authService.processAuthCode(authData).subscribe(
        _data => { this.router.navigate(['/']); },
        error => { this.errorMessage = error.message; }
      );
    }
  }

  onSubmit() {
    this.authService.siteLogin(this.email, this.password).subscribe(
      _data => { this.router.navigate(['/']); },
      error => { this.errorMessage = error.message; }
    );
  }

  doOpenIdLogin() {
    this.errorMessage = 'OpenID login not yet implemented!';
    return false;
  }
}
