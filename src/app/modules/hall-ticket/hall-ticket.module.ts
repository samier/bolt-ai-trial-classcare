import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HallTicketRoutingModule } from './hall-ticket-routing.module';
import { HallTicketListComponent } from './hall-ticket-list/hall-ticket-list.component';
import { ViewHallTicketStudentwiseComponent } from './view-hall-ticket-studentwise/view-hall-ticket-studentwise.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    HallTicketListComponent,
    ViewHallTicketStudentwiseComponent
  ],
  imports: [
    CommonModule,
    HallTicketRoutingModule,
    SharedModule
  ]
})
export class HallTicketModule { }
