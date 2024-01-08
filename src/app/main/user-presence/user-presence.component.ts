import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { PresenceService } from 'src/app/shared/services/presence.service';


/**
* Component for displaying user presence status.
* This component subscribes to the presence service to reflect the real-time presence status of a user.
* It can be configured to show a minimized view and is reactive to changes in the user's ID.
*/
@Component({
  selector: 'app-user-presence',
  templateUrl: './user-presence.component.html',
  styleUrls: ['./user-presence.component.scss']
})
export class UserPresenceComponent {

  /**
  * A BehaviorSubject to manage the stream of user IDs. It ensures the component reacts to changes in the user's ID.
  */
  private userIDSource = new BehaviorSubject<string>('');
  /**
  * An Input property to indicate if the component should be displayed in a minimized view.
  */
  @Input() mini: boolean = false;
  /**
  * An Input setter for the user's ID. It updates the userIDSource BehaviorSubject.
  * @param {string} value - The user's ID to set.
  */
  @Input() set userID(value: string) {
    this.userIDSource.next(value);
  }
  /**
  * Indicates whether presence data is unavailable.
  */
  noPresence: boolean = false;


  /**
  * An Observable to track the presence status of a user.
  */
  presence$?: Observable<any>;


  /**
  * Constructs the UserPresenceComponent instance.
  * @param {PresenceService} presence - Service for managing user presence.
  */
  constructor(private presence: PresenceService) { }


  /**
  * Lifecycle hook that is called after Angular has initialized all data-bound properties.
  * Sets up an Observable to track the presence of a user based on the current user ID.
  */
  ngOnInit() {
    this.presence$ = this.userIDSource.asObservable().pipe(
      switchMap(uid => uid ? this.presence.getPresence(uid) : [null])
    );
  }

}
