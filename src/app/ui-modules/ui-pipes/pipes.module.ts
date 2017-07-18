import { CommonModule }    from '@angular/common';
import { NgModule }        from '@angular/core';

import { FormatThousands } from './format-thousands.pipe';

@NgModule({
    imports: [CommonModule],
    exports: [FormatThousands],
    declarations: [FormatThousands]
})
export class PipesModule { }
