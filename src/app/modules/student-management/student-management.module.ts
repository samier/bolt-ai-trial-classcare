import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { StudentBulkEditComponent } from './student-bulk-edit/student-bulk-edit.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DataTablesModule } from 'angular-datatables';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'bulk-edit',
    component: StudentBulkEditComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_student_bulk_edit', permission: 'has_access'}
  },
];

@NgModule({
  declarations: [
    StudentBulkEditComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NgMultiSelectDropDownModule.forRoot(),
    DataTablesModule,
    NgbModule,
    SharedModule
  ],
  exports: [
    RouterModule
  ]
})
export class StudentManagementModule { }
