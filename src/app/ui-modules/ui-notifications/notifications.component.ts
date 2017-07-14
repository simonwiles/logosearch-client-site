import {Subscription}         from 'rxjs/Subscription';

import { Component,
         EventEmitter,
         OnInit,
         OnDestroy,
         ViewEncapsulation,
         Input,
         Output }             from '@angular/core';

interface NotificationsOptions {
  timeout?: number;
  showProgressBar?: boolean;
  pauseOnHover?: boolean;
  clickToClose?: boolean;
  styleClass?: string;
  animate?: 'fromRight' | 'fromLeft' | 'rotate' | 'scale';
  position?: ['top' | 'bottom', 'right' | 'left'];
}

@Component({
  selector: 'ui-notifications',
  // encapsulation: ViewEncapsulation.None,
  template: `
  <div class="ui-notification-wrapper" [ngClass]="options.position">
    <ui-notification *ngFor="let notification of notificationsService.notifications; let i = index"
                     [notification]="notification"
                     [timeout]="options.timeout"
                     [clickToClose]="options.clickToClose"
                     [showProgressBar]="options.showProgressBar"
                     [pauseOnHover]="options.pauseOnHover"
                     [styleClass]="options.styleClass"
                     [animate]="options.animate">
    </ui-notification>
  </div>
  `,
  styles: [`
  .ui-notification-wrapper {
    position: fixed;
    min-width: 300px;
    max-width: 500px;
    z-index: 1000;
  }

  .ui-notification-wrapper.left { left: 20px; }
  .ui-notification-wrapper.top { top: 20px; }
  .ui-notification-wrapper.right { right: 20px; }
  .ui-notification-wrapper.bottom { bottom: 20px; }

  @media (max-width: 340px) {
    .ui-notification-wrapper {
      width: auto;
      left: 20px;
      right: 20px;
    }
  }
  `]
})

export class NotificationsComponent implements OnInit {

  @Input() notificationsService;
  @Input() options: NotificationsOptions;

  ngOnInit(): void {
    // initialize default options
    this.options = Object.assign({
      timeout: 0,
      clickToClose: true,
      showProgressBar: true,
      pauseOnHover: true,
      styleClass: '',
      animate: 'fromRight',
      position: ['top', 'right']
    }, this.options)
  }
}
