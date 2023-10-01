import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorHandlingComponent } from './error-handling.component';

describe('ErrorHandlingComponent', () => {
  let component: ErrorHandlingComponent;
  let fixture: ComponentFixture<ErrorHandlingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorHandlingComponent]
    });
    fixture = TestBed.createComponent(ErrorHandlingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
