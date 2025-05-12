import { NgModule , CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseRoutingModule } from './expense-routing.module';
import { ExpenseReportComponent } from './expense-report/expense-report.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExpenseCategoriesComponent } from './expense-categories/expense-categories.component';
import { ExpenseVendorsComponent } from './expense-vendors/expense-vendors.component';
import { AddEditExpenseComponent } from './add-edit-expense/add-edit-expense.component';
import { ExpenseListComponent } from './expense-list/expense-list.component';
import { HighchartsChartModule } from 'highcharts-angular'

@NgModule({
  declarations: [
    ExpenseReportComponent,
    ExpenseCategoriesComponent,
    ExpenseVendorsComponent,
    AddEditExpenseComponent,
    ExpenseListComponent,
  ],
  imports: [
    CommonModule,
    ExpenseRoutingModule,
    SharedModule,
    HighchartsChartModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExpenseModule { }