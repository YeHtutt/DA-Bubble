import { TestBed } from '@angular/core/testing';
import { MessageTreeService } from './message-tree.service';

describe('messageTreeService', () => {
  let service: MessageTreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageTreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
