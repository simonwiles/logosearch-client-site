// import { NgModule, ModuleWithProviders} from '@angular/core';
// import {CommonModule} from '@angular/common';

// import {MaxPipe} from './simple-notifications/pipes/max.pipe';
// import {NotificationsService} from './simple-notifications/services/notifications.service';

// Type
// export * from './simple-notifications/interfaces/notification.type';
// export * from './simple-notifications/interfaces/options.type';
// export * from './simple-notifications/interfaces/icons';

// export * from './simple-notifications/components/simple-notifications.component';
// export * from './simple-notifications/components/notification.component';
// export * from './simple-notifications/pipes/max.pipe';
// export * from './simple-notifications/services/notifications.service';


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
