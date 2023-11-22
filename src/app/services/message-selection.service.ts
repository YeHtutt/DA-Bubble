import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageSelectionService {

  private selectedMessageIdSource = new BehaviorSubject<string | null>(null);
  selectedMessageId$ = this.selectedMessageIdSource.asObservable();

  constructor() { }

  selectMessage(id: string) {
    this.selectedMessageIdSource.next(id);
  }
}
