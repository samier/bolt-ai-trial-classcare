import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CombineMarksheetListComponent } from './combine-marksheet-list/combine-marksheet-list.component';
import { CreateEditCombineMarksheetComponent } from './create-edit-combine-marksheet/create-edit-combine-marksheet.component';
import { CombineResultSetupComponent } from './combine-result-setup/combine-result-setup.component';
import { DownloadBatchWiseCombineResultComponent } from './download-batch-wise-combine-result/download-batch-wise-combine-result.component';
import { DownloadStudentWiseCombineResultComponent } from './download-student-wise-combine-result/download-student-wise-combine-result.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { GenerateMarksheetSetupComponent } from './generate-marksheet-setup/generate-marksheet-setup.component';

const routes: Routes = [
  {
    path: 'combine-marksheet-list',
    component: CombineMarksheetListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_marksheet_create', permission: 'has_access' }
  },
  {
    path: 'create-marksheet',
    component: CreateEditCombineMarksheetComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_marksheet_create', permission: 'has_create' }
  },
  {
    path: 'edit-marksheet/:id',
    component: CreateEditCombineMarksheetComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_marksheet_create', permission: 'has_edit' }
  },
  {
    // path: 'download-combine-result/:id',
    path: 'download-batch-combine-result',
    component: DownloadBatchWiseCombineResultComponent,
    pathMatch: 'full'
  },
  {
    // path: 'download-combine-result/:id',
    path: 'download-combine-result/:id',
    component: DownloadStudentWiseCombineResultComponent,
    pathMatch: 'full'
  },
  {
    path: 'combine-result-setup/:id',
    component: CombineResultSetupComponent,
    pathMatch: 'full'
  },
  {
    path: 'generate-marksheet-setup/:marksheetId',
    component: GenerateMarksheetSetupComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CombineMarksheetRoutingModule { }
