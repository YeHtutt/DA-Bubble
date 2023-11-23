import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditChannelDialogComponent } from './edit-channel-dialog.component';

describe('EditChannelDialogComponent', () => {
  let component: EditChannelDialogComponent;
  let fixture: ComponentFixture<EditChannelDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditChannelDialogComponent]
    });
    fixture = TestBed.createComponent(EditChannelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
