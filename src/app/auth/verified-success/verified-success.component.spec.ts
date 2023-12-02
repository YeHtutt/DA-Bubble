import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifiedSuccessComponent } from './verified-success.component';

describe('VerifiedSuccessComponent', () => {
  let component: VerifiedSuccessComponent;
  let fixture: ComponentFixture<VerifiedSuccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerifiedSuccessComponent]
    });
    fixture = TestBed.createComponent(VerifiedSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
