import { ChangeDetectorRef,
         Component,
         OnInit }                from '@angular/core';

import { ActivatedRoute,
         Router }                from '@angular/router';

import { environment }           from '../../environments/environment';

import { ApiService }            from '../services/api.service';
import { AuthService }           from '../services/auth.service';
import { MessageBusService }     from '../services/message-bus.service';
import { NotificationsService }  from '../services/notifications.service';


@Component({
  selector: 'lr-lms-bridge',
  templateUrl: './lms-bridge.component.html'
})
export class LmsBridgeComponent implements OnInit {

  public environment = environment;
  public spinnerText = 'Waiting for communication from Lagunita...';
  public lmsConnectionEstablished = false;

  public noPeerReview = false;

  private remoteHost: string;

  constructor(
    public notificationsService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private messageBusService: MessageBusService) {

    document.querySelector('html').classList.add('lms-bridge');
  }

  ngOnInit() {

    window.addEventListener(
      'message',
      event => {
        if (event.origin === environment.lagunitaHost || event.origin === environment.lagunitaPreviewHost) {
          this.dataReceived(JSON.parse(event.data));
        }
      },
      false
    );

    this.messageBusService.listen(
      'sampleSaved',
      sample => {
        this.notificationsService.success('Thank you!', 'Your submission has been saved!');
        this.sendData(sample.uuid);
      }
    );

    window.addResizeListener(
      document.body,
      () => window.parent.postMessage(
        JSON.stringify({'command': 'setHeight', value: document.body.scrollHeight}),
        this.remoteHost
      )
    );
  }

  dataReceived(data) {
    const [course, session, assignment, type] = data.assignmentIdToken.split(':');
    this.remoteHost = data.remoteHost;
    if (course !== data.openEdXCourseId.split(':').pop()) {
      this.spinnerText = 'Configuration Error!';
      console.log('course mismatch!');
      return;
    }

    this.logInUser(data.lagunitaUser);

    // dispatch based on type parameter
    if (type.toLowerCase() === 'submission') {
      if (data.hasOwnProperty('responseValue')) {
        this.router.navigate(['sample', data.responseValue], {relativeTo: this.route});
      } else {
        let queryParams = {
          course: course,
          session: session,
          assignment: assignment
        };
        this.router.navigate(
          ['sample-entry'],
          {
            relativeTo: this.route,
            queryParams: queryParams
          }
        );
      }
    }

    if (type.toLowerCase() === 'peerevaluation') {

      // get the user's own submission in this cohort/assignment
      //  (there really should be only one), and extract the grade-level
      //  and subject-area from that to better assign peer review.

      // this.apiService.getSamples(
      //   {
      //     sortBy: '-num_scores',
      //     submittedBy: '-' + this.authService.loggedInUser.uuid,
      //     assignment: [course, session, assignment].join(':')
      //   }
      // ).subscribe(
      //   samples => {
      //     console.log(samples);
      //   }
      // );

      // this.router.navigate(
      //   ['evaluate'],
      //   {
      //     relativeTo: this.route,
      //     queryParams: {tool: '9a3b4f7b-50a7-4ab5-a2fb-bebdb780a2c5'}
      //   }
      // );

      this.noPeerReview = true;
    }
  }

  sendData(sampleUuid) {
    window.parent.postMessage(
      JSON.stringify({'command': 'submit', value: sampleUuid}),
      this.remoteHost
    );
  }

  logInUser(lagunitaUser) {

    this.spinnerText = 'Logging-in to UL Language Repository...';
    this.changeDetectorRef.detectChanges();

    this.authService.lmsBridgeLogin(
        lagunitaUser.email,
        lagunitaUser.username,
        lagunitaUser.name,
        {
          'gender': lagunitaUser.gender,
          'lmsSource': 'Lagunita',
          'lmsUser': lagunitaUser
        }
      ).subscribe(
        data => this.onConnectionEstablished(data),
        error => {
          this.spinnerText = 'Authentication Error!';
          console.log(error);
        }
    );
  }

  onConnectionEstablished(data) {
    this.lmsConnectionEstablished = true;
    this.changeDetectorRef.detectChanges();

    // This block hooks up a MutationObserver to watch for the introduction of (or changes to)
    //  overlay-panel components.  These are positioned absolutely, and so won't affect document.scrollHeight;
    //  the result is that the iframe won't resize to accommodate them, and they become unusable, so here
    //  we manually post the necessary height to the the parent window.
    const remoteHost = this.remoteHost;
    const mutationObserver = new MutationObserver(
      mutations => {
        mutations.forEach(
          mutation => {
            if (Array.from(document.querySelectorAll('.ui-overlaypanel')).some(elem => elem.contains(mutation.target))) {
              setTimeout(
                () => {
                  const panel = (mutation.target as HTMLElement).closest('.ui-overlaypanel') as HTMLElement;
                  window.parent.postMessage(
                    JSON.stringify({'command': 'setHeight', value: panel.offsetTop + panel.offsetHeight}),
                    remoteHost
                  )
                }, 0
              );
            } else if (mutation.target.nodeName === 'UI-OVERLAY-PANEL') {
              // in case the panel has been removed...
              window.parent.postMessage(
                JSON.stringify({'command': 'setHeight', value: document.body.scrollHeight}),
                remoteHost
              )
            }
          }
        );
      }
    );
    mutationObserver.observe(document.querySelector('.router-outlet'), { childList: true, subtree: true });
  }
}

