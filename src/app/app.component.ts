import { Component }             from '@angular/core';

import { AboutComponent }        from './components/about.component';
import { LoginComponent }        from './components/login.component';
import { HomeComponent }         from './components/home.component';


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
export class AppComponent {}
