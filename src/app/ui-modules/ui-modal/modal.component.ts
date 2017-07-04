import { Component,
         EventEmitter,
         Input,
         Output,
         ViewChild }            from '@angular/core';

import { animate,
         state,
         style,
         transition,
         trigger }              from '@angular/core';


@Component({
  selector: 'ui-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateX(0)'})),
      transition('void => *', [
        style({transform: 'translateX(-100%)'}),
        animate(100)
      ]),
      transition('* => void', [
        animate(100, style({transform: 'translateX(100%)'}))
      ])
    ])
  ]
})
export class ModalComponent {

  @Input() appendTo: any;
  @Input() displayed: boolean;
  @Input() styleClass: string;
  @Input() showCloseButton = true;

  @Output() onBeforeDisplay: EventEmitter<any> = new EventEmitter();
  @Output() onAfterDisplay: EventEmitter<any> = new EventEmitter();
  @Output() onBeforeRemove: EventEmitter<any> = new EventEmitter();
  @Output() onAfterRemove: EventEmitter<any> = new EventEmitter();

  @ViewChild('mask') mask;
  @ViewChild('wrapper') wrapper;

  displayModal() {
    if (!this.displayed) {
      this.onBeforeDisplay.emit(null);
      this.displayed = true;
      setTimeout(() => document.body.appendChild(this.mask.nativeElement));
      this.onAfterDisplay.emit(null);
    }
  }

  removeModal() {
    if (this.displayed) {
      this.onBeforeRemove.emit(null);
      this.displayed = false;
      this.onAfterRemove.emit(null);
    }
  }

  maskClicked($event) {
    if ($event.target === this.mask.nativeElement) {
      this.removeModal();
    }
  }

}
