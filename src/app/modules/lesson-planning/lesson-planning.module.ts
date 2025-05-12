import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateLessonComponent } from './create-lesson/create-lesson.component';
import { RouterModule, Routes } from '@angular/router';
import { LessonListComponent } from './lesson-list/lesson-list.component';
import { EditLessonComponent } from './edit-lesson/edit-lesson.component';
import { FacultyLessonListComponent } from './faculty-lesson-list/faculty-lesson-list.component';
import { AdminAddNewRecordComponent } from './admin-add-new-record/admin-add-new-record.component';
import { AdminEditRecordComponent } from './admin-edit-record/admin-edit-record.component';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'create-lesson',
    component: CreateLessonComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_lesson_planning', permission: 'has_create', parentModule: 'lesson' }
  },
  {
    path: 'lesson-list',
    component: LessonListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_lesson_planning', permission: 'has_access', parentModule: 'lesson' }
  },  
  {
    path: 'faculty-lesson-list',
    component: FacultyLessonListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_lesson_planning', permission: 'has_access', parentModule: 'lesson' }
  },  
  {
    path: 'edit-lesson/:id',
    component: EditLessonComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_lesson_planning', permission: 'has_edit', parentModule: 'lesson' }
  },
  {
    path: 'add-admin-new-record',
    component: AdminAddNewRecordComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_lesson_planning', permission: 'has_create', parentModule: 'lesson' }
  },
  {
    path: 'admin-edit-record/:id',
    component: AdminEditRecordComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_lesson_planning', permission: 'has_edit', parentModule: 'lesson' }
  },
];


@NgModule({
  declarations: [
    CreateLessonComponent,
    LessonListComponent,
    EditLessonComponent,
    FacultyLessonListComponent,
    AdminAddNewRecordComponent,
    AdminEditRecordComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,    
    SharedModule,
    RouterModule.forChild(routes),
    NgSelectModule,
    NgMultiSelectDropDownModule.forRoot(),
  ]
})
export class LessonPlanningModule { }
