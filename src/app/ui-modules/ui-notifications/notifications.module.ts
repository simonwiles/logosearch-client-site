import { CommonModule }    from '@angular/common';
import { NgModule }        from '@angular/core';

import { NotificationsComponent } from './notifications.component';
import { NotificationComponent }  from './notification.component';

@NgModule({
    imports: [CommonModule],
    exports: [NotificationsComponent],
    declarations: [NotificationComponent, NotificationsComponent]
})
export class NotificationsModule { }
