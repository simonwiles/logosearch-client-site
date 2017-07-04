import { CommonModule }          from '@angular/common';

import { ChangeDetectorRef,
         Component,
         forwardRef,
         Input,
         NgModule }              from '@angular/core';

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
    <div class="switch-toggle">
      <ng-template ngFor let-item [ngForOf]="options">
        <input type="radio"
               [name]="name"
               [value]="item.value"
               [checked]="this.value === item.value"
               [id]="(name + '-' + item.value)"
               (change)="handleChange($event)">
        <label [for]="(name + '-' + item.value)" onclick="" [innerHTML]="item.label"></label>
      </ng-template>
      <a></a>
    </div>
    `,
    providers: [SWITCHTOGGLE_VALUE_ACCESSOR]
})
export class SwitchToggleComponent implements ControlValueAccessor  {

  @Input() name: string;
  @Input() options: any[];
  @Input() value: any;

  isDisabled: boolean;
  onModelChange: Function = () => { return; };
  onModelTouched: Function = () => { return; };

  constructor(private cd: ChangeDetectorRef) { }

  handleChange(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
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

@NgModule({
    imports: [CommonModule],
    exports: [SwitchToggleComponent],
    declarations: [SwitchToggleComponent]
})
export class SwitchToggleModule { }
