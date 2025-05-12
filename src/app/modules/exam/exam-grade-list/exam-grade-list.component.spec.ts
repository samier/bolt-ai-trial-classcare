import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamGradeListComponent } from './exam-grade-list.component';

describe('ExamGradeListComponent', () => {
  let component: ExamGradeListComponent;
  let fixture: ComponentFixture<ExamGradeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamGradeListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamGradeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
