import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WhatsappRoutingModule } from './whatsapp-routing.module';
import { WhatsappComponent } from './whatsapp/whatsapp.component';
import { WhatsappCallbackComponent } from './whatsapp-callback/whatsapp-callback.component';


@NgModule({
  declarations: [
    WhatsappComponent,
    WhatsappCallbackComponent
  ],
  imports: [
    CommonModule,
    WhatsappRoutingModule
  ]
})
export class WhatsappModule { }
