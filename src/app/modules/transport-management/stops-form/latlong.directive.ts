import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: "[appLatLongDirective]"
})
export class LatLongDirective {
  // Allow decimal numbers and negative values
  private regex: RegExp = new RegExp(/^\d{0,3}\.?\d{0,8}$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = [
    "Backspace",
    "Tab",
    "End",
    "Home",
    "-",
    ".",
    "ArrowLeft",
    "ArrowRight",
    "Del",
    "Delete"
  ];

  constructor(private el: ElementRef) {}
  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.value;
    const position = this.el.nativeElement.selectionStart;
    const next: string = [
      current.slice(0, position),
      event.key == "Decimal" ? "." : event.key,
      current.slice(position)
    ].join("");

    const beforeDecimal: any = next.toString().split(".")[0];
    const AfterDecimal: any = next.toString().split(".")[1];
    const checkDotFirstPosition: string = next.toString().substring(0, 2);

    if (next === "00000") {
      event.preventDefault();
    }
    if (checkDotFirstPosition === ".") {
      event.preventDefault();
    }
    if (beforeDecimal) {
        if (beforeDecimal.toString().length > 3) {
          event.preventDefault();
        }
    }
    if (AfterDecimal) {
      if (AfterDecimal.toString().length >= 8) {
        event.preventDefault();
      }
    }
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}
