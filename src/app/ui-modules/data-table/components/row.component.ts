import { ChangeDetectionStrategy,
         Component,
         Input,
         Output,
         EventEmitter,
         OnDestroy }          from '@angular/core';
import { DataTableComponent } from './table.component';


@Component({
  selector: '[ui-data-table-row]',
  template: `
  <tr class="data-table-row"
      [title]="getTooltip()"
      [class.row-odd]="index % 2 === 0"
      [class.row-even]="index % 2 === 1"
      [class.selected]="selected"
      [class.clickable]="dataTable.selectOnRowClick"
      (dblclick)="dataTable.rowDoubleClicked(_this, $event)"
      (click)="dataTable.rowClicked(_this, $event)">

    <td [hide]="!dataTable.expandColumnVisible" (click)="expanded = !expanded; $event.stopPropagation()" class="row-expand-button">
      <i class="fa fa-caret-right" [hide]="expanded"></i>
      <i class="fa fa-caret-down" [hide]="!expanded"></i>
    </td>

    <td [hide]="!dataTable.indexColumnVisible" class="index-column" [textContent]="displayIndex"></td>

    <td [hide]="!dataTable.selectColumnVisible" class="select-column">
      <input type="checkbox" [(ngModel)]="selected"/>
    </td>

    <td *ngFor="let column of dataTable.columns"
        class="data-column"
        [hide]="!column.visible"
        [ngClass]="column.styleClassObject">
      <div *ngIf="!column.cellTemplate"
           [textContent]="item[column.property]">
      </div>
      <div *ngIf="column.cellTemplate"
           [ngTemplateOutlet]="column.cellTemplate"
           [ngOutletContext]="{column: column, row: _this, item: item}">
      </div>
    </td>

  </tr>

  <tr *ngIf="dataTable.expandableRows"
      [hide]="!expanded"
      class="row-expansion">

    <td [attr.colspan]="dataTable.columnCount">
      <div [ngTemplateOutlet]="dataTable.expandTemplate"
           [ngOutletContext]="{row: _this, item: item}">
      </div>
    </td>

  </tr>
  `,
  styles: [`
    .select-column {
        text-align: center;
    }

    .row-expand-button {
        cursor: pointer;
        text-align: center;
    }

    .clickable {
        cursor: pointer;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableRowComponent implements OnDestroy {

  @Input() item: any;
  @Input() index: number;
  @Input() dataTable: DataTableComponent;
  @Output() selectedChange = new EventEmitter();

  _this = this; // FIXME is there no template keyword for this in angular 2?
  expanded: boolean;

  // row selection:

  private _selected: boolean;


  get selected() {
    return this._selected;
  }

  set selected(selected) {
    this._selected = selected;
    this.selectedChange.emit(selected);
  }

  // other:

  get displayIndex() {
    if (this.dataTable.pagination) {
      return this.dataTable.dataService.offset + this.index + 1;
    } else {
      return this.index + 1;
    }
  }

  getTooltip() {
    if (this.dataTable.rowTooltip) {
      return this.dataTable.rowTooltip(this.item, this, this.index);
    }
    return '';
  }

  ngOnDestroy() {
    this.selected = false;
  }

}
