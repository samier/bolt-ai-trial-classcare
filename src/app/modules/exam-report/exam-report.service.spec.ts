import { TestBed } from '@angular/core/testing';

import { ExamReportService } from './exam-report.service';

describe('ExamReportService', () => {
  let service: ExamReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
