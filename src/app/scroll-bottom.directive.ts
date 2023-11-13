import { Directive, ElementRef, Input, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appScrollBottom]'
})
export class ScrollBottomDirective {

  @Input() appScrollBottom?: any[];
  @Input() currentChat?: string;
  private lastItemCount = 0;

  constructor(private elementRef: ElementRef) {}

  // ngAfterViewChecked() {
  //   if (this.appScrollBottom && this.appScrollBottom.length > this.lastItemCount) {
  //     this.scrollToBottom();
  //     this.lastItemCount = this.appScrollBottom.length;
  //   }
  // }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentChat']) {
      this.lastItemCount = 0;
      this.scrollToBottom();
    }
    this.checkScroll();
  }

  private checkScroll() {
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
