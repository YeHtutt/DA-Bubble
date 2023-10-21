
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ThreadService } from 'src/app/services/thread.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-threads',
  templateUrl: './threads.component.html',
  styleUrls: ['./threads.component.scss']
})
export class ThreadsComponent {

  currentId: string = '';
  messageCreator: any;
  message: any;
  private subscriptions = new Subscription();




  constructor(private route: ActivatedRoute,
    public threadService: ThreadService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      let channelId = params['channelId'];
      let chatId = params['chatId'];
      if (channelId) this.currentId = channelId;
      else if (chatId) this.currentId = chatId;
    });

    this.subscriptions.add(
      this.threadService.message$.subscribe(message => {
        this.messageCreator = message.user;
        this.message = message
      })
    );
  }



  getTimeOfDate(time: string) { 
    
  }

}
