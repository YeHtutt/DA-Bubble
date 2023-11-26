import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileChooseAvatarComponent } from './user-profile-choose-avatar.component';

describe('UserProfileChooseAvatarComponent', () => {
  let component: UserProfileChooseAvatarComponent;
  let fixture: ComponentFixture<UserProfileChooseAvatarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserProfileChooseAvatarComponent]
    });
    fixture = TestBed.createComponent(UserProfileChooseAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
