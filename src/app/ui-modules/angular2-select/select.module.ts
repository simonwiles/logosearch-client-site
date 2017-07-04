import { NgModule }                     from '@angular/core';
import { CommonModule }                 from '@angular/common';

import { SelectComponent }              from './select.component';
import { SelectDropdownComponent }      from './select-dropdown.component';

@NgModule({
    imports: [CommonModule],
    exports: [SelectComponent],
    declarations: [SelectComponent, SelectDropdownComponent]
})
export class SelectModule { }
