import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseListComponent } from './course-list/course-list.component';
import { CourseFormComponent } from './course-form/course-form.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { CourseOrderComponent } from './course-order/course-order.component';

const routes: Routes = [
  {
    path:'list',
    component : CourseListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_course', permission: 'has_access'}
  },
  {
    path:'add',
    component : CourseFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_course', permission: 'has_create'}
  },
  {
    path:'edit/:id',
    component : CourseFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_course', permission: 'has_edit'}
  },
  {
    path:'order',
    component : CourseOrderComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_course', permission: 'has_access'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CourseRoutingModule { }
