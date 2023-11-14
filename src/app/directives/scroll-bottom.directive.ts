import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appScrollBottom]'
})
export class ScrollBottomDirective {

  @Input() appScrollBottom?: any[];
  private lastItemCount = 0;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewChecked() {
    if (this.appScrollBottom && this.appScrollBottom.length > this.lastItemCount) {
      this.scrollToBottom();
      this.lastItemCount = this.appScrollBottom.length;
    }
  }

  private scrollToBottom(): void {
    const element = this.elementRef.nativeElement;
    element.scrollTop = element.scrollHeight;
  }

}
