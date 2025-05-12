import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeesComponent } from './fees.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


const routes: Routes = [
  {
    path: 'fees',
    component: FeesComponent,
    pathMatch: 'full',
    data: { moduleName: 'finance_import_fees', permission: 'has_import' , parentModule : 'import'} // Example: passing roles as a parameter
  }
];


@NgModule({
  declarations: [
    FeesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    RouterModule.forChild(routes),
    MatProgressSpinnerModule
  ]
})
export class FeesModule { }
