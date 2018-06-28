import { ChangeDetectorRef,
         Component,
         Input }              from '@angular/core';

import { Language }           from '../models/common';
import { Sample,
         SubjectArea }        from '../models/sample';
import { Gender,
         GradeLevel }         from '../models/participants';

import { ApiService }         from '../services/api.service';

@Component({
  selector: 'lr-samples-analysis',
  templateUrl: './samples-analysis.component.html',
  styles: [`
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

    hr { clear: both; margin: 20px 0; }
  `]
})

export class SamplesAnalysisComponent {

  @Input() parentComponent: any;

  public chartJsLoaded = false;
  public stats: any;
  public analysis: any;
  public reloading = false;
  public reloadingTimer = 0;

  private ulColors = {
    cardinal: '#8c1515',
    teal: '#007c92',
    darkGrey: '#4d4f53',
    gold: '#eaab00',
    blue: '#0098d8',
    green: '#009b76',
  }

  public chartData: any = {
    subjectArea: {
      datasets: [{
        data: [],
        backgroundColor: this.ulColors.cardinal
      }],
      labels: [],
      options: {maintainAspectRatio: false}
    },
    hasRecording: {
      datasets: [{
        data: [],
        backgroundColor: Object.values(this.ulColors)
      }],
      labels: ['yes', 'no'],
      options: {responsive: true, maintainAspectRatio: false}
    },
    hasElls: {
      datasets: [{
        data: [],
        backgroundColor: Object.values(this.ulColors)
      }],
      labels: ['all', 'some', 'none'],
      options: {responsive: false, maintainAspectRatio: false}
    },
    adultsByGender: {
      datasets: [{
        data: [],
        backgroundColor: Object.values(this.ulColors)
      }],
      labels: ['female', 'male', 'other', 'unknown'],
      options: {responsive: true, maintainAspectRatio: false}
    },
    studentsByGender: {
      datasets: [{
        data: [],
        backgroundColor: Object.values(this.ulColors)
      }],
      labels: ['female', 'male', 'other', 'unknown'],
      options: {responsive: true, maintainAspectRatio: false}
    },
    studentsByGradeLevel: {
      datasets: [{
        data: [],
        backgroundColor: this.ulColors.cardinal
      }],
      labels: [],
      options: {maintainAspectRatio: false}
    },
  }


  private subjectAreas = SubjectArea;
  // FIXME: the whole system of grade-level keys (and subject areas too)
  //        needs to be overhauled, and then this won't be necessary,
  //        but, in the interests of a quick fix...
  // private gradeLevels = GradeLevel;
  private gradeLevels = new Map();

  constructor(
    private apiService: ApiService,
    private changeDetectorRef: ChangeDetectorRef) {

    this.gradeLevels.set('unknownElementary', 'Unknown (Elementary)');
    this.gradeLevels.set('unknownMiddleschool', 'Unknown (Middle School)');
    this.gradeLevels.set('unknownHighschool', 'Unknown (High School)');
    this.gradeLevels.set('unknown', 'Unknown');
    this.gradeLevels.set('preK', 'Pre-Kindergarden');
    this.gradeLevels.set('k', 'Kindergarden');
    this.gradeLevels.set('one', 'First Grade');
    this.gradeLevels.set('two', 'Second Grade');
    this.gradeLevels.set('three', 'Third Grade');
    this.gradeLevels.set('four', 'Fourth Grade');
    this.gradeLevels.set('five', 'Fifth Grade');
    this.gradeLevels.set('six', 'Sixth Grade');
    this.gradeLevels.set('seven', 'Seventh Grade');
    this.gradeLevels.set('eight', 'Eighth Grade');
    this.gradeLevels.set('nine', 'Ninth Grade');
    this.gradeLevels.set('ten', 'Tenth Grade');
    this.gradeLevels.set('eleven', 'Eleventh Grade');
    this.gradeLevels.set('twelve', 'Twelfth Grade');
    this.gradeLevels.set('twelvePlus', 'Beyond Twelfth Grade');

    this.chartData.studentsByGradeLevel.labels = Array.from(this.gradeLevels.values());

  }

