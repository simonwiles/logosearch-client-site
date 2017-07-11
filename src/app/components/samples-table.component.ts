import { Component,
         ElementRef,
         ViewChildren,
         Input,
         QueryList }          from '@angular/core';

import { IDataTableLabels }   from '../ui-modules/data-table/components/types';

import { SubjectArea }        from '../models/sample';
import { SamplesListService } from '../services/samples-list.service';


@Component({
  selector: 'lr-samples-table',
  templateUrl: './samples-table.component.html',
  styles: [`
  >>> .samples-list-table {
    width: 100%;
  }
  `]
})
export class SamplesTableComponent {

  @Input() parentComponent: any;
  @Input() noItemsMsgHtml = '<p class="no-items-msg">No samples found that match the current criteria!</p>';

  public subjectAreas = SubjectArea;

  @ViewChildren('subjectAreaList') subjectAreaLists: QueryList<ElementRef>;

  labels: IDataTableLabels = {
    indexColumn: 'Index column',
    expandColumn: 'Expand column',
    selectColumn: 'Select column'
  };


  constructor(
    public samplesListService: SamplesListService) { }

  switchToCarousel(sample) {
    this.samplesListService.selectedItem = sample;
    this.parentComponent.displayType = 'carousel';
  }

}
