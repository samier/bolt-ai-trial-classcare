import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/service/permission.service';
import { InquiryFormLayoutComponent } from './inquiry-form-layout/inquiry-form-layout.component';
import { InquiryCustomFormListComponent } from './inquiry-custom-form-list/inquiry-custom-form-list.component';

const routes: Routes = [

  {
    path: 'inquiry-list',
    component: InquiryCustomFormListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'inquiry_form_builder', permission: 'has_access' }
  },
  {
    path: 'inquiry-add',
    component: InquiryFormLayoutComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'inquiry_form_builder', permission: 'has_create' }
  },
  {
    path: 'inquiry-edit/:id',
    component: InquiryFormLayoutComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'inquiry_form_builder', permission: 'has_edit' }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormBuilderRoutingModule { }
