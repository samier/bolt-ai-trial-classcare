import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddEventHolidayComponent } from '../add-event-holiday/add-event-holiday.component';
import { NavigationExtras, Router } from '@angular/router';
import { CalendarService } from '../calendar.service';
import { CalendarEventDetailsComponent } from '../calendar-event-details/calendar-event-details.component';
import { HomeworkService } from '../../homework/homework.service';
import { EventService } from '../../event/event.service';
import { FullCalendarComponent } from '@fullcalendar/angular';

@Component({
  selector: 'app-calendar-dashboard',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit{
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants;
  calendarForm : FormGroup = new FormGroup({});
  @ViewChild('fullcalendar') calendarComponent!: FullCalendarComponent;
  batchList : any = []
  eventTypeList : any = []
  eventResponse: any[] = []
  modalOptions : any = {
    backdrop: 'static',
    centered: true,
    size: 'lg',
    windowClass: 'duplicate-modal-section latest-design-modal',
    backdropClass: 'duplicate-modal-backdrop'
  }
  filter: boolean = false;
  filterCount: any = 0;
  isResetLoading: boolean = false;
  isShowLoading: boolean = false;
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
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventSelect.bind(this),
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
    },
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    }
  };
  hasAccess = this.CommonService.hasPermission('administrator_event_type', 'has_access');

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public CommonService: CommonService,
    private _fb : FormBuilder,
    public homeworkService: HomeworkService,
    private _toastr : Toastr,
    private _formValidationService : FormValidationService,
    private _modalService: NgbModal,
    private _router: Router,
    private _calendarService: CalendarService,
    private eventService: EventService,
   
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.countFilters();
    this.getBatchList();
    this.hasAccess ? this.getEventTypeList(): '';
    this.createCalendarOption();
    setTimeout(function () {
      window.dispatchEvent(new Event('resize'))
    }, 100)
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  getBatchList(){
    this.homeworkService.getBatchOnClass({}).subscribe((res: any) => {
      if(res?.status){
        this.batchList = res?.data
      }
    })
  }

  showData() {
    this.countFilters();
    this.isShowLoading = true;
    this.createCalendarOption();
  }

  reset(event: any){
    if(event){
      event.stopPropagation();
    }
    this.calendarForm.reset();
    this.calendarForm.controls['assignTo'].patchValue('3');
    this.countFilters();
    this.isResetLoading = true;
    this.createCalendarOption();
  }

  async openModal(selectedData: any, type: any, modalName?: any ){
    const modalRef = this._modalService.open(modalName == 'add' ? AddEventHolidayComponent : CalendarEventDetailsComponent, this.modalOptions)
    modalRef.componentInstance.selectedDate = selectedData;
    modalRef.componentInstance.selectedObj = selectedData; // for editModal via view modal
    modalRef.componentInstance.type = type;

    await modalRef.result.then((res: any) => {
      if(res?.data){
        this.createCalendarOption();
      }else if(res?.isEdit){
        this.openModal(res?.selectedObj,res?.selectedObj?.type == 2 ? 'holiday' : 'event', 'add')
      }
    })
  }

  addMultiple(type: any){
    let queryParams : NavigationExtras = {
      queryParams: {
        isDefaultTemplate: type
      }
    }
    this._router.navigate([this.CommonService.setUrl(URLConstants.ADD_MULTI_EVENT)],queryParams)
  }

  eventHolidayList(type: any){
    let queryParams : NavigationExtras = {
      queryParams: {
        isDefaultTemplate: type
      }
    }
    this._router.navigate([this.CommonService.setUrl(URLConstants.EVENT_HOLIDAY_LIST)],queryParams)

  }

  countFilters() {
    this.filterCount = 0;
    const filter = this.calendarForm?.value;
    Object.keys(filter).forEach((item) => {
      if (item === 'date') {
        if (filter[item]?.startDate && filter[item]?.endDate) {
          this.filterCount++;
        }
      } else if (filter[item] && (Array.isArray(filter[item]) ? filter[item].length : true)) {
        this.filterCount++;
      }
    })
  }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.calendarForm = this._fb.group({
      batch_id: [null],
      event_type_id: [null],
      assignTo: ['3'],
    })
  }

  createCalendarOption() {
    const payload = {
      batch_id: this.CommonService.getID(this.calendarForm?.value?.batch_id),
      calendar_data_type: this.CommonService.getID(this.calendarForm?.value?.event_type_id),
      event_for: this.calendarForm?.value?.assignTo ? [parseInt(this.calendarForm?.value?.assignTo)] : []
    };
    this.isCalendarLoading = true
    this._calendarService.getCalendarEventsList(payload).pipe(takeUntil(this.$destroy)).subscribe({
      next: (res: any) => {
        this.isResetLoading = false;
        this.isShowLoading = false;
        this.isCalendarLoading = false;
        const eventResponse = res?.data || [];
        const events = eventResponse.map(event => ({
          ...event,
          id: event?.id,
          title: event?.name ?? event?.exam_name,
          start: event?.start_date + (event?.start_time ? ' ' + event?.start_time : ' 00:00:00'),
          end: event?.end_date + (event?.end_time ? ' ' + event?.end_time : ' 23:59:59'),
          description: event?.description,
          color: event?.color
        }));
        
        if (this.calendarComponent) {
          this.calendarComponent.getApi().removeAllEvents();
          this.calendarComponent.getApi().addEventSource(events);
        }
      },
      error: (error: any) => {
        this.isResetLoading = false;
        this.isShowLoading = false;
        this.isCalendarLoading = false;
        this._toastr.showError(error?.message || 'Something went wrong');
        if (this.calendarComponent) {
          this.calendarComponent.getApi().removeAllEvents(); // Clear events on error if needed
        }
      }
    });
  }
  

  handleDateSelect(selectInfo: DateSelectArg){
    const hasHolidayPermission = this.CommonService.hasPermission('administrator_holiday', 'has_create'); 
    const hasEventPermission = this.CommonService.hasPermission('administrator_event', 'has_create'); // replace with actual permission check
    if (hasHolidayPermission && hasEventPermission) {
      this.openModal(selectInfo,null, 'add');
    } else if (hasHolidayPermission) {
      this.openModal(selectInfo,'holiday', 'add');
    } else if (hasEventPermission) {
      this.openModal(selectInfo,'event', 'add');
    }
    
  }

  handleEventSelect(clickInfo: EventClickArg){
    this.openModal(clickInfo?.event?._def,null, 'view')
  }

  getEventTypeList(){
    this._calendarService.getEventTypeList().subscribe((res: any) => {
      this.eventTypeList =res.data;
      if (res.status) {
        this.eventTypeList = [...[{id:"exam", name:'Exam'}, {id:"holiday", name:'Holiday'}], ...res.data];
      }
    });
  }

  //#endregion Private methods
}