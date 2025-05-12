import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule ,ReactiveFormsModule } from '@angular/forms';
import { FeesCentersComponent } from './fees-centers/fees-centers.component';
import { FeesCollectionDetailComponent } from './fees-collection-detail/fees-collection-detail.component';
import { AddCenterComponent } from './add-center/add-center.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';

const routes : Routes =[
  {
    path: 'centers',
    component: FeesCentersComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_fees_collection_center', permission: 'has_access', parentModule : 'fees-collection' }
  },
  {
    path: 'edit-center/:id',
    component: AddCenterComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_fees_collection_center', permission: 'has_edit' , parentModule : 'fees-collection'}
  },
  {
    path: 'add-center',
    component: AddCenterComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_fees_collection_center', permission: 'has_create', parentModule : 'fees-collection'}
  },
  {
    path: 'detail/:id',
    component: FeesCollectionDetailComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_fees_collection_center', permission: 'has_access', parentModule : 'fees-collection'}
  },
];

@NgModule({
  declarations: [
    FeesCentersComponent,
    FeesCollectionDetailComponent,
    AddCenterComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgSelectModule,
    DataTablesModule,
    FormsModule,
    NgMultiSelectDropDownModule,
    ReactiveFormsModule,
    SharedModule,
  ]
})
export class FeesCollectionCenterModule { }
