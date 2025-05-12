import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InquiryListComponent } from './inquiry-list/inquiry-list.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { InquiryAddComponent } from './inquiry-add/inquiry-add.component';
import { InquiryImportComponent } from './inquiry-import/inquiry-import.component';
import { InquiryFieldSettingComponent } from './inquiry-field-setting/inquiry-field-setting.component';
import { FollowUpComponent } from './follow-up/follow-up.component';
import { AddFollowUpComponent } from './add-follow-up/add-follow-up.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { InquiryFeesModelComponent } from './inquiry-fees-model/inquiry-fees-model.component';
import { InquiryViewComponent } from './inquiry-view/inquiry-view.component';

const routes: Routes = [
  {
    path: 'list',
    component: InquiryListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inquiry_inquiry', permission: 'has_access'}
  },
  {
    path: 'add',
    component: InquiryAddComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inquiry_inquiry', permission: 'has_create'}
  },
  {
    path: 'edit/:id',
    component: InquiryAddComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inquiry_inquiry', permission: 'has_edit'}
  },
  {
    path: 'import',
    component: InquiryImportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inquiry_inquiry', permission: 'has_import'}
  },
  {
    path: 'field-setting',
    component: InquiryFieldSettingComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inquiry_inquiry_field_setting', permission: 'has_access'}
  },
  {
    path: 'follow-up/:id',
    component: FollowUpComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inquiry_follow_up', permission: 'has_access'}
  },
  {
    path: 'add/follow-up/:id',
    component: AddFollowUpComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inquiry_follow_up', permission: 'has_create'}
  },
  {
    path: 'follow-up/:id/edit/:followUpId',
    component: AddFollowUpComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inquiry_follow_up', permission: 'has_edit'}
  },
  {
    path: 'view/:id',
    component: InquiryViewComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inquiry_inquiry', permission: 'has_access'}
  },
]

@NgModule({
  declarations: [
    InquiryListComponent,
    InquiryAddComponent,
    InquiryImportComponent,
    InquiryFieldSettingComponent,
    FollowUpComponent,
    AddFollowUpComponent,
    InquiryFeesModelComponent,
    InquiryViewComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  exports : [
    InquiryFieldSettingComponent
  ]
})
export class InquiryModule { }
