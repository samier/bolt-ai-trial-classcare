import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityLogListComponent } from './activity-log-list/activity-log-list.component';
import { PermissionGuard } from 'src/app/service/permission.service';

const routes: Routes = [
  {
    path: 'list',
    component : ActivityLogListComponent,
    pathMatch: 'full',
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivityLogRoutingModule { }
