import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileSubViewComponent } from './user-profile-sub-view.component';

describe('UserProfileSubViewComponent', () => {
  let component: UserProfileSubViewComponent;
  let fixture: ComponentFixture<UserProfileSubViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserProfileSubViewComponent]
    });
    fixture = TestBed.createComponent(UserProfileSubViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
