import { TestBed } from '@angular/core/testing';

import { FirebaseUtilsService } from './firebase-utils.service';

describe('FirebaseUtilsService', () => {
  let service: FirebaseUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
