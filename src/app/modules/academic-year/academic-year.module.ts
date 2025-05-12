import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YearTransferComponent } from './year-transfer/year-transfer.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AcademicYearRoutingModule } from './academic-year-routing.module';
import { YearTransferListComponent } from './year-transfer-list/year-transfer-list.component';
import { YearTransferDetailsComponent } from './year-transfer-details/year-transfer-details.component';
import { AcademicYearFormComponent } from './academic-year-form/academic-year-form.component';
import { AcademicYearListComponent } from './academic-year-list/academic-year-list.component';



@NgModule({
  declarations: [
    YearTransferComponent,
    YearTransferListComponent,
    YearTransferDetailsComponent,
    AcademicYearFormComponent,
    AcademicYearListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AcademicYearRoutingModule,
  ]
})
export class AcademicYearModule { }
