import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PollListStudentComponent } from './poll-list-student/poll-list-student.component';
import { PollVoteStudentComponent } from './poll-vote-student/poll-vote-student.component';
import { PollShowResultStudentComponent } from './poll-show-result-student/poll-show-result-student.component';

const routes:Routes = [
  {
    path:'list',
    component:PollListStudentComponent,
    pathMatch:'full'
  },
  {
    path:':poll_id/vote',
    component:PollVoteStudentComponent,
    pathMatch:'full'
  },
  {
    path:':poll_id/result',
    component:PollShowResultStudentComponent,
    pathMatch:'full'
  },
]

@NgModule({
  declarations: [
    PollListStudentComponent,
    PollVoteStudentComponent,
    PollShowResultStudentComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    NgSelectModule,
    DataTablesModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule.forRoot()
  ],
  exports: [
    RouterModule
  ]
})
export class PollManagementStudentModule { }
