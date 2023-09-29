import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartAnimationComponent } from './start-animation.component';

describe('StartAnimationComponent', () => {
  let component: StartAnimationComponent;
  let fixture: ComponentFixture<StartAnimationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StartAnimationComponent]
    });
    fixture = TestBed.createComponent(StartAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
