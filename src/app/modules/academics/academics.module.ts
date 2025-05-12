import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcademicsComponent } from './academics/academics.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TransportModule } from 'src/app/modules/transport-management/transport.module';
import { HostelManagementModule } from 'src/app/modules/hostel-management/hostel-management.module';
import { AttachmentsComponent } from './attachments/attachments.component';
import { GenerateDiscountReceiptComponent } from './generate-discount-receipt/generate-discount-receipt.component';
import { AddAttachmentComponent } from './add-attachment/add-attachment.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ViewAttachmentsComponent } from './view-attachments/view-attachments.component';

const routes: Routes = [
  {
    path: 'academic-details/:id',
    component: AcademicsComponent,
    pathMatch: 'full'
  },
];

@NgModule({
  declarations: [
    AcademicsComponent,
    AttachmentsComponent,
    GenerateDiscountReceiptComponent,
    AddAttachmentComponent,
    ViewAttachmentsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    DataTablesModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NgMultiSelectDropDownModule.forRoot(),
    NgbModule,
    TransportModule,
    HostelManagementModule,
    SharedModule
  ]
})
export class AcademicsModule { }
