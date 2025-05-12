import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PermissionRoutingModule } from './permission-routing.module';
import { StudentPermissionComponent } from './student-permission/student-permission.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedRoutingModule } from '../shared-routing.module';


@NgModule({
  declarations: [
    StudentPermissionComponent
  ],
  imports: [
    CommonModule,
    PermissionRoutingModule,
    SharedModule,
  ]
})
export class PermissionModule { }
