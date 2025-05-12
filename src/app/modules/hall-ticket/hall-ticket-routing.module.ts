import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HallTicketListComponent } from './hall-ticket-list/hall-ticket-list.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { ViewHallTicketStudentwiseComponent } from './view-hall-ticket-studentwise/view-hall-ticket-studentwise.component';

const routes: Routes = [
  {
    path:'',
    component : HallTicketListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_hall_ticket', permission: 'has_access'}
  },
  {
    path:':id',
    component : ViewHallTicketStudentwiseComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_hall_ticket', permission: 'has_access'}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HallTicketRoutingModule { }
