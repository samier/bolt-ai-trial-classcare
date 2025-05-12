import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StudentListComponent} from './student-list/student-list.component';
import {RouterModule, Routes} from '@angular/router';
import {NgSelectModule} from '@ng-select/ng-select';
import {NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';
import {DataTablesModule} from 'angular-datatables';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {StudentAddComponent} from './student-add/student-add.component';
import { StudentEditComponent } from './student-edit/student-edit.component';
import { StudentLayoutComponent } from './student-layout/student-layout.component';
import { CollectFeesComponent } from 'src/app/modules/fees/collect-fees/collect-fees.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { AcademicsComponent } from '../academics/academics/academics.component';
import { StudentExamListComponent } from '../mcq-management/student-exam-list/student-exam-list.component';
import { AdminStudentLeaveListTabComponent } from '../leave-management/admin-student-leave-list-tab/admin-student-leave-list-tab.component';
import { AdminStudentRemarkListTabComponent } from '../student-remark/admin-student-remark-list-tab/admin-student-remark-list-tab.component';
import { StudentTabWalletComponent } from '../fees/wallet/student-tab-wallet/student-tab-wallet.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { UploadProfilePictureComponent } from './upload-profile-picture/upload-profile-picture.component';
import { studentRefundComponent } from './student-refund/student-refund.component';
import { FeesModule } from '../fees/fees.module';
import {WebcamModule} from 'ngx-webcam';
import { StudentTakeAttendanceComponent } from './student-take-attendance/student-take-attendance.component';
import { StudentProfileComponent } from './student-profile/student-profile.component';
import { BankDetailTabComponent } from './bank-detail-tab/bank-detail-tab.component';
import { DocumentTabComponent } from './document-tab/document-tab.component';
import { StudentTransportComponent } from '../transport-management/student-transport/student-transport.component';
import { StudentHostelRoomComponent } from '../hostel-management/student-hostel-room/student-hostel-room.component';
import { WebcamModalComponent } from './webcam-modal/webcam-modal.component';
import { StudentNoticeHistoryComponent } from '../homework/student-notice-history/student-notice-history.component';
import { StudentMonthlyReportComponent } from '../report/student-monthly-report/student-monthly-report.component';
import { GenderWiseStudentCountComponent } from './dashboard/gender-wise-student-count/gender-wise-student-count.component';
import { StudentDashboardLayoutComponent } from './dashboard/student-dashboard-layout.component';
import { NewAdmissionComponent } from './dashboard/new-admission/new-admission.component';
import { TotalStudentStrengthComponent } from './dashboard/total-student-strength/total-student-strength.component';
import { CategoryWiseStudentCountComponent } from './dashboard/category-wise-student-count/category-wise-student-count.component';
import { StudentFieldSettingComponent } from '../system-setting/student-field-setting/student-field-setting.component';
import { SystemSettingModule } from '../system-setting/system-setting.module';
import { EventTabComponent } from './event-tab/event-tab.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { OptionalFeesComponent } from '../fees/optional-fees/optional-fees.component';

const routes: Routes = [
  {
    path: 'student-list',
    component: StudentListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_student', permission: 'has_access' , parentModule : 'student'}
  },

  {
    path: 'add',
    component: StudentAddComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_student', permission: 'has_create'}
  },
  {
    path: 'add/:inquiryID',
    component: StudentAddComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_student', permission: 'has_create'}
  },
  {
    path: 'edit/:id',
    component: StudentAddComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_student', permission: 'has_edit'}
  },
  {
    path: 'take-attendance',
    component: StudentTakeAttendanceComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'student_attendance', permission: 'has_access'}
  },
  {
    path: 'student-dashboard',
    component: StudentDashboardLayoutComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'student_student_dashboard', permission: 'has_access' }
  },
  {
    path: 'student-field-setting',
    component: StudentFieldSettingComponent,
    pathMatch: 'full',
  },
  {
    path: '',
    component: StudentLayoutComponent,
    children: [
      {
        path: 'bank-detail/:id',
        component: BankDetailTabComponent,
        pathMatch: 'full',
      },
      {
        path: 'collect-fees/:unique_id',
        component: CollectFeesComponent,
        pathMatch: 'full',
        canActivate: [PermissionGuard],
        data: {moduleName: 'finance_fees', permission: 'has_access'}
      },
      {
        path: 'refund-fees/:unique_id',
        component: studentRefundComponent,
        pathMatch: 'full',
        canActivate: [PermissionGuard],
        data: {moduleName: 'finance_fees', permission: 'has_access'}
      },
      {
        path: 'academics/academic-details/:unique_id',
        component: AcademicsComponent,
        pathMatch: 'full',                
      },
      {
        path: 'mcq/student-exam/:unique_id',
        component: StudentExamListComponent,
        pathMatch: 'full',
        canActivate: [PermissionGuard],
        data: {moduleName: 'online_exam_result', permission: 'has_access'}               
      },
      {
        path: 'leaves/admin-student-leave-list-tab/:unique_id',
        component: AdminStudentLeaveListTabComponent,
        pathMatch: 'full',
        canActivate: [PermissionGuard],
        data: {moduleName: 'administrator_leave', permission: 'has_edit'}               
      },
      {
        path: 'remark/admin-student-remark-list-tab/:unique_id',
        component: AdminStudentRemarkListTabComponent,
        pathMatch: 'full',                   
      },
      {
        path: 'fees/student-wallet-history/:unique_id',
        component: StudentTabWalletComponent,
        pathMatch: 'full',
        canActivate: [PermissionGuard],
        data: {moduleName: 'finance_wallets', permission: 'has_access'}
      },
      {
        path: 'student-profile/:id',
        component: StudentProfileComponent,
        pathMatch: 'full',
      },
      {
        path: 'documents/:id',
        component: DocumentTabComponent,
        pathMatch: 'full',
      },
      {
        path: 'hostel/:id',
        component: StudentHostelRoomComponent,
        pathMatch: 'full',
      },
      {
        path: 'transport/:id',
        component: StudentTransportComponent,
        pathMatch: 'full',
      },
      {
        path: 'notice-history/:id',
        component: StudentNoticeHistoryComponent,
        canActivate: [PermissionGuard],
        data: {moduleName: 'administrator_notice', permission: 'has_access'}
      },
      {
        path: 'monthly-report/:unique_id',
        component: StudentMonthlyReportComponent,
        pathMatch: 'full',
        canActivate: [PermissionGuard],
        data: {moduleName: 'report_student_monthly_report', permission: 'has_access'}
      },
      {
        path: 'event/:id',
        component: EventTabComponent,
      },
      {
        path: 'eventDetail/:id',
        component: EventDetailComponent,
        pathMatch: 'full',
      },
      {
        path:'optional-fees/:unique_id',
        component:OptionalFeesComponent,
        pathMatch:'full',
        canActivate: [PermissionGuard],
        data: {moduleName: 'finance_assign_optional_fees', permission: 'has_access', parentModule : 'fees'}
      },
    ]
  },
];

@NgModule({
  declarations: [
    StudentListComponent,
    StudentAddComponent,
    StudentEditComponent,
    StudentLayoutComponent,
    UploadProfilePictureComponent,
    studentRefundComponent,
    WebcamModalComponent,
    StudentTakeAttendanceComponent,
    StudentProfileComponent,
    BankDetailTabComponent,
    DocumentTabComponent,
    GenderWiseStudentCountComponent,
    StudentDashboardLayoutComponent,
    NewAdmissionComponent,
    TotalStudentStrengthComponent,
    CategoryWiseStudentCountComponent,
    EventTabComponent,
    EventDetailComponent,
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    NgbDropdownModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NgMultiSelectDropDownModule.forRoot(),
    SharedModule,
    FeesModule,
    WebcamModule,
    // SystemSettingModule
  ]
})
export class StudentModule { }