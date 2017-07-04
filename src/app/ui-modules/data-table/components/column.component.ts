import { ContentChild,
         Component,
         Input,
         OnInit }       from '@angular/core';

import { CellCallback } from './types';


@Component({
  selector: 'ui-data-table-column',
  template: ''
})
export class DataTableColumnComponent implements OnInit {

  @Input() header: string;
  @Input() sortable = false;
  @Input() resizable = false;
  @Input() property: string;
  @Input() styleClass: string;
  @Input() cellColors: CellCallback;

  @Input() width: string;
  @Input() visible = true;

  @ContentChild('dataTableCell') cellTemplate;
  @ContentChild('dataTableHeader') headerTemplate;

  private styleClassObject = {};

  ngOnInit() {
    if (!this.styleClass && this.property) {
      this.styleClass = 'column-' + this.property.replace(/[^a-zA-Z0-9_]/g, '');
    }

    if (this.styleClass != null) {
      this.styleClassObject = {
        [this.styleClass]: true
      };
    }
  }
}
