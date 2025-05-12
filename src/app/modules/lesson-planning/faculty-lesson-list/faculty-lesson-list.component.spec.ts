import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyLessonListComponent } from './faculty-lesson-list.component';

describe('FacultyLessonListComponent', () => {
  let component: FacultyLessonListComponent;
  let fixture: ComponentFixture<FacultyLessonListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacultyLessonListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyLessonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
