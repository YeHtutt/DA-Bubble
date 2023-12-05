import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { PresenceService } from 'src/app/shared/services/presence.service';

@Component({
  selector: 'app-user-presence',
  templateUrl: './user-presence.component.html',
  styleUrls: ['./user-presence.component.scss']
})
export class UserPresenceComponent {

  private userIDSource = new BehaviorSubject<string>('');
  @Input() mini: boolean = false;
  @Input() set userID(value: string) {
    this.userIDSource.next(value);
  }
  noPresence: boolean = false;

  presence$?: Observable<any>;

  constructor(private presence: PresenceService) { }

  ngOnInit() {
    this.presence$ = this.userIDSource.asObservable().pipe(
      switchMap(uid => uid ? this.presence.getPresence(uid) : [null])
    );
  }

}
