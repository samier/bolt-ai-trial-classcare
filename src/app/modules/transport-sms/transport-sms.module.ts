import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SendSmsComponent } from './send-sms/send-sms.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedModule } from "../../shared/shared.module";



const routes:Routes =[
  {
    path:'send-transport-message',
    component:SendSmsComponent,
    pathMatch:'full'
  },
] 

@NgModule({
  declarations: [
    SendSmsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    RouterModule.forChild(routes),
    NgSelectModule,
    NgMultiSelectDropDownModule.forRoot(),
    SharedModule
]
})
export class TransportSmsModule { }
