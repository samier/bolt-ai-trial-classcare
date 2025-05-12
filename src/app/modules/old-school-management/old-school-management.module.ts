import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { oldSchoolComponent } from './old-school/old-school.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'list',
    component: oldSchoolComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_old_school', permission: 'has_access' , parentModule : 'school'}
  },
];
@NgModule({
  declarations: [
    oldSchoolComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    RouterModule.forChild(routes),
    DataTablesModule,
    NgMultiSelectDropDownModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    RouterModule
  ]
})
export class oldSchoolManagementModule { }
