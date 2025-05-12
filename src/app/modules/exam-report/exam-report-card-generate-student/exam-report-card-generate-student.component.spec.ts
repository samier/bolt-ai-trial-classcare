import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamReportCardGenerateStudentComponent } from './exam-report-card-generate-student.component';

describe('ExamReportCardGenerateStudentComponent', () => {
  let component: ExamReportCardGenerateStudentComponent;
  let fixture: ComponentFixture<ExamReportCardGenerateStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamReportCardGenerateStudentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamReportCardGenerateStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
