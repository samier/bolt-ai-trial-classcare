import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditBankAccountComponent } from './add-edit-bank-account/add-edit-bank-account.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { IncomeFormComponent } from './income-form/income-form.component';
import { IncomeListComponent } from './income-list/income-list.component';
import { BankAccountListComponent } from './bank-account-list/bank-account-list.component';
import { TaxListComponent } from './tax-list/tax-list.component';
import { LedgerListComponent } from './ledger-list/ledger-list.component';
import { HeadListComponent } from './head-list/head-list.component';
import { ExpenseFormComponent } from './expense-form/expense-form.component';
import { ExpenseListComponent } from './expense-list/expense-list.component';
import { ProfitLossComponent } from './profit-loss/profit-loss.component';

const routes: Routes = [

  // bank module
  {
    path: 'add-bank-account',
    component: AddEditBankAccountComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_bank_accounts', permission: 'has_create'}
  },
  {
    path: 'edit-bank-account/:id',
    component: AddEditBankAccountComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_bank_accounts', permission: 'has_edit'}
  },
  {
    path: 'bank-account-list',
    component: BankAccountListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_bank_accounts', permission: 'has_access'}
  },

  //income
  {
    path: 'income',
    component: IncomeFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_incomes', permission: 'has_create'}
  },
  {
    path: 'income/:income_id',
    component: IncomeFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_incomes', permission: 'has_edit'}
  },
  {
    path: 'income-list',
    component: IncomeListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_incomes', permission: 'has_access'}
  },

  // tax module
  {
    path: 'tax-list',
    component: TaxListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_taxes', permission: 'has_access'}
  },

  //ledger module
  {
    path: 'ledger-list',
    component: LedgerListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_ac_group', permission: 'has_access'}
  },

  //head module
  {
    path: 'head-list',
    component: HeadListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_ledger_accounts', permission: 'has_access'}
  },

  //expense
  {
    path: 'expense',
    component: ExpenseFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_expenses', permission: 'has_create'},
  },
  {
    path: 'expense/:expense_id',
    component: ExpenseFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_expenses', permission: 'has_edit'},
  },
  {
    path: 'expense-list',
    component: ExpenseListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_expenses', permission: 'has_access'},
  },
  {
    path: 'profit-loss',
    component: ProfitLossComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'finance_profit_loss_report', permission: 'has_access'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncomeExpenseRoutingModule { }
