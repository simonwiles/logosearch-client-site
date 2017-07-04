import { Pipe,
         PipeTransform } from '@angular/core';

@Pipe({ name: 'lrMapToIterable' })
export class MapToIterable implements PipeTransform {
    transform(map: {}, args: any[] = null): any {
        return Object.keys(map)
            .map((key) => ({ 'key': key, 'value': map[key] }));
    }
}
