import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from "angular-datatables";
import { RouterModule, Routes } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StudentRequisitionFormComponent } from './student-requisition-form/student-requisition-form.component';
import { StudentRequisitionListComponent } from './student-requisition-list/student-requisition-list.component';

const routes: Routes = [ 
  {
    path: 'student-requisition-form/:id',
    component: StudentRequisitionFormComponent,
    pathMatch: 'full'
  },       
  {
    path: 'student-requisition-list',
    component: StudentRequisitionListComponent,
    pathMatch: 'full'
  },    
]

@NgModule({
  declarations: [
    StudentRequisitionFormComponent,
    StudentRequisitionListComponent,
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
export class InventoryManagementStudentModule { }
