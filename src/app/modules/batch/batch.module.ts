import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BatchRoutingModule } from './batch-routing.module';
import { BatchTransferComponent } from './batch-transfer/batch-transfer.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BatchTransferListComponent } from './batch-transfer-list/batch-transfer-list.component';
import { BatchTransferDetailsComponent } from './batch-transfer-details/batch-transfer-details.component';
import { ManageStudentRollNoComponent } from './manage-student-roll-no/manage-student-roll-no.component';
import { BatchComponent } from './batch/batch.component';
import { AddBatchModalComponent } from './add-batch-modal/add-batch-modal.component';
import { BatchOrderComponent } from './batch-order/batch-order.component';
import { StudentAssignBatchComponent } from './student-assign-batch/student-assign-batch.component';

@NgModule({
  declarations: [
    BatchTransferComponent,
    BatchTransferListComponent,
    BatchTransferDetailsComponent,
    ManageStudentRollNoComponent,
    BatchComponent,
    AddBatchModalComponent,
    BatchOrderComponent,
    StudentAssignBatchComponent
  ],
  imports: [
    CommonModule,
    BatchRoutingModule,
    SharedModule,
  ]
})
export class BatchModule { }
