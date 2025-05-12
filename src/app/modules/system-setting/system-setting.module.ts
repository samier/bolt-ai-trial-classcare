import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SystemSettingRoutingModule } from './system-setting-routing.module';
import { OtpLogComponent } from './otp-log/otp-log.component';
import { SharedModule } from 'src/app/shared/shared.module';

import { RouterModule, Routes } from '@angular/router';
import { SystemSettingComponent } from './system-setting/system-setting.component';
import { FieldHideShowComponent } from './field-hide-show/field-hide-show.component';
import { InquiryModule } from '../inquiry/inquiry.module';
import { StudentFieldSettingComponent } from './student-field-setting/student-field-setting.component';
import { NotificationSettingComponent } from './notification-setting/notification-setting.component';
import { DragDropModule } from '@angular/cdk/drag-drop';



@NgModule({
  declarations: [
    SystemSettingComponent,
    FieldHideShowComponent,
    StudentFieldSettingComponent,
    OtpLogComponent,
    NotificationSettingComponent,
  ],
  imports: [
    CommonModule,
    SystemSettingRoutingModule,
    CommonModule,
    SharedModule,
    InquiryModule,
    DragDropModule
  ],
  exports: [
    StudentFieldSettingComponent
  ]
})
export class SystemSettingModule { }
