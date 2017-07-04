export const TABLE_TEMPLATE = `
<div class="data-table-wrapper">
  <ui-data-table-header *ngIf="header" [dataTable]="_this"></ui-data-table-header>

  <div class="data-table-box" #dataTableBox>
    <table #dataTable class="data-table" [class]="tableClass">
      <thead>
        <tr>

          <th [hide]="!expandColumnVisible" class="expand-column-header" (click)="expandAll()">
            <i class="fa fa-caret-right" [hide]="allExpanded"></i>
            <i class="fa fa-caret-down" [hide]="!allExpanded"></i>
          </th>

          <th [hide]="!indexColumnVisible" class="index-column-header">
            <span [textContent]="indexColumnHeader"></span>
          </th>

          <th [hide]="!selectColumnVisible" class="select-column-header">
            <input [hide]="!multiSelect" type="checkbox" [(ngModel)]="selectAllCheckbox"/>
          </th>

          <th #th
              *ngFor="let column of columns"
              [hide]="!column.visible"
              (click)="headerClicked(column, $event)"
              [class.sortable]="column.sortable"
              [class.clickable]="column.sortable"
              [class.resizable]="column.resizable"
              [ngClass]="column.styleClassObject"
              class="column-header"
              [style.width]="column.width">

            <span *ngIf="!column.headerTemplate"
                  [textContent]="column.header"></span>
            <span *ngIf="column.headerTemplate"
                  [ngTemplateOutlet]="column.headerTemplate"
                  [ngOutletContext]="{column: column}"></span>
            <span *ngIf="column.sortable"
                  class="column-sort-icon">
                <i class="fa fa-sort" [hide]="column.property === dataService.sortBy"></i>
                <span [hide]="column.property !== dataService.sortBy">
                  <i class="fa fa-sort-asc" [hide]="dataService.sortAsc"></i>
                  <i class="fa fa-sort-desc" [hide]="!dataService.sortAsc"></i>
                </span>
            </span>
            <span *ngIf="column.resizable" class="column-resize-handle" (mousedown)="resizeColumnStart($event, column, th)"></span>

          </th>

        </tr>
      </thead>
      <tbody *ngIf="!items?.length">
        <tr>
          <td colspan="100%" [innerHtml]="noItemsMsgHtml"></td>
        </tr>
      </tbody>
      <tbody *ngFor="let item of items; let index=index" class="data-table-row-wrapper"
             ui-data-table-row #row [dataTable]="_this" [item]="item" [index]="index" (selectedChange)="onRowSelectChanged(row)">
      </tbody>
      <tbody class="substitute-rows" *ngIf="pagination && substituteRows">
        <tr *ngFor="let item of substituteItems, let index = index"
            [class.row-odd]="(index + items.length) % 2 === 0"
            [class.row-even]="(index + items.length) % 2 === 1">
          <td [hide]="!expandColumnVisible"></td>
          <td [hide]="!indexColumnVisible">&nbsp;</td>
          <td [hide]="!selectColumnVisible"></td>
          <td *ngFor="let column of columns" [hide]="!column.visible">
        </tr>
      </tbody>
    </table>
    <div class="reload-mask" *ngIf="showReloading && dataService.reloading">
      <i class="fa fa-spin fa-spinner"></i>
    </div>
  </div>
</div>
`;
