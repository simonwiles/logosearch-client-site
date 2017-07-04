import { NgModule }             from '@angular/core';
import { CommonModule }         from '@angular/common';
import { FormsModule }          from '@angular/forms';

import { DataTableComponent }            from './components/table.component';
import { DataTableColumnComponent }      from './components/column.component';
import { DataTableRowComponent }         from './components/row.component';
import { DataTableHeaderComponent }      from './components/header.component';

import { PixelConverter }       from './utils/px';
import { Hide }                 from './utils/hide';

export * from './components/types';

export { DataTableComponent, DataTableColumnComponent, DataTableRowComponent, DataTableHeaderComponent };
export const DATA_TABLE_DIRECTIVES = [ DataTableComponent, DataTableColumnComponent ];


@NgModule({
  imports: [ CommonModule, FormsModule ],
  declarations: [
    DataTableComponent, DataTableColumnComponent,
    DataTableRowComponent, DataTableHeaderComponent,
    PixelConverter, Hide
  ],
  exports: [ DataTableComponent, DataTableColumnComponent ]
})
export class DataTableModule { }
