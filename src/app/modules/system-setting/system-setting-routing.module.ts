import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemSettingComponent } from './system-setting/system-setting.component';
import { NotificationSettingComponent } from './notification-setting/notification-setting.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { OtpLogComponent } from './otp-log/otp-log.component';

const routes: Routes = [
  {
    path : '',
    redirectTo : 'system',
    pathMatch: 'full',
  },
  {
    path : 'system',
    pathMatch : 'full',
    component : SystemSettingComponent,
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_system_setting', permission: 'has_access'}
  },
  {
    path : 'notification',
    pathMatch : 'full',
    component : NotificationSettingComponent,
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_notification', permission: 'has_access'}
  },
  {
    path : 'otp-log',
    component : OtpLogComponent,
    pathMatch : 'full'
  },
  {
    path : 'system/:id',
    pathMatch : 'full',
    component : SystemSettingComponent,
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_system_setting', permission: 'has_access'}
  },
  {
    path : 'notification/:id',
    pathMatch : 'full',
    component : NotificationSettingComponent,
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_notification', permission: 'has_access'}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemSettingRoutingModule { }
