import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveFormComponent } from './leave-form/leave-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeaveListComponent } from './leave-list/leave-list.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from "angular-datatables";
import { StudentLeaveComponent } from './student-leave/student-leave.component';
import { FacultyLeaveComponent } from './faculty-leave/faculty-leave.component';
import { RouterModule, Routes } from '@angular/router';
import { AdminLeaveEditFormComponent } from './admin-leave-edit-form/admin-leave-edit-form.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { StudentLeaveListComponent } from './student-leave-list/student-leave-list.component';
import { StudentLeaveEditFormComponent } from './student-leave-edit-form/student-leave-edit-form.component';
import { FacultyLeaveListComponent } from './faculty-leave-list/faculty-leave-list.component';
import { FacultyLeaveEditFormComponent } from './faculty-leave-edit-form/faculty-leave-edit-form.component';
import { FacultyStudentLeaveListComponent } from './faculty-student-leave-list/faculty-student-leave-list.component';
import { FacultyEditStudentLeaveComponent } from './faculty-edit-student-leave/faculty-edit-student-leave.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FacultyAddStudentLeaveComponent } from './faculty-add-student-leave/faculty-add-student-leave.component';
import { AdminStudentLeaveListTabComponent } from './admin-student-leave-list-tab/admin-student-leave-list-tab.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'leave-create',
    component: LeaveFormComponent,
    pathMatch: 'full',
    // canActivate: [PermissionGuard],
    // data: {moduleName: 'leave_faculty_leave', permission: 'has_create', parentModule: 'leaves' }
  },
  {
    path: 'leave-list',
    component: LeaveListComponent,
    pathMatch: 'full',
    // canActivate: [PermissionGuard],
    // data: {moduleName: 'administrator_leave', permission: 'has_access', parentModule: 'leaves'}
  },    
  {
    path: 'admin-leave-edit-form/:id',
    component: AdminLeaveEditFormComponent,
    pathMatch: 'full',
    // canActivate: [PermissionGuard],
    // data: {moduleName: 'administrator_leave', permission: 'has_edit', parentModule: 'leaves'}
  }, 
  // {
  //   path: 'student-leave-edit-form/:id',
  //   component: StudentLeaveEditFormComponent,
  //   pathMatch: 'full'
  // },   
  {
    path: 'faculty-leave-edit-form/:id',
    component: FacultyLeaveEditFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'leave_faculty_leave', permission: 'has_edit', parentModule: 'leaves'}
  },        
  // {
  //   path: 'student-leave',
  //   component: StudentLeaveComponent,
  //   pathMatch: 'full'
  // },
  {
    path: 'faculty-leave',
    component: FacultyLeaveComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'leave_faculty_leave', permission: 'has_create', parentModule: 'leaves'}
  },
  // {
  //   path: 'student-leave-list',
  //   component: StudentLeaveListComponent,
  //   pathMatch: 'full'
  // }, 
  {
    path: 'faculty-leave-list',
    component: FacultyLeaveListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'leave_faculty_leave', permission: 'has_access', parentModule: 'leaves'}
  },
  {
    path: 'faculty-student-leave-list',
    component: FacultyStudentLeaveListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'leave_approve_leave', permission: 'has_access', parentModule: 'leaves'}
  },     
  {
    path: 'faculty-edit-student-leave/:id',
    component: FacultyEditStudentLeaveComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'leave_approve_leave', permission: 'has_edit', parentModule: 'leaves'}
  },    
  {
    path: 'faculty-add-student-leave',
    component: FacultyAddStudentLeaveComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'leave_approve_leave', permission: 'has_create', parentModule: 'leaves'}
  },
  {
    path: 'admin-student-leave-list-tab/:id',
    component: AdminStudentLeaveListTabComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_leave', permission: 'has_edit', parentModule: 'leaves'}
  },  
]

@NgModule({
  declarations: [
    LeaveFormComponent,
    LeaveListComponent,
    AdminLeaveEditFormComponent,
    // StudentLeaveComponent,
    FacultyLeaveComponent,
    // StudentLeaveListComponent,
    // StudentLeaveEditFormComponent,
    FacultyLeaveListComponent,
    FacultyLeaveEditFormComponent,
    FacultyStudentLeaveListComponent,
    FacultyEditStudentLeaveComponent,
    FacultyAddStudentLeaveComponent,
    AdminStudentLeaveListTabComponent,    
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DataTablesModule,    
    SharedModule,
    RouterModule.forChild(routes),
    NgxPaginationModule,
    NgbModule
  ],
  exports: [
    RouterModule
  ]
})
export class LeaveManagementModule { }
