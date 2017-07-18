import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';

import { Component,
         Input,
         NgModule }     from '@angular/core';

import { PipesModule }  from './ui-pipes/pipes.module';

import { IApiDataService } from '../services/api-data.service.interface';

@Component({
  selector: 'ui-pagination',
  template: `
  <div class="ui-pagination">
    <label>{{paginationLimitLabel}}</label>

    <input *ngIf="!paginationLimitOptions"
           #limitInput
           type="number" min="1" step="1"
           class="text-style"
           [ngModel]="limit" (blur)="limit = limitInput.value"
           (keyup.enter)="limit = limitInput.value" (keyup.esc)="limitInput.value = limit"/>

    <select *ngIf="paginationLimitOptions" [(ngModel)]="limit">
      <option *ngFor="let limitOption of paginationLimitOptions"
              [value]="limitOption">{{limitOption}}</option>
    </select>


    <span class="pagination-range">
      {{dataService.offset + 1}}-{{rangeEnd}}
      of {{dataService.itemCount | uiFormatThousands}}
    </span>


    <button class="text-style"
            [disabled]="!dataService.hasPreviousPage()"
            (click)="dataService.toFirstPage()">
      <i class="fa fa-angle-double-left"></i>
    </button>
    <button class="text-style"
            [disabled]="!dataService.hasPreviousPage()"
            (click)="dataService.toPreviousPage()">
       <i class="fa fa-angle-left"></i>
    </button>

    <input #pageInput
           type="number" min="1" step="1" max="{{dataService.lastPage}}"
           class="text-style"
           [ngModel]="page"
           (blur)="page = pageInput.value"
           (keyup.enter)="page = pageInput.value"
           (keyup.esc)="pageInput.value = page">
    of {{dataService.lastPage}}
    <button class="text-style"
            [disabled]="!dataService.hasNextPage()"
            (click)="dataService.toNextPage()">
       <i class="fa fa-angle-right"></i>
    </button>
    <button class="text-style"
            [disabled]="!dataService.hasNextPage()"
            (click)="dataService.toLastPage()">
       <i class="fa fa-angle-double-right"></i>
    </button>
  </div>
  `,
  styles: [`
    .ui-pagination {
      float: right;
      margin: 10px 0;
    }
    .pagination-range {
      margin: 0 2em;
    }
    label {
      margin-right: 1em;
    }
  `]
})
export class PaginationComponent {

  @Input() dataService: IApiDataService;
  @Input() paginationLimitOptions: number[];
  @Input() paginationLimitLabel = 'Results per page:';


  get limit(): number {
    return this.dataService.limit;
  }

  set limit(value) {
    this.dataService.limit = Number(<any>value); // TODO better way to handle that value of number <input> is string?
  }

  get page(): number {
    return this.dataService.page;
  }

  set page(value) {
    this.dataService.page = Number(<any>value);
  }

  get rangeEnd(): number {
    return Math.min(this.dataService.offset + this.dataService.limit, this.dataService.itemCount);
  }
}

@NgModule({
    imports: [CommonModule, FormsModule, PipesModule],
    exports: [PaginationComponent],
    declarations: [PaginationComponent]
})
export class PaginationModule { }
