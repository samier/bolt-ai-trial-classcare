import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WardenListComponent } from './warden-list/warden-list.component';
import { WardenComponent } from './warden/warden.component';
import { HostelListComponent } from './hostel-list/hostel-list.component';
import { HostelComponent } from './hostel/hostel.component';
import { RoomComponent } from './room/room.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RoomListComponent } from './room-list/room-list.component';
import { studentRoomComponent } from './sudent-room/student-room.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { RoomTypeComponent } from './room-type/room-type.component';
import { CreateRoomTypeComponent } from './room-type/create-room-type/create-room-type.component';
import { WingComponent } from './wing/wing.component';
import { CreateWingComponent } from './wing/create-wing/create-wing.component';
import { CreateFloorComponent } from './floor/create-floor/create-floor.component';
import { FloorComponent } from './floor/floor.component';
import { EditFloorComponent } from './floor/edit-floor/edit-floor.component';
import { hostelStudentTransferComponent } from './hostel-student-transfer/hostel-student-transfer.component';
import { StudentHostelRoomComponent } from './student-hostel-room/student-hostel-room.component';
import { HostelReportComponent } from './hostel-report/hostel-report.component';
import { SendSmsComponent } from './hostel-report/send-sms/send-sms.component';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'list-warden',
    component: WardenListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'hostel_management_warden', permission: 'has_access', parentModule: 'hostel' }
  },
  {
    path: 'create-warden',
    component: WardenComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'hostel_management_warden', permission: 'has_create', parentModule: 'hostel' }
  },
  {
    path: 'edit-warden/:id',
    component: WardenComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'hostel_management_warden', permission: 'has_edit', parentModule: 'hostel'}
  },


  {
    path: 'list',
    component: HostelListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'hostel_management_hostel', permission: 'has_access', parentModule: 'hostel' }
  },
  {
    path: 'create',
    component: HostelComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'hostel_management_hostel', permission: 'has_create', parentModule: 'hostel' }
  },
  {
    path: 'edit/:id',
    component: HostelComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'hostel_management_hostel', permission: 'has_edit', parentModule: 'hostel' }
  },
  {
    path: 'list-room',
    component: RoomListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'hostel_management_room', permission: 'has_access', parentModule: 'hostel' }
  },
  {
    path: 'create-room',
    component: RoomComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'hostel_management_room', permission: 'has_create', parentModule: 'hostel' }
  },
  {
    path: 'edit-room/:id',
    component: RoomComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'hostel_management_room', permission: 'has_edit', parentModule: 'hostel' }
  },
  {
    path: 'list-floor/:id',
    component: FloorComponent,
    pathMatch: 'full',
  },
  {
    path: 'assign-student/:id',
    component: studentRoomComponent,
    pathMatch: 'full'
  },
  {
    path: 'room-types',
    component: RoomTypeComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'hostel_management_room_type', permission: 'has_access', parentModule: 'hostel' }
  },
  {
    path: 'wings',
    component: WingComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'hostel_management_wings', permission: 'has_access', parentModule: 'hostel' }
  },
  {
    path: 'student-transfer',
    component: hostelStudentTransferComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'hostel_management_hostel_student_transfer', permission: 'has_access', parentModule: 'hostel' }
  },
  {
    path: 'room-report',
    component: HostelReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'hostel_management_hostel_room_report', permission: 'has_access' }
  },
];
@NgModule({
  declarations: [
    WardenListComponent,
    WardenComponent,
    HostelListComponent,
    HostelComponent,
    RoomListComponent,
    RoomComponent,
    studentRoomComponent,
    RoomTypeComponent,
    CreateRoomTypeComponent,
    WingComponent,
    CreateWingComponent,
    FloorComponent,
    CreateFloorComponent,
    EditFloorComponent,
    hostelStudentTransferComponent,
    StudentHostelRoomComponent,
    HostelReportComponent,
    SendSmsComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    RouterModule.forChild(routes),
    DataTablesModule,
    NgMultiSelectDropDownModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    SharedModule
  ],
  exports: [
    RouterModule,
    StudentHostelRoomComponent
  ]
})
export class HostelManagementModule { }
