import { Component,
         Input }              from '@angular/core';

import { SubjectArea }        from '../models/sample';
import { SamplesListService } from '../services/samples-list.service';


@Component({
  selector: 'lr-samples-cards',
  template: `
  <div class="pagination ui-helper-clearfix">
    <ui-pagination [dataService]="samplesListService"
                   paginationLimitLabel="Samples per page:"
                   [paginationLimitOptions]="[4, 10, 20]">
    </ui-pagination>
  </div>
  <div class="cards ui-helper-clearfix">

    <div *ngFor="let sample of samplesListService.items" class="sample-display mini-panel">
      <table>
        <tr>
          <td><strong>Subject Area:</strong>
            <ul class="pills">
              <li *ngFor="let subjectArea of sample.subjectArea"
                  class="clickable"
                  (click)="filterSubjectArea(subjectAreas[subjectArea].key)">
                {{subjectAreas[subjectArea].label}}
              </li>
            </ul>
          </td>
          <td><strong># Students:</strong><br>{{sample?.students.length}}</td>
          <td><strong># Turns:</strong><br>{{sample.numTurns}}</td>
        </tr>
      </table>
      <hr>
      <div class="context">{{sample?.context}}</div>
      <hr>
      <p class="submission-details">
        Submitted by
        <a [routerLink]="['/user', sample?.submittedBy.uuid]">{{sample?.submittedBy.displayName}}</a>
        on
        <span>{{sample?.submittedAt | date}}</span>
      </p>
    </div>


    <div *ngIf="!samplesListService.items.length" [innerHtml]="noItemsMsgHtml"></div>

    <div class="reload-mask" *ngIf="samplesListService.reloading">
      <i class="fa fa-spin fa-spinner"></i>
    </div>
  </div>

  `,
  styles: [`
    .pagination { width: 100%; padding-right: 15%; }

    .cards {
      position: relative;
      min-height: 200px;
      margin: 0 5%;
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
export class SamplesCardsComponent {

  @Input() noItemsMsgHtml = '<p class="no-items-msg">No samples found that match the current criteria!</p>';

  public subjectAreas = SubjectArea;

  constructor(public samplesListService: SamplesListService) { }
}

