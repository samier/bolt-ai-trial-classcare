import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IncomeExpenseRoutingModule } from './income-expense-routing.module';
import { AddEditBankAccountComponent } from './add-edit-bank-account/add-edit-bank-account.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { IncomeFormComponent } from './income-form/income-form.component';
import { CommonComponentsModule } from '../common-components/common-components.module';
import { IncomeListComponent } from './income-list/income-list.component';
import { BankAccountListComponent } from './bank-account-list/bank-account-list.component';
import { TaxListComponent } from './tax-list/tax-list.component';
import { LedgerListComponent } from './ledger-list/ledger-list.component';
import { HeadListComponent } from './head-list/head-list.component';
import { ExpenseFormComponent } from './expense-form/expense-form.component';
import { ExpenseListComponent } from './expense-list/expense-list.component';
import { ProfitLossComponent } from './profit-loss/profit-loss.component';
import { HeadModalComponent } from './head-modal/head-modal.component';


@NgModule({
  declarations: [
    AddEditBankAccountComponent,
    IncomeFormComponent,
    IncomeListComponent,
    BankAccountListComponent,
    TaxListComponent,
    LedgerListComponent,
    HeadListComponent,
    ExpenseFormComponent,
    ExpenseListComponent,
    ProfitLossComponent,
    HeadModalComponent
  ],
  imports: [
    CommonModule,
    IncomeExpenseRoutingModule,
    SharedModule,
    CommonComponentsModule,
  ]
})
export class IncomeExpenseModule { }
