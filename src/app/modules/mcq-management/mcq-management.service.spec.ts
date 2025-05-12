import { TestBed } from '@angular/core/testing';

import { McqManagementService } from './mcq-management.service';

describe('McqManagementService', () => {
  let service: McqManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(McqManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
