import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UploadDocumentComponent } from './upload-document/upload-document.component';
import { PermissionGuard } from 'src/app/service/permission.service';

const routes: Routes = [
  {
    path:'',
    component : UploadDocumentComponent,
    pathMatch : 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_template_manager', permission: 'has_access' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UploadDocumentRoutingModule { }
