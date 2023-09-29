import { Component, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from 'src/app/services/channel.service';
import { DirectMessageService } from 'src/app/services/direct-message.service';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  showSidenav: boolean = true;
  @Input() channel_window: any;
  // @ViewChild('tree') tree:any;

  constructor(
    private Route: ActivatedRoute,
    private router: Router,
    public channelService: ChannelService,
    public directMessageService: DirectMessageService
    ) {}

    // ngAfterViewInit() {
    //   this.directMessageService.treeControl.expandAll();
    // }

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
