import { CommonModule }    from '@angular/common';
import { NgModule }        from '@angular/core';

import { AutoCompleteComponent }  from './autocomplete.component';

@NgModule({
    imports: [CommonModule],
    exports: [AutoCompleteComponent],
    declarations: [AutoCompleteComponent]
})
export class AutoCompleteModule { }
