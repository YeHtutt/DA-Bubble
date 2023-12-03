import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { MessageSelectionService } from 'src/app/services/message-selection.service';

@Component({
  selector: 'app-scroll-button',
  templateUrl: './scroll-button.component.html',
  styleUrls: ['./scroll-button.component.scss']
})
export class ScrollButtonComponent {


  @Output() EmitScrollDown = new EventEmitter<void>();
  @Input() chatData: any;
  messages: Observable<any> = new Observable();
  private messageSubscription: Subscription = new Subscription();
  messageCount: number = 0;
  newMessageCount: number = 0;
  originMessageCount: number = 0;
  checked: boolean = false;
  messageSelectionSub: Subscription = new Subscription();
  reset: boolean = false;


  constructor(
    private firestore: Firestore = inject(Firestore), 
    private mss: MessageSelectionService
    ) {}
    

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
    if(this.reset) {
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