import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { performanceCategoryComponent } from './performance-category/performance-category.component';
import { performanceCriteriaComponent } from './performance-criteria/performance-criteria.component';
import { StudentPerformanceComponent } from './student-performance/student-performance.component';
import { PermissionGuard } from 'src/app/service/permission.service';

const routes: Routes = [
  {
    path: 'categories',
    component: performanceCategoryComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_student_performance', permission: 'has_access'}
  },
  {
    path: 'criteria',
    component: performanceCriteriaComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_student_performance', permission: 'has_access'}
  },
  {
    path: 'student-performance',
    component: StudentPerformanceComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_student_performance', permission: 'has_access'}
  },
]
@NgModule({
  declarations: [
    performanceCategoryComponent,
    performanceCriteriaComponent,
    StudentPerformanceComponent,
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NgMultiSelectDropDownModule.forRoot(),
    DataTablesModule,
    NgbModule,
  ],
  exports: [
    RouterModule
  ]
})
export class StudentPerformanceModule { }
