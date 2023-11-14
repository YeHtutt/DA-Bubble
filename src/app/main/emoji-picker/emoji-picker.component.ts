import { Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.scss']
})
export class EmojiPickerComponent {

  @Output() emojiSelectedEvent = new EventEmitter<string>();

  constructor() {}

  emojiSelected(event: any) {
    this.emojiSelectedEvent.emit(event.emoji.native);
  }

}
