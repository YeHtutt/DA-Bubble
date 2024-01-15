import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';


/**
 * Directive to detect clicks outside of an element.
 * When a click is detected outside the host element, an event is emitted.
 * 
 * @Directive Decorator that declares a directive and specifies its CSS selector.
 */
@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {

  /**
  * Event emitter that emits an event when a click occurs outside the host element.
  */
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) { }
 

  /**
  * Host listener for the 'click' event on the document. Emits the `clickOutside` event
  * when a click occurs outside the host element.
  * 
  * @param {HTMLElement} targetElement - The HTML element that was clicked.
  */
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement: HTMLElement): void {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}