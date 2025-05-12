import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateSchoolComponent } from './create-school/create-school.component';
import { SchoolListComponent } from './school-list/school-list.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { EditSchoolComponent } from './edit-school/edit-school.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'create',
    component: CreateSchoolComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_school_name', permission: 'has_create'}
  },
  {
    path: 'list',
    component: SchoolListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_school_name', permission: 'has_access'}
  },
  {
    path: 'edit/:id',
    component: EditSchoolComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_school_name', permission: 'has_edit'}
  },
];

@NgModule({
  declarations: [
    CreateSchoolComponent,
    SchoolListComponent,
    EditSchoolComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DataTablesModule,
    SharedModule
  ]
})
export class SchoolNameModule { }
