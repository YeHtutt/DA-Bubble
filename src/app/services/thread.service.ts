import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {

  constructor() { }

  threadIsOpen: boolean = false;


  openThread(messageId: string) {
    this.threadIsOpen = true;
    
  }


}
