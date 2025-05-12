import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BatchTransferComponent } from './batch-transfer/batch-transfer.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { BatchTransferListComponent } from './batch-transfer-list/batch-transfer-list.component';
import { BatchTransferDetailsComponent } from './batch-transfer-details/batch-transfer-details.component';
import { ManageStudentRollNoComponent } from './manage-student-roll-no/manage-student-roll-no.component';
import { BatchComponent } from './batch/batch.component';
import { BatchOrderComponent } from './batch-order/batch-order.component';
import { StudentAssignBatchComponent } from './student-assign-batch/student-assign-batch.component';

const routes: Routes = [
  {
    path:'',
    component:BatchComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_batch', permission: 'has_access'}
  },
  {
    path:'transfer',
    component:BatchTransferComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_batch', permission: 'has_create'}
  },
  {
    path:'list',
    component:BatchTransferListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_batch', permission: 'has_access'}
  },
  {
    path:'list/:id',
    component:BatchTransferDetailsComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_batch', permission: 'has_access'}
  },
  {
    path:'manage-student-roll-no',
    component:ManageStudentRollNoComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_batch', permission: 'has_access'}
  },
  {
    path: 'order',
    component: BatchOrderComponent,
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_batch', permission: 'has_access'},
  },
  {
    path: 'student/:id',
    component: StudentAssignBatchComponent,
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_batch', permission: 'has_access'},
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BatchRoutingModule { }
