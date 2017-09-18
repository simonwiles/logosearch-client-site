import { Component,
         OnInit }                from '@angular/core';

import { environment }           from '../../environments/environment';

import { AuthService }           from '../services/auth.service';
import { NotificationsService }  from '../services/notifications.service';

@Component({
  selector: 'lr-lms-bridge',
  templateUrl: './lms-bridge.component.html',
  styles: [`

  `]
})
export class LmsBridgeComponent implements OnInit {

  lmsConnectionEstablished = false;

  assignmentIdToken: string;
  openEdXCourseId: string;

  public environment = environment;

  constructor(
    public authService: AuthService,
    public notificationsService: NotificationsService) {

    document.querySelector('html').classList.add('lms-bridge');
  }

  ngOnInit() {
    window.addEventListener(
      'message',
      (event) => {
        if (event.origin === environment.lagunitaHost ||
            event.source === window && event.data.openEdXCourseId) {  // second option is for localhost developing
          this.dataReceived(event.data);
        }
      },
      false
    );
  }

  dataReceived(data) {
    this.openEdXCourseId = data.openEdXCourseId;
    this.assignmentIdToken = data.assignmentIdToken;
    this.logInUser(data.lagunitaUser);
    // setTimeout(() => this.sendData('abc123'), 10000)
  }

  sendData(message) {
    parent.postMessage(message, environment.lagunitaHost);
  }

  logInUser(lagunitaUser) {

    if (this.authService.isLoggedIn && this.authService.loggedInUser.email === lagunitaUser.email) {
       this.lmsConnectionEstablished = true;
       return;
    }

    this.authService.lmsBridgeLogin(
        lagunitaUser.email,
        lagunitaUser.username,
        lagunitaUser.name,
        {'gender': lagunitaUser.gender}
      ).subscribe(

      data => {
        this.lmsConnectionEstablished = true;
      },
      error => { console.log(error); }

    );
  }

}

