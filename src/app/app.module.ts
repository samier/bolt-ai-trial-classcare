import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayModule } from '@angular/cdk/overlay'
import { ColorPickerService } from 'ngx-color-picker';
import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import {Interceptor} from "./core/interceptor";
import {ToastrModule} from "ngx-toastr";
import { PipesModule } from './shared/pipes';
import { BlockUIModule } from 'ng-block-ui';
import { BlockUITemplateComponent } from './shared/componets/blockUITemplate';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { SubscriptionAccessDeniedComponent } from './page/subscription-access-denied/subscription-access-denied.component';
import { InquiryFormComponent } from './page/inquiry-form/inquiry-form.component';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    BlockUITemplateComponent,
    SubscriptionAccessDeniedComponent,
    InquiryFormComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    RouterModule, 
    OverlayModule,
    HttpClientModule,
    PipesModule,
    NgSelectModule,
    BlockUIModule.forRoot({
      template: BlockUITemplateComponent,
    }),
    NgMultiSelectDropDownModule,
    NgSelectModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      maxOpened: 1,
      autoDismiss: true,
      positionClass: 'toast-bottom-right',
    }),
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:10000',
    }),
    MarkdownModule.forRoot(),
    SharedModule
  ],  
  providers: [ 
    {provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true},
    ColorPickerService
  ],
  entryComponents: [
    BlockUITemplateComponent
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