  ngOnInit() {

    // load the Dropbox script
    if (!window.Chart) {
      const chartJsScriptTag = document.createElement('script');
      chartJsScriptTag.type = 'text/javascript';
      chartJsScriptTag.src = '//cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.min.js';
      chartJsScriptTag.addEventListener('load', () => {

        // window.Chart.plugins.register({
        //   afterDatasetsDraw: function(chart) {
        //     var ctx = chart.ctx;

        //     chart.data.datasets.forEach(function(dataset, i) {
        //       var meta = chart.getDatasetMeta(i);
        //       if (!meta.hidden) {
        //         meta.data.forEach(function(element, index) {
        //           // Draw the text in black, with the specified font
        //           ctx.fillStyle = 'rgb(0, 0, 0)';

        //           var fontSize = 18;
        //           var fontStyle = 'normal';
        //           var fontFamily = "'Roboto', sans-serif";
        //           ctx.font = window.Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
        //           // ctx.font = "normal 20px 'Roboto Slab', Helvetica Neue', 'Helvetica', 'Arial', sans-serif"

        //           // Just naively convert to string for now
        //           var dataString = dataset.data[index].toString();

        //           // Make sure alignment settings are correct
        //           ctx.textAlign = 'center';
        //           ctx.textBaseline = 'middle';

        //           var padding = 5;
        //           var position = element.tooltipPosition();
        //           ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
        //         });
        //       }
        //     });
        //   }
        // });

        this.chartJsLoaded = true;

      });
      document.body.appendChild(chartJsScriptTag);
    } else {
      this.chartJsLoaded = true;
    }

    this.parentComponent.filtersUpdated.debounceTime(200).subscribe(
      filters => {
        this.reloading = true;
        this.updateStats();
      }
    );

    this.updateStats();

  }


  mapAndSortDict(dict) {
    // map dict of form {'a': 1, 'b': 2 ...} to [{'label': 'a', 'count': 1}, {'label': 'b', 'count': 2} ...]
    //  and sort on 'count'
    //return Object.keys(dict).map(_ => ({ count: dict[_], label: _ })).sort((a, b) => a.count == b.count ? 0 : +(a.count < b.count) || -1)
    return Object.keys(dict).map(_ => ({ count: dict[_], label: _ })).sort((a, b) => a.label.localeCompare(b.label))
  }

  mapSubjectAreaStatistics(data) {
    const subjectArea = this.mapAndSortDict(data.subjectArea);

    this.chartData.subjectArea.labels = subjectArea.map(obj => this.subjectAreas[obj.label].label);
    this.chartData.subjectArea.datasets = [{
      data: subjectArea.map(obj => obj.count),
      backgroundColor: this.ulColors.cardinal
    }];
  }

  mapHasRecordingStatistics(data) {
    this.chartData.hasRecording.datasets = [{
      data: [data.hasRecording.yes, data.hasRecording.no],
      backgroundColor: Object.values(this.ulColors)
    }];
  }

  mapHasEllsStatistics(data) {
    this.chartData.hasElls.datasets = [{
      data: [data.ells.all, data.ells.some, data.ells.none],
      backgroundColor: Object.values(this.ulColors)
    }];
  }

  mapAdultsStatistics(data) {
    this.chartData.adultsByGender.datasets = [{
      data: [
        data.participants.adults.gender.female,
        data.participants.adults.gender.male,
        data.participants.adults.gender.other,
        data.participants.adults.gender.unknown
      ],
      backgroundColor: Object.values(this.ulColors)
    }];
  }

  mapStudentsStatistics(data) {
    this.chartData.studentsByGender.datasets = [{
      data: [
        data.participants.students.gender.female,
        data.participants.students.gender.male,
        data.participants.students.gender.other,
        data.participants.students.gender.unknown
      ],
      backgroundColor: Object.values(this.ulColors)
    }];

    this.chartData.studentsByGradeLevel.datasets = [{
      data: Array.from(this.gradeLevels.keys()).map(key => data.participants.students.gradeLevel[key]),
      backgroundColor: this.ulColors.cardinal
    }];
  }

  updateStats() {
    this.apiService.getSampleStats(this.parentComponent.filters).subscribe(
      data => {
        this.parentComponent.itemCount = data.count;
        this.parentComponent.itemTotal = data.total;
        this.mapSubjectAreaStatistics(data);
        this.mapHasRecordingStatistics(data);
        this.mapHasEllsStatistics(data);
        this.mapAdultsStatistics(data);
        this.mapStudentsStatistics(data);
        this.stats = data;
        this.analysis = null;
        this.changeDetectorRef.detectChanges();
        this.reloading = false;
      }
    );
  }

  getAnalysis() {
    this.reloading = true;
    this.reloadingTimer = 0;
    let startTime = Math.floor(Date.now() / 1000);
    let timer = setInterval(() => {
      this.reloadingTimer = Math.floor(Date.now() / 1000) - startTime;
      //++this.reloadingTimer;
    }, 100);

    this.apiService.getSampleAnalysis(this.parentComponent.filters).subscribe(
      data => {
        clearInterval(timer);
        this.analysis = data;
        this.changeDetectorRef.detectChanges();
        this.reloading = false;
      }
    );
  }
}

