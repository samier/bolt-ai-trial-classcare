import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamReportCardGenerateFacultyComponent } from './exam-report-card-generate-faculty.component';

describe('ExamReportCardGenerateFacultyComponent', () => {
  let component: ExamReportCardGenerateFacultyComponent;
  let fixture: ComponentFixture<ExamReportCardGenerateFacultyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamReportCardGenerateFacultyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamReportCardGenerateFacultyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
