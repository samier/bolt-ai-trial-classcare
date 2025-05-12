import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LeaveFormComponent } from './leave-management/leave-form/leave-form.component';
import { PrivateCompoent } from './private.component';
import { LeaveListComponent } from './leave-management/leave-list/leave-list.component';
import { AdminLeaveEditFormComponent } from './leave-management/admin-leave-edit-form/admin-leave-edit-form.component';
import { LeaveManagementModule } from '../modules/leave-management/leave-management.module';
import { MealModule } from '../modules/meal/meal.module';
import { TransportModule } from '../modules/transport-management/transport.module';
import { FacultyTransportModule } from '../modules/transport-management/faculty-transport.module';
//import { LessonPlanningModule } from '../modules/lesson-planning/lesson-planning.module';
import { AdminSpecGuard } from '../service/admin-spec-guard.service';
import { InstituteModuleGuard } from '../service/institute-module-guard.service';
import { FacultySpecGuard } from '../service/faculty-spec-guard.service';
import { McqManagementModule } from '../modules/mcq-management/mcq-management.module';
//import { HRAModule } from './hra/hra.module';
import { HRAModule } from '../modules/hra/hra.module';
import { StudentLeavingCertificateModule } from '../modules/student-leaving-certificate/student-leaving-certificate.module';
import { ExamTypeModule } from '../modules/exam-type/exam-type.module';
import { WhatsappHistoryModule } from '../modules/whatsapp-history/whatsapp-history.module';
import { StudentGrReportsModule } from '../modules/student-gr-reports/student-gr-reports.module';
import { TimetableModule } from '../modules/timetable/timetable.module';
//import { StudentGrReportsModule } from '../modules/student-gr-reports/student-gr-reports.module';
import { ExamModule } from '../modules/exam/exam.module';
import { UserModule } from '../modules/user/user.module';
import { PollManagementModule } from '../modules/poll-management/poll-management.module';
import { ChatModule } from './chat/chat.module';
import { ExamReportModule } from '../modules/exam-report/exam-report.module';
import { AttendanceManagementModule } from '../modules/attendance-management/attendance-management.module';
import { UserLayoutComponent } from './user-layout/user-layout/user-layout.component';
import { DashBoardGuard } from '../service/dashboard-guard.service';

