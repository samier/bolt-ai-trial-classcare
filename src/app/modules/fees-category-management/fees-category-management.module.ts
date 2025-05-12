import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeesCategoryComponent } from './fees-category-list/fees-category-list.component';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeesCategoryCreateComponent } from './fees-category-create/fees-category-create.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'list',
    component: FeesCategoryComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_fees_category', permission: 'has_access'}
  },
  {
    path: 'create',
    component: FeesCategoryCreateComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_fees_category', permission: 'has_access'}
  },
  {
    path: 'edit/:id',
    component: FeesCategoryCreateComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_fees_category', permission: 'has_access'}
  }
];

@NgModule({
  declarations: [
    FeesCategoryComponent,
    FeesCategoryCreateComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    RouterModule.forChild(routes),
    DataTablesModule,
    NgMultiSelectDropDownModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  exports: [
    RouterModule
  ]
})
export class FeesCategoryManagementModule { }
