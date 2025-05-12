import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { EditProfileComponent } from './edit-profile/edit-profile.component';
// import { EmptyPageComponent } from './empty-page/empty-page.component';
// import { FaqsComponent } from './faqs/faqs.component';
// import { InvoiceComponent } from './invoice/invoice.component';
// import { PricingComponent } from './pricing/pricing.component';
import { ProfileComponent } from './profile/profile.component';
// import { TodotaskComponent } from './todotask/todotask.component';
import { PagesRoutingModule } from './pages-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import 'hammerjs';
import 'mousetrap';
// import { GalleryModule } from 'ng-gallery';
// import { AboutUsComponent } from './about-us/about-us.component';
import { SettingsComponent } from './settings/settings.component';
import { SwitcherOneComponent } from './switcher-one/switcher-one.component';
// import { MailModule } from './mail/mail.module';
// import { EcommerceModule } from './ecommerce/ecommerce.module';
import { CustomPagesRoutingModule } from './custom-pages/custom-pages-routing.module';
// import { LightboxModule } from 'ng-gallery/lightbox';
// import { GalleryComponent } from './gallery/gallery.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import 'hammerjs';
import 'mousetrap';
import { GalleryModule } from '@ks89/angular-modal-gallery';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelPropagation: false
};

@NgModule({
  declarations: [
    // EditProfileComponent, 

    // EmptyPageComponent, FaqsComponent, 
    // InvoiceComponent,
    //  PricingComponent, 
     ProfileComponent,
      // TodotaskComponent,
      SettingsComponent, SwitcherOneComponent,
      // GalleryComponent
    ],
      // AboutUsComponent,
  imports: [
    CommonModule,
    PagesRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    // LightboxModule,
    // MailModule,
    // EcommerceModule,
    CustomPagesRoutingModule,
    ColorPickerModule,
    PerfectScrollbarModule,
    GalleryModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class PagesModule { }
