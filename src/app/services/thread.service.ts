import { Injectable } from '@angular/core';
import { Message } from '../models/message';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {

  constructor() { }

  threadIsOpen: boolean = true;

  private _message = new BehaviorSubject<Message>(new Message());
  message$ = this._message.asObservable();

  openThread(message: Message) {
    this.threadIsOpen = true;
    this._message.next(message);
  }

  closeThread() {
    this.threadIsOpen = false;
  }
}
