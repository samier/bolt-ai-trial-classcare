import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddComponent } from './add/add.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { ListComponent } from './list/list.component';
import { EditComponent } from './edit/edit.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';


const routes:Routes =[
  {
    path:'add',
    component:AddComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_exam_type', permission: 'has_create'}
  },
  {
    path:'list',
    component:ListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_exam_type', permission: 'has_access'}
  },
  {
    path:'edit/:id',
    component:EditComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_exam_type', permission: 'has_edit'}
  },
] 

@NgModule({
  declarations: [
    AddComponent,
    ListComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,    
    RouterModule.forChild(routes),
    NgSelectModule,
    SharedModule
  ]
})
export class ExamTypeModule { }
