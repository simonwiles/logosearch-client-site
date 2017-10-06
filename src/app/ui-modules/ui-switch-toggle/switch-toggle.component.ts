import { ChangeDetectorRef,
         Component,
         forwardRef,
         Input }                 from '@angular/core';

import { ControlValueAccessor,
         NG_VALUE_ACCESSOR }     from '@angular/forms';

export const SWITCHTOGGLE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SwitchToggleComponent),
  multi: true
};
// <label onclick=""> is required for older iOS and Opera Mini, apparently
@Component({
    selector: 'ui-switch-toggle',
    template: `
    <div [ngClass]="'switch-toggle'" [class]="styleClass">
      <ng-template ngFor let-item [ngForOf]="options" let-idx="index">
        <input type="radio"
               [name]="name"
               [value]="idx"
               [attr.data-value]="item.value"
               [checked]="this.value === item.value"
               [id]="(name + '-' + item.value)"
               (change)="handleChange($event)">
        <label [for]="(name + '-' + item.value)" onclick="" [innerHTML]="item.label"></label>
      </ng-template>
      <a></a>
    </div>
    `,
    styleUrls: ['./switch-toggle.component.scss'],
    providers: [SWITCHTOGGLE_VALUE_ACCESSOR]
})
export class SwitchToggleComponent implements ControlValueAccessor  {

  @Input() name: string;
  @Input() options: any[];
  @Input() value: any;
  @Input() styleClass: string;

  isDisabled: boolean;
  onModelChange: Function = () => { return; };
  onModelTouched: Function = () => { return; };

  constructor(private cd: ChangeDetectorRef) { }

  handleChange(event: Event) {
    // <HTMLInputElement>.value can only be a string; this shenanigans is so that
    //  values passed into (and, crucially, out of) this component can have other
    //  types (boolean, number, object, array, etc.)
    this.value = this.options[+(event.target as HTMLInputElement).value].value;
    this.onModelChange(this.value);
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }

  writeValue(value: any): void {
    this.value = value;
    this.cd.markForCheck();  // necessary??
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
