import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WhatsappComponent } from './whatsapp/whatsapp.component';
import { WhatsappCallbackComponent } from './whatsapp-callback/whatsapp-callback.component';

const routes: Routes = [
  {
    path : '',
    component : WhatsappComponent
  },
  // {
  //   path : 'callback',
  //   component : WhatsappCallbackComponent
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WhatsappRoutingModule { }
