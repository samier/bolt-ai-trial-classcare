import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResultComponent } from './result.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { CreateMarksheetComponent } from './create-marksheet/create-marksheet.component';
import { MarksheetListComponent } from './marksheet-list/marksheet-list.component';
import { AssignExamComponent } from './assign-exam/assign-exam.component';
import { ResultActionComponent } from './result-action/result-action.component';
import { MarksheetTemplateDesignComponent } from './marksheet-template-design/marksheet-template-design.component';
import { MarksheetTemplateListComponent } from './marksheet-template-list/marksheet-template-list.component';
import { studentAttendanceComponent } from './student-attendance/student-attendance.component';
import { studentAttendanceListComponent } from './student-attendance-list/student-attendance-list.component';
import { AddSidhiGunComponent } from './add-sidhi-gun/add-sidhi-gun.component';
import { TeacherRemarkListComponent } from './teacher-remark-list/teacher-remark-list.component';
import { TeacherRemarkAddComponent } from './teacher-remark-add/teacher-remark-add.component';
import { StudentWiseResultComponent } from './student-wise-result/student-wise-result.component';


const routes: Routes = [
  {
    path:'',
    component:ResultComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: '', permission: '' }
  },
  {
    path:'create-marksheet',
    component: CreateMarksheetComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_marksheet_create', permission: 'has_create' }
  },
  {
    path:'edit-marksheet/:id',
    component: CreateMarksheetComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_marksheet_create', permission: 'has_edit' }
  },
  {
    path:'marksheet-list',
    component: MarksheetListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_marksheet_create', permission: 'has_access' }
  },
  {
    path:'assign-exam/:id',
    component: AssignExamComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_marksheet_create', permission: 'has_create' }
  },
  {
    path:'action/:id',
    component: ResultActionComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_marksheet_create', permission: 'has_create' }
  },
  {
    path:'marksheet-template-design',
    component: MarksheetTemplateDesignComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: '', permission: '' }
  },
  {
    path:'marksheet-template-design/:id/:type',
    component: MarksheetTemplateDesignComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: '', permission: '' }
  },
  {
    path:'marksheet-template-list',
    component: MarksheetTemplateListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: '', permission: '' }
  },
  {
    path:'student-attendance-list',
    component: studentAttendanceListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: '', permission: '' }
  },
  {
    path:'student-attendance',
    component: studentAttendanceComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: '', permission: '' }
  },
  {
    path:'student-attendance/:attendance_detail_id',
    component: studentAttendanceComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: '', permission: '' }
  },
  {
    path:'add-sidhi-gun/:id',
    component: AddSidhiGunComponent,
    // pathMatch: 'full',
    // canActivate: [PermissionGuard],
    // data: { moduleName: '', permission: '' }
  },
  {
    path:'teacher-remark-list',
    component: TeacherRemarkListComponent,
    // pathMatch: 'full',
    // canActivate: [PermissionGuard],
    // data: { moduleName: '', permission: '' }
  },
  {
    path:'teacher-remark',
    component: TeacherRemarkAddComponent,
    // pathMatch: 'full',
    // canActivate: [PermissionGuard],
    // data: { moduleName: '', permission: '' }
  },
  {
    path:'teacher-remark/:remark_id',
    component: TeacherRemarkAddComponent,
    // pathMatch: 'full',
    // canActivate: [PermissionGuard],
    // data: { moduleName: '', permission: '' }
  },
  {
    path:'student-wise-result/:id',
    component: StudentWiseResultComponent,
    // pathMatch: 'full',
    // canActivate: [PermissionGuard],
    // data: { moduleName: '', permission: '' }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResultRoutingModule { }
