import { Component,
         Input }             from '@angular/core';

@Component({
    selector: 'lr-tab-panel',
    template: `
    <div class="ui-tabview-panel ui-widget-content ui-corner-all"
        [style.display]="selected ? 'block' : 'none'">

      <ng-content></ng-content>
    </div>
    `,
})
export class TabPanelComponent {

    @Input() header: string;

    @Input() selected: boolean;

    @Input() disabled: boolean;

    @Input() headerStyle: any;

    @Input() leftIcon: string;

    @Input() rightIcon: string;

    public hoverHeader: boolean;
}
