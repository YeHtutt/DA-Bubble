import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-scroll-button',
  templateUrl: './scroll-button.component.html',
  styleUrls: ['./scroll-button.component.scss']
})
export class ScrollButtonComponent {

  @Output() EmitScrollDown = new EventEmitter<void>();
  @Input() chatData: any
  messages: Observable<any> = new Observable()
  private messageSubscription: Subscription = new Subscription();
  messageCount: number = 0;
  newMessageCount: number = 0;
  originMessageCount: number = 0;
  checked: boolean = false;

  constructor(private firestore: Firestore = inject(Firestore)) {

  }

  ngOnInit() {
    this.getMessageLength();
  }

  ngOnDestroy() {
    if (this.messageSubscription) this.messageSubscription.unsubscribe();
  }

  getMessageLength() {
    const collRef = collection(this.firestore, `${this.chatData.chat}/${this.chatData.id}/message`);
    this.messages = collectionData(collRef);
    this.messageSubscription = this.messages.subscribe((message: any) => this.setCounter(message.length));
  }


  setCounter(count: number) {
    if (this.messageCount > count) this.messageCount = 0; // when deleting messages, reset messageCount
    if (this.messageCount == 0) this.messageCount = count; // when first rendered
    if (count > this.messageCount && !this.checked) this.increaseCounter(count);  // when new message comes in 
  }

  increaseCounter(count: number) {
    this.newMessageCount++;
    this.messageCount = count;
    this.checked = true;
    setTimeout(() => this.checked = false, 500);
  }

  scrollDown() {
    this.EmitScrollDown.emit();
    this.newMessageCount = 0;
    this.checked = false;
  }
}
