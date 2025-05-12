import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterModule, Routes } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { DataTablesModule } from 'angular-datatables';

import { StudentLeavingCertificateListComponent } from './student-leaving-certificate-list/student-leaving-certificate-list.component';
import { StudentLeavingCertificateAddComponent } from './student-leaving-certificate-add/student-leaving-certificate-add.component';
import { ViewComponent } from './view/view.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { StudentLeavingCertificateEditComponent } from './student-leaving-certificate-edit/student-leaving-certificate-edit.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { MatNativeDateModule } from '@angular/material/core';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'list',
    component: StudentLeavingCertificateListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_leaving_certificate', permission: 'has_access', parentModule: 'student-leaving-certificate'}
  },
  {
    path: 'add',
    component: StudentLeavingCertificateAddComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_leaving_certificate', permission: 'has_create', parentModule: 'student-leaving-certificate'}
  },
  {
    path: 'add/:student_id',
    component: StudentLeavingCertificateAddComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_leaving_certificate', permission: 'has_create'}
  },
  {
    path: 'view/:id',
    component: ViewComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_leaving_certificate', permission: 'has_download', parentModule: 'student-leaving-certificate'}
  },
  {
    path: 'edit/:id',
    component: StudentLeavingCertificateEditComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_leaving_certificate', permission: 'has_edit', parentModule: 'student-leaving-certificate'}
  },
  {
    path: 'view-details/:id',
    component: StudentLeavingCertificateEditComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_leaving_certificate', permission: 'has_access', parentModule: 'student-leaving-certificate', readonly:true}
  },
];


@NgModule({
  declarations: [
    StudentLeavingCertificateListComponent,
    StudentLeavingCertificateAddComponent,
    ViewComponent,
    StudentLeavingCertificateEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,    
    RouterModule.forChild(routes),
    NgxPaginationModule,
    DataTablesModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgbDropdownModule,
    CdkAccordionModule,
    NgxDaterangepickerMd.forRoot({
      separator: ' - ',
      applyLabel: 'Okay',
    }),
    MatNativeDateModule,
    MatDatepickerModule,
    SharedModule
  ],
  exports: [
    RouterModule
  ]
})
export class StudentLeavingCertificateModule { }
