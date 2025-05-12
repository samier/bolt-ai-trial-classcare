import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentTypeListComponent } from './document-type-list/document-type-list.component';
import { DocumentTypeComponent } from './document-type/document-type.component';
import { VehicleListComponent } from './vehicle-list/vehicle-list.component';
import { VehicleComponent } from './vehicle/vehicle.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DriverFormComponent } from './driver-form/driver-form.component';
import { DriverListComponent } from './driver-list/driver-list.component';
import { RouteFormComponent } from './route-form/route-form.component';
import { RouteListComponent } from './route-list/route-list.component';
import { StopsFormComponent } from './stops-form/stops-form.component';
import { StopsListComponent } from './stops-list/stops-list.component';
import { DataTablesModule } from "angular-datatables";
import { FareDirective } from './stops-form/fare.directive';
import { LatLongDirective } from './stops-form/latlong.directive';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AssignTransportFormComponent } from './assign-transport-form/assign-transport-form.component';
import { AssignTransportListComponent } from './assign-transport-list/assign-transport-list.component';
import { TransportSettingsComponent } from './transport-settings/transport-settings.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PermissionGuard } from 'src/app/service/permission.service';
import { enviroment } from '../../../environments/environment.staging';
import { AgmCoreModule } from '@agm/core';
import { LocationPickerComponent } from 'src/app/modules/transport-management/location-picker/location-picker.component';
import { TransportTransferListComponent } from './transport-transfer-list/transport-transfer-list.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedModule } from 'src/app/shared/shared.module';
import { TransportTransferStudentListComponent } from './transport-transfer-student-list/transport-transfer-student-list.component';
import { TransportStudentComponent } from './transport-student/transport-student.component';
import { StudentTransportComponent } from './student-transport/student-transport.component';
import { AreaListComponent } from './area-list/area-list.component';
import { AreaCreateComponent } from './area-create/area-create.component';
import { VehicleDocumentListComponent } from './vehicle-document-list/vehicle-document-list.component';
import { transportAreaComponent } from './transport-area/transport-area.component';
import { AssignTransportComponent } from './assign-transport/assign-transport.component';
import { StopsLogsComponent } from './stops-logs/stops-logs.component';
import { StopsLogsDetailComponent } from './stops-logs-detail/stops-logs-detail.component';

