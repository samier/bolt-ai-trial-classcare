import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ExamReportCardGenerateComponent } from './exam-report-card-generate/exam-report-card-generate.component';
import { ExamReportCardGenerateFacultyComponent } from './exam-report-card-generate-faculty/exam-report-card-generate-faculty.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { EditExamReportCardComponent } from './edit-exam-report-card/edit-exam-report-card.component';
import { examGraceMarksComponent } from './exam-grace-marks/exam-grace-marks.component';
import { ExamReportListComponent } from './exam-report-list/exam-report-list.component';
import { EditExamReportModalComponent } from './exam-report-list/edit-exam-report-modal/edit-exam-report-modal.component';

const routes: Routes = [
  {
    path: 'generate',
    component: ExamReportCardGenerateComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_exam_report_card', permission: 'has_access'}
  },
  {
    path: 'faculty/result-generate',
    component: ExamReportCardGenerateFacultyComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_exam_report_card', permission: 'has_access'}
  },
  {
    path: 'edit',
    component: EditExamReportCardComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_exam_report_card', permission: 'has_edit'}
  },
  {
    path: 'grace',
    component: examGraceMarksComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    ExamReportCardGenerateComponent,
    ExamReportCardGenerateFacultyComponent,
    EditExamReportCardComponent,
    examGraceMarksComponent,
    ExamReportListComponent,
    EditExamReportModalComponent
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
  ],
  exports: [
    RouterModule
  ]
})
export class ExamReportModule { }
