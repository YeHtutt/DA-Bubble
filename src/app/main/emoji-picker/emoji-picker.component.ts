import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.scss']
})
export class EmojiPickerComponent {

  @Output() emojiSelectedEvent = new EventEmitter<string>();

  constructor(private elRef: ElementRef) {}

  emojiSelected(event: any) {
    this.emojiSelectedEvent.emit(event.emoji.native);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      console.log('click auserhalb')
      
    }
  }

}
