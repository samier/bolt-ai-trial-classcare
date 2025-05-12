import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterModule, Routes } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { ListComponent } from './list/list.component';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'list',
    component: ListComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    ListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,    
    RouterModule.forChild(routes),
    NgxPaginationModule,
    DataTablesModule,
    NgMultiSelectDropDownModule.forRoot(),
    SharedModule
  ],
  exports: [
    RouterModule
  ]
})
export class StudentGrReportsModule { }
