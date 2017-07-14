import { Component,
         OnInit,
         OnDestroy,
         Input,
         ViewEncapsulation,
         NgZone }            from '@angular/core';

import { trigger,
         state,
         style,
         transition,
         animate }           from '@angular/animations';

import { DomSanitizer,
         SafeHtml}           from '@angular/platform-browser';

@Component({
    selector: 'ui-notification',
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('enterLeave', [

            // Enter from right
            state('fromRight', style({opacity: 1, transform: 'translateX(0)'})),
            transition('* => fromRight', [
                style({opacity: 0, transform: 'translateX(5%)'}),
                animate('400ms ease-in-out')
            ]),
            state('fromRightOut', style({opacity: 0, transform: 'translateX(-5%)'})),
            transition('fromRight => fromRightOut', [
                style({opacity: 1, transform: 'translateX(0)'}),
                animate('300ms ease-in-out')
            ]),

            // Enter from left
            state('fromLeft', style({opacity: 1, transform: 'translateX(0)'})),
            transition('* => fromLeft', [
                style({opacity: 0, transform: 'translateX(-5%)'}),
                animate('400ms ease-in-out')
            ]),
            state('fromLeftOut', style({opacity: 0, transform: 'translateX(5%)'})),
            transition('fromLeft => fromLeftOut', [
                style({opacity: 1, transform: 'translateX(0)'}),
                animate('300ms ease-in-out')
            ]),

            // Rotate
            state('scale', style({opacity: 1, transform: 'scale(1)'})),
            transition('* => scale', [
                style({opacity: 0, transform: 'scale(0)'}),
                animate('400ms ease-in-out')
            ]),
            state('scaleOut', style({opacity: 0, transform: 'scale(0)'})),
            transition('scale => scaleOut', [
                style({opacity: 1, transform: 'scale(1)'}),
                animate('400ms ease-in-out')
            ]),

            // Scale
            state('rotate', style({opacity: 1, transform: 'rotate(0deg)'})),
            transition('* => rotate', [
                style({opacity: 0, transform: 'rotate(5deg)'}),
                animate('400ms ease-in-out')
            ]),
            state('rotateOut', style({opacity: 0, transform: 'rotate(-5deg)'})),
            transition('rotate => rotateOut', [
                style({opacity: 1, transform: 'rotate(0deg)'}),
                animate('400ms ease-in-out')
            ])
        ])
    ],
    template: `
    <div class="ui-notification"
         [@enterLeave]="notification.state"
         (click)="onClick($event)"
         [class]="styleClass"

         [ngClass]="{
           'alert': notification.type === 'alert',
           'error': notification.type === 'error',
           'warn': notification.type === 'warn',
           'success': notification.type === 'success',
           'info': notification.type === 'info',
           '': notification.type === null
         }"
         [style.paddingBottom]="(showCloseButton) ? '60px': '10px'"

        (mouseenter)="onEnter()"
        (mouseleave)="onLeave()">

      <div *ngIf="!notification.html">
        <div class="notification-title">{{notification.title}}</div>
        <div class="notification-content">{{notification.content}}</div>
        <div class="icon" *ngIf="icon !== null" [innerHTML]="icon"></div>
      </div>
      <div *ngIf="notification.html" [innerHTML]="notification.html"></div>

      <div class="notification-progress-loader" *ngIf="showProgressBar">
          <span [ngStyle]="{'width': progressWidth + '%'}"></span>
      </div>

      <button *ngIf="showCloseButton" class="notification-close-button">Close</button>

    </div>
    `,
    styleUrls: ['./notification.component.scss']
})

export class NotificationComponent implements OnInit, OnDestroy {

  @Input() public notification: any; // Notification;

  @Input() public animate: string;
  @Input() public clickToClose: boolean;
  @Input() public pauseOnHover: boolean;
  @Input() public showCloseButton = false;
  @Input() public showProgressBar: boolean;
  @Input() public styleClass: string;
  @Input() public timeout: number;


  // Progress bar variables
  public progressWidth = 0;

  private stopTime = false;
  private timer: any;
  private steps: number;
  private speed: number;
  private count = 0;
  private start: any;

  private diff: any;
  private icon: SafeHtml;

  public icons = {
    alert: '<i class="fa fw fa-bell"></i>',
    error: '<i class="fa fw fa-exclamation-circle"></i>',
    info: '<i class="fa fw fa-info-circle"></i>',
    success: '<i class="fa fw fa-check"></i>',
    warn: '<i class="fa fw fa-exclamation-triangle"></i>'
  };

  constructor(
    private domSanitizer: DomSanitizer,
    private zone: NgZone) {}

  ngOnInit(): void {
    if (this.notification.options) { this.applyOptions(); }
    if (this.animate) { this.notification.state = this.animate; }
    if (this.timeout !== 0) { this.startTimeOut(); }
    if (this.notification.type && this.icons[this.notification.type]) {
      this.icon = this.domSanitizer.bypassSecurityTrustHtml(this.icons[this.notification.type]);
    }
  }

  startTimeOut(): void {
    this.steps = this.timeout / 10;
    this.speed = this.timeout / this.steps;
    this.start = new Date().getTime();
    this.zone.runOutsideAngular(() => this.timer = setTimeout(this.instance, this.speed));
  }

  onEnter(): void {
    if (this.pauseOnHover) {
      this.stopTime = true;
    }
  }

  onLeave(): void {
    if (this.pauseOnHover) {
      this.stopTime = false;
      setTimeout(this.instance, (this.speed - this.diff));
    }
  }

  onClick($event: MouseEvent): void {
    // this.notification.click!.emit($event);
    if (this.clickToClose) { this.remove(); }
  }

  applyOptions(): void {
    Object.keys(this.notification.options).forEach(option => {
      if (this.hasOwnProperty(option)) {
        (<any>this)[option] = this.notification.options[option];
      }
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }

  private instance = () => {
    this.zone.runOutsideAngular(() => {
      this.zone.run(() => this.diff = (new Date().getTime() - this.start) - (this.count * this.speed));

      if (this.count++ === this.steps) {
        this.zone.run(() => this.remove());
      } else if (!this.stopTime) {
        if (this.showProgressBar) {
          this.zone.run(() => this.progressWidth += 100 / this.steps);
        }
        this.timer = setTimeout(this.instance, (this.speed - this.diff));
      }
    })
  };

  private remove() {
    if (this.animate) {
      this.notification.state = this.animate + 'Out';
      this.zone.runOutsideAngular(() => {
        setTimeout(() => {
          this.zone.run(() => this.notification.remove());
        }, 310);
      })
    } else {
      this.notification.remove();
    }
  }
}
