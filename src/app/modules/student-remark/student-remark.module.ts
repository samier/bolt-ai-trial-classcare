import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { RemarkListComponent } from './remark-list/remark-list.component';
import { SharedModule } from 'src/app/shared/shared.module';

const routes:Routes = [
  {
    path:'list',
    component:RemarkListComponent,
    pathMatch:'full'
  },
]

@NgModule({
  declarations: [
    RemarkListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DataTablesModule,
    SharedModule
  ]
})
export class StudentRemarkModule { }
