import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { RouterModule } from '@angular/router';
import {GridsterModule } from 'angular-gridster2';
import { CounterCardComponent } from './components/counter-card/counter-card.component';
import { CalenderEventComponent } from './components/calender-event/calender-event.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FeesCollectionComponent } from './components/fees-collection/fees-collection.component';
import { UpcomingExamComponent } from './components/upcoming-exam/upcoming-exam.component';
import { TodayCollectionComponent } from './components/today-collection/today-collection.component';
import { TodayBirthdayComponent } from './components/today-birthday/today-birthday.component';
import { HomeworkComponent } from './components/homework/homework.component';
import { ScoolPerfomanceComponent } from './components/scool-perfomance/scool-perfomance.component';
// import { AssignmentComponent, UpcomingBirthdayComponent } from './components/assignment/assignment.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { StudentBirthdayComponent } from './components/student-birthday/student-birthday.component';
import { TimetableComponent } from './components/timetable/timetable.component';
import { TodayLeaveComponent } from './components/video-link/video-link.component';
import { UpcomingLeaveComponent } from './components/student-absent/student-absent.component';
import { PendingLeaveComponent } from './components/staff-leave/staff-leave.component';
import { UnpaidFeesComponent } from './components/unpaid-fees/unpaid-fees.component';
import { ExamMarkComponent } from './components/exam-mark/exam-mark.component';
import { TopStudentListComponent } from './components/top-student-list/top-student-list.component';
import { InquiryComponent } from './components/inquiry/inquiry.component';
import { PresentStaffComponent } from './components/present-staff/present-staff.component'
import { AssignmentComponent } from './components/assignment/assignment.component';
import { ProxyTimetableComponent } from './components/proxy-timetable/proxy-timetable.component';
import { CalendarDashboardComponent } from './components/calendar-dashboard/calendar-dashboard.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DashboardTimetableComponent } from './components/dashboard-timetable/dashboard-timetable.component';

@NgModule({
  declarations: [
    DashboardComponent,
    CounterCardComponent,
    CalenderEventComponent,
    FeesCollectionComponent,
    UpcomingExamComponent,
    TodayCollectionComponent,
    TodayBirthdayComponent,
    HomeworkComponent,
    ScoolPerfomanceComponent,
    AssignmentComponent,
    // UpcomingBirthdayComponent,
    AttendanceComponent,
    StudentBirthdayComponent,
    TimetableComponent,
    TodayLeaveComponent,
    UpcomingLeaveComponent,
    PendingLeaveComponent,
    UnpaidFeesComponent,
    ExamMarkComponent,
    TopStudentListComponent,
    InquiryComponent,
    PresentStaffComponent,
    ProxyTimetableComponent,
    CalendarDashboardComponent,
    DashboardTimetableComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    GridsterModule,
    SharedModule,
    FullCalendarModule
  ]
})
export class DashboardModule { }
