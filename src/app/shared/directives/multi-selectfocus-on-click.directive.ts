import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appMultiSelectfocusOnClick]'
})
export class MultiSelectfocusOnClickDirective {

  constructor(private elementRef: ElementRef) {
  }

  @HostListener('click', ['$event.target'])
  onClick(btn) {
    console.log(">> btn", btn)
    const input = this.elementRef.nativeElement.querySelector(
      '.filter-textbox > input'
    );
    if (input) {
      input.focus();
    }
  }

}
