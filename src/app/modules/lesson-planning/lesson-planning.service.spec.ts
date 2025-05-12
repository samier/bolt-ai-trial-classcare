import { TestBed } from '@angular/core/testing';

import { LessonPlanningService } from './lesson-planning.service';

describe('LessonPlanningService', () => {
  let service: LessonPlanningService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LessonPlanningService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
