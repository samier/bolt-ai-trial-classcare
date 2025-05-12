import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ExamReportCardGenerateStudentComponent } from './exam-report-card-generate-student/exam-report-card-generate-student.component';

const routes: Routes = [
  {
    path: 'generate-result',
    component: ExamReportCardGenerateStudentComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    ExamReportCardGenerateStudentComponent,
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
export class ExamReportStudentModule { }
