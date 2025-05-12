import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrustDetailsComponent } from './trust-details/trust-details.component';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrustCreateComponent } from './trust-create/trust-create.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'list',
    component: TrustDetailsComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_trust_details', permission: 'has_access'}
  },
  {
    path: 'create',
    component: TrustCreateComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_trust_details', permission: 'has_create'}
  },
  {
    path: 'edit/:id',
    component: TrustCreateComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_trust_details', permission: 'has_edit'}
  }
];

@NgModule({
  declarations: [
    TrustDetailsComponent,
    TrustCreateComponent
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
export class TrustDetailManagementModule { }
