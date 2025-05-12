import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TemplateComponent } from './template/template.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ExamReportComponent } from './exam-report/exam-report.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { NotSectionTemplateComponent } from './not-section-template/not-section-template.component';
import { PermissionGuard } from 'src/app/service/permission.service';
const routes: Routes = [
  {
    path: 'list/:id',
    component: TemplateComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_template_settings', permission: 'has_access'}
  },
  {
    path: 'list',
    component: NotSectionTemplateComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_template_settings', permission: 'has_access'}
  },
  {
    path: 'create-exam-report',
    component: ExamReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_exam_setting', permission: 'has_access'}
  },
]
@NgModule({
  declarations: [
    TemplateComponent,
    ExamReportComponent,
    NotSectionTemplateComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(routes),
    NgSelectModule,
    NgMultiSelectDropDownModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    DataTablesModule
  ],
  exports: [
    RouterModule,
  ]
})
export class TemplateManagementModule { }