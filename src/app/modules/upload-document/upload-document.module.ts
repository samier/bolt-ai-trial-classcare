import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UploadDocumentRoutingModule } from './upload-document-routing.module';
import { UploadDocumentComponent } from './upload-document/upload-document.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    UploadDocumentComponent
  ],
  imports: [
    CommonModule,
    UploadDocumentRoutingModule,
    SharedModule
  ]
})
export class UploadDocumentModule { }
