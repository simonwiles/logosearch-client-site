import { Component,
         HostListener,
         Input }               from '@angular/core';
import { DataTableComponent }  from './table.component';


@Component({
  selector: 'ui-data-table-header',
  template: `
  <div class="data-table-header">
    <h4 class="title" [textContent]="dataTable.headerTitle"></h4>
    <div class="button-panel">

      <button type="button"
              class="button-style"
              (click)="dataTable.dataService.update(true)">
        <i class="fa fa-refresh"></i>
      </button>

      <button type="button"
              class="button-style"
              [class.active]="columnSelectorOpen"
              (click)="columnSelectorOpen = !columnSelectorOpen; $event.stopPropagation()">
        <i class="fa fa-list"></i>
      </button>

      <div class="column-selector-wrapper" (click)="$event.stopPropagation()">
        <div *ngIf="columnSelectorOpen" class="column-selector-box panel panel-default">
          <div *ngIf="dataTable.expandableRows" class="column-selector-fixed-column checkbox">
            <label>
              <input type="checkbox" [(ngModel)]="dataTable.expandColumnVisible"/>
              <span>{{dataTable.labels.expandColumn}}</span>
            </label>
          </div>
          <div *ngIf="dataTable.indexColumn" class="column-selector-fixed-column checkbox">
            <label>
              <input type="checkbox" [(ngModel)]="dataTable.indexColumnVisible"/>
              <span>{{dataTable.labels.indexColumn}}</span>
            </label>
          </div>
          <div *ngIf="dataTable.selectColumn" class="column-selector-fixed-column checkbox">
            <label>
              <input type="checkbox" [(ngModel)]="dataTable.selectColumnVisible"/>
              <span>{{dataTable.labels.selectColumn}}</span>
            </label>
          </div>
          <div *ngFor="let column of dataTable.columns" class="column-selector-column checkbox">
            <label>
              <input type="checkbox" [(ngModel)]="column.visible"/>
              <span [textContent]="column.header"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
  .data-table-header {
    min-height: 25px;
    margin-bottom: 10px;
  }
  .title {
    display: inline-block;
    margin: 5px 0 0 5px;
  }
  .button-panel {
    float: right;
  }
  .button-panel button {
    outline: none !important;
  }

  .column-selector-wrapper {
    position: relative;
  }
  .column-selector-box {
    box-shadow: 0 0 10px lightgray;
    width: 150px;
    padding: 10px;
    position: absolute;
    right: 0;
    top: 1px;
    z-index: 1060;
  }
  .column-selector-box .checkbox {
    margin-bottom: 4px;
  }
  .column-selector-fixed-column {
    font-style: italic;
  }
  `]
})
export class DataTableHeaderComponent {

  @Input() dataTable: DataTableComponent;
  columnSelectorOpen = false;

  @HostListener('document:click') _closeSelector() {
    this.columnSelectorOpen = false;
  }

}
