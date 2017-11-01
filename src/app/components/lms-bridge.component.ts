import { ChangeDetectorRef,
         Component,
         OnInit }                from '@angular/core';

import { SafeHtml }              from '@angular/platform-browser';

import { ActivatedRoute,
         NavigationEnd,
         NavigationExtras,
         NavigationStart,
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
  public hideRouter = false;

  private assignmentIdToken: string;
  private remoteHost: string;
  private routing: 'selfEvaluation'|'peerEvaluation'|'peerEvaluationFinal';

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

        window.parent.postMessage(
          JSON.stringify({'command': 'setHeight', value: document.body.scrollHeight}),
          this.remoteHost
        )

        if (this.routing === 'selfEvaluation') {

          this.notificationsService.success('Thank you!', 'Your evaluation has been saved and this assignment is now complete!');
          this.assignmentCompletionStatus = this.statuses.assignmentComplete;

        } else if (this.routing === 'peerEvaluation') {

          document.querySelector('body').style.opacity = '0';
          window.parent.postMessage(JSON.stringify({'command': 'scrollToTop'}), this.remoteHost);
          const [course, session, assignment, type] = this.assignmentIdToken.split(':');
          this.peerEvaluation(course, session, assignment);

        } else if (this.routing === 'peerEvaluationFinal') {

          this.notificationsService.success('Thank you!', 'Your peer-evaluations have been recevied and this assignment is now complete!');
          this.assignmentCompletionStatus = this.statuses.assignmentComplete;
          this.sendData('[Peer-Evaluation Complete]');
          this.hideRouter = true;

        }
      }
    );
    this.messageBusService.listen(
      'sampleSaved',
      sample => {
        this.sendData(sample.uuid);
        if (this.routing === 'selfEvaluation') {
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

    this.router.events.subscribe(
      event => {
        if (event instanceof NavigationEnd) {
          document.querySelector('body').style.opacity = '1';
          Array.from(document.querySelectorAll('.assignment-completion-status')).forEach(
            elem => { elem.classList.remove('bounce'); void (elem as HTMLElement).offsetWidth; elem.classList.add('bounce'); }
          );
        }
      }
    );
  }

  dataReceived(data) {

    // DELETE ME
    // if (data.assignmentIdToken.startsWith('Education/CCC/SandBox:2017-Q4:A1')) {
    //   data.assignmentIdToken = 'Education+XEDUC201+Fall2017:2017-Q4:A2:' + data.assignmentIdToken.split(':').pop();
    //   data.openEdXCourseId = ':Education+XEDUC201+Fall2017';
    // }

    this.remoteHost = data.remoteHost;
    this.assignmentIdToken = data.assignmentIdToken;

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
                      this.remoteHost
                    );
                  }
                }, 0
              );
            } else if (mutation.target.nodeName === 'UI-OVERLAY-PANEL') {
              // in case the panel has been removed...
              window.parent.postMessage(
                JSON.stringify({'command': 'setHeight', value: document.body.scrollHeight}),
                this.remoteHost
              )
            }
          }
        );
      }
    );
    mutationObserver.observe(document.querySelector('.router-outlet'), { childList: true, subtree: true });
  }


  dispatch(data) {
    const responseValue = data['responseValue'];
    const [course, session, assignment, type] = data.assignmentIdToken.split(':');

    if (course !== data.openEdXCourseId.split(':').pop()) {
      this.lmsConnectionEstablished = false;
      this.spinnerText = 'Configuration Error!';
      console.log('Course mismatch!', course, data.openEdXCourseId.split(':').pop());
      return;
    }

    // window.parent.postMessage(JSON.stringify({'command': 'scrollToTop'}), this.remoteHost);
    // dispatch based on type parameter
    if (type.toLowerCase() === 'submission') {
      this.submissionOnly(responseValue, course, session, assignment);
      return;
    }

    if (type.toLowerCase() === 'peerevaluation') {
      this.peerEvaluation(course, session, assignment)
      return;
    }

    if (type.toLowerCase() === 'submissionselfevaluation') {
      this.submissionWithSelfEvaluation(responseValue, course, session, assignment);
      return;
    }

    this.spinnerText = 'Configuration Error!';
    console.log('unknown command:', type);
  }


  submissionOnly(responseValue, course, session, assignment) {
    if (typeof responseValue !== 'undefined') {
      let navigationExtras: NavigationExtras = {
        relativeTo: this.route,
        skipLocationChange: true,
        replaceUrl: false,
        queryParams: {showEvaluations: false}
      };
      this.router.navigate(['sample', responseValue], navigationExtras);
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


  submissionWithSelfEvaluation(responseValue, course, session, assignment) {

    this.routing = 'selfEvaluation';

    // the CAT (it's the only tool we have so far, so...)
    const catToolUuid = '9a3b4f7b-50a7-4ab5-a2fb-bebdb780a2c5';

    // if we have a responseValue, then the sample has been submitted
    if (typeof responseValue !== 'undefined') {

      // check if a self-evaluation for this sample has been completed:
      this.apiService.getEvaluations({sample: responseValue, bySubmitter: true}).subscribe(
        response => {
          if (response.count < 1) {
            this.assignmentCompletionStatus = this.statuses.requiresSelfEvaluation;
            let navigationExtras: NavigationExtras = {
              queryParams: {
                collectionSource: JSON.stringify({course: course, session: session, assignment: assignment}),
                toolUuid: catToolUuid,
                sampleUuid: responseValue
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
            this.router.navigate(['sample', responseValue], navigationExtras);
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

  peerEvaluation(course, session, assignment) {

    // the CAT (it's the only tool we have so far, so...)
    const catToolUuid = '9a3b4f7b-50a7-4ab5-a2fb-bebdb780a2c5';
    const evaluationsRequired = 3;

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
              } else {
                doPeerEvaluation(sample.uuid);
              }
            }
          );

        } else {
          this.notice = `
            You seem to have submitted more than one sample for this assignment.  This is unexpected, and cannot be handled
            at present.  Please contact Simon Wiles <sjwiles@stanford.edu> and I'll resolve the issue for you.  Thank you.`;

          return;
        }
      }
    );

    let doPeerEvaluation = (sampleUuid) => {

      this.apiService.getPeerReview(sampleUuid, evaluationsRequired).subscribe(
        response => {
          if (response.evaluationsForAssignment < evaluationsRequired && response.nextSample) {
            if (response.evaluationsForAssignment === evaluationsRequired - 1) {
              // this is the last one
              this.routing = 'peerEvaluationFinal';
            } else {
              this.routing = 'peerEvaluation';
            }
            this.assignmentCompletionStatus = {
              class: 'warning',
              icon: 'sliders',
              content: `
                You have completed <span class="evals-completed">${response.evaluationsForAssignment}</span> of your 3 peer-evaluations.
                <br>Please submit your review for the submission shown below.
              `
            }

            let navigationExtras: NavigationExtras = {
              queryParams: {
                collectionSource: JSON.stringify({course: course, session: session, assignment: assignment}),
                toolUuid: catToolUuid,
                sampleUuid: response.nextSample,
                routing: this.routing
              },
              relativeTo: this.route,
              skipLocationChange: true,
              replaceUrl: false
            };
            this.router.navigate(['evaluate'], navigationExtras);


          } else {
            this.hideRouter = true;
            this.assignmentCompletionStatus = {
              class: 'valid',
              icon: 'sliders',
              content: `
                You have completed <span class="evals-completed">${response.evaluationsForAssignment}</span> of your 3 peer-evaluations.
                <br>Your peer-evaluation assignment is now complete!  Thank you!
              `
            }
          }
        }
      );
    }

  }

}

