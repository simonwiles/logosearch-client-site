import { Observable }              from 'rxjs/Observable';

import { AfterViewInit,
         Component,
         OnDestroy,
         OnInit,
         ViewChild }               from '@angular/core';

import { Router,
         ActivatedRoute }          from '@angular/router';

import { User }                from '../models/user';

import { AuthConfig }              from '../auth.config';

import { ApiService }              from '../services/api.service';
import { AuthService }             from '../services/auth.service';
import { NotificationsService }    from '../services/notifications.service';

import { EvaluationsListService }  from '../services/evaluations-list.service';
import { SamplesListService }      from '../services/samples-list.service';


@Component({
  selector: 'lr-profile',
  templateUrl: './profile.component.html',
  providers: [SamplesListService]  // IMPORTANT: the ProfileComponent (and child components) will now
                                   //            be using a new instance of SamplesListService!!
})
export class ProfileComponent implements AfterViewInit, OnDestroy, OnInit {

  @ViewChild('tabView') tabView;
  @ViewChild('samplesTab') samplesTab;

  public noSamplesMsgHtml = '<p class="no-items-msg">You haven\'t uploaded any samples yet!</p>';
  public noEvaluationssMsgHtml = '<p class="no-items-msg">You haven\'t evaluated any samples yet!</p>';

  public dialogDisplay = false;
  public dialogContent: string;
  public dialogHeader: string;
  public dialogProvider: any = { name: '' };

  public errorMessage: string;
  public user: User;
  public userSocial: any = [];

  private userLoggedOutListener: any;

  private isOwnUser = false;

  private showSampleModal = false;
  private curSampleUuid: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    // private elementRef: ElementRef,
    // private appConfig: AppConfig,
    private authConfig: AuthConfig,
    private apiService: ApiService,
    private authService: AuthService,
    private notificationsService: NotificationsService,
    private evaluationsListService: EvaluationsListService,
    private samplesListService: SamplesListService) {

    // this.userLoggedOutListener = this.notificationsService.emitter.listen(
    //   'userLoggedOut', () => this.router.navigate(['/']));
  }

  ngOnInit() {
    const key = 'uuid',
          uuid = this.activatedRoute.snapshot.params[key];

    // Once a user has been initialized, fetch their submitted samples
    //  and recordings.
    this.initUser(uuid).subscribe(
      user => {
        this.user = user;
        this.samplesListService.reloading = true;
        this.samplesListService.filters.submittedBy = this.user.uuid;
        this.samplesListService.update();
        this.evaluationsListService.reloading = true;
        this.evaluationsListService.filters.submittedBy = this.user.uuid;
        this.evaluationsListService.update();

      },
      error => { this.errorMessage = error.message; }
    );

  }

  ngAfterViewInit() {
    // load the Dropbox script
    if (!window.Dropbox) {
      const dropboxScriptTag = document.createElement('script');
      dropboxScriptTag.type = 'text/javascript';
      dropboxScriptTag.src = '//www.dropbox.com/static/api/2/dropins.js';
      dropboxScriptTag.setAttribute('data-app-key',
        this.authConfig.oauthProviders.dropboxOauth2.authParams.client_id);
      document.body.appendChild(dropboxScriptTag);
    }

    // TODO: do this with matrix params
    if ((this.activatedRoute.snapshot.data as any).tab) {
      this.tabView.open(this.samplesTab);
    }

  }

  ngOnDestroy() {
    if (this.userLoggedOutListener) { this.userLoggedOutListener.unsubscribe(); };
  }

  initUser(uuid: string): Observable<any> {

    if (this.authService.isLoggedIn && (
          uuid === undefined || uuid === this.authService.loggedInUser.uuid)) {

      this.user = this.authService.loggedInUser;
      this.isOwnUser = true;

      this.apiService.getUserSocial(uuid || this.authService.loggedInUser.uuid).subscribe(
        response => { this.userSocial = response; },
        error => { this.errorMessage = error.message; }
      );

      return new Observable<string>(
        (observer: any) => {
          observer.next(this.authService.loggedInUser);
          observer.complete();
        }
      );

    } else if (uuid === undefined) {

      this.router.navigate(['/login']);

    } else {
      return this.apiService.getUser(uuid);
    }

  }

  addUserSocial(provider: string) {
    this.authService.socialLogin(provider);
  }

  removeUserSocial(provider: string) {
    this.apiService.deleteUserSocial(this.user.uuid, provider.toKebabCase()).subscribe(
      response => {
        if (response.status === 204) {
          delete this.userSocial[provider];
          this.notificationsService.success('The association was successfully deleted!');
          this.showRemoveUserSocialDialog(provider);
          this.dialogDisplay = false;
        }
      },
      error => { this.errorMessage = error.message; }
    );
  }

  showRemoveUserSocialDialog(provider: string) {
    this.dialogProvider = this.authConfig.oauthProviders[provider];
    this.dialogHeader = 'Remove Social Login';
    const providerName = this.dialogProvider.name;
    this.dialogContent = `
    Your login association has been deleted from the Language Repository site.
    However, to revoke access to your ${providerName}
    account completely, you must remove the permissions on your
    ${providerName} account directly. (This action can be reversed at any time
    by simply logging in to the Language Repository again using your
    ${providerName} account.) Click the button below to be taken to your
    ${providerName} account settings.
    `;
    this.dialogDisplay = true;
  }

  openSocialAccountSettings() {
    const managementUrl = this.dialogProvider.managementUrl;
    const options = 'width=972,height=660,modal=yes,alwaysRaised=yes';
    window.open(managementUrl, 'Third-Party Account', options);
  }

  showSample(sampleUuid: string) {
    this.curSampleUuid = sampleUuid;
    this.showSampleModal = true;

  }
}

