import { Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.scss']
})
export class EmojiPickerComponent {

  @Output() emojiSelectedEvent = new EventEmitter<string>();

  constructor() {}


  /**
  * Handles the selection of an emoji. Emits the selected emoji through the emojiSelectedEvent emitter.
  * @param {any} event - The event object containing the selected emoji.
  */
  emojiSelected(event: any) {
    this.emojiSelectedEvent.emit(event.emoji.native);
  }
}