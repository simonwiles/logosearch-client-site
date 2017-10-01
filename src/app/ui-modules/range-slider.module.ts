import { CommonModule }          from '@angular/common';

import { Component,
         forwardRef,
         Input,
         NgModule }              from '@angular/core';

import { ControlValueAccessor,
         NG_VALUE_ACCESSOR }     from '@angular/forms';


export const SLIDER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RangeSliderComponent),
  multi: true
};

@Component({
    selector: 'ui-range-slider',
    template: `
    <div class="range"
         [style.width]="(100 - (100 / options.length)) + '%'"
         [style.backgroundSize]="(((index === -1) ? 0 : index) * 100 / (options.length - 1)) + '% 5px, ' + maxRangeWidth + '% 2px'"
         [ngClass]="{'disabled': disabled}">
    </div>

    <ul #rangeLabels
        class="range-labels"
        [ngClass]="{'disabled': disabled || readonly}">
      <li *ngFor="let option of options; let i=index"
          [ngClass]="{
            'selected': i == index,
            'active': i <= index,
            'disabled': option.disabled
          }"
          (click)="(!readonly && !disabled && !option.disabled) && updateIndex(i)">
        {{ option.label }}
      </li>
    </ul>
    `,
    providers: [SLIDER_VALUE_ACCESSOR]
})
export class RangeSliderComponent implements ControlValueAccessor {

  @Input() options = [
    {label: 'One', value: 'one', disabled: false},
    {label: 'Two', value: 'two', disabled: false},
    {label: 'Three', value: 'three', disabled: false},
    {label: 'Four', value: 'four', disabled: false}
  ];
  @Input() disabled = false;
  @Input() readonly = false;

  index: number = null;
  maxRangeWidth = 100;  // using this it's possible to shorten the line if the last option(s) are disabled

  onModelChange: Function = () => { return; };
  onModelTouched: Function = () => { return; };

  updateIndex(index: number): void {
    this.index = index;
    this.onModelChange((index >= 0) ? this.options[index].value : null);
  }

  writeValue(value: any): void {
    this.updateIndex(this.options.indexOf(this.options.find(option => option.value === value)));
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }

  setDisabledState(value: boolean): void {
    this.disabled = value;
  }
}

@NgModule({
    imports: [CommonModule],
    exports: [RangeSliderComponent],
    declarations: [RangeSliderComponent]
})
export class RangeSliderModule { }
