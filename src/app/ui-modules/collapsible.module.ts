// This is a bit of a Frankenstein's Monster -- fancy clever CSS tricks for the
//  collapsibile expansion, and ugly Javascript DOM manipulation to scroll the
//  expanded element into view.
//
// For completeness, should probably inject a reference to DOCUMENT (from
//  @angular/platform-browser) and wrap and inject a reference to window, too.

import { AfterViewChecked,
         Component,
         EventEmitter,
         Input,
         NgModule,
         Output,
         ViewChild }            from '@angular/core';

import { animate,
         group,
         state,
         style,
         transition,
         trigger }              from '@angular/core';

import { CommonModule }         from '@angular/common';


@Component({
  selector: 'ui-collapsible',
  template: `
  <div #outer>
    <div #handle *ngIf="!hideHeader" (click)="toggle()" class="handle">
      <span class="toggle">
        <i class="fa fa-{{shown ? 'minus' : 'plus'}}-square"></i>
      </span>
      <span class="header" [innerHtml]="header"></span>
    </div>
    <div #container class="container">
      <div #content
           class="content"
           [style.height]="fixedHeight || content.scrollHeight"
           [@rollUpDown]="shown"
           (@rollUpDown.start)="container.style.overflow='hidden'"
           (@rollUpDown.done)="container.style.overflow=(shown) ? 'visible' : 'hidden'">
        <ng-content></ng-content>
      </div>
    </div>
  </div>
  `,
  styles: [`
  .handle {
    display: table;
    cursor: pointer;
  }
  .toggle {
    display: table-cell;
    vertical-align: middle;
    width: 20px;
  }
  .header { display: table-cell; }
  .content { border-top: 1px solid transparent; }  // prevent child margins from leaking out
  `],
  animations: [
    trigger('rollUpDown', [
      state('true', style({ height: '*', maxHeight: 'initial' })),
      state('false', style({ height: '0px', maxHeight: '0px' })),
      transition('0 => 1', [
        group([
          animate('0ms', style({ maxHeight: 'initial' })),
          animate('300ms', style({ height: '*' }))
        ])
      ]),
      transition('1 => 0', animate('300ms', style({ height: '0px' })))
    ])
  ]
})
export class CollapsibleComponent implements AfterViewChecked {
  @Input() shown = true;
  @Input() hideHeader = '';
  @Input() header = '';
  @Input() fixedHeight: string;
  @Output() open: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  @ViewChild('content') content;
  @ViewChild('outer') outer;

  ngAfterViewChecked() {
    if (this.shown && !this.fixedHeight) {
      this.content.nativeElement.style.height = 'auto';
    }
  }

  toggle(show: boolean): void {
    this.shown = (typeof show !== 'undefined') ? show : !this.shown;
    if (this.shown) {
      this.open.emit(null);
      setTimeout(() => this.scrollTo(this.outer.nativeElement, 300), 310);
    } else {
      this.close.emit(null);
    }
  }

  scrollTo(target: HTMLElement, duration: number) {
    let rect = target.getBoundingClientRect();
    if ((rect.top >= 0) && (rect.bottom <= window.innerHeight)) {
      // already completely onscreen!
      return;
    }
    let scrollToDest: number;
    if (target.getBoundingClientRect().height >= window.innerHeight) {
      // target is too big for the viewport -- bring it too the top
      scrollToDest = target.offsetTop;
    } else {
      // target will fit in viewport -- scroll just enough to make it so
      scrollToDest = Math.round(rect.bottom - window.innerHeight);
    }

    let start = document.body.scrollTop;
    let diff = scrollToDest - start;
    let scrollStep = Math.PI / (duration / 10);
    let count = 0, currPos = 0;

    let scrollInterval = setInterval(function() {
      if (document.body.scrollTop !== scrollToDest && (window.innerHeight + window.pageYOffset) < document.body.offsetHeight) {
        count = count + 1;
        currPos = start + diff * (0.5 - 0.5 * Math.cos(count * scrollStep));
        document.body.scrollTop = currPos;
      } else {
        clearInterval(scrollInterval);
      }
    }, 10);
  }
}

@NgModule({
    imports: [CommonModule],
    exports: [CollapsibleComponent],
    declarations: [CollapsibleComponent]
})
export class CollapsibleModule { }
