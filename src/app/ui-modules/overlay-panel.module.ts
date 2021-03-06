import { AfterViewInit,
         ChangeDetectorRef,
         Component,
         ElementRef,
         EventEmitter,
         HostListener,
         Input,
         NgModule,
         OnDestroy,
         Output,
         ViewChild }      from '@angular/core';

import { CommonModule }   from '@angular/common';

import { DomHandler }     from '../utils/domhandler';


@Component({
  selector: 'ui-overlay-panel',
  template: `
    <div #overlayPanel
         [ngClass]="'ui-overlaypanel panel'"
         [ngStyle]="style"
         [class]="styleClass"
         *ngIf="visible"
         (document:click)="onDocumentClick($event)">
      <div class="ui-overlaypanel-content">
        <ng-content></ng-content>
      </div>
      <a href="#"
         *ngIf="showCloseIcon"
         class="ui-overlaypanel-close"
         (click)="onCloseClick($event)">
        <span class="fa fa-fw fa-close"></span>
      </a>
    </div>
  `,
  styles: [`
  .ui-overlaypanel {
    display: none;
    margin: 0;
    padding: 0;
    position: absolute;
  }

  .ui-overlaypanel-content {
    padding: 5px;
    overflow: hidden;
  }

  .ui-overlaypanel-close {
    border-radius: 2px;
    border: 1px solid transparent;
    color: #8c1515;
    font-size: 20px;
    font-weight: normal;
    position: absolute;
    right: 4px;
    top: 4px;
    transition: all 0.2s ease;
  }

  .ui-overlaypanel-close:hover {
    border-color: #8c1515;
    background-color: #8c1515;
    color: #fff;
  }
  `],
  providers: [DomHandler]
})
export class OverlayPanelComponent {

  @Input() appendTo: any;
  @Input() dismissable = true;
  @Input() showCloseIcon: boolean;
  @Input() style: any;
  @Input() styleClass: string;

  @Output() onBeforeShow: EventEmitter<any> = new EventEmitter();
  @Output() onAfterShow: EventEmitter<any> = new EventEmitter();
  @Output() onBeforeHide: EventEmitter<any> = new EventEmitter();
  @Output() onAfterHide: EventEmitter<any> = new EventEmitter();

  container: any;
  hoverCloseIcon: boolean;
  target: any;
  visible = false;

  @ViewChild('overlayPanel') overlayPanel;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private el: ElementRef,
    private domHandler: DomHandler) { }

  // prefering not to use HostListener here, so as not to have the event
  //  constantly firing when the panel is not even part of the DOM
  //  (better solutions are available?)
  onDocumentClick($event) {
    if (!this.overlayPanel.nativeElement.contains($event.target)) {
      this.hide();
    }
  }

  getContainer() {
    this.container = this.el.nativeElement.children[0];
    this.container.style.zIndex = ++DomHandler.zindex;

    if (this.appendTo) {
      if (this.appendTo === 'body') {
        document.body.appendChild(this.container);
      } else {
        this.domHandler.appendChild(this.container, this.appendTo);
      }
    }

    return this.container;
  }

  toggle(event, target?) {
    if (this.visible) {
      this.hide();
    } else {
      this.show(event, target);
    }
  }

  show(event, target?) {
    this.onBeforeShow.emit(null);
    let elementTarget = target || event.currentTarget || event.target;
    this.target = elementTarget;

    this.visible = true;
    this.changeDetectorRef.detectChanges();

    let container = this.getContainer()
    container.style.zIndex = ++DomHandler.zindex;

    container.style.display = 'block';

    let top = elementTarget.offsetHeight + elementTarget.getBoundingClientRect().top + this.domHandler.getWindowScrollTop();
    let left = elementTarget.getBoundingClientRect().left + this.domHandler.getWindowScrollLeft()
                + elementTarget.offsetWidth - container.offsetWidth;

    container.style.top = top + 'px';
    container.style.left = left + 'px';
    this.domHandler.fadeIn(container, 250);
    this.onAfterShow.emit(null);
  }

  hide() {
    if (this.visible) {
      this.onBeforeHide.emit(null);
      this.visible = false;
      this.onAfterHide.emit(null);
    }
  }

  onCloseClick(event) {
    this.hide();
    event.preventDefault();
  }
}

@NgModule({
  imports: [CommonModule],
  exports: [OverlayPanelComponent],
  declarations: [OverlayPanelComponent]
})
export class OverlayPanelModule { }
