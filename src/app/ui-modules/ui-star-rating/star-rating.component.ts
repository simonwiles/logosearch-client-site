import { Observable }           from 'rxjs/Observable';

import { Component,
         ElementRef,
         EventEmitter,
         forwardRef,
         HostListener,
         Input,
         Output,
         ViewChild }            from '@angular/core';

import { NG_VALUE_ACCESSOR,
         ControlValueAccessor}  from '@angular/forms';

import { DomHandler }           from '../../utils/domhandler';

export const STARRATING_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => StarRatingComponent),
  multi: true
};

@Component({
  selector: 'ui-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  providers: [STARRATING_VALUE_ACCESSOR, DomHandler]
})
export class StarRatingComponent implements ControlValueAccessor {

  @Input() options: any[];
  @Input() readonly: boolean;
  @Input() name: string;

  @Input() styleClass = '';

  @Output() onBlur: EventEmitter<any> = new EventEmitter();
  @Output() onClear: EventEmitter<any> = new EventEmitter();
  @Output() onFocus: EventEmitter<any> = new EventEmitter();
  @Output() onSelect: EventEmitter<any> = new EventEmitter();


  display: string;
  value: string;

  constructor(private domHandler: DomHandler) {

  }

  handleChange(event: Event) {
    // <HTMLInputElement>.input can only be a string; this shenanigans is so that
    //  values passed into (and, crucially, out of) this component can have other
    //  types (boolean, number, object, array, etc.)
    this.value = (event.target as HTMLInputElement).value;
    this.onModelChange(this.value);
  }

  // ControlValueAccessor boiler-plate ///////
  onModelChange: Function = () => { return; };
  onModelTouched: Function = () => { return; };

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }

  writeValue(value: any): void {
    this.value = value;
  }
  ////////////////////////////////////////////


}
