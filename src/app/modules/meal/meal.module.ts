import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealComponent } from './meal/meal.component';
import { MealListComponent } from './meal-list/meal-list.component';
import { DateWiseMealListComponent } from './date-wise-meal-list/date-wise-meal-list.component';
import { DateWiseMealComponent } from './date-wise-meal/date-wise-meal.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from "angular-datatables";
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'meal-create',
    component: MealComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_meal', permission: 'has_create', parentModule: 'meal' }
  },
  {
    path: 'meal-edit/:id',
    component: MealComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_meal', permission: 'has_edit', parentModule: 'meal' }
  },
  {
    path: 'meal-list',
    component: MealListComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_meal', permission: 'has_access', parentModule: 'meal' }
  },
  {
    path: 'date-wise-meal-create',
    component: DateWiseMealComponent,
    pathMatch: 'full',
     canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_date_wise_meal', permission: 'has_create' , parentModule: 'meal' }
  },
  {
    path: 'date-wise-meal-edit/:id',
    component: DateWiseMealComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_date_wise_meal', permission: 'has_edit' , parentModule: 'meal' }
  },
  {
    path: 'date-wise-meal-list',
    component: DateWiseMealListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_date_wise_meal', permission: 'has_access' , parentModule: 'meal'}
  }
]

@NgModule({
  declarations: [
    MealComponent,
    MealListComponent,
    DateWiseMealListComponent,
    DateWiseMealComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes),
    NgSelectModule,
    DataTablesModule,
    SharedModule
  ],
  exports: [
    RouterModule
  ]
})
export class MealModule { }
