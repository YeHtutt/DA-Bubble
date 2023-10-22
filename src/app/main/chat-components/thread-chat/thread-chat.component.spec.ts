import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadChatComponent } from './thread-chat.component';

describe('ThreadChatComponent', () => {
  let component: ThreadChatComponent;
  let fixture: ComponentFixture<ThreadChatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThreadChatComponent]
    });
    fixture = TestBed.createComponent(ThreadChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
