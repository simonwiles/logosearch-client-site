import { Component,
         Input }                      from '@angular/core';

import { SamplesListService }         from '../services/samples-list.service';


@Component({
  selector: 'lr-samples-carousel',
  templateUrl: './samples-carousel.component.html',
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
export class SamplesCarouselComponent {

  @Input() noItemsMsgHtml = '<p class="no-items-msg">There are no samples to show!</p>';

  containerClass = 'flip-in-left';
  nextClass: string;
  sample: any = this.samplesListService.selectedItem;
  sampleIndex: Number = 1;

  constructor(
    public samplesListService: SamplesListService) {

    this.samplesListService.updated.subscribe(
      () => {
        // hacky...
        // better would be a single flip-out/flip-in class, and probably
        //  picking up samplesListService.loading to fade out, or display a mask or something
        this.containerClass = 'flip-out-left';
        setTimeout(() => this.containerClass = 'flip-in-right', 200);
      }
    );

    this.samplesListService.newItem.subscribe(
      (item) => {
        this.containerClass = this.nextClass;
        this.sample = item;
        this.sampleIndex = this.samplesListService.offset + this.samplesListService.selectedItemIndex + 1;
      }
    );
  }

  previousSample(): void {
    this.containerClass = 'flip-out-left';
    this.nextClass = 'flip-in-right';
    setTimeout(() => this.samplesListService.previousItem(), 200);
  }

  nextSample(): void {
    this.containerClass = 'flip-out-right';
    this.nextClass = 'flip-in-left';
    setTimeout(() => this.samplesListService.nextItem(), 200);
  }

}

