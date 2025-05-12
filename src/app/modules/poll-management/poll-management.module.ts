import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PollCreateComponent } from './poll-create/poll-create.component';
import { PollListComponent } from './poll-list/poll-list.component';
import { PollVoteComponent } from './poll-vote/poll-vote.component';
import { PollShowResultComponent } from './poll-show-result/poll-show-result.component';
import { PollResultDetailComponent } from './poll-result-detail/poll-result-detail.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';

const routes:Routes = [
  {
    path:'list',
    component:PollListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_poll_management', permission: 'has_access'}
  },
  {
    path:'create',
    component:PollCreateComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_poll_management', permission: 'has_create'}
  },
  {
    path:'edit/:id',
    component:PollCreateComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_poll_management', permission: 'has_edit'}
  },
  {
    path:':id/vote',
    component:PollVoteComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_poll_management', permission: 'has_access'}
  },
  {
    path:':poll_id/result',
    component:PollShowResultComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_poll_management', permission: 'has_access'}
  },
  {
    path:':poll_id/result-detail',
    component:PollResultDetailComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_poll_management', permission: 'has_access'}
  },
]

@NgModule({
  declarations: [
    PollCreateComponent,
    PollListComponent,
    PollVoteComponent,
    PollShowResultComponent,
    PollResultDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    NgSelectModule,
    DataTablesModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule.forRoot(),
    SharedModule
  ],
  exports: [
    RouterModule
  ]
})
export class PollManagementModule { }
