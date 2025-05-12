import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplainAddEditComponent } from './complain-add-edit/complain-add-edit.component';
import { ComplainListComponent } from './complain-list/complain-list.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { ComplainThreadComponent } from './complain-thread/complain-thread.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { ComplainViewComponent } from './complain-view/complain-view.component';

const routes: Routes = [
  {
    path: 'list',
    component: ComplainListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'concern_concern', permission: 'has_access' }
  },
  {
    path: 'add',
    component: ComplainAddEditComponent,
    pathMatch: 'full'
  },
  {
    path: 'edit/:id',
    component: ComplainAddEditComponent,
    pathMatch: 'full'
  },
  {
    path: 'view/:id',
    component: ComplainViewComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'concern_concern', permission: 'has_access' }
  },
]


@NgModule({
  declarations: [
    ComplainAddEditComponent,
    ComplainListComponent,
    ComplainThreadComponent,
    ComplainViewComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    
  ]
})
export class ComplainModule { }
