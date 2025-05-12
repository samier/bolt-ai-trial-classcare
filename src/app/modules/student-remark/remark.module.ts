import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { AdminStudentRemarkListTabComponent } from './admin-student-remark-list-tab/admin-student-remark-list-tab.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { StudentRemarkListComponent } from './student-remark-list/student-remark-list.component';
import { StudentRemarkComponent } from './student-remark/student-remark.component';
import { PredefineRemarkListComponent } from './predefine-remark-list/predefine-remark-list.component';
import { PredefineRemarkFormComponent } from './predefine-remark-form/predefine-remark-form.component'
import { PermissionGuard } from 'src/app/service/permission.service';

const routes:Routes = [
  {
    path:'admin-student-remark-list-tab/:id',
    component:AdminStudentRemarkListTabComponent,
    pathMatch:'full'
  },
  {
    path:'list',
    component:StudentRemarkListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_student_remark', permission: 'has_access' }
  },
  {
    path:'create',
    component:StudentRemarkComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_student_remark', permission: 'has_create' }
  },
  {
    path:'edit/:id',
    component:StudentRemarkComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_student_remark', permission: 'has_edit' }
  },
  {
    path:'predefine-remark-list',
    component:PredefineRemarkListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_student_remark_title', permission: 'has_access' }
  },  
];

@NgModule({
  declarations: [
    AdminStudentRemarkListTabComponent,
    StudentRemarkListComponent,
    StudentRemarkComponent,
    PredefineRemarkListComponent,
    PredefineRemarkFormComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DataTablesModule,
    SharedModule,
  ]
})
export class RemarkModule { }
