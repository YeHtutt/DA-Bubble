import { Component, Input } from '@angular/core';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-scroll-button',
  templateUrl: './scroll-button.component.html',
  styleUrls: ['./scroll-button.component.scss']
})
export class ScrollButtonComponent {

  @Input() messageCount: any 

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    
  }

}
