import { Component }      from '@angular/core';

import { environment }    from '../environments/environment';

import { Message }        from './primeng/api.interfaces';

import { AboutComponent } from './components/about.component';
import { LoginComponent } from './components/login.component';
import { HomeComponent }  from './components/home.component';

import { AuthService }    from './services/auth.service';
import { PubSubService }  from './services/pubsub.service';


@Component({
  selector: 'lr-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  entryComponents: [AboutComponent, HomeComponent, LoginComponent]
})
export class AppComponent {
  public environment = environment;
  public messages: Message[] = [];

  constructor(
    public authService: AuthService,
    private pubSubService: PubSubService) {

    this.pubSubService.emitter.listen(
      'message', (messageData) => { this.messages.push(messageData); });
 }
}
