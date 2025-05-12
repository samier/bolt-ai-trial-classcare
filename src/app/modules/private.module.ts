import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ModulesRoutingModule } from './private-routing.module';
// import { SharedModule } from 'src/app/shared/shared.module';
import { PrivateCompoent } from './private.component';
import { PipesModule } from '../shared/pipes';
import { DashboardModule } from './dashboard/dashboard.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeaveManagementModule } from './leave-management/leave-management.module';
import { HRAModule } from './hra/hra.module';
import { ExamTypeModule } from './exam-type/exam-type.module';
import { ReportModule } from './report/report.module';
import { TemplateManagementModule } from './template-management/template-management.module';
import { TrustDetailManagementModule } from './trust-details-management/trust-details-management.module';
import { FeesCategoryManagementModule } from './fees-category-management/fees-category-management.module';
import { oldSchoolManagementModule } from './old-school-management/old-school-management.module';
import { StudentManagementModule } from './student-management/student-management.module';
import { StudentPerformanceModule } from './student-performance/student-performance.module';
import { subjectModule } from './subject/subject.module';
import { enviroment } from '../../environments/environment.staging';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [PrivateCompoent],
  imports: [
    CommonModule,
    ModulesRoutingModule,
    // SharedModule,
    DashboardModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule,
    LeaveManagementModule,
    HRAModule,
    ReportModule,
    TemplateManagementModule,
    TrustDetailManagementModule,
    FeesCategoryManagementModule,
    oldSchoolManagementModule,
    StudentManagementModule,
    StudentPerformanceModule,
    subjectModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyA62YEg0WsS6u8nsrAvjafM8SRNznNBYJk', //enviroment.MAP_API,
      libraries: ['places']
    }),
  ],
  providers:[DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModulesModule { }
