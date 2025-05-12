import { TestBed } from '@angular/core/testing';

import { oldSchoolManagementService } from './old-school-management.service';

describe('oldSchoolManagementService', () => {
  let service: oldSchoolManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(oldSchoolManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
