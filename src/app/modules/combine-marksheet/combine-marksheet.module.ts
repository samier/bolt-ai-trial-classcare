import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CombineMarksheetRoutingModule } from './combine-marksheet-routing.module';
import { CombineMarksheetListComponent } from './combine-marksheet-list/combine-marksheet-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateEditCombineMarksheetComponent } from './create-edit-combine-marksheet/create-edit-combine-marksheet.component';
import { CombineResultSetupComponent } from './combine-result-setup/combine-result-setup.component';
import { DownloadStudentWiseCombineResultComponent } from './download-student-wise-combine-result/download-student-wise-combine-result.component';
import { DownloadBatchWiseCombineResultComponent } from './download-batch-wise-combine-result/download-batch-wise-combine-result.component';
import { GenerateMarksheetSetupComponent } from './generate-marksheet-setup/generate-marksheet-setup.component';


@NgModule({
  declarations: [
    CombineMarksheetListComponent,
    CreateEditCombineMarksheetComponent,
    CombineResultSetupComponent,
    DownloadStudentWiseCombineResultComponent,
    DownloadBatchWiseCombineResultComponent,
    GenerateMarksheetSetupComponent
  ],
  imports: [
    CommonModule,
    CombineMarksheetRoutingModule,
    SharedModule
  ]
})
export class CombineMarksheetModule { }
