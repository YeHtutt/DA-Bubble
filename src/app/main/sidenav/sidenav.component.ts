import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from 'src/app/services/channel.service';
import { DirectMessageService } from 'src/app/services/direct-message.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  showSidenav: boolean = true;
  @Input() channel_window: any;

  private subscriptions: Subscription[] = [];

  constructor(
    private Route: ActivatedRoute,
    private router: Router,
    public channelService: ChannelService,
    public directMessageService: DirectMessageService
    ) {}

    //habe alles von channels übernommen das der tree standartmäßig geöffnet ist, klappt aber aus irgendeinem grund noch nicht
    ngOnInit() {
      const sub = this.directMessageService.dataLoaded.subscribe(loaded => {
        if (loaded) {
          this.directMessageService.treeControl.expandAll();
        }
      });
      this.subscriptions.push(sub);
    }



  toggleExpanded(node: any) {
    // Code to toggle the expanded state of the node
    this.channelService.treeControl.toggle(node);
  }


  toggleSidenav() {
    if (this.showSidenav) {
      this.showSidenav = false;
      console.log('true');
    } else {
      this.showSidenav = true;
      console.log('false');
    }
  }
}
