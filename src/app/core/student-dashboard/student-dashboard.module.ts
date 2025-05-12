import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentDetailsComponent } from './student-details/student-details.component';
import { RouterModule, Routes } from '@angular/router';


@NgModule({
  declarations: [
    StudentDetailsComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    StudentDetailsComponent
  ]
})
export class StudentDashboardModule { }
