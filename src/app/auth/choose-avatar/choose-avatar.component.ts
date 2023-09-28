import { Component } from '@angular/core';

@Component({
  selector: 'app-choose-avatar',
  templateUrl: './choose-avatar.component.html',
  styleUrls: ['./choose-avatar.component.scss']
})
export class ChooseAvatarComponent {
  avatars = ['avatar1.png','avatar2.png','avatar3.png','avatar4.png','avatar5.png','avatar6.png' ];
}
