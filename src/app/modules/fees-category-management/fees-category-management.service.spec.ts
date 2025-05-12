import { TestBed } from '@angular/core/testing';

import { FeesCategoryManagementService } from './fees-category-management.service';

describe('FeesCategoryManagementService', () => {
  let service: FeesCategoryManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeesCategoryManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
