// based on:
// http://www.cssscript.com/creating-accessible-switch-controls-with-pure-css-scss/

import { Component,
         EventEmitter,
         forwardRef,
         Input,
         NgModule,
         Output }               from '@angular/core';

import { CommonModule }         from '@angular/common';

import { NG_VALUE_ACCESSOR,
         ControlValueAccessor } from '@angular/forms';


export const CHECKBOX_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ToggleComponent),
  multi: true
};


@Component({
  selector: 'ui-toggle',
  template: `
  <div class="ui-toggle ui-toggle--size-small radio">
    <input type="checkbox"
           [id]="idString"
           [checked]="checked"
           [disabled]="disabled"
           (change)="handleChange($event)">
    <label [attr.for]="idString">
      <div class="ui-toggle__switch"
           [attr.data-checked]="onStateLabel"
           [attr.data-unchecked]="offStateLabel">
      </div>
    </label>
  </div>
  `,
  providers: [CHECKBOX_VALUE_ACCESSOR]
})
export class ToggleComponent implements ControlValueAccessor {

  @Input() idString: string;
  @Input() checked = false;
  @Input() disabled = false;
  @Input() onStateLabel = 'On';
  @Input() offStateLabel = 'Off';
  @Output() onChange: EventEmitter<any> = new EventEmitter();

  state = false;

  model: any;
  onModelChange: Function = () => { return; };
  onModelTouched: Function = () => { return; };

  handleChange(event: Event) {
    this.state = (event.target as HTMLInputElement).checked;
    this.onModelChange(this.state);
    this.onChange.emit(this.state);
  }

  writeValue(model: any): void {
    this.model = model;
    this.state = this.model;
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }
}

@NgModule({
    imports: [CommonModule],
    exports: [ToggleComponent],
    declarations: [ToggleComponent]
})
export class ToggleModule { }
