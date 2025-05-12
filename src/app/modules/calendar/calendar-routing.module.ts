import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './calendar/calendar.component';
import { EventHolidayListComponent } from './event-holiday-list/event-holiday-list.component';
import { AddMultiEventComponent } from './add-multi-event/add-multi-event.component';
import { EventTypeListComponent } from './event-type-list/event-type-list.component';
import { PermissionGuard } from 'src/app/service/permission.service';

const routes: Routes = [
  {
    path : '',
    pathMatch : 'full',
    component : CalendarComponent,
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_calender', permission: 'has_access'},
  },
  {
    path : 'add-event-holiday',
    pathMatch : 'full',
    component : AddMultiEventComponent,
  },
  {
    path : 'event-type-list',
    pathMatch : 'full',
    component : EventTypeListComponent,
    canActivate: [PermissionGuard],
    data: {moduleName: 'administrator_event_type', permission: 'has_access'},
  },
  {
    path : 'event-holiday-list',
    pathMatch : 'full',
    component : EventHolidayListComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalendarRoutingModule { }
