import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomFieldRoutingModule } from './custom-field-routing.module';
import { CustomFieldListComponent } from './custom-field-list/custom-field-list.component';
import { CustomFieldAddComponent } from './custom-field-add/custom-field-add.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    CustomFieldListComponent,
    CustomFieldAddComponent
  ],
  imports: [
    CommonModule,
    CustomFieldRoutingModule,
    SharedModule,
    RouterModule
  ]
})
export class CustomFieldModule { }
