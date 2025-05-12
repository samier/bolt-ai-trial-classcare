import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedComponent } from './shared.component';
import { LeaveManagementStudentModule } from '../modules/leave-management/leave-management-student.module';
import { StudentExamManagementModule } from '../modules/student-exam-management/student-exam-management.module';
import { InstituteModuleGuard } from '../service/institute-module-guard.service';
import { PollManagementStudentModule } from '../modules/poll-management/poll-management-student.module';
import { ExamReportStudentModule } from '../modules/exam-report/exam-report-student.module';

const routes: Routes = [
  {
    path: '',
    component: SharedComponent,
    children: [
      {
        path: 'leaves',
        canActivate: [InstituteModuleGuard],
        data: { 
            module: 'Leave'
        },
        loadChildren: () => import('../modules/leave-management/leave-management-student.module')
        .then(m => m.LeaveManagementStudentModule),
      },
      {
        path: 'exam',
        canActivate: [InstituteModuleGuard],
        data: { 
            module: 'MCQ'
        },
        loadChildren: () => import('../modules/student-exam-management/student-exam-management.module')
        .then(m => m.StudentExamManagementModule),
      },
      {
        path: 'poll-student',
        canActivate: [InstituteModuleGuard],
        data: { 
            module: 'Poll'
        },
        loadChildren: () => import('../modules/poll-management/poll-management-student.module')
        .then(m => m.PollManagementStudentModule),
      },
      {
        path: 'inventory-management',
        canActivate: [InstituteModuleGuard],
        data: { 
            module: 'Inventory'
        },
        loadChildren: () => import('../modules/inventory-management/inventory-management-student.module')
        .then(m => m.InventoryManagementStudentModule),
      },
      {
        path: 'exam-report-card-student',
        loadChildren: () => import('../modules/exam-report/exam-report-student.module')
        .then(m => m.ExamReportStudentModule),
      },
      // {
      //   path: 'chat-student',
      //   loadChildren: () => import('../modules/chat/chat.module')
      //   .then(m => m.ChatModule),
      // }
      {
        path: 'remarks',
        loadChildren: () => import('../modules/student-remark/student-remark.module')
        .then(m => m.StudentRemarkModule),
      },
      {
        path: 'academics',
        loadChildren: () => import('../modules/academics/academics.module')
        .then(m => m.AcademicsModule),
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SharedRoutingModule { }
