import { CommonModule }          from '@angular/common';
import { NgModule }              from '@angular/core';

import { SwitchToggleComponent } from './switch-toggle.component';

@NgModule({
    imports: [CommonModule],
    exports: [SwitchToggleComponent],
    declarations: [SwitchToggleComponent]
})
export class SwitchToggleModule { }
