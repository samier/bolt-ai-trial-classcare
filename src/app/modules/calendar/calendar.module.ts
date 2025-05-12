import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarRoutingModule } from './calendar-routing.module';
import { CalendarComponent } from './calendar/calendar.component';
import { FullCalendarModule } from '@fullcalendar/angular'; // for FullCalendar!
import { SharedModule } from 'src/app/shared/shared.module';
import { EventHolidayListComponent } from './event-holiday-list/event-holiday-list.component';
import { AddEventHolidayComponent } from './add-event-holiday/add-event-holiday.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AddMultiEventComponent } from './add-multi-event/add-multi-event.component';
import { EventTypeModelComponent } from './event-type-model/event-type-model.component';
import { EventTypeListComponent } from './event-type-list/event-type-list.component';
import { CalendarEventDetailsComponent } from './calendar-event-details/calendar-event-details.component';



@NgModule({
  declarations: [
    CalendarComponent,
    EventHolidayListComponent,
    AddEventHolidayComponent,
    AddMultiEventComponent,
    EventTypeModelComponent,
    EventTypeListComponent,
    CalendarEventDetailsComponent,
  ],
  imports: [
    CommonModule,
    CalendarRoutingModule,
    FullCalendarModule,
    SharedModule
  ],
  providers: [NgbActiveModal] 
})
export class CalendarModule { }
