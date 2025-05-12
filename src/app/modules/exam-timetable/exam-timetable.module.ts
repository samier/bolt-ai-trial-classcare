import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamTimeTableFormComponent } from './exam-time-table-form/exam-time-table-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedModule } from 'src/app/shared/shared.module';


const routes:Routes =[
  {
    path:'exam-timetable-form',
    component:ExamTimeTableFormComponent,
    pathMatch:'full'
  },
] 
@NgModule({
  declarations: [
    ExamTimeTableFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NgSelectModule,
    NgMultiSelectDropDownModule.forRoot(),
    SharedModule   
  ]
})
export class ExamTimetableModule { }
