import { Component }             from '@angular/core';
import { environment }           from '../../environments/environment';


import { AuthService }           from '../services/auth.service';
import { NotificationsService }  from '../services/notifications.service';

@Component({
  selector: 'lr-site-layout',
  templateUrl: './site-layout.component.html'
})
export class SiteLayoutComponent {
  public environment = environment;

  constructor(
    public authService: AuthService,
    public notificationsService: NotificationsService) {

    document.querySelector('html').classList.add('site');

  }
}
