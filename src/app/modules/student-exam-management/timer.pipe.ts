import { Pipe, PipeTransform } from '@angular/core';
import { interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Pipe({
  name: 'timer'
})

export class TimerPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    const futureDate = new Date(value).getTime();
    const interval$ = interval(1000);
    return interval$.pipe(
      map(() => {
        const remainingTime = futureDate - Date.now();
        if (remainingTime <= 0) {
          return '00:00:00';
        } else {
          const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
          const seconds = Math.floor((remainingTime / 1000) % 60);
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
      }),
      takeWhile((countdown) => countdown !== '00:00:00')
    );
  }

}
