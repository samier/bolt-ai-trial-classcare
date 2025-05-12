import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpenseReportComponent } from './expense-report/expense-report.component';
import { AddEditExpenseComponent } from './add-edit-expense/add-edit-expense.component';
import { PermissionGuard } from 'src/app/service/permission.service';

const routes: Routes = [
  {
    path: 'expenseReport',
    component: ExpenseReportComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'finance_expense', permission: 'has_access', parentModule: 'expenses'}
  },
  {
    path: 'add-expense',
    component: AddEditExpenseComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'finance_expense', permission: 'has_create', parentModule: 'expenses' }
  },
  {
    path: 'add-expense/:id',
    component: AddEditExpenseComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'finance_expense', permission: 'has_edit', parentModule: 'expenses' }
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpenseRoutingModule { }