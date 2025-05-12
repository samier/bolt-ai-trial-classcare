import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DataTablesModule } from 'angular-datatables';
import { FeesDiscountComponent } from './fees-discount/fees-discount.component';
import { EditDiscountComponent } from './edit-discount/edit-discount.component';
import { StudentDiscountComponent } from './student-discount/student-discount.component';
import { FeesRefundComponent } from './fees-refund/fees-refund.component';
import { RefundTypeComponent } from './refund-type/refund-type.component';
import { FeesTabsLayoutComponent } from './fees-tabs-layout/fees-tabs-layout.component';
import { EditRefundComponent } from './edit-refund/edit-refund.component';
import { FeesReceiptNoComponent } from './fees-receipt-no/fees-receipt-no.component';
import { OptionalFeesComponent } from './optional-fees/optional-fees.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { FeesRefundListComponent } from './fees-refund-list/fees-refund-list.component';
import { AddFeesRefundComponent } from './add-fees-refund/add-fees-refund.component';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CollectFeesComponent } from './collect-fees/collect-fees.component';
import { DpDatePickerModule} from 'ng2-date-picker';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { CommonComponentsModule } from 'src/app/modules/common-components/common-components.module';
import { FeesReceiptListComponent } from './fees-receipt-no-list/fees-receipt-no-list.component';
import { DeleteOrCancelReasonComponent } from './delete-or-cancel-reason/delete-or-cancel-reason.component';
import { AttachmentsComponent } from './attachments/attachments.component';
import { WalletComponent } from './wallet/wallet.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { WalletHistoryComponent } from './wallet/wallet-history/wallet-history.component';
import { CreateWalletComponent } from './wallet/create-wallet/create-wallet.component';
import { StudentTabWalletComponent } from './wallet/student-tab-wallet/student-tab-wallet.component';
import { WalletDailyReportComponent } from './wallet/wallet-daily-report/wallet-daily-report.component';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { FeesEditHistoryComponent } from './fees-edit-history/fees-edit-history.component';
import { DiscountStudentListComponent } from './discount-student-list/discount-student-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { GenerateDiscountReceiptLogComponent } from './generate-discount-receipt-log/generate-discount-receipt-log.component';
import { GenerateDiscountReceiptLogDetailsComponent } from './generate-discount-receipt-log-details/generate-discount-receipt-log-details.component';
import { BulkDiscountGuard } from 'src/app/service/bulk-discount.guard';
import { FeesReceiptsComponent } from './fees-receipts/fees-receipts.component';
import { FeesConfirmationComponent } from './fees-confirmation/fees-confirmation.component';
import { studentBulkDiscountComponent } from './student-bulk-discount/student-bulk-discount.component';
import { studentBulkDiscountLogComponent } from './student-bulk-discount-log/student-bulk-discount-log.component';
import { OptionalFeesLogComponent } from './optional-fees-log/optional-fees-log.component';
import { OptionalFeesStudentLogComponent } from './optional-fees-student-log/optional-fees-student-log.component';
import { DashboardLayoutComponent } from './dashboard/dashboard-layout/dashboard-layout.component';
import { CollectionReportFeesComponent } from './dashboard/collection-report-fees/collection-report-fees.component';
import { RefundReportFeesComponent } from './dashboard/refund-report-fees/refund-report-fees.component';
import { FeesCardsComponent } from './dashboard/fees-cards/fees-cards.component';
import { TotalFeesReportComponent } from './dashboard/total-fees-report/total-fees-report.component';
import { AutoFeeReminderSetupComponent } from './auto-fee-reminder-setup/auto-fee-reminder-setup.component';
import { FeeRemindersListComponent } from './auto-fee-reminder-setup/fee-reminders-list/fee-reminders-list.component';
import { FeeReminderDetailsComponent } from './auto-fee-reminder-setup/fee-reminder-details/fee-reminder-details.component';
import { ChequeListComponent } from './multiple-cheque/cheque-list/cheque-list.component';
import { CollectChequeComponent } from './multiple-cheque/collect-cheque/collect-cheque.component';

const routes: Routes = [
  {
    path: 'fees-discount',
    component: FeesDiscountComponent,
    pathMatch: 'full'
  },
  {
    path: 'edit-discount',
    component: EditDiscountComponent,
    pathMatch: 'full'
  },
  {
    path: 'student-discount',
    component: StudentDiscountComponent,
    pathMatch: 'full'
  },
  {
    path: 'fees-refund',
    component: FeesRefundComponent,
    pathMatch: 'full'
  },
  {
    path: 'refund-type',
    component: RefundTypeComponent,
    pathMatch: 'full'
  },
  {
    path: 'fees-type/:type',
    component: FeesTabsLayoutComponent,
    pathMatch: 'full'
  },
  {
    path: 'edit-refund',
    component: EditRefundComponent,
    pathMatch: 'full'
  },
  {
    path: 'fees-refund-list',
    component: FeesRefundListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_fees_refund', permission: 'has_access', parentModule : 'fees'}
  },
  {
    path: 'add-fees-refund',
    component: AddFeesRefundComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_fees_refund', permission: 'has_create', parentModule : 'fees'}
  },
  {
    path: 'edit-fees-refund/:id',
    component: AddFeesRefundComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_fees_refund', permission: 'has_edit', parentModule : 'fees'}
  },
  {
    path:'fees-receipt-no',
    component:FeesReceiptListComponent,
    pathMatch:'full'
  },
  {
    path:'create-fees-receipt-no',
    component:FeesReceiptNoComponent,
    pathMatch:'full'
  },
  {
    path:'edit-fees-receipt-no/:id',
    component:FeesReceiptNoComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'settings_fees_settings', permission: 'has_access', parentModule : 'fees'}
  },
  {
    path:'assign-optional-fees',
    component:OptionalFeesComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_assign_optional_fees', permission: 'has_access', parentModule : 'fees'}
  },
  {
    path:'assign-optional-fees/log',
    component:OptionalFeesLogComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_assign_optional_fees', permission: 'has_access', parentModule : 'fees'}
  },
  {
    path:'assign-optional-fees/log/:id',
    component:OptionalFeesStudentLogComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_assign_optional_fees', permission: 'has_access', parentModule : 'fees'}
  },
  {
    path: 'collect-fees',
    component: CollectFeesComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_collect_fees', permission: 'has_access', parentModule : 'fees'}
  },
  {
    path: 'fees-receipts',
    component: FeesReceiptsComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'fees_report_fees_receipt_report', permission: 'has_access', parentModule : 'fees report'}
  },
  // {
  //   path: 'fees-receipt-no',
  //   component: FeesReceiptNoComponent,
  //   pathMatch: 'full'
  // },
  {
    path: 'assign-optional-fees',
    component: OptionalFeesComponent,
    pathMatch: 'full'
  },
  {
    path: 'wallets',
    component: WalletComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_wallets', permission: 'has_access', parentModule : 'fees'}
  },
  {
    path: 'wallet-history/:id',
    component: WalletHistoryComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_wallets', permission: 'has_access', parentModule : 'fees'}
  },
  {
    path: 'student-wallet-history/:studentId',
    component: StudentTabWalletComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_wallets', permission: 'has_access', parentModule : 'fees'}
  },
  {
    path: 'wallet-daily-report',
    component: WalletDailyReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_wallets', permission: 'has_access', parentModule : 'fees'}
  },
  {
    path: 'bulk-discount',
    canActivate: [BulkDiscountGuard],
    children: [
      {
        path: '',
        component: DiscountStudentListComponent,
        pathMatch: 'full',
      },
      {
        path: 'log',
        component: GenerateDiscountReceiptLogComponent,
        pathMatch: 'full',
      },
      {
        path: 'log/:id',
        component: GenerateDiscountReceiptLogDetailsComponent,
        pathMatch: 'full',
      },
    ]
  },
  {
    path: 'student-bulk-discount',
    children: [
      {
        path: '',
        component: studentBulkDiscountLogComponent,
        pathMatch: 'full',
        canActivate: [PermissionGuard],
        data: {moduleName: 'finance_fees', permission: 'has_access'},
      },
      {
        path: 'add',
        component: studentBulkDiscountComponent,
        pathMatch: 'full',
        canActivate: [PermissionGuard],
        data: {moduleName: 'finance_fees', permission: 'has_update'},
      },
    ]
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    pathMatch: 'full',
    // canActivate: [PermissionGuard],
    // data: {moduleName: 'finance_wallets', permission: 'has_access', parentModule : 'fees'}
  },
  {
    path: 'auto-fee-reminder',
    children: [
      {
        path: 'list',
        component: FeeRemindersListComponent,
        pathMatch: 'full',
        canActivate: [PermissionGuard],
        data: {moduleName: 'finance_auto_fee_reminder', permission: 'has_access'},
      },
      {
        path: 'setup',
        component: AutoFeeReminderSetupComponent,
        pathMatch: 'full',
        canActivate: [PermissionGuard],
        data: {moduleName: 'finance_auto_fee_reminder', permission: 'has_create'},
      },
      {
        path: 'edit/:id',
        component: AutoFeeReminderSetupComponent,
        pathMatch: 'full',
        canActivate: [PermissionGuard],
        data: {moduleName: 'finance_auto_fee_reminder', permission: 'has_edit'},
      },
      {
        path: 'details/:id',
        component: FeeReminderDetailsComponent,
        pathMatch: 'full',
        canActivate: [PermissionGuard],
        data: {moduleName: 'finance_auto_fee_reminder', permission: 'has_access'},
      }
    ]
  },
  {
    path: 'cheque',
    children: [
      {
        path: 'collect-cheque',
        pathMatch: 'full',
        component: CollectChequeComponent,
        canActivate: [PermissionGuard],
        data: { moduleName: 'finance_collect_cheque', permission: 'has_create'}
      },
      {
        path: 'cheque-list',
        pathMatch: 'full',
        component: ChequeListComponent,
        canActivate: [PermissionGuard],
        data: { moduleName: 'finance_collect_cheque', permission: 'has_access'}
      },
      {
        path: 'collect-cheque/:collection_id',
        pathMatch: 'full',
        component: CollectChequeComponent,
        canActivate: [PermissionGuard],
        data: { moduleName: 'finance_collect_cheque', permission: 'has_edit'}
      },
    ]
  }
];

