import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SectionListComponent } from './section-list/section-list.component';
import { SectionAddEditComponent } from './section-add-edit/section-add-edit.component';
import { PermissionGuard } from 'src/app/service/permission.service';

const routes: Routes = [
  {
    path:'list',
    component:SectionListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_section', permission: 'has_access'}
  },
  {
    path:'add',
    component:SectionAddEditComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_section', permission: 'has_access'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SectionRoutingModule { }