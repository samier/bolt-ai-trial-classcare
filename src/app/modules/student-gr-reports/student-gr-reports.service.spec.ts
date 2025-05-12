import { TestBed } from '@angular/core/testing';

import { StudentGrReportsService } from './student-gr-reports.service';

describe('StudentGrReportsService', () => {
  let service: StudentGrReportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentGrReportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
