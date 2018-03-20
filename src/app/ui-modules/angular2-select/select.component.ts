import { Component,
         ContentChild,
         ElementRef,
         EventEmitter,
         ExistingProvider,
         forwardRef,
         Input,
         OnChanges,
         OnInit,
         Output,
         ViewChild }                 from '@angular/core';

import { NG_VALUE_ACCESSOR,
         ControlValueAccessor }      from '@angular/forms';

import { SelectDropdownComponent }   from './select-dropdown.component';


export const SELECT_VALUE_ACCESSOR: ExistingProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectComponent),
  multi: true
};

@Component({
  selector: 'ui-select',
  template: `
<div style="width:100%;position:relative;">
  <span #container
        style="width:100%"
        [ngClass]="getContainerClass()"
        (window:resize)="onWindowResize()"
        (window:click)="onWindowClick($event)">
    <span class="selection">
      <span #selectionSpan
          tabindex=0
          [ngClass]="getSelectionClass()"
          (click)="onSelectionClick($event)"
          (keydown)="onKeydown($event)">

        <span *ngIf="!multiple"
              class="select2-selection__rendered">
          <span class="select2-selection__placeholder">
            {{getPlaceholder()}}
          </span>
        </span>

        <span *ngIf="!multiple && selection.length > 0"
              class="select2-selection__rendered">
          <span *ngIf="allowClear"
                class="select2-selection__clear"
                (click)="onClearClick($event)">
            x
          </span>
          {{selection[0].label}}
        </span>

        <ul *ngIf="multiple"
            class="select2-selection__rendered">

          <ng-template *ngIf="pillTemplate"
                    [ngTemplateOutlet]="pillTemplate"
                    [ngOutletContext]="{selection: selection}">
          </ng-template>

          <ng-template *ngIf="!pillTemplate" ngFor let-option="$implicit" [ngForOf]="selection">
            <li class="select2-selection__choice"
                title="{{option.label}}"
                [attr.data-value]="option.value"
                (click)="onSelectedOptionClicked($event)">
              <span class="select2-selection__choice__remove"
                    [attr.data-value]="option.value"
                    (click)=onClearItemClick($event)>
                  ×
              </span>
              <span [innerHtml]="option.label"></span>
            </li>
          </ng-template>

          <li class="select2-search select2-search--inline">
            <input #searchInput
                   class="select2-search__field"
                   placeholder="{{getPlaceholder()}}"
                   [ngStyle]="getInputStyle()"
                   (input)="onInput($event)"
                   (keydown)="onSearchKeydown($event)"/>
          </li>
        </ul>
        <span class="select2-selection__arrow">
          <b></b>
        </span>
      </span>
    </span>
  </span>
  <ui-select-dropdown #dropdown
                      *ngIf="isOpen"
                      [multiple]="multiple"
                      [optionValues]="optionValues"
                      [optionsDict]="optionsDict"
                      [selection]="selection"
                      [width]="width"
                      [top]="top"
                      [left]="left"
                      (toggleSelect)="onToggleSelect($event)"
                      (close)="onClose($event)">
  </ui-select-dropdown>
</div>
  `,
  providers: [SELECT_VALUE_ACCESSOR]
})

export class SelectComponent implements ControlValueAccessor, OnInit, OnChanges {

  @Input() options: Array<any>;
  @Input() theme: string;
  @Input() multiple: boolean;
  @Input() placeholder: string;
  @Input() allowClear: boolean;
  @Input() disabled = false;

  @Output() opened: EventEmitter<any> = new EventEmitter<any>();
  @Output() closed: EventEmitter<any> = new EventEmitter<any>();
  @Output() selected: EventEmitter<any> = new EventEmitter<any>();
  @Output() deselected: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectedOptionClicked: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('container') container: any;
  @ViewChild('selectionSpan') selectionSpan: any;
  @ViewChild('dropdown') dropdown: SelectDropdownComponent;
  @ViewChild('searchInput') searchInput: any;

  @ContentChild('pillTemplate') pillTemplate;


  // State variables.
  isBelow = true;
  isOpen = false;
  hasFocus = false;

  width: number;
  top: number;
  left: number;

  // Select options.
  optionValues: Array<string> = [];
  optionsDict: any = {};

  selection: Array<any> = [];
  value: Array<string> = [];

  // Class names.
  private S2 = 'select2';
  private S2_CONTAINER: string = this.S2 + '-container';
  private S2_SELECTION: string = this.S2 + '-selection';

