import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { AddSalaryComponent } from './add-salary/add-salary.component';
import { AddPayrollCategoryComponent } from './add-payroll-category/add-payroll-category.component';
import { PayrollCategoryListComponent } from './payroll-category-list/payroll-category-list.component';
import { AddPayrollGroupComponent } from './add-payroll-group/add-payroll-group.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PayrollGroupListComponent } from './payroll-group-list/payroll-group-list.component';
import { AssignPayrollgroupToRoleComponent } from './assign-payrollgroup-to-role/assign-payrollgroup-to-role.component';
import { PayrollCategoryViewComponent } from './payroll-category-view/payroll-category-view.component';
import { PayrollGroupViewComponent } from './payroll-group-view/payroll-group-view.component';
import { PayslipListComponent } from './payslip-list/payslip-list.component';
import { AssignedPayrollGroupListComponent } from './assigned-payroll-group-list/assigned-payroll-group-list.component';
import { GeneratePayslipComponent } from './generate-payslip/generate-payslip.component';
import { StaffPayslipComponent } from './staff-payslip/staff-payslip.component';
import { AttendaceListComponent } from './attendace-list/attendace-list.component';
import { MonthwiseListComponent } from './monthwise-list/monthwise-list.component';
import { PayrollCalculationComponent } from './payroll-calculation/payroll-calculation.component';
import { SetMonthlyWorkingDaysComponent } from './set-monthly-working-days/set-monthly-working-days.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';



const routes:Routes =[
  {
    path:'home',
    component:HomeComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  },
  {
    path:'add-salary/:id',
    component:AddSalaryComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  },
  {
    path:'add-payroll-category/:id',
    component:AddPayrollCategoryComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  },
  {
    path:'payroll-category-list',
    component:PayrollCategoryListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  },
  {
    path:'add-payroll-group/:id',
    component:AddPayrollGroupComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  },
  {
    path:'payroll-group-list',
    component:PayrollGroupListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  },
  {
    path:'assign-payroll-group/:id',
    component:AssignPayrollgroupToRoleComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  },  
  {
    path:'payroll-category-view/:id',
    component:PayrollCategoryViewComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  }, 
  {
    path:'payroll-group-view/:id',
    component:PayrollGroupViewComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  },
  {
    path:'payslip-list',
    component:PayslipListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  }, 
  {
    path:'assigned-payroll-group-list',
    component:AssignedPayrollGroupListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  },  
  {
    path:'generate-payslip/:id',
    component:GeneratePayslipComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  },  
  {
    path:'staff-payslip-list',
    component:StaffPayslipComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payslip_list', permission: 'has_access'}
  },  
  {
    path:'attendace-list/:date',
    component:AttendaceListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  }, 
  {
    path:'monthwise-list',
    component:MonthwiseListComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  },       
  {
    path:'payroll-calculation/:date',
    component:PayrollCalculationComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  },
  {
    path:'set-monthly-working-days',
    component:SetMonthlyWorkingDaysComponent,
    pathMatch:'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'payroll_payroll_management', permission: 'has_access'}
  },             
] 

@NgModule({
  declarations: [
    HomeComponent,
    AddSalaryComponent,
    AddPayrollCategoryComponent,
    PayrollCategoryListComponent,
    AddPayrollGroupComponent,
    PayrollGroupListComponent,
    AssignPayrollgroupToRoleComponent,
    PayrollCategoryViewComponent,
    PayrollGroupViewComponent,
    PayslipListComponent,
    AssignedPayrollGroupListComponent,
    GeneratePayslipComponent,
    StaffPayslipComponent,
    AttendaceListComponent,
    MonthwiseListComponent,
    PayrollCalculationComponent,
    SetMonthlyWorkingDaysComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,    
    RouterModule.forChild(routes),
    NgSelectModule,  
    DragDropModule,
    NgMultiSelectDropDownModule.forRoot(),
    SharedModule
  ]
})
export class PayrollManagementModule { }

// CdkDropListGroup, 
    // CdkDropList, 
    // CdkDrag

    // import {
//   // CdkDragDrop,
  
//   CdkDrag,
//   CdkDropList,
//   CdkDropListGroup,
//   // moveItemInArray,
//   // transferArrayItem,
// } from '@angular/cdk/drag-drop';

//import {NgFor} from '@angular/common';
