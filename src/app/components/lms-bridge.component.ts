import { Component,
         OnInit }      from '@angular/core';

@Component({
  selector: 'lr-lms-bridge',
  template: `
    <div class="panel">
      <i *ngIf="!lagunitaUser" class="main-spinner fa fa-spin fa-spinner"></i>
      <div *ngIf="lagunitaUser">
        {{ lagunitaUser.name }}<br>
        {{ lagunitaUser.email }}
      </div>
    </div>
    `,
})
export class LmsBridgeComponent implements OnInit {

  lagunitaUser: any;

  ngOnInit() {
    window.addEventListener(
      'message',
      (event) => {
        if (event.origin === 'https://preview.lagunita.stanford.edu' || event.origin === 'https://localhost:4200' && event.data.email) {
          this.userReceived(event.data);
        }
      },
      false
    );
  }

  userReceived(lagunitaUser) {
    this.lagunitaUser = lagunitaUser;
  }

}