  private KEYS: any = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    ESC: 27,
    SPACE: 32,
    UP: 38,
    DOWN: 40
  };

  onChange = (_: any) => undefined;
  onTouched = () => undefined;

  constructor(private el: ElementRef) { }


  /***************************************************************************
   * Event handlers.
   **************************************************************************/

  ngOnInit() {
    this.init();
  }

  ngOnChanges(changes: any) {
    this.init();
  }

  onSelectionClick(event: any) {
    this.toggleDropdown();

    if (this.multiple) {
      this.focus();
    }
    event.stopPropagation();
    // this is a hack; stopping propagation causes any upstream eventHandlers
    //  to be ignored.  Here we make sure at least those bound on document will fire.
    document.dispatchEvent(new Event('click'));
  }

  /**
   * Event handler of the single select clear (x) button click. It is assumed
   * that there is exactly one item selected.
   *
   * The `deselect` method is used instead of `clear`, to heve the deselected
   * event emitted.
   */
  onClearClick(event: any) {
    this.deselect(this.selection[0].value);
    event.stopPropagation();
  }

  onClearItemClick(event: any) {
    this.deselect(event.target.dataset.value);
    event.stopPropagation();
  }

  onToggleSelect(event) {
    this.toggleSelect(event);
  }

  onClose(focus: any) {
    this.close(focus);
  }

  onWindowClick(event) {
    this.blur();
    this.close(this.el.nativeElement.contains(event.target));
  }

  onWindowResize() {
    this.updateWidth();
  }

  onKeydown(event: any) {
    this.handleKeyDown(event);
  }

  onInput(event: any) {

    // Open dropdown, if it is currently closed.
    if (!this.isOpen) {
      this.open();
      // HACK
      setTimeout(() => {
        this.handleInput(event);
      }, 100);
    } else {
      this.handleInput(event);
    }
  }

  onSearchKeydown(event: any) {
    this.handleSearchKeyDown(event);
  }

  onSelectedOptionClicked(event: any) {
    this.selectedOptionClicked.emit({event: event, value: this.optionsDict[event.target.dataset.value]});
    event.stopPropagation();
  }

  /***************************************************************************
   * Initialization.
   **************************************************************************/

  init() {
      this.initOptions();
      this.initDefaults();
  }

  initOptions() {
    let values: any[] = [];
    let opts = {};

    for (let option of this.options) {

      let selected = false;
      let existingOption = this.optionsDict[option.value];
      if (typeof existingOption !== 'undefined') {
        selected = existingOption.selected;
      }

      opts[option.value] = {
        value: option.value,
        label: option.label,
        disabled: option.disabled || false,
        selected: selected
      };
      values.push(option.value);
    }

    this.optionValues = values;
    this.optionsDict = opts;

    this.updateSelection();
  }

  initDefaults() {
    if (typeof this.multiple === 'undefined') {
      this.multiple = false;
    }
    if (typeof this.theme === 'undefined') {
      this.theme = 'default';
    }
    if (typeof this.allowClear === 'undefined') {
      this.allowClear = false;
    }
  }

  /***************************************************************************
   * Dropdown toggle.
   **************************************************************************/

  toggleDropdown() {
    if (!this.disabled) {
      this.isOpen ? this.close(true) : this.open();
    }
  }

  open() {
    if (!this.isOpen) {
      this.updateWidth();
      this.updatePosition();
      this.isOpen = true;
      this.opened.emit(null);
    }
  }

  close(focus: boolean) {
    if (this.isOpen) {
      this.isOpen = false;
      if (focus) {
        this.focus();
      }
      this.closed.emit(null);
    }
  }

  /***************************************************************************
   * Select.
   **************************************************************************/

  toggleSelect(value: string) {

    if (!this.multiple && this.selection.length > 0) {
      this.selection[0].selected = false;
    }

    this.optionsDict[value].selected ?
      this.deselect(value) : this.select(value);

    if (this.multiple) {
      this.searchInput.nativeElement.value = '';
    }
    this.focus();
  }

  select(value: string) {
    this.optionsDict[value].selected = true;
    this.updateSelection();

    setTimeout(() => {
      this.selected.emit(this.optionsDict[value]);
    }, 100);

  }

  deselect(value: string) {
    this.optionsDict[value].selected = false;
    this.updateSelection();
    this.deselected.emit(this.optionsDict[value]);
  }

  updateSelection() {
    let s: Array<any> = [];
    let v: Array<string> = [];
    for (let optionValue of this.optionValues) {
      if (this.optionsDict[optionValue].selected) {
        let opt = this.optionsDict[optionValue];
        s.push(opt);
        v.push(opt.value);
      }
    }

    this.selection = s;
    this.value = v;

    // TODO first check if value has changed?
    this.onChange(this.getOutputValue());
  }

  popSelect() {
    if (this.selection.length > 0) {
      this.selection[this.selection.length - 1].selected = false;
      this.updateSelection();
      this.onChange(this.getOutputValue());
    }
  }

  clear() {
    Object.keys(this.optionsDict).forEach(key => this.optionsDict[key].selected = false);
    this.selection = [];
    this.value = [];

    // TODO first check if value has changed?
    this.onChange(this.getOutputValue());
  }

  getOutputValue(): any {
    if (this.multiple) {
      return this.value.length === 0 ? '' : this.value.slice(0);
    } else {
      return this.value.length === 0 ? '' : this.value[0];
    }
  }

  /***************************************************************************
   * ControlValueAccessor interface methods.
   **************************************************************************/

  writeValue(value: any) {

    if (typeof value === 'undefined' || value === null || value === '') {
      value = this.multiple ? [] : '';
    }

    Object.keys(this.optionsDict).forEach(key => this.optionsDict[key].selected = false);

    if (this.multiple) {
      for (let item of value) {
        this.optionsDict[item].selected = true;
      }
    } else if (value !== '') {
      this.optionsDict[value].selected = true;
    }

    this.updateSelection();
  }

  registerOnChange(fn: (_: any) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  /***************************************************************************
   * Keys.
   **************************************************************************/

  handleKeyDown(event: any) {

    let key = event.which;

    if (key === this.KEYS.ENTER || key === this.KEYS.SPACE ||
       (key === this.KEYS.DOWN && event.altKey)) {

      this.open();
      event.preventDefault();
    }
  }

  handleInput(event: any) {
    this.dropdown.filter(event.target.value);
  }

  handleSearchKeyDown(event: any) {

    let key = event.which;

    if (key === this.KEYS.ENTER) {
      if (typeof this.dropdown !== 'undefined') {
        let hl = this.dropdown.highlighted;

        if (hl !== null) {
          this.onToggleSelect(hl.value);
          this.isOpen = false;
          this.close(true);
        }
      }
    } else if (key === this.KEYS.BACKSPACE) {
      if (this.searchInput.nativeElement.value === '') {
        this.popSelect();
      }
    } else if (key === this.KEYS.UP) {
      if (typeof this.dropdown === 'undefined') {
        this.open();
      } else {
        this.dropdown.highlightPrevious();
      }
    } else if (key === this.KEYS.DOWN) {
      if (typeof this.dropdown === 'undefined') {
        this.open();
      } else {
        this.dropdown.highlightNext();
      }
    } else if (key === this.KEYS.ESC) {
      this.close(true);
    }
  }

  /***************************************************************************
   * Layout/Style/Classes/Focus.
   **************************************************************************/

  focus() {
    this.hasFocus = true;
    if (this.multiple) {
      this.searchInput.nativeElement.focus();
    } else {
      this.selectionSpan.nativeElement.focus();
    }
  }

  blur() {
    this.hasFocus = false;
    this.selectionSpan.nativeElement.blur();
  }

  updateWidth() {
    this.width = this.container.nativeElement.offsetWidth;
  }

  updatePosition() {
    let e = this.container.nativeElement;
    this.left = e.offsetLeft;
    this.top = e.offsetTop + e.offsetHeight;
  }

  getContainerClass(): any {
    let result = {};

    result[this.S2] = true;

    let c = this.S2_CONTAINER;
    result[c] = true;
    result[c + '--open'] = this.isOpen;
    result[c + '--focus'] = this.hasFocus;
    result[c + '--disabled'] = this.disabled;
    result[c + '--' + this.theme] = true;
    result[c + '--' + (this.isBelow ? 'below' : 'above')] = true;

    return result;
  }

  getSelectionClass(): any {
    let result = {};

    let s = this.S2_SELECTION;
    result[s] = true;
    result[s + '--' + (this.multiple ? 'multiple' : 'single')] = true;

    return result;
  }

  showPlaceholder(): boolean {
    return typeof this.placeholder !== 'undefined' &&
        this.selection.length === 0;
  }

  getPlaceholder(): string {
    return this.showPlaceholder() ? this.placeholder : '';
  }

  getInputStyle(): any {

    let width: number;

    if (typeof this.searchInput === 'undefined') {
      width = 200;
    } else if (this.showPlaceholder() &&
               this.searchInput.nativeElement.value.length === 0 ) {
      width = 10 + 10 * this.placeholder.length;
    } else {
      width = 10 + 10 * this.searchInput.nativeElement.value.length;
    }

    return {
      'width': width + 'px'
    };
  }
}
