import { Directive, ElementRef, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Directive({ selector: '[chartJs]' })
export class ChartJsDirective {

  @Input() title: string;
  @Input() data: any;
  @Input() datasets: any;
  @Input() labels: any;
  @Input() options: any;
  @Input() type: string;
  @Input() legend: boolean|any;

  private chart: any;
  private ctx: any;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.ctx = this.el.nativeElement.getContext('2d');
    this.chart = this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.ctx) {
      // Check if the changes are in the data or datasets
      if (changes.hasOwnProperty('datasets')) {
        if (this.chart.data.datasets[0]) {
          for (let i=0, il=this.chart.data.datasets[0].data.length; i < il; i++) {
            this.chart.data.datasets[0].data[i] = changes['datasets'].currentValue[0].data[i];
          }
        } else {
          this.chart.data.datasets = changes['datasets'].currentValue;
        }
      }
      if (changes.hasOwnProperty('labels')) {
        this.chart.data.labels = changes['labels'].currentValue;
      }
      this.chart.update();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = void 0;
    }
  }

  public buildChart(): any {
    let options: any = Object.assign({}, this.options);
    if (this.legend !== null) {
      if (typeof this.legend === 'boolean') {
        options.legend = {display: this.legend};
      } else {
        options.legend = this.legend;
      }
    }

    // // hock for onHover and onClick events
    // options.hover = options.hover || {};
    // if (!options.hover.onHover) {
    //   options.hover.onHover = (active:Array<any>) => {
    //     if (active && !active.length) {
    //       return;
    //     }
    //     this.chartHover.emit({active});
    //   };
    // }

    // if (!options.onClick) {
    //   options.onClick = (event:any, active:Array<any>) => {
    //     this.chartClick.emit({event, active});
    //   };
    // }

    let opts: any = {
      type: this.type,
      data: {
        labels: this.labels,
        datasets: this.datasets
      },
      options: options
    };

    if (this.title) {
      opts.options.title = {
        display: true,
        text: this.title
      }
    }
    return new window.Chart(this.ctx, opts);
}



  updateChartData(newDataValues: number[] | any[]): void {
    if (Array.isArray(newDataValues[0].data)) {
      this.chart.data.datasets.forEach((dataset: any, i: number) => {
        dataset.data = newDataValues[i].data;

        if (newDataValues[i].label) {
          dataset.label = newDataValues[i].label;
        }
      });
    } else {
      this.chart.data.datasets[0].data = newDataValues;
    }
  }

  private refresh():any {
    // if (this.options && this.options.responsive) {
    //   setTimeout(() => this.refresh(), 50);
    // }
    // todo: remove this line, it is producing flickering
    this.ngOnDestroy();
    this.chart = this.buildChart();
}

  // buildChart() {


  //   var myChart = new window.Chart(this.ctx, {
  //       type: this.type,
  //       data: this.data,
  //       options: this.options
  //   });


  // }

}
