import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentReportComponent } from './student-report/student-report.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { FeesReportsComponent } from './fees-reports/fees-reports.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DataTablesModule } from 'angular-datatables';
import { TransportReportComponent } from './transport-report/transport-report.component';
import { ApplicationReportComponent } from './application-report/application-report.component';
import { SendMessageComponent } from './send-message/send-message.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PermissionGuard } from 'src/app/service/permission.service';
import { FeesDueReportsComponent } from './fees-due-reports/fees-due-reports.component';
import { masterFeesReportComponent } from './master-fees-report/master-fees-report.component';
import { FeesReceiptDayWiseReportComponent } from './fees-receipt-day-wise-report/fees-receipt-day-wise-report.component';
import {NgxDaterangepickerMd} from "ngx-daterangepicker-material";
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import * as dayjs from 'dayjs';
import { SharedModule } from 'src/app/shared/shared.module';
import { CourseFeesUpdateReportComponent } from './course-fees-update-report/course-fees-update-report.component';
import { StudentCategoryReportComponent } from './student-category-report/student-category-report.component';
import { StudentGenderReportComponent } from './student-gender-report/student-gender-report.component';
import { StudentActiveInactiveReportComponent } from './student-active-inactive-report/student-active-inactive-report.component';
import { ExpenseReportComponent } from './expense-report/expense-report.component';
import { BirthdayListComponent } from './birthday-list/birthday-list.component';
import { FeesReminderComponent } from './fees-reminder/fees-reminder.component';
import { BatchReportComponent } from './batch-report/batch-report.component';
import { ExamGeneralReportComponent } from './exam-general-report/exam-general-report.component';
import { StudentMonthlyReportComponent } from './student-monthly-report/student-monthly-report.component';
import { FeesDiscountReportsComponent } from './fees-discount-reports/fees-discount-reports.component';
import { BatchMonthlyReportListComponent } from './student-monthly-report/batch-monthly-report-list/batch-monthly-report-list.component';
import { InquiryFeesComponent } from './inquiry-fees/inquiry-fees.component';
import { StrengthSummaryReportComponent } from './strength-summary-report/strength-summary-report.component';
import { SectionWiseFeesReportComponent } from './section-wise-fees-report/section-wise-fees-report.component';
import { StudentAttendanceReportMontlyYearlyComponent } from './student-attendance-report-montly-yearly/student-attendance-report-montly-yearly.component';
import { StudentBlankReportComponent } from './student-blank-report/student-blank-report.component';
import { StudentWalletMinusReportComponent } from './student-wallet-minus-report/student-wallet-minus-report.component';

const routes: Routes = [
  {
    path: 'student-report',
    component: StudentReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_report_student_report', permission: 'has_access' },
  },
  {
    path: 'student-category-report',
    component: StudentCategoryReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_report_student_category_report', permission: 'has_access' },
  },
  {
    path: 'student-gender-report',
    component: StudentGenderReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_report_student_gender_report', permission: 'has_access' },
  },
  {
    path: 'student-active-inactive-report',
    component: StudentActiveInactiveReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_report_student_active_inactive_report', permission: 'has_access' },
  },
  {
    path: 'fees-report',
    component: FeesReportsComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'fees_report_fees_report', permission: 'has_access' },
  },
  {
    path: 'birthday-list',
    component: BirthdayListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'report_birthday_report', permission: 'has_access' },
  },
  {
    path: 'transport-report',
    component: TransportReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'report_transport_report', permission: 'has_access' },
  },
  {
    path: 'application-log-in-report',
    component: ApplicationReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {
      moduleName: 'report_application_login_report',
      permission: 'has_access',
    },
  },
  {
    path: 'fees-receipt-details-datewise',
    component: FeesReceiptDayWiseReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {
      moduleName: 'fees_report_fees_report_date_wise',
      permission: 'has_access',
    },
  },
  {
    path: 'fees-due-report',
    component: FeesDueReportsComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'fees_report_fees_due_report', permission: 'has_access' },
  },
  {
    path: 'master-fees-report',
    component: masterFeesReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'fees_report_master_fees_report', permission: 'has_access'}
  },
  {
    path: 'student-academic-fees-report',
    component: CourseFeesUpdateReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_report_student_academic_fees_report', permission: 'has_access'}
  },
  {
    path: 'expense-report',
    component: ExpenseReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_expense_report', permission: 'has_access'}
  },
  
  {
    path: 'fees-reminder',
    component: FeesReminderComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'report_fees_reminder', permission: 'has_access'}
  },

  {
    path: 'batch-report',
    component: BatchReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'report_batchwise_monthly_report', permission: 'has_access'}
  },

  {
    path: 'exam-general-report',
    component: ExamGeneralReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'report_exam_general_report', permission: 'has_access'}
  },

  {
    path: 'student-monthly-report',
    component: StudentMonthlyReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'report_student_monthly_report', permission: 'has_access'}
  },
  {
    path: 'inquiry-fees',
    component: InquiryFeesComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'report_inquiry_fees_report', permission: 'has_access'}
  },
  {
    path: 'student-monthly-report/:id',
    component: BatchMonthlyReportListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'report_student_monthly_report', permission: 'has_access'}
  },
  {
    path: 'fees-discount-report',
    component: FeesDiscountReportsComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'fees_report_fees_discount_module', permission: 'has_access'}
  },

  {
    path: 'strength-summary-report',
    component: StrengthSummaryReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_student_strength_report', permission: 'has_access'}
  },

  {
    path: 'section-wise-fees-report',
    component: SectionWiseFeesReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'report_section_wise_fees_report', permission: 'has_access'}
  },
  {
    path: 'student-attendance-monthly-yearly-report',
    component: StudentAttendanceReportMontlyYearlyComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'report_student_monthly_yearly_attendance_report', permission: 'has_access'}
  },
  {
    path: 'student-blank-report',
    component: StudentBlankReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_student_blank_report', permission: 'has_access'}
  },
  {
    path: 'student-wallet-minus-report',
    component: StudentWalletMinusReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'report_student_wallet_minus_report', permission: 'has_access'}
  },
];

@NgModule({
  declarations: [
    StudentReportComponent,
    FeesReportsComponent,
    TransportReportComponent,
    ApplicationReportComponent,
    SendMessageComponent,
    FeesDueReportsComponent,
    masterFeesReportComponent,
    FeesReceiptDayWiseReportComponent,
    CourseFeesUpdateReportComponent,
    StudentCategoryReportComponent,
    StudentGenderReportComponent,
    StudentActiveInactiveReportComponent,
    ExpenseReportComponent,
    BirthdayListComponent,
    FeesReminderComponent,
    BatchReportComponent,
    ExamGeneralReportComponent,
    StudentMonthlyReportComponent,
    FeesDiscountReportsComponent,
    BatchMonthlyReportListComponent,
    InquiryFeesComponent,
    StrengthSummaryReportComponent,    
    SectionWiseFeesReportComponent,
    StudentAttendanceReportMontlyYearlyComponent,
    StudentBlankReportComponent,
    StudentWalletMinusReportComponent,
  ],
  imports: [
    CommonModule,
    // NgSelectModule,
    // FormsModule,
    // ReactiveFormsModule,
    RouterModule.forChild(routes),
    NgMultiSelectDropDownModule.forRoot(),
    DataTablesModule,
    // NgbModule,
    NgxDaterangepickerMd.forRoot({
      separator: ' - ',
      applyLabel: 'Okay',
    }),
    MatNativeDateModule,
    MatDatepickerModule,
    MatRippleModule,
    SharedModule
  ],
  exports: [RouterModule],
})
export class ReportModule {}
