import { Component,
         ElementRef,
         Input,
         Output,
         EventEmitter,
         ContentChildren,
         AfterContentInit,
         QueryList }           from '@angular/core';
import { TabPanelComponent }   from './tab-panel.component';

@Component({
    selector: 'lr-tab-view',
    template: `
    <div class="ui-tabview ui-widget ui-corner-all"
         [ngStyle]="style"
         [class]="styleClass">

      <ul class="ui-tabview-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-top">
        <ng-template ngFor let-tab [ngForOf]="tabs">
          <li class="ui-state-default ui-corner-top"
              [ngStyle]="tab.headerStyle"
              [ngClass]="{
                'ui-tabview-selected ui-state-active': tab.selected,
                'ui-state-hover': tab.hoverHeader && !tab.disabled,
                'ui-state-disabled': tab.disabled
              }"
              (mouseenter)="tab.hoverHeader=true"
              (mouseleave)="tab.hoverHeader=false"
              (click)="open(tab, $event)">

            <a href="#">
              <span *ngIf="tab.leftIcon"
                    class="ui-tabview-left-icon fa"
                    [ngClass]="tab.leftIcon"></span>

              {{tab.header}}

              <span *ngIf="tab.rightIcon"
                    class="ui-tabview-right-icon fa"
                    [ngClass]="tab.rightIcon"></span>
            </a>

            <span *ngIf="tab.closable"
                  class="ui-tabview-close fa fa-close"
                  (click)="close($event,tab)"></span>
          </li>
        </ng-template>
      </ul>
      <div class="ui-tabview-panels">
        <ng-content></ng-content>
      </div>
    </div>
    `,
})
export class TabViewComponent implements AfterContentInit {

  @Input() style: any;
  @Input() styleClass: string;

  @Output() onChange: EventEmitter<any> = new EventEmitter();
  @Output() onClose: EventEmitter<any> = new EventEmitter();

  @ContentChildren(TabPanelComponent) tabsQuery: QueryList<TabPanelComponent>;

  public tabs: TabPanelComponent[];


  constructor(private el: ElementRef) { }

  ngAfterContentInit() {
    this.tabs = this.tabsQuery.toArray();
    let selectedTab: TabPanelComponent = this.findSelectedTab();
    if (!selectedTab && this.tabs.length) { this.tabs[0].selected = true; }
  }

  open(tab: TabPanelComponent, event) {
    if (tab.disabled) {
      if (event) { event.preventDefault(); }
      return;
    }

    if (!tab.selected) {
      let selectedTab: TabPanelComponent = this.findSelectedTab();
      if (selectedTab) { selectedTab.selected = false; }
      tab.selected = true;
      this.onChange.emit({originalEvent: event, index: this.findTabIndex(tab)});
    }
    if (event) { event.preventDefault(); }
  }

  close(event, tab: TabPanelComponent) {
    if (tab.selected) {
      tab.selected = false;
      for (let i = 0; i < this.tabs.length; i++) {
        let tabPanel = this.tabs[i];
        if (!tabPanel.disabled) {
          tabPanel.selected = true;
          break;
        }
      }
    }

    this.onClose.emit({originalEvent: event, index: this.findTabIndex(tab)});
    event.stopPropagation();
  }

  findSelectedTab(): any {
    for (let i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i].selected) { return this.tabs[i]; }
    }
    return null;
  }

  findTabIndex(tab: TabPanelComponent): number {
    let index = -1;
    for (let i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i] === tab) {
        index = i;
        break;
      }
    }
    return index;
  }
}
