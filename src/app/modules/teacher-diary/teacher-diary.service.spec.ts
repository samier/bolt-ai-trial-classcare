import { TestBed } from '@angular/core/testing';

import { TeacherDiaryService } from './teacher-diary.service';

describe('TeacherDiaryService', () => {
  let service: TeacherDiaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeacherDiaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
