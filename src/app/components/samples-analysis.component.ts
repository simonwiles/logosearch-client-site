import { Component,
         Input }                      from '@angular/core';

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
  `]
})

export class SamplesAnalysisComponent {
  constructor() { }
}

