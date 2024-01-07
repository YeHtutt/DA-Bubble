import { TestBed } from '@angular/core/testing';

import { MainIdsService } from './main-ids.service';

describe('MainIdsService', () => {
  let service: MainIdsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainIdsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
