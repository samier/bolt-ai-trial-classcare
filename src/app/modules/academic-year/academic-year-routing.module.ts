import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { YearTransferComponent } from './year-transfer/year-transfer.component';
import { YearTransferListComponent } from './year-transfer-list/year-transfer-list.component';
import { YearTransferDetailsComponent } from './year-transfer-details/year-transfer-details.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { AcademicYearFormComponent } from './academic-year-form/academic-year-form.component';
import { AcademicYearListComponent } from './academic-year-list/academic-year-list.component';

const routes: Routes = [
  {
    path:'add',
    component:AcademicYearFormComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_academic_year', permission: 'has_create'}
  },
  {
    path:'edit/:id',
    component:AcademicYearFormComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_academic_year', permission: 'has_edit'}
  },
  {
    path:'list',
    component:AcademicYearListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_academic_year', permission: 'has_access'}
  },
  {
    path:'transfer',
    component:YearTransferComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_academic_year_transfer', permission: 'has_access'}
  },
  {
    path:'transfer-list',
    component:YearTransferListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_academic_year_transfer', permission: 'has_access'}
  },
  {
    path:'transfer-list/:id',
    component:YearTransferDetailsComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_academic_year_transfer', permission: 'has_access'}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademicYearRoutingModule { }
