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

export const AUTOCOMPLETE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AutoCompleteComponent),
  multi: true
};

@Component({
  selector: 'ui-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  providers: [AUTOCOMPLETE_VALUE_ACCESSOR, DomHandler]
})
export class AutoCompleteComponent implements ControlValueAccessor {

  @Input() minLength = 3;

  @Input() disabled: boolean;
  @Input() inputId: string;
  @Input() maxlength: number;
  @Input() placeholder: string;
  @Input() readonly: boolean;
  @Input() size: number;
  @Input() tabindex: number;

  @Input() styleClass = '';
  @Input() inputStyleClass: string;
  @Input() buttonStyleClass: string;
  @Input() suggestionsMaxHeight = '200px';
  @Input() showClearButton = true;

  @Output() onBlur: EventEmitter<any> = new EventEmitter();
  @Output() onClear: EventEmitter<any> = new EventEmitter();
  @Output() onFocus: EventEmitter<any> = new EventEmitter();
  @Output() onSelect: EventEmitter<any> = new EventEmitter();


  @Input() prop: string;
  @Input() emptyMessage = 'nothing found';
  // @Input() dataKey: string;
  // @Input() immutable: boolean = true;


  display: string;
  suggestions: any[];
  value: string;

  suggestionsVisible: boolean;
  highlightedOption: any;
  highlightedOptionChanged: boolean;

  @ViewChild('input') inputElRef: ElementRef;
  @ViewChild('suggestionsPanel') suggestionsPanelElRef: ElementRef;

  @Input() getSuggestions: Function = (query) => new Observable<any>(query);


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


  constructor(private domHandler: DomHandler) {}


  show() {
    if (this.inputElRef) {
      let hasFocus = document.activeElement === this.inputElRef.nativeElement ;
      if (!this.suggestionsVisible && hasFocus) {
        this.suggestionsVisible = true;
        this.suggestionsPanelElRef.nativeElement.style.zIndex = ++DomHandler.zindex;
        this.domHandler.fadeIn(this.suggestionsPanelElRef.nativeElement, 200);
      }
    }
  }

  hide() {
    this.suggestionsVisible = false;
  }

  search(event: any, query: string) {
      // allow empty string but not undefined or null
     if (query === undefined || query === null) {
       return;
     }

     this.getSuggestions(query).subscribe(
       suggestions => {
         this.suggestions = suggestions;

          if (this.suggestionsPanelElRef && this.suggestionsPanelElRef.nativeElement) {
            if (this.suggestions && this.suggestions.length) {
              this.show();
            } else {
              if (this.emptyMessage) {
                this.show();
              } else {
                this.hide();
              }
            }
          }
       }
     );
  }

  clear() {
    this.hide();
    this.value = undefined;
    this.display = null;
    this.onModelChange(this.value);
    this.onSelect.emit(null);
  }

  selectItem(option: any) {
    this.inputElRef.nativeElement.value = option;
    this.value = option;
    this.display = (this.prop) ? option[this.prop] : option;
    this.onModelChange(this.value);

    this.onSelect.emit(option);

    this.inputElRef.nativeElement.focus();
  }

  findOptionIndex(option): number {
    let index: number = -1;

    if (this.suggestions) {
      for (let i = 0; i < this.suggestions.length; i++) {
        if (option === this.suggestions[i]) {
            index = i;
            break;
        }
      }
    }

    return index;
  }


  ///////////////////////////////////////////////////////////////////////
  // Events

  @HostListener('window:click', ['$event'])
  onWindowClick(event: Event) {
    if (this.suggestionsVisible) {
      this.hide();
    }
  }

  onInputFocus(event) {
    this.onFocus.emit(event);
  }

  onInputBlur(event) {
    this.onModelTouched();
    this.onBlur.emit(event);
  }

  onInput(event: KeyboardEvent) {
    let value = (<HTMLInputElement> event.target).value;

    if (value.length === 0) {
      this.hide();
      this.onClear.emit(event);
    }

    if (value.length >= this.minLength) {
      this.search(event, value);
    } else {
      this.suggestions = null;
    }
  }

  onKeydown(event) {
    if (this.suggestionsVisible) {
      let highlightedItemIdx = this.findOptionIndex(this.highlightedOption);

      switch (event.which) {
        // down
        case 40:
          if (highlightedItemIdx !== -1) {
            const nextItemIndex = highlightedItemIdx + 1;
            if (nextItemIndex !== (this.suggestions.length)) {
              this.highlightedOption = this.suggestions[nextItemIndex];
              this.highlightedOptionChanged = true;
            }
          } else {
            this.highlightedOption = this.suggestions[0];
          }

          event.preventDefault();
        break;

        // up
        case 38:
          if (highlightedItemIdx > 0) {
            let prevItemIndex = highlightedItemIdx - 1;
            this.highlightedOption = this.suggestions[prevItemIndex];
            this.highlightedOptionChanged = true;
          }

          event.preventDefault();
        break;

        // enter
        case 13:
          if (this.highlightedOption) {
            this.selectItem(this.highlightedOption);
            this.hide();
          }
          event.preventDefault();
        break;

        // escape
        case 27:
          this.hide();
          event.preventDefault();
        break;


        // tab
        case 9:
          if (this.highlightedOption) {
            this.selectItem(this.highlightedOption);
          }
          this.hide();
        break;
      }
    } else {
      if (event.which === 40 && this.suggestions) {
        this.search(event, event.target.value);
      }
    }
  }
}
