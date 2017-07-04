import { Directive,
         ElementRef,
         HostListener,
         Input,
         NgModule,
         OnDestroy }      from '@angular/core';

import { CommonModule }   from '@angular/common';

import { DomHandler }     from '../primeng/domhandler';

@Directive({
  selector: '[uiTooltip]',
  providers: [DomHandler]
})
export class TooltipDirective implements OnDestroy {

  @Input() uiTooltip: string;
  @Input() uiTooltipHTML = false;
  @Input() uiTooltipPosition = 'top';
  @Input() uiTooltipEvent = 'hover';
  @Input() uiTooltipAppendTo: any = 'body';
  @Input() uiTooltipPositionStyle: string;
  @Input() uiTooltipStyleClass: string;
  @Input() uiTooltipDisabled: boolean;

  container: any;

  constructor(
    private el: ElementRef,
    private domHandler: DomHandler) { }

  initTooltip() {
    this.container = document.createElement('div');

    let styleClass = 'ui-widget ui-tooltip ui-tooltip-' + this.uiTooltipPosition;
    if (this.uiTooltipStyleClass) {
      styleClass += ' ' + this.uiTooltipStyleClass;
    }

    this.container.className = styleClass;

    let tooltipArrow = document.createElement('div');
    tooltipArrow.className = 'ui-tooltip-arrow';
    this.container.appendChild(tooltipArrow);

    let tooltipText = document.createElement('div');
    tooltipText.className = 'ui-tooltip-text ui-shadow ui-corner-all';
    if (this.uiTooltipHTML) {
      tooltipText.innerHTML = this.uiTooltip;
    } else {
      tooltipText.appendChild(document.createTextNode(this.uiTooltip));
    }

    if (this.uiTooltipPositionStyle) {
      this.container.style.position = this.uiTooltipPositionStyle;
    }

    this.container.appendChild(tooltipText);
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter() {
    if (this.uiTooltipEvent === 'hover') {
      this.show();
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave() {
    if (this.uiTooltipEvent === 'hover') {
      this.hide();
    }
  }

  @HostListener('focus', ['$event'])
  onFocus() {
    if (this.uiTooltipEvent === 'focus') {
      this.show();
    }
  }

  @HostListener('blur', ['$event'])
  onBlur() {
    if (this.uiTooltipEvent === 'focus') {
      this.hide();
    }
  }

  @HostListener('click', ['$event'])
  onClick() {
    if (this.uiTooltipEvent === 'click') {
      this.show();
    }
  }

  @HostListener('window:click', ['$event'])
  onWindowClick(event: Event) {
    if (this.container && this.el.nativeElement !== event.target && !this.container.contains(event.target)) {
      this.hide();
    }
  }

  show() {
    if (!this.uiTooltip || this.uiTooltipDisabled) {
      return;
    }

    this.initTooltip();

    if (this.uiTooltipAppendTo === 'body') {
      document.body.appendChild(this.container);
    } else if (this.uiTooltipAppendTo === 'target') {
      this.domHandler.appendChild(this.container, this.el.nativeElement);
    } else {
      this.domHandler.appendChild(this.container, this.uiTooltipAppendTo);
    }

    let offset = (this.uiTooltipAppendTo !== 'body') ? {left: 0, top: 0} : this.domHandler.getOffset(this.el.nativeElement);
    let targetTop = offset.top;
    let targetLeft = offset.left;
    let left: number;
    let top: number;

    this.container.style.display = 'block';

    switch (this.uiTooltipPosition) {
      case 'right':
        left = targetLeft + this.domHandler.getOuterWidth(this.el.nativeElement);
        top = targetTop + (this.domHandler.getOuterHeight(this.el.nativeElement) - this.domHandler.getOuterHeight(this.container)) / 2;
      break;

      case 'left':
        left = targetLeft - this.domHandler.getOuterWidth(this.container);
        top = targetTop + (this.domHandler.getOuterHeight(this.el.nativeElement) - this.domHandler.getOuterHeight(this.container)) / 2;
      break;

      case 'top':
        left = targetLeft + (this.domHandler.getOuterWidth(this.el.nativeElement) - this.domHandler.getOuterWidth(this.container)) / 2;
        top = targetTop - this.domHandler.getOuterHeight(this.container);
      break;

      case 'bottom':
        left = targetLeft + (this.domHandler.getOuterWidth(this.el.nativeElement) - this.domHandler.getOuterWidth(this.container)) / 2;
        top = targetTop + this.domHandler.getOuterHeight(this.el.nativeElement);
      break;

    }

    this.container.style.left = left + 'px';
    this.container.style.top = top + 'px';
    this.domHandler.fadeIn(this.container, 250);
    this.container.style.zIndex = ++DomHandler.zindex;
  }

  hide() {
    if (this.container && this.container.parentElement) {
      if (this.uiTooltipAppendTo === 'body') {
        document.body.removeChild(this.container);
      } else if (this.uiTooltipAppendTo === 'target') {
        this.el.nativeElement.removeChild(this.container);
      } else {
        this.domHandler.removeChild(this.container, this.uiTooltipAppendTo);
      }
    }
  }

  ngOnDestroy() {
    this.hide();
    this.container = null;
  }
}

@NgModule({
  imports: [CommonModule],
  exports: [TooltipDirective],
  declarations: [TooltipDirective]
})
export class TooltipModule { }
