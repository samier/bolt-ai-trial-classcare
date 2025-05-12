import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SectionRoutingModule } from './section-routing.module';
import { SectionAddEditComponent } from './section-add-edit/section-add-edit.component';
import { SectionListComponent } from './section-list/section-list.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    SectionAddEditComponent,
    SectionListComponent
  ],
  imports: [
    CommonModule,
    SectionRoutingModule,
    SharedModule
  ]
})
export class SectionModule { }
