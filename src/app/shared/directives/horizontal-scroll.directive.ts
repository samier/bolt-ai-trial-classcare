import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appHorizontalScroll]'
})
export class HorizontalScrollDirective {
  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (event.deltaY !== 0) {
      event.preventDefault();
      this.el.nativeElement.scrollLeft += event.deltaY;
    }
  }
}
