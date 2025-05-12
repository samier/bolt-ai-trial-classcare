import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadFileComponent } from './upload-file/upload-file.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { ImportFeesComponent } from './import-fees/import-fees.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { ImportUsersComponent } from './import-users/import-users.component';
import { SharedModule } from 'src/app/shared/shared.module';

const routes:Routes =[
  {
    path:'import-form',
    component:UploadFileComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_student', permission: 'has_import'} // Example: passing roles as a parameter
  },
  {
    path: 'import-fees',
    component: ImportFeesComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_fees', permission: 'has_import'} // Example: passing roles as a parameter
  },
  {
    path: 'import-users',
    component: ImportUsersComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'faculty_faculty', permission: 'has_import'} // Example: passing
  }
];

@NgModule({
  declarations: [
    UploadFileComponent,
    ImportFeesComponent,
    ImportUsersComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,    
    RouterModule.forChild(routes),
    NgSelectModule,
    SharedModule
  ]
})
export class ExcelImportModule { }
