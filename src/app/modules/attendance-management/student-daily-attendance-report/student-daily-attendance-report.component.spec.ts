import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDailyAttendanceReportComponent } from './student-daily-attendance-report.component';

describe('StudentDailyAttendanceReportComponent', () => {
  let component: StudentDailyAttendanceReportComponent;
  let fixture: ComponentFixture<StudentDailyAttendanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentDailyAttendanceReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentDailyAttendanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
