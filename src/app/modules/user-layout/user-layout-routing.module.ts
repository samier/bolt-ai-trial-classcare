import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import { AddUserComponent } from '../user/add-user/add-user.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { AdminUserListComponent } from '../user/admin-user-list/admin-user-list.component';
import { EditUserComponent } from '../user/edit-user/edit-user.component';
import { SuperAdminService } from 'src/app/service/super-admin.service';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { PlanDetailsComponent } from './plan-details/plan-details.component';
import { UserBranchListComponent } from './user-branch-list/user-branch-list.component';
import { UserBranchAddEditComponent } from './user-branch-add-edit/user-branch-add-edit.component';

const routes: Routes = [
  {
    path : '',
    component : UserLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'admin-user-list',
        pathMatch: 'full',
      },
      {
        path:'admin-user-list',
        component:AdminUserListComponent,
        pathMatch:'full',
        canActivate: [PermissionGuard, SuperAdminService],
        data: {moduleName: 'faculty_faculty', permission: 'has_access'}
      },
      {
        path:'add-user',
        component:AddUserComponent,
        pathMatch:'full',
        canActivate: [PermissionGuard, SuperAdminService],
        data: {moduleName: 'faculty_faculty', permission: 'has_create'}
      },
      {
        path:'edit-user/:id',
        component:EditUserComponent,
        pathMatch:'full',
        canActivate: [PermissionGuard, SuperAdminService],
        data: {moduleName: 'faculty_faculty', permission: 'has_edit'}
      },
      {
        path: 'profile',
        component : UserProfileComponent,
      },
      {
        path: 'plan-details',
        component : PlanDetailsComponent,
      },
      {
        path: 'branch-list',
        component : UserBranchListComponent,
      },
      {
        path: 'branch-add',
        component : UserBranchAddEditComponent,
      },
      {
        path: 'branch-edit/:id',
        component : UserBranchAddEditComponent,
      }
    ]
  },
  // {
  //   path: 'branch-list',
  //   component : UserBranchListComponent,
  //   canActivate: [PermissionGuard, SuperAdminService],
  // },
  // {
  //   path: 'branch-add',
  //   component : UserBranchAddEditComponent,
  // },
  // {
  //   path: 'branch-edit/:id',
  //   component : UserBranchAddEditComponent,
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserLayoutRoutingModule { }
