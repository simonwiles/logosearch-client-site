import { Component }             from '@angular/core';

import { environment }           from '../environments/environment';

import { AboutComponent }        from './components/about.component';
import { LoginComponent }        from './components/login.component';
import { HomeComponent }         from './components/home.component';

import { AuthService }           from './services/auth.service';
import { NotificationsService }  from './services/notifications.service';


export interface Message {
    severity?: string;
    summary?: string;
    detail?: string;
}

@Component({
  selector: 'lr-root',
  template: '<router-outlet></router-outlet>',
  entryComponents: [AboutComponent, HomeComponent, LoginComponent]
})
export class AppComponent {
  public environment = environment;

  constructor(
    public authService: AuthService,
    public notificationsService: NotificationsService) {
  }
}
