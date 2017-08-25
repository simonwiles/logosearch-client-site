import { Component,
         Input,
         NgModule }             from '@angular/core';

import { CommonModule }         from '@angular/common';
import { TooltipModule }        from './tooltip.module';


@Component({
  selector: 'ui-help-button',
  template: `
    <a class="help-icon" [uiTooltip]="helpText" [uiTooltipHTML]="HTML" [uiTooltipPosition]="position"><i class="fa fa-info-circle"></i></a>
  `,
  styles: [`
  `],
  animations: [ ]
})
export class HelpButtonComponent {
  @Input() helpText: string;
  @Input() HTML = false;
  @Input() position = 'top';
}


@NgModule({
    imports: [CommonModule, TooltipModule],
    exports: [HelpButtonComponent],
    declarations: [HelpButtonComponent]
})
export class HelpButtonModule { }
