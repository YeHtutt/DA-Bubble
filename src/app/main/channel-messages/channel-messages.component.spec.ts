import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelMessagesComponent } from './channel-messages.component';

describe('ChannelMessagesComponent', () => {
  let component: ChannelMessagesComponent;
  let fixture: ComponentFixture<ChannelMessagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelMessagesComponent]
    });
    fixture = TestBed.createComponent(ChannelMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
