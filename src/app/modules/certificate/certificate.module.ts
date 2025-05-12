import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { certificateComponent } from './certificate-list/certificate-list.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { FieldValueComponent } from './field-value/field-value.component';


const routes: Routes = [
  {
    path: 'list',
    component: certificateComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_certificate_generator', permission: 'has_access'}
  },
]
@NgModule({
  declarations: [
    certificateComponent,
    FieldValueComponent
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
    DragDropModule
  ],
  exports: [
    RouterModule
  ]
})
export class CertificateModule { }
