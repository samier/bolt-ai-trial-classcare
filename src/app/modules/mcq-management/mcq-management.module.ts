import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from "angular-datatables";
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ChapterListComponent } from './chapter-list/chapter-list.component';
import { ChapterFormComponent } from './chapter-form/chapter-form.component';
import { QuestionFormComponent } from './question-form/question-form.component';
import { QuestionListComponent } from './question-list/question-list.component';
import { QuestionViewComponent } from './question-view/question-view.component';
import { ExamListComponent } from './exam-list/exam-list.component';
import { ExamFormComponent } from './exam-form/exam-form.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ResultListComponent } from './result-list/result-list.component';
import { StudentExamListComponent } from './student-exam-list/student-exam-list.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'chapter-create',
    component: ChapterFormComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'online_exam_chapter', permission: 'has_create' , parentModule : 'mcq' }
  },
  {
    path: 'chapter-edit/:id',
    component: ChapterFormComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'online_exam_chapter', permission: 'has_edit' , parentModule : 'mcq'}
  },
  {
    path: 'chapter-list',
    component: ChapterListComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'online_exam_chapter', permission: 'has_access' , parentModule : 'mcq'}
  },
  {
    path: 'question-create',
    component: QuestionFormComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'online_exam_question', permission: 'has_create' , parentModule : 'mcq'}
  },
  {
    path: 'question-edit/:id',
    component: QuestionFormComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'online_exam_question', permission: 'has_edit' , parentModule : 'mcq'}
  },
  {
    path: 'question-view/:id',
    component: QuestionViewComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'online_exam_question', permission: 'has_access' , parentModule : 'mcq'}
  },
  {
    path: 'question-list',
    component: QuestionListComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'online_exam_question', permission: 'has_access' , parentModule : 'mcq'}
  },
  {
    path: 'exam-create',
    component: ExamFormComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'online_exam_exam', permission: 'has_create' , parentModule : 'mcq'}
  },
  {
    path: 'exam-edit/:id',
    component: ExamFormComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'online_exam_exam', permission: 'has_edit' , parentModule : 'mcq'}
  },
  {
    path: 'exam-list',
    component: ExamListComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'online_exam_exam', permission: 'has_access' , parentModule : 'mcq'}
  },
  {
    path: 'result-list',
    component: ResultListComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'online_exam_result', permission: 'has_access' , parentModule : 'mcq'}
  },
  {
    path: 'student-exam/:studentId',
    component: StudentExamListComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'online_exam_result', permission: 'has_access' , parentModule : 'mcq'}
  }
]

@NgModule({
  declarations: [
    ChapterListComponent,
    ChapterFormComponent,
    QuestionFormComponent,
    QuestionListComponent,
    QuestionViewComponent,
    ResultListComponent,
    ExamListComponent,
    ExamFormComponent,
    StudentExamListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    DataTablesModule,
    RouterModule.forChild(routes),
    NgMultiSelectDropDownModule.forRoot(),
    NgxDaterangepickerMd.forRoot(),
    SharedModule
  ],
  exports: [
    RouterModule
  ]
})

export class McqManagementModule { }
