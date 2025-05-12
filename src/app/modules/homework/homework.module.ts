import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeworkListComponent } from './homework-list/homework-list.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddHomeworkComponent } from './add-homework/add-homework.component';
import { ViewHomeworkComponent } from './view-homework/view-homework.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { AddNoticeComponent } from './add-notice/add-notice.component';
import { ViewNoticeComponent } from './view-notice/view-notice.component';
import { NoticeListComponent } from './notice-list/notice-list.component';
import { NoticeHistoryComponent } from './notice-history/notice-history.component';
import { StudentNoticeHistoryComponent } from './student-notice-history/student-notice-history.component';

const routes: Routes = [
  // Homework
  {
    path: 'homework-list',
    component: HomeworkListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_homework', permission: 'has_access', parentModule: 'administrator' }
  },
  {
    path: 'view-homework/:id',
    component: ViewHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_homework', permission: 'has_access', parentModule: 'administrator' }
  },
  {
    path: 'add-homework',
    component: AddHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_homework', permission: 'has_create', parentModule: 'administrator' }
  },
  {
    path: 'edit-homework/:id',
    component: AddHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_homework', permission: 'has_edit', parentModule: 'administrator' }
  },

  // Assignment
  {
    path: 'assignment-list',
    component: HomeworkListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_assignment', permission: 'has_access', parentModule: 'administrator' }
  },
  {
    path: 'view-assignment/:id',
    component: ViewHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_assignment', permission: 'has_access', parentModule: 'administrator' }
  },
  {
    path: 'add-assignment',
    component: AddHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_assignment', permission: 'has_create', parentModule: 'administrator' }
  },
  {
    path: 'edit-assignment/:id',
    component: AddHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_assignment', permission: 'has_edit', parentModule: 'administrator' }
  },

  // Classwork
  {
    path: 'classwork-list',
    component: HomeworkListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_classwork', permission: 'has_access', parentModule: 'administrator' }
  },
  {
    path: 'view-classwork/:id',
    component: ViewHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_classwork', permission: 'has_access', parentModule: 'administrator' }
  },
  {
    path: 'add-classwork',
    component: AddHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_classwork', permission: 'has_create', parentModule: 'administrator' }
  },
  {
    path: 'edit-classwork/:id',
    component: AddHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_classwork', permission: 'has_edit', parentModule: 'administrator' }
  },

  // Syallbus
  {
    path: 'syllabus-list',
    component: HomeworkListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_syllabus', permission: 'has_access', parentModule: 'administrator' }
  },
  {
    path: 'view-syllabus/:id',
    component: ViewHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_syllabus', permission: 'has_access', parentModule: 'administrator' }
  },
  {
    path: 'add-syllabus',
    component: AddHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_syllabus', permission: 'has_create', parentModule: 'administrator' }
  },
  {
    path: 'edit-syllabus/:id',
    component: AddHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_syllabus', permission: 'has_edit', parentModule: 'administrator' }
  },

  // Add notes
  {
    path: 'notes-list',
    component: HomeworkListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_notes', permission: 'has_access', parentModule: 'administrator' }
  },
  {
    path: 'view-notes/:id',
    component: ViewHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_notes', permission: 'has_access', parentModule: 'administrator' }
  },
  {
    path: 'add-notes',
    component: AddHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_notes', permission: 'has_create', parentModule: 'administrator' }
  },
  {
    path: 'edit-notes/:id',
    component: AddHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_notes', permission: 'has_edit', parentModule: 'administrator' }
  },

  // Video Link 
  {
    path: 'videolink-list',
    component: HomeworkListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_videolink', permission: 'has_access', parentModule: 'administrator' }
  },
  {
    path: 'view-videolink/:id',
    component: ViewHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_videolink', permission: 'has_access', parentModule: 'administrator' }
  },
  {
    path: 'add-videolink',
    component: AddHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_videolink', permission: 'has_create', parentModule: 'administrator' }
  },
  {
    path: 'edit-videolink/:id',
    component: AddHomeworkComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_videolink', permission: 'has_edit', parentModule: 'administrator' }
  },

  //notice
  {
    path: 'notice-list',
    component: NoticeListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_notice', permission: 'has_access', parentModule: 'administrator' }
  },
  {
    path: 'view-notice/:id',
    component: ViewNoticeComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_notice', permission: 'has_access', parentModule: 'administrator' }
  },
  {
    path: 'add-notice',
    component: AddNoticeComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_notice', permission: 'has_create', parentModule: 'administrator' }
  },
  {
    path: 'edit-notice/:id',
    component: AddNoticeComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_notice', permission: 'has_edit', parentModule: 'administrator' }
  },
  {
    path: 'notice-history',
    component: NoticeHistoryComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_notice', permission: 'has_access', parentModule: 'administrator' }
  },

]

@NgModule({
  declarations: [
    HomeworkListComponent,
    AddHomeworkComponent,
    ViewHomeworkComponent,
    AddNoticeComponent,
    ViewNoticeComponent,
    NoticeListComponent,
    NoticeHistoryComponent,
    StudentNoticeHistoryComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class HomeworkModule { }
