import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from "angular-datatables";
import { RouterModule, Routes } from '@angular/router';
import { AdminLeaveEditFormComponent } from './admin-leave-edit-form/admin-leave-edit-form.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { StudentLeaveComponent } from './student-leave/student-leave.component';
import { StudentLeaveListComponent } from './student-leave-list/student-leave-list.component';
import { StudentLeaveEditFormComponent } from './student-leave-edit-form/student-leave-edit-form.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

const routes: Routes = [ 
  {
    path: 'student-leave-edit-form/:id',
    component: StudentLeaveEditFormComponent,
    pathMatch: 'full'
  },       
  {
    path: 'student-leave',
    component: StudentLeaveComponent,
    pathMatch: 'full'
  },
  {
    path: 'student-leave-list',
    component: StudentLeaveListComponent,
    pathMatch: 'full'
  },    
]

@NgModule({
  declarations: [
    StudentLeaveComponent,
    StudentLeaveListComponent,
    StudentLeaveEditFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DataTablesModule,
    RouterModule.forChild(routes),
    NgxPaginationModule,
    NgbModule
  ],
  exports: [
    RouterModule
  ]
})
export class LeaveManagementStudentModule { }
