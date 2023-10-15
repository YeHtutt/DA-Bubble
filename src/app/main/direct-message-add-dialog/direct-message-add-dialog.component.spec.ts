import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMessageAddDialogComponent } from './direct-message-add-dialog.component';

describe('DirectMessageAddDialogComponent', () => {
  let component: DirectMessageAddDialogComponent;
  let fixture: ComponentFixture<DirectMessageAddDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DirectMessageAddDialogComponent]
    });
    fixture = TestBed.createComponent(DirectMessageAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
