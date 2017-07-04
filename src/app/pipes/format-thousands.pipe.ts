import { Pipe,
         PipeTransform } from '@angular/core';

@Pipe({ name: 'uiFormatThousands' })
export class FormatThousands implements PipeTransform {
  transform(value: number): string {
    if (value !== undefined) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }
}
