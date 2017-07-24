import { CommonModule }    from '@angular/common';
import { NgModule }        from '@angular/core';
import { FormsModule }     from '@angular/forms';

import { TurnEditorComponent } from './turn-editor.component';

@NgModule({
    imports: [CommonModule, FormsModule],
    exports: [TurnEditorComponent],
    declarations: [TurnEditorComponent]
})
export class TurnEditorModule { }
