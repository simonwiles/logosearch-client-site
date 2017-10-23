import { ChangeDetectorRef,
         Component,
         OnInit }                from '@angular/core';

import { SafeHtml }              from '@angular/platform-browser';

import { ActivatedRoute,
         NavigationExtras,
         Router }                from '@angular/router';

import { environment }           from '../../environments/environment';

import { Sample }                from '../models/sample';

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
  public assignmentCompletionStatus: any;
  public notice: SafeHtml;

  private remoteHost: string;
  private routing: string;

  private statuses = {
    assignmentComplete: {
      class: 'valid',
      icon: 'check',
      content: 'Thank you! Your assignment is complete!'
    },
    // assignmentNotStarted: { class: '', content: '<i class="fa fa-bell"></i> Assignment not yet begun!' },
    requiresSelfEvaluation: {
      class: 'warning',
      icon: 'bell',
      content: 'Please now review your submission, and complete the evaulation using the Conversation Analysis Tool below. ' +
               'Don\'t forget to click "Submit" when you have finished!'
    },
  }

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
      'evaluationSaved',
      evaluation => {
        this.notificationsService.success('Thank you!', 'Your evaluation has been saved and this assignment is now complete!');
        this.assignmentCompletionStatus = this.statuses.assignmentComplete;
      }
    );
    this.messageBusService.listen(
      'sampleSaved',
      sample => {
        this.sendData(sample.uuid);
        if (this.routing === 'selfevaluation') {
          this.notificationsService.success(
            'Thank you!',
            'Please now review your submission, and complete the evaulation using the Conversation Analysis Tool below. ' +
            'Don\'t forget to click "Submit" when you have finished!',
            {
              timeout: 0,
              clickToClose: true,
              showProgressBar: false,
              showCloseButton: true
            }
          );
          this.assignmentCompletionStatus = this.statuses.requiresSelfEvaluation;
        } else {
          this.notificationsService.success('Thank you!', 'Your submission has been saved and this assignment is now complete!');
          this.assignmentCompletionStatus = this.statuses.assignmentComplete;
        }
      }
    );

    if (window !== parent.window) {
      window.addResizeListener(
        document.body,
        () => window.parent.postMessage(
          JSON.stringify({'command': 'setHeight', value: document.body.scrollHeight}),
          this.remoteHost
        )
      );
    }
  }

  dataReceived(data) {

    this.remoteHost = data.remoteHost;

    this.logInUser(data.lagunitaUser).subscribe(
      user => {
        this.onConnectionEstablished();
        this.dispatch(data);
      },
      error => {
        this.spinnerText = 'Authentication Error!';
        console.log(error);
      }
    );
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

    return this.authService.lmsBridgeLogin(
        lagunitaUser.email,
        lagunitaUser.username,
        lagunitaUser.name,
        {
          'gender': lagunitaUser.gender,
          'lmsSource': 'Lagunita',
          'lmsUser': lagunitaUser
        }
      );
  }

  onConnectionEstablished() {
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
                  let targetHeight: number;
                  const panel = (mutation.target as HTMLElement).closest('.ui-overlaypanel') as HTMLElement;
                  // a race condition is possible (?) (because of setTimeout?), whereby there is no panel
                  //  by the time we get here, so don't send anything unless we've got a legitimate height.
                  if (panel) { targetHeight = panel.offsetTop + panel.offsetHeight; }
                  if (targetHeight) {
                    window.parent.postMessage(
                      JSON.stringify({'command': 'setHeight', value: panel.offsetTop + panel.offsetHeight}),
                      remoteHost
                    );
                  }
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


  dispatch(data) {

    const [course, session, assignment, type] = data.assignmentIdToken.split(':');
    if (course !== data.openEdXCourseId.split(':').pop()) {
      this.spinnerText = 'Configuration Error!';
      console.log('Course mismatch!', course, data.openEdXCourseId.split(':').pop());
      return;
    }

    // dispatch based on type parameter
    if (type.toLowerCase() === 'submission') {
      this.submissionOnly(data, course, session, assignment);
      return;
    }

    if (type.toLowerCase() === 'peerevaluation') {
      this.peerEvaluation(data, course, session, assignment)
      return;
    }

    if (type.toLowerCase() === 'submissionselfevaluation') {
      this.submissionWithSelfEvaluation(data, course, session, assignment);
      return;
    }

    this.spinnerText = 'Configuration Error!';
    console.log('unknown command:', type);
  }


  submissionOnly(data, course, session, assignment) {
    if (data.hasOwnProperty('responseValue')) {
      let navigationExtras: NavigationExtras = {
        relativeTo: this.route,
        skipLocationChange: true,
        replaceUrl: false,
        queryParams: {showEvaluations: false}
      };
      this.router.navigate(['sample', data.responseValue], navigationExtras);
    } else {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          collectionSource: JSON.stringify({course: course, session: session, assignment: assignment})
        },
        relativeTo: this.route,
        skipLocationChange: true,
        replaceUrl: false
      };

      this.router.navigate(['sample-entry'], navigationExtras);
    }
  }


  submissionWithSelfEvaluation(data, course, session, assignment) {

    this.routing = 'selfevaluation';

    // the CAT (it's the only tool we have so far, so...)
    const catToolUuid = '9a3b4f7b-50a7-4ab5-a2fb-bebdb780a2c5';

    // if we have a data.responseValue, then the sample has been submitted
    if (data.hasOwnProperty('responseValue')) {

      // check if a self-evaluation for this sample has been completed:
      this.apiService.getEvaluations({sample: data.responseValue, bySubmitter: true}).subscribe(
        response => {
          if (response.count < 1) {
            this.assignmentCompletionStatus = this.statuses.requiresSelfEvaluation;
            let navigationExtras: NavigationExtras = {
              queryParams: {
                collectionSource: JSON.stringify({course: course, session: session, assignment: assignment}),
                toolUuid: catToolUuid,
                sampleUuid: data.responseValue
              },
              relativeTo: this.route,
              skipLocationChange: true,
              replaceUrl: false
            };
            this.router.navigate(['evaluate'], navigationExtras);
          } else {
            this.assignmentCompletionStatus = this.statuses.assignmentComplete;
            let navigationExtras: NavigationExtras = {
              relativeTo: this.route,
              skipLocationChange: true,
              replaceUrl: false
            };
            this.router.navigate(['sample', data.responseValue], navigationExtras);
          }
        },
        error => { console.log('err', error)}
      );

    } else {
      // otherwise, load the sample-entry component
      // this.assignmentCompletionStatus = this.statuses.assignmentNotStarted;
      let navigationExtras: NavigationExtras = {
        queryParams: {
          collectionSource: JSON.stringify({course: course, session: session, assignment: assignment}),
          toolUuid: catToolUuid,
          routing: this.routing
        },
        relativeTo: this.route,
        skipLocationChange: true,
        replaceUrl: false
      };

      this.router.navigate(['sample-entry'], navigationExtras);
    }
  }

  peerEvaluation(data, course, session, assignment) {

    // the CAT (it's the only tool we have so far, so...)
    const catToolUuid = '9a3b4f7b-50a7-4ab5-a2fb-bebdb780a2c5';

    // get the user's own submission in this cohort/assignment
    //  (there really should be only one), and check that the
    //  self-evaluation has been completed.

    this.apiService.getSamples(
      {
        submittedBy: this.authService.loggedInUser.uuid,
        assignment: [course, session, assignment].join(':')
      }
    ).subscribe(
      samples => {

        if (samples.count === 0) {
          this.notice = `
            You have not yet completed your submission.<br><br>
            Please return to the submission task and complete your upload,
            before returning to this task.
          `;
          return;
        } else if (samples.count === 1) {
          const sample: Sample = samples.results[0];
          this.apiService.getEvaluations({sample: sample.uuid, bySubmitter: true}).subscribe(
            evaluations => {
              if (evaluations.count === 0) {
                this.notice = `
                  You have not yet evaluated your submission.<br><br>
                  Please return to the submission task and complete your evaluation,
                  before returning to this task.
                `;
                return;
              }
            }
          );

          // we're still going, so we've got a user who's ready to do peer review:

          this.notice = `
            Peer-review for this assignment is not yet available (too few assignments have been submitted at this stage).
            Please check back later!`;

          // this.apiService.getPeerReview(sample.uuid, 3).subscribe(
          //   response => {
          //     console.log(response);
          //   }
          // );

        } else {
          this.notice = `
            You seem to have submitted more than one sample for this assignment.  This is unexpected, and cannot be handled
            at present.  Please contact Simon Wiles <sjwiles@stanford.edu> and I'll resolve the issue for you.  Thank you.`;

          return;
        }
      }
    );


  }


}

