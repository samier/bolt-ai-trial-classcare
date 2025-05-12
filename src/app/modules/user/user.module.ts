import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { AddUserComponent } from './add-user/add-user.component';
import { UserListComponent } from './user-list/user-list.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { AssingnSubjectsComponent } from './assingn-subjects/assingn-subjects.component';
import { ManageStudentSubjectsComponent } from './manage-student-subjects/manage-student-subjects.component';
import { ExportFacultyComponent } from './export-faculty/export-faculty.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PermissionGuard } from 'src/app/service/permission.service';
import { ProfileComponent } from './profile/profile.component';
import { LeaveListComponent } from './user-leaves/leave-list.component';
import { TimetableComponent } from './user-timetable/timetable.component';
import { DocumentComponent } from './user-document/document.component';
import { AttendanceReportComponent } from './attendance-report/attendance-report.component';
import { AdminUserListComponent } from './admin-user-list/admin-user-list.component';
import { UserWisePermissionComponent } from './user-wise-permission/user-wise-permission.component';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { SharedModule } from 'src/app/shared/shared.module';
import { StaffAttendanceComponent } from './staff-attendance/staff-attendance.component';
import { AssignBatchesComponent } from './assign-batches/assign-batches.component';
import { UserNoticeHistoryComponent } from './user-notice-history/user-notice-history.component';
import { AttendanceMachineReportComponent } from './attendance-machine-report/attendance-machine-report.component';
import { InOutLogsComponent } from './attendance-machine-report/in-out-logs/in-out-logs.component';

const routes:Routes =[ 
  
  {
    path:'add-user',
    component:AddUserComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_faculty', permission: 'has_create', parentModule: 'user'}
  },
  {
    path:'user-list',
    component:UserListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_faculty', permission: 'has_access', parentModule: 'user'}
  },
  {
    path:'user-list/:type',
    component:UserListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_faculty', permission: 'has_access', parentModule: 'user'}
  },
  {
    path:'profile/:id',
    component:ProfileComponent,
    pathMatch:'full'
  },
  {
    path:'edit-user/:id',
    component:EditUserComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_faculty', permission: 'has_edit', parentModule: 'user'}
  },
  {
    path:'assign-subjects/:id',
    component:AssingnSubjectsComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_assign_subjects', permission: 'has_access', parentModule: 'user'}
  },
  {
    path:'manage-student-subjects/:id',
    component:ManageStudentSubjectsComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_faculty', permission: 'has_access', parentModule: 'user'}
  },
  {
    path:'export-faculty',
    component:ExportFacultyComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_faculty', permission: 'has_download', parentModule: 'user'}
  },
  {
    path:'attendance-report',
    component:AttendanceReportComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_attendance_report', permission: 'has_access', parentModule: 'user'}
  },
  {
    path:'admin-user-list',
    component:AdminUserListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_faculty', permission: 'has_access',parentModule: 'user'}
  },
  {
    path:'staff-attendance',
    component:StaffAttendanceComponent,
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_staff_attendance', permission: 'has_access'}
  },   
  {
    path:'assign-batches/:id',
    component:AssignBatchesComponent,
    // pathMatch:'full',
    // canActivate: [PermissionGuard],
    // data: {moduleName: 'faculty_assign_batches', permission: 'has_access', parentModule: 'user'}
  },
  {
    path: 'attendance-machine-report',
    component: AttendanceMachineReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_attendance_machine_report', permission: 'has_access'}
  },
  {
    path: 'attendance-machine-report/in-out-logs/:id',
    component: InOutLogsComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_attendance_machine_report', permission: 'has_access'}
  }
]

@NgModule({
  declarations: [
    AddUserComponent,
    UserListComponent,
    EditUserComponent,
    AssingnSubjectsComponent,
    ManageStudentSubjectsComponent,
    ExportFacultyComponent,
    ProfileComponent,
    LeaveListComponent,
    TimetableComponent,
    DocumentComponent,
    AttendanceReportComponent,
    AdminUserListComponent,
    UserWisePermissionComponent,
    StaffAttendanceComponent,
    AssignBatchesComponent,
    UserNoticeHistoryComponent,
    AttendanceMachineReportComponent,
    InOutLogsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    RouterModule.forChild(routes),
    NgSelectModule,
    NgMultiSelectDropDownModule.forRoot(),
    CdkAccordionModule,
    SharedModule
  ]
})


export class UserModule { }
