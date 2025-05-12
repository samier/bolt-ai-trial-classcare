import { TestBed } from '@angular/core/testing';

import { TrustDetailManagementService } from './trust-details-management.service';

describe('TrustDetailManagementService', () => {
  let service: TrustDetailManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrustDetailManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
