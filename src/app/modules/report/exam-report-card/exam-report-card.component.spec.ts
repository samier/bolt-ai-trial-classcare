import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamReportCardComponent } from './exam-report-card.component';

describe('ExamReportCardComponent', () => {
  let component: ExamReportCardComponent;
  let fixture: ComponentFixture<ExamReportCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamReportCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamReportCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
