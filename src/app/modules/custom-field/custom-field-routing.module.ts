import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomFieldListComponent } from './custom-field-list/custom-field-list.component';
import { CustomFieldAddComponent } from './custom-field-add/custom-field-add.component';
import { PermissionGuard } from 'src/app/service/permission.service';

const routes: Routes = [
  {
    path:'',
    component : CustomFieldListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inquiry_custom_field_list', permission: 'has_access'}
  },
  {
    path:'add',
    component : CustomFieldAddComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inquiry_custom_field_list', permission: 'has_create'}
  },
  {
    path:':id',
    component : CustomFieldAddComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inquiry_custom_field_list', permission: 'has_edit'}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomFieldRoutingModule { }
