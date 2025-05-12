import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamGradeComponent } from './exam-grade/exam-grade.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { ExamGradeListComponent } from './exam-grade-list/exam-grade-list.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MarksBulkEditComponent } from './marks-bulk-edit/marks-bulk-edit.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PermissionGuard } from 'src/app/service/permission.service';
import { CreateExamComponent } from './create-exam/create-exam.component';
import { ExamListComponent } from './exam-list/exam-list.component';
import { AddEditMarkComponent } from './add-edit-mark/add-edit-mark.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ViewExamListComponent } from './view-exam-list/view-exam-list.component';
import { SignleExamAttendencaComponent } from './signle-exam-attendenca/signle-exam-attendenca.component';
import { BlankExamSheetComponent } from './blank-exam-sheet/blank-exam-sheet.component';
import { ExamReportDownloadModalComponent } from './exam-report-download-modal/exam-report-download-modal.component';
import { MarksImportListComponent } from './marks-import-list/marks-import-list.component';
import { MarksImportLogComponent } from './marks-import-log/marks-import-log.component';
import { CreateMultipleExamComponent } from './create-multiple-exam/create-multiple-exam.component';
import { StudentRankListComponent } from './student-rank-list/student-rank-list.component';
import { NewStudentRankingComponent } from './new-student-ranking/new-student-ranking.component';

const routes:Routes =[
  {
    path:'exam-grade',
    component:ExamGradeComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_exam_grade', permission: 'has_create'}
  },
  {
    path:'exam-grade/:id',
    component:ExamGradeComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_exam_grade', permission: 'has_edit'}
  },
  {
    path:'exam-grade-list',
    component:ExamGradeListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_exam_grade', permission: 'has_access'}
  },
  {
    path:'marks-bulk-edit',
    component:MarksBulkEditComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_marks_bulk_edit', permission: 'has_access'}
  },
  {
    path:'create',
    component:CreateMultipleExamComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_exam', permission: 'has_access'}
  },
  {
    path:'edit/:id',
    component:CreateExamComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_exam', permission: 'has_access'}
  },
  {
    path:'list',
    component:ExamListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_exam', permission: 'has_access', parentModule : 'exam'}
  },
  {
    path:'result/:id',
    component:AddEditMarkComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_exam_marks', permission: 'has_access'}
  },
  {
    path:'view/:id',
    component:ViewExamListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_exam', permission: 'has_access'}
  },
  {
    path:'attendance/:id',
    component:SignleExamAttendencaComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_exam_attendance', permission: 'has_access'}
  },
  {
    path:'blank-sheet',
    component:BlankExamSheetComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_blank_exam_sheet', permission: 'has_access'}
  },
  {
    path:'imported-marks/:id',
    component:MarksImportListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_import_marks_log', permission: 'has_access'}
  },
  {
    path:'imported-marks-log/:id',
    component:MarksImportLogComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_import_marks_log', permission: 'has_access'}
  },
  {
    path:'student-rank-list',
    component:StudentRankListComponent,
    // pathMatch:'full',
    // canActivate: [PermissionGuard],
    // data: {moduleName: '', permission: ''}
  },
  {
    path:'student-rank-list/:id',
    component:StudentRankListComponent,
    // pathMatch:'full',
    // canActivate: [PermissionGuard],
    // data: {moduleName: '', permission: ''}
  },
  {
    path: 'student-ranking',
    component: NewStudentRankingComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_student_rank_list', permission: 'has_access'}
  }
  
] 

@NgModule({
  declarations: [
    ExamGradeComponent,
    ExamGradeListComponent,
    MarksBulkEditComponent,
    CreateExamComponent,
    ExamListComponent,
    AddEditMarkComponent,
    ViewExamListComponent,
    SignleExamAttendencaComponent,
    BlankExamSheetComponent,
    StudentRankListComponent,
    ExamReportDownloadModalComponent,
    MarksImportListComponent,
    MarksImportLogComponent,
    CreateMultipleExamComponent,
    NewStudentRankingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    DataTablesModule,
    ReactiveFormsModule,    
    RouterModule.forChild(routes),
    NgMultiSelectDropDownModule.forRoot(),
    NgbModule,
    SharedModule
  ],
  exports: [
    RouterModule
  ]
})
export class ExamModule { }
