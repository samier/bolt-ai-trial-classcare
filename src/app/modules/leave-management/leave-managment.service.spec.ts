import { TestBed } from '@angular/core/testing';

import { LeaveManagmentService } from './leave-managment.service';

describe('LeaveManagmentService', () => {
  let service: LeaveManagmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeaveManagmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
