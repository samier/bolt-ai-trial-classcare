import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StudentDailyAttendanceReportComponent } from './student-daily-attendance-report/student-daily-attendance-report.component';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { PresentAttendanceBlankSheetReportComponent } from './present-attendance-blank-sheet-report/present-attendance-blank-sheet-report.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { MonthPickerComponent } from './month-picker/month-picker.component';
// import { MonthPickerComponent } 

import { QuickStudentAttendanceComponent } from './quick-student-attendance/quick-student-attendance.component';
import { SharedModule } from "../../shared/shared.module";
import { PermissionGuard } from 'src/app/service/permission.service';
import { ViewAttendanceListComponent } from './view-attendance-list/view-attendance-list.component';
import { BatchWiseAttendanceListComponent } from './batch-wise-attendance-list/batch-wise-attendance-list.component';
const routes: Routes = [
  {
    path: 'student-daily-report/generate',
    component: StudentDailyAttendanceReportComponent,
    pathMatch: 'full'
  },
  {
    path: 'present-attendance-blank-sheet',
    component: PresentAttendanceBlankSheetReportComponent,
  },
  {
    path: 'quick-student-attendance',
    component: QuickStudentAttendanceComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_quick_attendance', permission: 'has_access' },
  },
  {
    path: 'batch-wise-attendance-list',
    component: BatchWiseAttendanceListComponent,
    pathMatch: 'full',
    data: { moduleName: 'student_attendance', permission: 'has_access'}
  },
  {
    path: 'view-attendance-list',
    component: ViewAttendanceListComponent,
    pathMatch: 'full',
    data: { moduleName: 'student_attendance', permission: 'has_access' }
  },
]
@NgModule({
  declarations: [
    StudentDailyAttendanceReportComponent,
    PresentAttendanceBlankSheetReportComponent,
    // MonthPickerComponent
    QuickStudentAttendanceComponent,
    ViewAttendanceListComponent,
    BatchWiseAttendanceListComponent
  ],
  imports: [
    CommonModule,
    // RouterModule,
    RouterModule.forChild(routes),
    // FormsModule,
    // ReactiveFormsModule,
    // DataTablesModule,
    // NgSelectModule,
    // NgMultiSelectDropDownModule.forRoot(),
    NgbModule,
    SharedModule
],
  exports: [
    RouterModule
  ]
})
export class AttendanceManagementModule { }
