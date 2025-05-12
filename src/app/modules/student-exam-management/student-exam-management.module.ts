import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ExamListComponent } from './exam-list/exam-list.component';
import { ExamFormComponent } from './exam-form/exam-form.component';
import { ExamDetailComponent } from './exam-detail/exam-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimerPipe } from './timer.pipe';
import { DataTablesModule } from "angular-datatables";

const routes: Routes = [
  {
    path: 'exam-list',
    component: ExamListComponent,
    pathMatch: 'full'
  },
  {
    path: 'exam-detail/:id',
    component: ExamDetailComponent,
    pathMatch: 'full'
  },
  {
    path: 'exam/:id',
    component: ExamFormComponent,
    pathMatch: 'full'
  }
]

@NgModule({
  declarations: [
    ExamListComponent,
    ExamFormComponent,
    ExamDetailComponent,
    TimerPipe,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ]
})
export class StudentExamManagementModule { }