@NgModule({
  declarations: [
    FeesDiscountComponent,
    EditDiscountComponent,
    StudentDiscountComponent,
    FeesRefundComponent,
    RefundTypeComponent,
    FeesTabsLayoutComponent,
    EditRefundComponent,
    FeesReceiptNoComponent,
    FeesReceiptListComponent,
    OptionalFeesComponent,
    FeesRefundListComponent,
    AddFeesRefundComponent,
    CollectFeesComponent,
    DeleteOrCancelReasonComponent,
    AttachmentsComponent,
    WalletComponent,
    WalletHistoryComponent,
    CreateWalletComponent,
    StudentTabWalletComponent,
    WalletDailyReportComponent,
    FeesEditHistoryComponent,
    DiscountStudentListComponent,
    GenerateDiscountReceiptLogComponent,
    GenerateDiscountReceiptLogDetailsComponent,
    FeesReceiptsComponent,
    FeesConfirmationComponent,
    studentBulkDiscountComponent,
    studentBulkDiscountLogComponent,
    OptionalFeesLogComponent,
    OptionalFeesStudentLogComponent,
    DashboardLayoutComponent,
    CollectionReportFeesComponent,
    RefundReportFeesComponent,
    FeesCardsComponent,
    TotalFeesReportComponent,
    AutoFeeReminderSetupComponent,
    FeeRemindersListComponent,
    FeeReminderDetailsComponent,
    ChequeListComponent,
    CollectChequeComponent,
    
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    RouterModule.forChild(routes),
    DataTablesModule,
    NgMultiSelectDropDownModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NgbTypeaheadModule,
    NgbTooltipModule,
    DpDatePickerModule,
    NgxDaterangepickerMd.forRoot(),
    CommonComponentsModule,
    NgbDropdownModule,
    CdkAccordionModule,
    SharedModule,
  ],
  exports: [
    AddFeesRefundComponent,
    FeesRefundListComponent
  ]
})
export class FeesModule {

}
