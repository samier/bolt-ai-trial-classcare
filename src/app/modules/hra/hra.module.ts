import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoleListComponent } from './role-list/role-list.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { AddRoleComponent } from './add-role/add-role.component';
import { EditRoleComponent } from './edit-role/edit-role.component';
import { LeaveTypeListComponent } from './leave-type-list/leave-type-list.component';
import { AddLeaveTypeComponent } from './add-leave-type/add-leave-type.component';
import { EditLeaveTypeComponent } from './edit-leave-type/edit-leave-type.component';
import { AssignLeaveRoleComponent } from './assign-leave-role/assign-leave-role.component';
import { MenuListComponent } from './menu-list/menu-list.component';

import { SetLeaveApproverComponent } from './set-leave-approver/set-leave-approver.component';
import { RoleWiseUserPermissionComponent } from './role-wise-user-permission/role-wise-user-permission.component';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';

const routes:Routes =[
  {
    path:'role-list',
    component:RoleListComponent,
    pathMatch:'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'hra_role_list', permission: 'has_access', parentModule: 'hra' }
  },
  {
    path:'add-role',
    component:AddRoleComponent,
    pathMatch:'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'hra_role_list', permission: 'has_create',parentModule: 'hra'}
  },
  {
    path:'edit-role/:id',
    component:EditRoleComponent,
    pathMatch:'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'hra_role_list', permission: 'has_edit',  parentModule: 'hra'}
  },
  {
    path:'leave-type-list',
    component:LeaveTypeListComponent,
    pathMatch:'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'hra_leave_type', permission: 'has_access', parentModule: 'hra'}
  },
  {
    path:'add-leave-type',
    component:AddLeaveTypeComponent,
    pathMatch:'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'hra_leave_type', permission: 'has_create', parentModule: 'hra'}
  },
  {
    path:'edit-leave-type/:id',
    component:EditLeaveTypeComponent,
    pathMatch:'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'hra_leave_type', permission: 'has_edit', parentModule: 'hra'}
  },
  {
    path:'assign-leave-role/:id',
    component:AssignLeaveRoleComponent,
    pathMatch:'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'hra_leave_type', permission: 'has_access', parentModule: 'hra'}
  },  
  {
    path:'menu-list',
    component:MenuListComponent,
    pathMatch:'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'hra_leave_type', permission: 'has_access', parentModule: 'hra'}
  },  
  {
    path:'set-leave-approver/:id',
    component:SetLeaveApproverComponent,
    pathMatch:'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'hra_leave_type', permission: 'has_edit', parentModule: 'hra'}
  },
  {
    path:'role-wise-user-permission-list',
    component:RoleWiseUserPermissionComponent,
    pathMatch:'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'hra_access_list', permission: 'has_access', parentModule: 'hra'}
  },         
]

@NgModule({
  declarations: [
    RoleListComponent,
    AddRoleComponent,
    EditRoleComponent,
    LeaveTypeListComponent,
    AddLeaveTypeComponent,
    EditLeaveTypeComponent,
    AssignLeaveRoleComponent,
    MenuListComponent,
    SetLeaveApproverComponent,
    RoleWiseUserPermissionComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,    
    RouterModule.forChild(routes),
    NgSelectModule,
    CdkAccordionModule,
    SharedModule
  ]
})
export class HRAModule { }
