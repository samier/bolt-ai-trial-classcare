import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HomeworkService } from '../../homework/homework.service';
import { EventService } from '../../event/event.service';
import { Toastr } from 'src/app/core/services/toastr';
import { CalendarService } from '../calendar.service';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';

@Component({
  selector: 'app-add-event-holiday',
  templateUrl: './add-event-holiday.component.html',
  styleUrls: ['./add-event-holiday.component.scss'],
  
  
})
export class AddEventHolidayComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  addEventHolidayF : FormGroup = new FormGroup({});
  hasId: any;
  @Input() selectedDate;
  @Input() selectedObj
  URLConstants = URLConstants
  batchList: any;
  facultyList: any;
  eventTypeList: any;
  @Input() type;
  @Input() isView ;
  dataReceived: boolean = false;
  isShowLoading: boolean = false;

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _fb : FormBuilder,
    private modalRef: NgbActiveModal,
    public homeworkService: HomeworkService,
    private eventService: EventService,
    private toastr: Toastr,
    private calendarService : CalendarService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  closeModal(){
    this.modalRef.close();
  }

  saveData(){
    this.addEventHolidayF.markAllAsTouched();
    if (this.addEventHolidayF?.invalid){
      return this.toastr.showError("Please fill all required Fields");
    }

    const payload = {
      ...this.addEventHolidayF?.value?.modalFor == '1' && ({
        events : [{
          ...this.addEventHolidayF?.value,
          batches: this.CommonService.getID(this.addEventHolidayF?.value?.batches),
          users: this.CommonService.getID(this.addEventHolidayF?.value?.users),
        }]
      }),
      ...this.addEventHolidayF?.value?.modalFor == '2' && ({
        holidays : [{
          ...this.addEventHolidayF?.value,
          batches: this.CommonService.getID(this.addEventHolidayF?.value?.batches),
          users: this.CommonService.getID(this.addEventHolidayF?.value?.users),
        }]
      }),
      modalFor: this.addEventHolidayF?.value?.modalFor == '1' ? 'event' : 'holiday',
    }
    const eventId = this.selectedObj ? this.selectedObj.id : null;
    this.isShowLoading = true;
    this.calendarService.createUpdateEventHoliday(payload, eventId ).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.isShowLoading = false;
      if(res?.status){
        this.toastr.showSuccess(res?.message);
        this.modalRef.close({data: true});
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.isShowLoading = false;
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.error?.error);
    });
  }

  onEventTypeChange(event: any){
    if (event){
      this.addEventHolidayF?.controls['color']?.patchValue(event?.color)
    }
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  async initForm() {
    // Init form once (outside the interval)
    this.addEventHolidayF = this._fb.group({
      modalFor: ['1'],
      name: [null, [Validators.required]],
      assignTo: ['1'],
      batches: [null],
      users: [null],
      event_type_id: [null],
      color: ['#000000'],
      start_date: [null, [Validators.required]],
      end_date: [null, [Validators.required]],
      description: [null],
      reference: [null, [ClassCareValidatores.pattern(/^(https?:\/\/)?([\w\-]+\.)+[\w]{2,}(\/\S*)?$/, "Please enter valid link")]],
      id: [null]
    });

    
    try {
      const selected = this.selectedObj ?? {};
      const type = this.type ?? null;

      const modalForVal = selected?.modalFor ?? (type == 'holiday' ? '2' : '1');
      const assignToVal = selected?.assignTo?.toString() ?? '1';
      
      const [batchList, facultyList, eventTypeList] = await Promise.all([
        this.getBatchList(),
        this.getFacultyList(),
        this.getEventTypeList(modalForVal)
      ]);
  
      this.batchList = batchList;
      this.facultyList = facultyList;
      this.eventTypeList = eventTypeList;

      this.addEventHolidayF.patchValue({
        modalFor: modalForVal,
        name: selected?.name ?? selected?.event_name ?? null,
        assignTo: assignToVal,
        batches: selected?.batches?.map(batch => this.batchList?.find(b => b.id == batch)) ?? null,
        users: selected?.users?.map(user => this.facultyList?.find(f => f.id == user)) ?? null,
        event_type_id: selected?.event_type_id ?? this.eventTypeList?.find(t => t.name == selected?.type)?.id ?? null,
        color: selected?.color ?? '#000000',
        start_date:
          this.selectedDate?.start || selected?.start_date
            ? new Date(this.selectedDate?.start ?? selected?.start_date + (selected?.start_time ? 'T' + selected?.start_time : ''))
                .toLocaleString('sv-SE')
                .replace(' ', 'T')
            : null,
        end_date:
          this.selectedDate?.end || selected?.end_date
            ? new Date(this.selectedDate?.end ?? selected?.end_date + (selected?.end_time ? 'T' + selected?.end_time : ''))
                .toLocaleString('sv-SE')
                .replace(' ', 'T')
            : null,
        description: selected?.description ?? null,
        reference: selected?.reference ?? null,
        id: selected?.id ?? null
      });
  
      // Validators and subscriptions
      const assignToControl = this.addEventHolidayF.get('assignTo');
      const batchesControl = this.addEventHolidayF.get('batches');
      const usersControl = this.addEventHolidayF.get('users');
  
      const updateAssignToValidators = (val: string) => {
        batchesControl?.clearValidators();
        usersControl?.clearValidators();
  
        if (val == '1') {
          batchesControl?.setValidators([Validators.required]);
        } else if (val == '2') {
          usersControl?.setValidators([Validators.required]);
        }
  
        batchesControl?.updateValueAndValidity();
        usersControl?.updateValueAndValidity();
      };
  
      updateAssignToValidators(assignToVal);
      assignToControl?.valueChanges.pipe(takeUntil(this.$destroy)).subscribe(updateAssignToValidators);
  
      const eventTypeControl = this.addEventHolidayF.get('event_type_id');
      const updateEventTypeValidators = (val: string) => {
        eventTypeControl?.clearValidators();
        if (val == '1') {
          eventTypeControl?.setValidators([Validators.required]);
        }
        eventTypeControl?.updateValueAndValidity();
      };
  
      updateEventTypeValidators(modalForVal);
      this.addEventHolidayF.get('modalFor')?.valueChanges.subscribe(updateEventTypeValidators);
      this.addEventHolidayF?.markAsUntouched();
      this.addEventHolidayF?.markAsPristine();
      this.dataReceived = true;
      
    } catch (err: any) {
      this.toastr.showError(err?.message);
      this.dataReceived = true;
    }
  }

  getBatchList() {
    return new Promise((resolve, reject) => {
      this.homeworkService.getBatchOnClass({}).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res?.status && Array.isArray(res?.data) && res.data.length > 0) {
          resolve(res.data);
        } else {
          reject(new Error('No batches found. Please add batches first.'));
        }
      }, () => reject(new Error('Failed to fetch batches.')));
    });
  }

  getFacultyList() {
    return new Promise((resolve, reject) => {
      this.homeworkService.getFacultyList().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res?.status && Array.isArray(res?.data) && res.data.length > 0) {
          resolve(res.data);
        } else {
          reject(new Error('No faculty found. Please add faculty first.'));
        }
      }, () => reject(new Error('Failed to fetch faculty.')));
    });
  }

  getEventTypeList(modalFor: any) {
    return new Promise((resolve, reject) => {
      this.calendarService.getEventTypeList().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res?.status && Array.isArray(res?.data) && res.data.length > 0) {
          resolve(res.data);
        } else {
          if (modalFor == '1') {
            reject(new Error('No event types found. Please add event types first.'));
          } else {
            resolve([]);
          }
        }
      }, () => {
        if (modalFor == '1') {
          reject(new Error('Failed to fetch event types.'));
        } else {
          resolve([]);
        }
      });
    });
  }
	
  //#endregion Private methods
}