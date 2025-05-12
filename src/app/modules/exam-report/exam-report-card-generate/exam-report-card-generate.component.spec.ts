import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamReportCardGenerateComponent } from './exam-report-card-generate.component';

describe('ExamReportCardGenerateComponent', () => {
  let component: ExamReportCardGenerateComponent;
  let fixture: ComponentFixture<ExamReportCardGenerateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamReportCardGenerateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamReportCardGenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