const routes: Routes = [
  {
    path: '',
    component: PrivateCompoent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [DashBoardGuard],
      },
      {
        path: 'leaves',
        canActivate: [InstituteModuleGuard],
        data: {
            module: 'Leave'
        },
        loadChildren: () => import('../modules/leave-management/leave-management.module')
        .then(m => m.LeaveManagementModule),
      },
      {
        path: 'meal',
        // canActivate: [AdminSpecGuard,InstituteModuleGuard],
        canActivate: [InstituteModuleGuard],
        data: {
            module: 'Meal'
        },
        loadChildren: () => import('../modules/meal/meal.module')
        .then(m => m.MealModule),
      },
      {
        path: 'transport',
        // canActivate: [AdminSpecGuard,InstituteModuleGuard],
        canActivate: [InstituteModuleGuard],
        data: {
            module: 'Transport'
        },
        loadChildren: () => import('../modules/transport-management/transport.module')
        .then(m => m.TransportModule),
      },
      {
        path: 'transport',
        canActivate: [FacultySpecGuard,InstituteModuleGuard],
        data: {
            module: 'Transport'
        },
        loadChildren: () => import('../modules/transport-management/faculty-transport.module')
        .then(m => m.FacultyTransportModule),
      },
      {
        path: 'lesson',
        canActivate: [InstituteModuleGuard],
        data: {
            module: 'Lesson Planning'
        },
        loadChildren: () => import('../modules/lesson-planning/lesson-planning.module')
        .then(m => m.LessonPlanningModule),
      },
      {
        path: 'teacher-diary',
        canActivate: [InstituteModuleGuard],
        data: {
            module: 'Teacher\'s Diary'
        },
        loadChildren: () => import('../modules/teacher-diary/teacher-diary.module')
        .then(m => m.TeacherDiaryModule),
      },
      {
        path: 'mcq',
        // canActivate: [AdminSpecGuard,InstituteModuleGuard],
        canActivate: [InstituteModuleGuard],
        data: {
            module: 'MCQ'
        },
        loadChildren: () => import('../modules/mcq-management/mcq-management.module')
        .then(m => m.McqManagementModule),
      },
      {
        path: 'hra',
        // canActivate: [AdminSpecGuard,InstituteModuleGuard],
        canActivate: [InstituteModuleGuard],
        data: {
            module: 'HRA'
        },
        loadChildren: () => import('../modules/hra/hra.module')
        .then(m => m.HRAModule),
      },
      // {
      //   path: 'user',
      //   canActivate: [AdminSpecGuard,InstituteModuleGuard],
      //   data: {
      //       module: 'User'
      //   },
      //   loadChildren: () => import('../modules/user/user.module')
      //   .then(m => m.UserModule),
      // },
      {
        path: 'user',
        loadChildren: () => import('../modules/user/user.module')
        .then(m => m.UserModule),
      },
      {
        path: 'student-leaving-certificate',
        // canActivate: [AdminSpecGuard,InstituteModuleGuard],
        canActivate: [InstituteModuleGuard],
        data: {
            module: 'Leaving Certificate'
        },
        loadChildren: () => import('../modules/student-leaving-certificate/student-leaving-certificate.module')
        .then(m => m.StudentLeavingCertificateModule),
      },
      {
        path: 'exam-type',
        loadChildren: () => import('../modules/exam-type/exam-type.module')
        .then(m => m.ExamTypeModule),
      },
      {
        path: 'message',
        loadChildren: () => import('../modules/whatsapp-history/whatsapp-history.module')
        .then(m => m.WhatsappHistoryModule),
      },
      {
        path: 'import',
        data: {
          module: 'file-import'
        },
        loadChildren: () => import('../modules/excel-import/excel-import.module')
        .then(m => m.ExcelImportModule),
      },
      {
        path: 'report',
        loadChildren: () => import('../modules/report/report.module')
        .then(m => m.ReportModule),
      },
      {
        path: 'message',
        data: {
          module: 'Transport-Sms'
        },
        loadChildren: () => import('../modules/transport-sms/transport-sms.module')
        .then(m => m.TransportSmsModule),
      },
      {
        path: 'student-gr-reports',
        // canActivate: [AdminSpecGuard,InstituteModuleGuard],
        canActivate: [InstituteModuleGuard],
        data: {
            module: 'Leaving Certificate'
        },
        loadChildren: () => import('../modules/student-gr-reports/student-gr-reports.module')
        .then(m => m.StudentGrReportsModule),
      },
      {
        path: 'timetable',
        loadChildren: () => import('../modules/timetable/timetable.module')
        .then(m => m.TimetableModule),
      },
      {
        path: 'fees',
        loadChildren: () => import('../modules/fees/fees.module')
        .then(m => m.FeesModule),
      },
      {
        path: 'hra/payroll',
        loadChildren: () => import('../modules/payroll-management/payroll-management.module')
        .then(m => m.PayrollManagementModule),
      },
      {
        path: 'exam',
        loadChildren: () => import('../modules/exam/exam.module')
        .then(m => m.ExamModule),
      },
      {
        path: 'template',
        loadChildren: () => import('../modules/template-management/template-management.module')
        .then(m => m.TemplateManagementModule),
      },
      {
        path: 'trust',
        loadChildren: () => import('../modules/trust-details-management/trust-details-management.module')
        .then(m => m.TrustDetailManagementModule),
      },
      {
        path: 'fees-category',
        loadChildren: () => import('../modules/fees-category-management/fees-category-management.module')
        .then(m => m.FeesCategoryManagementModule),
      },
      {
        path: 'poll',
        data: {
          module: 'poll'
        },
        loadChildren: () => import('../modules/poll-management/poll-management.module')
        .then(m => m.PollManagementModule),
      },
      {
        path: 'inventory-management',
        loadChildren: () => import('../modules/inventory-management/inventory-management.module')
        .then(m => m.InventoryManagementModule),
      },
      // {
      //   path: 'chat',
      //   loadChildren: () => import('../modules/chat/chat.module')
      //   .then(m => m.ChatModule),
      // },
      {
        path: 'school',
        loadChildren: () => import('../modules/old-school-management/old-school-management.module')
        .then(m => m.oldSchoolManagementModule),
      },
      {
        path: 'exam-report-card',
        loadChildren: () => import('../modules/exam-report/exam-report.module')
        .then(m => m.ExamReportModule),
      },
      {
        path: 'attendance',
        loadChildren: () => import('../modules/attendance-management/attendance-management.module')
        .then(m => m.AttendanceManagementModule),
      },
      {
        path: 'exam-timetable',
        loadChildren: () => import('../modules/exam-timetable/exam-timetable.module').then(m => m.ExamTimetableModule),
      },
      {
        path: 'students',
        loadChildren: () => import('../modules/student-management/student-management.module')
        .then(m => m.StudentManagementModule),
      },
      {
        path: 'student',
        loadChildren: () => import('../modules/student/student.module')
        .then(m => m.StudentModule),
      },
      {
        path: 'performance',
        loadChildren: () => import('../modules/student-performance/student-performance.module')
        .then(m => m.StudentPerformanceModule),
      },
      // {
      //   path: 'leaves',
      //   component: LeaveFormComponent,
      // },
      // {
      //   path: 'leave-list',
      //   component: LeaveListComponent,
      // }
      //}
      {
        path: 'todays-lecture',
        loadChildren: () => import('../modules/todays-lecture/todays-lecture.module')
        .then(m => m.TodaysLectureModule),
      },
      {
        path: 'subject',
        loadChildren: () => import('../modules/subject/subject.module')
        .then(m => m.subjectModule),
      },
      {
        path: 'school-name',
        loadChildren: () => import('../modules/school-name/school-name.module')
        .then(m => m.SchoolNameModule),
      },
      {
        path: 'hostel',
        loadChildren: () => import('../modules/hostel-management/hostel-management.module')
        .then(m => m.HostelManagementModule),
      },
      {
        path: 'event-type',
        loadChildren: () => import('../modules/event-type/event-type.module')
        .then(m => m.EventTypeModule),
      },
      {
        path: 'event',
        loadChildren: () => import('../modules/event/event.module')
        .then(m => m.EventModule),
      },
      {
        path: 'remark',
        loadChildren: () => import('../modules/student-remark/remark.module')
        .then(m => m.RemarkModule),
      },
      {
        path: 'certificate',
        loadChildren: () => import('../modules/certificate/certificate.module')
        .then(m => m.CertificateModule),
      },
      {
        path: 'document-manager',
        loadChildren: () => import('../modules/document-manager/document-manager.module')
        .then(m => m.DocumentManagerModule),
      },

      {
        path: 'academics',
        loadChildren: () => import('../modules/academics/academics.module')
        .then(m => m.AcademicsModule),
      },
      {
        path: 'fees-collection',
        loadChildren: () => import('../modules/fees-collection-center/fees-collection-center.module')
        .then(m => m.FeesCollectionCenterModule),
      },
      {
        path: 'import',
        loadChildren: () => import('../import/fees/fees.module').then(m => m.FeesModule)
      },
      {
        path: 'student',
        loadChildren: () => import('../modules/student/student.module').then(m => m.StudentModule)
      },
      {
        path: 'import/fees',
        loadChildren: () => import('../modules/fees-import/fees-import.module').then(m => m.FeesImportModule)
      },
      {
        path: 'batch',
        loadChildren: () => import('../modules/batch/batch.module').then(m => m.BatchModule)
      },
      {
        path: 'assignment',
        loadChildren: () => import('../modules/homework/homework.module').then(m => m.HomeworkModule)
      },
      {
        path: 'setting',
        loadChildren: () => import('../modules/system-setting/system-setting.module').then(m => m.SystemSettingModule)
      },
      {
        path: 'result',
        loadChildren: () => import('../modules/result/result.module').then(m => m.ResultModule)
      },
      {
        path: 'custom-field',
        loadChildren: () => import('../modules/custom-field/custom-field.module').then(m => m.CustomFieldModule)
      },
      {
        path: 'hall-ticket',
        loadChildren: () => import('../modules/hall-ticket/hall-ticket.module').then(m => m.HallTicketModule)
      },
      {
        path: 'upload-document',
        loadChildren: () => import('../modules/upload-document/upload-document.module').then(m => m.UploadDocumentModule)
      },
      // {
      //   path: 'whatsapp',
      //   loadChildren: () => import('../modules/whatsapp/whatsapp.module').then(m => m.WhatsappModule)
      // },
      {
        path: 'permission',
        loadChildren: () => import('../modules/permission/permission.module').then(m => m.PermissionModule)
      },
      {
        path: 'teacher-achivement',
        loadChildren: () => import('../modules/teacher-achivement/teacher-achivement.module').then(m => m.TeacherAchivementModule)
      },
      {
        path: 'course',
        loadChildren: () => import('../modules/course/course.module').then(m => m.CourseModule)
      },
      {
        path: 'inquiry',
        loadChildren: () => import('../modules/inquiry/inquiry.module')
        .then(m => m.InquiryModule),
      },
      {
        path: 'system-setting',
        loadChildren: () => import('../modules/system-setting/system-setting.module')
        .then(m => m.SystemSettingModule),
      },
      {
        path: 'expenses',
        loadChildren: () => import('../modules/expense/expense.module').then(m => m.ExpenseModule)
      },
      {
        path: 'academic-year',
        loadChildren: () => import('../modules/academic-year/academic-year.module').then(m => m.AcademicYearModule),
      },
      {
        path: 'activity-log',
        loadChildren: () => import('../modules/activity-log/activity-log.module')
        .then(m => m.ActivityLogModule),
      },
      {
        path: 'section',
        loadChildren: () => import('../modules/section/section.module')
        .then(m => m.SectionModule),
      },
      {
        path: 'concern',
        loadChildren: () => import('../modules/complain/complain.module')
        .then(m => m.ComplainModule),
      },
      {
        path: 'form-builder',
        loadChildren: () => import('../modules/form-builder/form-builder.module')
        .then(m => m.FormBuilderModule),
      },
      {
        path: 'user-daily-plan',
        loadChildren: () => import('../modules/user-daily-planning/user-daily-planning.module')
        .then(m => m.UserDailyPlanningModule),
      },
      {
        path: 'combine-marksheet',
        loadChildren: () => import('../modules/combine-marksheet/combine-marksheet.module')
        .then(m => m.CombineMarksheetModule),
      },
      {
        path: 'income-expense',
        loadChildren: () => import('../modules/income-expense/income-expense.module')
        .then(m => m.IncomeExpenseModule),
      },
      {
        path: 'calendar',
        loadChildren: () => import('../modules/calendar/calendar.module').then(m => m.CalendarModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModulesRoutingModule { }
