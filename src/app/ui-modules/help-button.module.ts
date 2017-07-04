import { Component,
         // EventEmitter,
         Input,
         NgModule,
         // Output,
         // ViewChild
       }            from '@angular/core';

// import { animate,
//          state,
//          style,
//          transition,
//          trigger }              from '@angular/core';

import { CommonModule }         from '@angular/common';


@Component({
  selector: 'lr-help-button',
  template: `
    <a class="help-icon" (click)="shown = (shown) ? false : true"><i class="fa fa-info-circle"></i></a>
    <div *ngIf="shown">
    </div>
  `,
  styles: [`
  `],
  animations: [ ]
})
export class HelpButtonComponent {

  @Input() helpText: string;

  public shown = false;

}


@NgModule({
    imports: [CommonModule],
    exports: [HelpButtonComponent],
    declarations: [HelpButtonComponent]
})
export class HelpButtonModule { }
