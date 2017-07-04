import { ChangeDetectorRef,
         Component,
         ContentChild,
         ContentChildren,
         EventEmitter,
         Input,
         OnInit,
         Output,
         QueryList,
         TemplateRef,
         ViewChild,
         ViewChildren }             from '@angular/core';

import { trigger,
         state,
         style,
         transition,
         animate,
         keyframes,
         group }                    from '@angular/core';

import { IApiDataService }          from '../../../services/api-data.service.interface';

import { DataTableColumnComponent } from './column.component';
import { DataTableRowComponent }    from './row.component';
import { RowCallback,
         IDataTableLabels }         from './types';
import { TABLE_TEMPLATE }           from './table.template';



@Component({
  selector: 'ui-data-table',
  template: TABLE_TEMPLATE,
  styles: [`
    .data-table-box {
      position: relative;
      transition: height .3s ease;
      overflow-y: hidden;
    }

    .reload-mask {
      background-color: rgba(255, 255, 255, 0.8);
      color: rgba(0, 0, 0, .54);
      font-size: 2em;
      height: 100%;
      position: absolute;
      text-align: center;
      top: 0;
      width: 100%;
    }

    .reload-mask i {
      font-size: 80px;
      margin-top: -40px;
      position: relative;
      top: 50%;
    }
  `]
})
export class DataTableComponent implements OnInit {

  @Input() dataService: IApiDataService;

  get items(): any[] {
    return this.dataService.items;
  }

  get itemCount(): number {
    return this.dataService.itemCount;
  };

  // UI components:
  @ContentChildren(DataTableColumnComponent) columns: QueryList<DataTableColumnComponent>;
  @ViewChildren(DataTableRowComponent) rows: QueryList<DataTableRowComponent>;
  @ContentChild('dataTableExpand') expandTemplate: TemplateRef<any>;
  @ViewChild('dataTable') dataTable;
  @ViewChild('dataTableBox') dataTableBox;

  // One-time optional bindings with default values:
  @Input() autoReload = true;
  @Input() expandableRows = false;
  @Input() header = true;
  @Input() headerTitle: string;
  @Input() indexColumn = true;
  @Input() indexColumnHeader = '';
  @Input() multiSelect = true;
  @Input() pagination = true;
  @Input() rowColors: RowCallback;
  @Input() rowTooltip: RowCallback;
  @Input() selectColumn = false;
  @Input() selectOnRowClick = false;
  @Input() showReloading = false;
  @Input() substituteRows = true;
  @Input() tableClass = '';
  @Input() labels: IDataTableLabels = {
      indexColumn: 'index',
      selectColumn: 'select',
      expandColumn: 'expand'
  };
  @Input() noItemsMsgHtml = 'No Items!';

  @Output() rowClick = new EventEmitter();
  @Output() rowDoubleClick = new EventEmitter();
  @Output() headerClick = new EventEmitter();
  @Output() cellClick = new EventEmitter();

  indexColumnVisible: boolean;
  selectColumnVisible: boolean;
  expandColumnVisible: boolean;

  allExpanded = false;
  selectedRow: DataTableRowComponent;
  selectedRows: DataTableRowComponent[] = [];

  _this = this;

  get selectAllCheckbox() {
    return this._selectAllCheckbox;
  }

  set selectAllCheckbox(value) {
    this._selectAllCheckbox = value;
    this._onSelectAllChanged(value);
  }

  get columnCount() {
    let count = 0;
    count += this.indexColumnVisible ? 1 : 0;
    count += this.selectColumnVisible ? 1 : 0;
    count += this.expandColumnVisible ? 1 : 0;
    this.columns.toArray().forEach(column => {
      count += column.visible ? 1 : 0;
    });
    return count;
  }

  private _selectAllCheckbox = false;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.indexColumnVisible = this.indexColumn;
    this.selectColumnVisible = this.selectColumn;
    this.expandColumnVisible = this.expandableRows;

    this.headerClick.subscribe(tableEvent => this.sortColumn(tableEvent.column));
    if (this.selectOnRowClick) {
      this.rowClick.subscribe(tableEvent => tableEvent.row.selected = !tableEvent.row.selected);
    }

    if (this.autoReload) {
      this.dataService.update();
    }

    this.dataService.updated.subscribe(
      data => {
        //this.changeDetectorRef.markForCheck();
        setTimeout(() => this.dataTableBox.nativeElement.style.height = this.dataTable.nativeElement.scrollHeight + 'px', 0);
      }
    );
  }
  public rowClicked(row: DataTableRowComponent, event) {
    this.rowClick.emit({ row, event });
  }

  public rowDoubleClicked(row: DataTableRowComponent, event) {
    this.rowDoubleClick.emit({ row, event });
  }

  public headerClicked(column: DataTableColumnComponent, event: MouseEvent) {
    this.headerClick.emit({ column, event });
  }

  public cellClicked(column: DataTableColumnComponent, row: DataTableRowComponent, event: MouseEvent) {
    this.cellClick.emit({ row, column, event });
  }

  public sortColumn(column: DataTableColumnComponent) {
    if (column.sortable) {
      let ascending = this.dataService.sortBy === column.property ? !this.dataService.sortAsc : true;
      this.dataService.sortBy = column.property;
      this.dataService.sortAsc = ascending;
    }
  }

  public expandAll() {
    let open = !(this.rows.toArray().every(row => row.expanded ));
    this.rows.toArray().forEach(function(row) {
      row.expanded = open;
    });
    this.allExpanded = open;
  }

  public onRowSelectChanged(row: DataTableRowComponent) {

    // maintain the selectedRow(s) view
    if (this.multiSelect) {
      let index = this.selectedRows.indexOf(row);
      if (row.selected && index < 0) {
        this.selectedRows.push(row);
      } else if (!row.selected && index >= 0) {
        this.selectedRows.splice(index, 1);
      }
    } else {
      if (row.selected) {
        this.selectedRow = row;
      } else if (this.selectedRow === row) {
        this.selectedRow = undefined;
      }
    }

    // unselect all other rows:
    if (row.selected && !this.multiSelect) {
      this.rows.toArray().filter(row_ => row_.selected).forEach(row_ => {
        if (row_ !== row) { // avoid endless loop
          row_.selected = false;
        }
      });
    }
  }

  private _onSelectAllChanged(value: boolean) {
    this.rows.toArray().forEach(row => row.selected = value);
  }

}
