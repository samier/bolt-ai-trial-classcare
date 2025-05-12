import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarService } from 'src/app/modules/calendar/calendar.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CalendarOptions } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-calendar-dashboard',
  templateUrl: './calendar-dashboard.component.html',
  styleUrls: ['./calendar-dashboard.component.scss']
})
export class CalendarDashboardComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  @ViewChild('fullcalendar') calendarComponent!: FullCalendarComponent;
  eventResponse: any[] = [];
  URLConstants = URLConstants;
  isCalendarLoading: boolean = false;
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    timeZone: 'local',
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    editable: false,
    selectable: true,
    events: [], // start with empty events
    dayMaxEvents: true,
    eventDisplay: 'block',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    views: {
      dayGridMonth: {
        dayMaxEventRows: 3,
        fixedWeekCount: false
      }
    }
  };
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private calendarService: CalendarService,
    private cdr: ChangeDetectorRef,
    private toastr: Toastr
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.createCalendarOption();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  createCalendarOption() {
    const payload = {
      event_for : [3],
      calendar_data_type: [],
      batch_id: []
    }
    this.isCalendarLoading = true
    this.calendarService.getCalendarEventsList(payload).pipe(takeUntil(this.$destroy)).subscribe({
      next: (res: any) => {
        this.isCalendarLoading = false;
        const eventResponse = res?.data || [];
        const events = eventResponse.map(event => ({
          ...event,
          id: event?.id,
          title: event?.name ?? event?.exam_name,
          start: event?.start_date + (event?.start_time ? ' ' + event?.start_time : ''),
          end: event?.end_date + (event?.end_time ? ' ' + event?.end_time : ''),
          description: event?.description,
          color: event?.color
        }));
        
        if (this.calendarComponent) {
          this.calendarComponent.getApi().removeAllEvents();
          this.calendarComponent.getApi().addEventSource(events);
        }
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.isCalendarLoading = false;
        this.toastr.showError(error?.message || 'Something went wrong');
        if (this.calendarComponent) {
          this.calendarComponent.getApi().removeAllEvents(); // Clear events on error if needed
        }
        this.cdr.detectChanges();
      }
    });
  }

  //#endregion Private methods
}
