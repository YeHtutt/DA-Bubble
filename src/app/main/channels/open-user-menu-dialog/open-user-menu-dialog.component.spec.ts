import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenUserMenuDialogComponent } from './open-user-menu-dialog.component';

describe('OpenUserMenuDialogComponent', () => {
  let component: OpenUserMenuDialogComponent;
  let fixture: ComponentFixture<OpenUserMenuDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpenUserMenuDialogComponent]
    });
    fixture = TestBed.createComponent(OpenUserMenuDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