const routes: Routes = [
  {
    path: 'document-type-create',
    component: DocumentTypeComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_document_type', permission: 'has_create',  parentModule: 'transport'}
  },
  {
    path: 'document-type-edit/:id',
    component: DocumentTypeComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_document_type', permission: 'has_edit',  parentModule: 'transport'}
  },
  {
    path: 'document-type-list',
    component: DocumentTypeListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_document_type', permission: 'has_access',  parentModule: 'transport'}
  },
  {
    path: 'vehicle-create',
    component: VehicleComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_vehicle', permission: 'has_create',  parentModule: 'transport'}
  },
  {
    path: 'vehicle-edit/:id',
    component: VehicleComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_vehicle', permission: 'has_edit',  parentModule: 'transport'}
  },
  {
    path: 'vehicle-list',
    component: VehicleListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_vehicle', permission: 'has_access',  parentModule: 'transport'}
  },
  {
    path: 'driver-create',
    component: DriverFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_driver', permission: 'has_create',  parentModule: 'transport'}
  },
  {
    path: 'driver-edit/:id',
    component: DriverFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_driver', permission: 'has_edit',  parentModule: 'transport'}
  },
  {
    path: 'driver-list',
    component: DriverListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_driver', permission: 'has_access',  parentModule: 'transport'}
  },
  {
    path: 'route-create',
    component: RouteFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_route', permission: 'has_create',  parentModule: 'transport'}
  },
  {
    path: 'route-edit/:id',
    component: RouteFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_route', permission: 'has_edit', parentModule: 'transport'}
  },
  {
    path: 'route-list',
    component: RouteListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_route', permission: 'has_access' , parentModule: 'transport'}
  },
  {
    path: 'stops-create',
    component: StopsFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_stop', permission: 'has_create' ,  parentModule: 'transport'}
  },
  {
    path: 'stops-edit/:id',
    component: StopsFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_stop', permission: 'has_edit', parentModule: 'transport'}
  },
  {
    path: 'stops-list',
    component: StopsListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_stop', permission: 'has_access',  parentModule: 'transport'}
  },
  {
    path: 'stops-list/stop-logs/:id',
    component: StopsLogsComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_stop', permission: 'has_access',  parentModule: 'transport'}
  },
  {
    path: 'stops-list/stop-logs-detail/:id',
    component: StopsLogsDetailComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_stop', permission: 'has_access',  parentModule: 'transport'}
  },
  {
    path: 'assign-transport-create',
    component: AssignTransportFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_assign_transport', permission: 'has_create', parentModule: 'transport'}
  },
  {
    path: 'assign-transport-edit/:id',
    component: AssignTransportFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_assign_transport', permission: 'has_edit', parentModule: 'transport'}
  },
  {
    path: 'assign-transport-list',
    component: AssignTransportListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_assign_transport', permission: 'has_access', parentModule: 'transport'}
  },
  {
    path: 'assign-transport',
    component: AssignTransportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_assign_transport', permission: 'has_access', parentModule: 'transport'}
  },
  {
    path: 'transport-setting',
    component: TransportSettingsComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_transport_settings', permission: 'has_access', parentModule: 'transport'}
  },
  {
    path: 'transport-transfer',
    component: TransportTransferListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_assign_transport', permission: 'has_access', parentModule: 'transport'}
  },
  {
    path: 'transport-transfer/:id',
    component: TransportTransferStudentListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_assign_transport', permission: 'has_access', parentModule: 'transport'}
  },
  {
    path: 'student-transport',
    component: TransportStudentComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_assign_transport', permission: 'has_access', parentModule: 'transport'}
  },
  {
    path: 'transport-area',
    component: transportAreaComponent,
    pathMatch: 'full',
    // canActivate: [PermissionGuard],
    // data: {moduleName: 'transport_assign_transport', permission: 'has_access', parentModule: 'transport'}
  },
  {
    path: 'document-list',
    component: VehicleDocumentListComponent,
    pathMatch: 'full',
    // canActivate: [PermissionGuard],
    // data: {moduleName: 'transport_assign_transport', permission: 'has_access', parentModule: 'transport'}
  }
  // {
  //   path: 'area',
  //   component: AreaListComponent,
  //   pathMatch: 'full',
  //   canActivate: [PermissionGuard],
  //   data: {moduleName: 'transport_area', permission: 'has_access', parentModule: 'transport'}
  // },
  // {
  //   path: 'area-create',
  //   component: AreaCreateComponent,
  //   pathMatch: 'full',
  //   canActivate: [PermissionGuard],
  //   data: {moduleName: 'transport_area', permission: 'has_create', parentModule: 'transport'}
  // },
  // {
  //   path: 'edit-area/:id',
  //   component: AreaCreateComponent,
  //   pathMatch: 'full',
  //   canActivate: [PermissionGuard],
  //   data: { moduleName: 'transport_area', permission: 'has_edit', parentModule: 'transport' }
  // },
]

@NgModule({
  declarations: [
    DocumentTypeListComponent,
    DocumentTypeComponent,
    VehicleComponent,
    VehicleListComponent,
    DriverFormComponent,
    DriverListComponent,
    RouteFormComponent,
    RouteListComponent,
    StopsFormComponent,
    StopsListComponent,
    FareDirective,
    LatLongDirective,
    AssignTransportFormComponent,
    AssignTransportListComponent,
    TransportSettingsComponent,
    LocationPickerComponent,
    TransportTransferListComponent,
    TransportTransferStudentListComponent,
    TransportStudentComponent,
    StudentTransportComponent,
    AreaListComponent,
    AreaCreateComponent,
    VehicleDocumentListComponent,
    transportAreaComponent,
    AssignTransportComponent,
    StopsLogsComponent,
    StopsLogsDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    DataTablesModule,
    DragDropModule,
    RouterModule.forChild(routes),
    NgMultiSelectDropDownModule.forRoot(),
    AgmCoreModule.forRoot({
        apiKey: 'AIzaSyA62YEg0WsS6u8nsrAvjafM8SRNznNBYJk', //enviroment.MAP_API,
        libraries: ['places']
    }),
    NgxDaterangepickerMd.forRoot({
      separator: ' - ',
      applyLabel: 'Okay',
    }),
    MatNativeDateModule,
    MatDatepickerModule,
    SharedModule
  ],
  exports: [
    RouterModule,
    StudentTransportComponent,
  ]
})
export class TransportModule { }
