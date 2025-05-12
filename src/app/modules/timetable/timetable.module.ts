import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AddLectureTimingsComponent } from './add-lecture-timings/add-lecture-timings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssignRoomComponent } from './assign-room/assign-room.component';
import { AssignLectureComponent } from './assign-lecture/assign-lecture.component';
import { CreateTimetableComponent } from './create-timetable/create-timetable.component';
import { CreateRoomComponent } from './create-room/create-room.component';
import { TeachersTimetableComponent } from './teachers-timetable/teachers-timetable.component';
import { ProxyTeachersTimetableComponent } from './proxy-teachers-timetable/proxy-teachers-timetable.component';
import { ProxyTimetableListComponent } from './proxy-timetable-list/proxy-timetable-list.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { FacultyTimetableComponent } from './faculty-timetable/faculty-timetable.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SubjectLectureComponent } from './subject-lecture/subject-lecture.component';
import { AddTimeSlotComponent } from './add-time-slot/add-time-slot.component';
import { AssignSubjectComponent } from './assign-subject/assign-subject.component';
import { AddExtraLectureComponent } from './add-extra-lecture/add-extra-lecture.component';
import { TimetableComponent } from './timetable/timetable.component';
import { ExtraTimetableListComponent } from './extra-timetable-list/extra-timetable-list.component';
import { downloadTimetableComponent } from './download-timetable/download-timetable.component';

const routes: Routes = [
  {
    path: 'add-lecture-timings',
    component: AddLectureTimingsComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_lecture_timing', permission: 'has_access' , parentModule : 'timetable'}
  },
  {
    path: 'assign-room',
    component: AssignRoomComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_assign_room', permission: 'has_access', parentModule : 'timetable'}
  },
  {
    path: 'create-room',
    component: CreateRoomComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_assign_room', permission: 'has_access', parentModule : 'timetable'}
  },
  {
    path: 'subject-lecture-list',
    component: AssignLectureComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_subject_lecture', permission: 'has_access', parentModule : 'timetable'}
  },
  {
    path: 'subject-lecture',
    component: SubjectLectureComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_subject_lecture', permission: 'has_create', parentModule : 'timetable'}
  },
  {
    path: 'subject-lecture/:id',
    component: SubjectLectureComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_subject_lecture', permission: 'has_edit', parentModule : 'timetable'}
  },
  // {
  //   path: 'create-timetable',
  //   component: CreateTimetableComponent,
  //   pathMatch: 'full',
  //   canActivate: [PermissionGuard],
  //   data: {moduleName: 'administrator_timetable', permission: 'has_access', parentModule : 'timetable'}
  // },
  {
    path: 'create-timetable',
    component: TimetableComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_timetable', permission: 'has_access', parentModule : 'timetable'}
  },
  {
    path: 'teachers-timetable',
    component: TeachersTimetableComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_timetable', permission: 'has_access', parentModule : 'timetable'}
  },
  {
    path: 'proxy-teachers-timetable',
    component: ProxyTeachersTimetableComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_proxy_lecture', permission: 'has_access', parentModule : 'timetable'}
  },
  {
    path: 'proxy-timetable-list',
    component: ProxyTimetableListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_proxy_lecture', permission: 'has_access', parentModule : 'timetable'}
  },
  {
    path: 'faculty-timetable',
    component: FacultyTimetableComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_faculty_timetable', permission: 'has_access', parentModule : 'timetable'}
  },
  {
    path: 'add-time-slot',
    component: AddTimeSlotComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_lecture_timing', permission: 'has_access', parentModule : 'timetable'}
  },
  {
    path: 'add-subject',
    component: AssignSubjectComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_subject_faculty', permission: 'has_access', parentModule : 'timetable'}
  },
  {
    path: 'add-extra-lecture',
    component: AddExtraLectureComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_extra_lecture', permission: 'has_access', parentModule : 'timetable'}
  },

  {
    path: 'extra-lecture-list',
    component: ExtraTimetableListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_extra_lecture', permission: 'has_access', parentModule : 'timetable'}
  },

  {
    path: 'download-timetable',
    component: downloadTimetableComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_timetable', permission: 'has_download', parentModule : 'timetable'}
  },
];



@NgModule({
  declarations: [
    AddLectureTimingsComponent,
    AssignRoomComponent,
    AssignLectureComponent,
    CreateTimetableComponent,
    CreateRoomComponent,
    TeachersTimetableComponent,
    ProxyTeachersTimetableComponent,
    ProxyTimetableListComponent,
    FacultyTimetableComponent,
    SubjectLectureComponent,
    AddTimeSlotComponent,
    AssignSubjectComponent,
    AddExtraLectureComponent,
    TimetableComponent,
    ExtraTimetableListComponent,
    downloadTimetableComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    RouterModule.forChild(routes),
    DataTablesModule,
    NgMultiSelectDropDownModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class TimetableModule { }
