import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelUsersDialogComponent } from './channel-users-dialog.component';

describe('ChannelUsersDialogComponent', () => {
  let component: ChannelUsersDialogComponent;
  let fixture: ComponentFixture<ChannelUsersDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelUsersDialogComponent]
    });
    fixture = TestBed.createComponent(ChannelUsersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
