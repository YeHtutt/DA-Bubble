import { TestBed } from '@angular/core/testing';

import { MessageSelectionService } from './message-selection.service';

describe('MessageSelectionService', () => {
  let service: MessageSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
