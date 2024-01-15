import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { MessageSelectionService } from 'src/app/shared/services/message-selection.service';


/**
* Component for displaying and managing a scroll button.
* This component handles the functionality related to scrolling through messages,
* including tracking new messages and emitting events to trigger scrolling actions.
*/
@Component({
  selector: 'app-scroll-button',
  templateUrl: './scroll-button.component.html',
  styleUrls: ['./scroll-button.component.scss']
})
export class ScrollButtonComponent {

  /**
  * Event emitter for when the scroll down action is triggered.
  */
  @Output() EmitScrollDown = new EventEmitter<void>();

  /**
  * Input for chat data, including the collection path for messages.
  */
  @Input() chatData: any;

  /**
  * Observable for retrieving messages from Firestore.
  */
  messages: Observable<any> = new Observable();

  /**
  * Subscription to the messages Observable.
  */
  private messageSubscription: Subscription = new Subscription();


  /**
  * Total count of messages.
  */
  messageCount: number = 0;

  /**
  * Count of new messages since last reset or scroll down action.
  */
  newMessageCount: number = 0;

  /**
  * Count of messages when the component was initialized.
  */
  originMessageCount: number = 0;

  /**
  * Flag to indicate if a new message has been checked.
  */
  checked: boolean = false;

  /**
   * Subscription to message selection events.
   */

  messageSelectionSub: Subscription = new Subscription();
  /**
  * Flag to reset new message count.
  */
  reset: boolean = false;


  constructor(
    private firestore: Firestore = inject(Firestore),
    private mss: MessageSelectionService
  ) { }


  ngOnInit() {
    this.getMessageLength();
    this.messageSelectionSub = this.mss.selectedMessageId$.subscribe(id => {
      if (id) {
        this.resetNewMessageCount();
        this.reset = true;
      }
    });
  }


  ngOnDestroy() {
    if (this.messageSubscription) this.messageSubscription.unsubscribe();
  }


  resetNewMessageCount() {
    this.newMessageCount = 0;
  }


  getMessageLength() {
    const collRef = collection(this.firestore, `${this.chatData.collPath}`);
    this.messages = collectionData(collRef);
    this.messageSubscription = this.messages.subscribe((message: any) => this.setCounter(message.length));
  }


  /**
  * Sets the message counter based on the current message count.
  * @param {number} count - The current count of messages.
  */
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
    if (this.reset) {
      this.resetNewMessageCount();
      this.reset = false;
    }
  }


  scrollDown() {
    this.EmitScrollDown.emit();
    this.newMessageCount = 0;
    this.checked = false;
  }
}