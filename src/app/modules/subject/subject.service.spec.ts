import { TestBed } from '@angular/core/testing';

import { subjectService } from './subject.service';

describe('subjectService', () => {
  let service: subjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(subjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
