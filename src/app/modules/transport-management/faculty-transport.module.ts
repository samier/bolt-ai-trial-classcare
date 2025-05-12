import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacultyTransportComponent } from './faculty-transport/faculty-transport.component';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/service/permission.service';

const routes: Routes = [
  {
    path: 'faculty-transport',
    component: FacultyTransportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'transport_faculty_transport', permission: 'has_access', parentModule: 'transport' }
  }
]

@NgModule({
  declarations: [
    FacultyTransportComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class FacultyTransportModule { }
