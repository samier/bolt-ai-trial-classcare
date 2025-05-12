import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeesImportListComponent } from './fees-import-list/fees-import-list.component';
import { FeesImportDetailComponent } from './fees-import-detail/fees-import-detail.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'list',
    component: FeesImportListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_imported_fees_list', permission: 'has_access', parentModule :'fees'}
  },
  {
    path: 'detail/:id',
    component: FeesImportDetailComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_imported_fees_list', permission: 'has_access', parentModule :'fees'}
  },  
];

@NgModule({
  declarations: [
    FeesImportListComponent,
    FeesImportDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DataTablesModule,
    SharedModule,
  ]
})
export class FeesImportModule { }
