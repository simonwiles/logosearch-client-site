import { DataTableRowComponent } from './row.component';
import { DataTableColumnComponent } from './column.component';


export type RowCallback = (item: any, row: DataTableRowComponent, index: number) => string;

export type CellCallback = (item: any, row: DataTableRowComponent, column: DataTableColumnComponent, index: number) => string;

// export type HeaderCallback = (column: DataTableColumn) => string;




export interface DataTableParams {
    offset?: number;
    limit?: number;
    sortBy?: string;
    sortAsc?: boolean;
}


export interface IDataTableLabels {
  indexColumn: string;
  selectColumn: string;
  expandColumn: string;
}
