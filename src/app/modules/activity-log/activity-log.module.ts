import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivityLogRoutingModule } from './activity-log-routing.module';
import { ActivityLogListComponent } from './activity-log-list/activity-log-list.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ActivityLogListComponent
  ],
  imports: [
    CommonModule,
    ActivityLogRoutingModule,
    SharedModule,
    
  ]
})
export class ActivityLogModule { }
