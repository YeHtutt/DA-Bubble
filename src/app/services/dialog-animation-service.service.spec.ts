import { TestBed } from '@angular/core/testing';

import { DialogAnimationServiceService } from './dialog-animation-service.service';

describe('DialogAnimationServiceService', () => {
  let service: DialogAnimationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogAnimationServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
