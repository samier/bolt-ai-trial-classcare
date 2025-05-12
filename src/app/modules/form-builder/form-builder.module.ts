import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilderRoutingModule } from './form-builder-routing.module';
import { InquiryFormLayoutComponent } from './inquiry-form-layout/inquiry-form-layout.component';
import { FormSetupComponent } from './inquiry-form-layout/form-setup/form-setup.component';
import { FormBuilderComponent } from './inquiry-form-layout/form-builder/form-builder.component';
import { IntegrationCodeComponent } from './inquiry-form-layout/integration-code/integration-code.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MarkdownModule } from 'ngx-markdown';
import { InquiryCustomFormListComponent } from './inquiry-custom-form-list/inquiry-custom-form-list.component';
import { InquiryCustomFormViewModelComponent } from './inquiry-custom-form-view-model/inquiry-custom-form-view-model.component';

@NgModule({
  declarations: [
    InquiryFormLayoutComponent,
    FormSetupComponent,
    FormBuilderComponent,
    IntegrationCodeComponent,
    InquiryCustomFormListComponent,
    InquiryCustomFormViewModelComponent
  ],
  imports: [
    CommonModule,
    FormBuilderRoutingModule,
    MarkdownModule.forChild(),
    SharedModule,
  ]
})
export class FormBuilderModule { }
