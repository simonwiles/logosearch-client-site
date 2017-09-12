import { CommonModule }    from '@angular/common';
import { NgModule }        from '@angular/core';

import { StarRatingComponent }  from './star-rating.component';

@NgModule({
    imports: [CommonModule],
    exports: [StarRatingComponent],
    declarations: [StarRatingComponent]
})
export class StarRatingModule { }
