
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ThreadService } from 'src/app/services/thread.service';

@Component({
  selector: 'app-threads',
  templateUrl: './threads.component.html',
  styleUrls: ['./threads.component.scss']
})
export class ThreadsComponent {


  currentId: string = ''

  constructor(private route: ActivatedRoute,
    public ThreadService : ThreadService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      let channelId = params['channelId'];
      let chatId = params['chatId'];
      if (channelId) this.currentId = channelId;
      else if (chatId) this.currentId = chatId;
    });
  }



}
