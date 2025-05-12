import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddRecordComponent } from './add-record/add-record.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TeacherDiaryListComponent } from './teacher-diary-list/teacher-diary-list.component';
import { TeacherDiaryEditFormComponent } from './teacher-diary-edit-form/teacher-diary-edit-form.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AdminAddRecordComponent } from './admin-add-record/admin-add-record.component';
import { AdminEditRecordComponent } from './admin-edit-record/admin-edit-record.component';
import { AdminDiaryListComponent } from './admin-diary-list/admin-diary-list.component';
import { DataTablesModule } from 'angular-datatables';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'add-record',
    component: AddRecordComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_teachers_diary', permission: 'has_create', parentModule :'teacher-diary' }
  },
  {
    path: 'teacher-diary-list',
    component: TeacherDiaryListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_teachers_diary', permission: 'has_access', parentModule :'teacher-diary'}
  },
  {
    path: 'teacher-diary-edit-form/:id',
    component: TeacherDiaryEditFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_teachers_diary', permission: 'has_edit', parentModule :'teacher-diary'}
  },
  {
    path: 'admin-add-record',
    component: AdminAddRecordComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_teachers_diary', permission: 'has_create', parentModule :'teacher-diary'}
  },
  {
    path: 'admin-edit-record/:id',
    component: AdminEditRecordComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_teachers_diary', permission: 'has_edit', parentModule :'teacher-diary'}
  },
  {
    path: 'admin-diary-list',
    component: AdminDiaryListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_teachers_diary', permission: 'has_access', parentModule :'teacher-diary'}
  },
];

@NgModule({
  declarations: [
    AddRecordComponent,
    TeacherDiaryListComponent,
    TeacherDiaryEditFormComponent,
    AdminAddRecordComponent,
    AdminEditRecordComponent,
    AdminDiaryListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DataTablesModule,
    NgSelectModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class TeacherDiaryModule { }
