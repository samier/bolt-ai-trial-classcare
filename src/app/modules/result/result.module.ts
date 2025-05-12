import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResultRoutingModule } from './result-routing.module';
import { CreateMarksheetComponent } from './create-marksheet/create-marksheet.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MarksheetListComponent } from './marksheet-list/marksheet-list.component';
import { AssignExamComponent } from './assign-exam/assign-exam.component';
import { ResultActionComponent } from './result-action/result-action.component';
import { ResultSectionComponent } from './result-action/result-section/result-section.component';
import { ExamSetupComponent } from './result-action/exam-setup/exam-setup.component';
import { SubjectSetupComponent } from './result-action/subject-setup/subject-setup.component';
import { ResultSetupComponent } from './result-action/result-setup/result-setup.component';
import { MarksheetTemplateDesignComponent } from './marksheet-template-design/marksheet-template-design.component';
import { MarksheetTemplateListComponent } from './marksheet-template-list/marksheet-template-list.component';
import { MarkCalculationComponent } from './result-action/mark-calculation/mark-calculation.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { studentAttendanceComponent } from './student-attendance/student-attendance.component';
import { studentAttendanceListComponent } from './student-attendance-list/student-attendance-list.component';
import { AddSidhiGunComponent } from './add-sidhi-gun/add-sidhi-gun.component';
import { TeacherRemarkListComponent } from './teacher-remark-list/teacher-remark-list.component';
import { TeacherRemarkAddComponent } from './teacher-remark-add/teacher-remark-add.component';
import { StudentWiseResultComponent } from './student-wise-result/student-wise-result.component';

@NgModule({
  declarations: [
  
    CreateMarksheetComponent,
       MarksheetListComponent,
       AssignExamComponent,
       ResultActionComponent,
       ResultSectionComponent,
       ExamSetupComponent,
       SubjectSetupComponent,
       ResultSetupComponent,
       MarksheetTemplateDesignComponent,
       MarksheetTemplateListComponent,
       MarkCalculationComponent,
       studentAttendanceComponent,
       studentAttendanceListComponent,
       AddSidhiGunComponent,
       TeacherRemarkListComponent,
       TeacherRemarkAddComponent,
       StudentWiseResultComponent
  ],
  imports: [
    CommonModule,
    ResultRoutingModule,
    SharedModule,
    DragDropModule
  ]
})
export class ResultModule { }
