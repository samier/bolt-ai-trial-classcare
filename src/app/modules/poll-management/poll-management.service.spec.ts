import { TestBed } from '@angular/core/testing';

import { PollManagementService } from './poll-management.service';

describe('PollManagementService', () => {
  let service: PollManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PollManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
