import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterModule, Routes } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { DataTablesModule } from 'angular-datatables';

import { ListComponent } from './list/list.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SmsHistoryComponent } from './sms-history/sms-history.component';
import { WhatsappHistoryComponent } from './whatsapp-history/whatsapp-history.component';
import { RemainingFeesSmsComponent } from './remaining-fees-sms/remaining-fees-sms.component';
import { SharedModule } from "../../shared/shared.module";
import { PermissionGuard } from 'src/app/service/permission.service';
import { NotificationHistoryComponent } from './notification-history/notification-history.component';

const routes: Routes = [
  {
    path: 'list',
    component: ListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'message_message', permission: 'has_access'}
  },
  {
    path: 'remaining-fee-sms',
    component: RemainingFeesSmsComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_remaining_fee_sms', permission: 'has_access'}
  }
];

@NgModule({
  declarations: [
    ListComponent,
    SmsHistoryComponent,
    WhatsappHistoryComponent,
    RemainingFeesSmsComponent,
    NotificationHistoryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    RouterModule.forChild(routes),
    NgxPaginationModule,
    DataTablesModule,
    NgxDaterangepickerMd.forRoot({
        separator: ' - ',
        applyLabel: 'Okay',
    }),
    SharedModule
],
  exports: [
    RouterModule
  ]
})
export class WhatsappHistoryModule { }
