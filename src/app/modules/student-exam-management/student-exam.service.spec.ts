import { TestBed } from '@angular/core/testing';

import { StudentExamService } from './student-exam.service';

describe('StudentExamService', () => {
  let service: StudentExamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentExamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
