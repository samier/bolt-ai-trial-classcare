import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { HomeworkService } from '../../homework/homework.service';
import { EventService } from '../../event/event.service';
import { CalendarService } from '../calendar.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';

@Component({
  selector: 'app-add-multi-event',
  templateUrl: './add-multi-event.component.html',
  styleUrls: ['./add-multi-event.component.scss']
})
export class AddMultiEventComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  addEventHolidayF : FormGroup = new FormGroup({});
  pageType : any;
  eventTypeList: any;
  facultyList: any;
  batchList: any;
  isShowLoading: boolean = false;
  URLConstants = URLConstants
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _fb : FormBuilder,
    private toastr : Toastr,
    private activatedRouteService : ActivatedRoute,
    public homeworkService: HomeworkService,
    private eventService: EventService,
    private calendarService : CalendarService,
    private router : Router,
    public commonService: CommonService,
  ) {
    // this.pageType = this.activatedRouteService.snapshot.queryParams['isDefaultTemplate'] ?? null
    this.activatedRouteService.queryParamMap.subscribe((ele) => {
      this.pageType = ele.get('isDefaultTemplate') || null;
      
    })
  }
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getDropDownData();
    this.eventCards?.push(this.createCards());
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  addEventCard() {
    this.eventCards.push(this.createCards());

    setTimeout(() => {
      const newCardIndex = this.eventCards.length - 1;
      const newCardElement = document.getElementById('eventCard' + newCardIndex);
      
      if (newCardElement) {
        newCardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  removeEventCard(index: number) {
    let lastCard = index > 0 ? document.getElementById('eventCard' + (index - 1)) : null;

    if (this.eventCards.length === 2) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (lastCard) {
      lastCard.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    setTimeout(() => {
      this.eventCards.removeAt(index)
    }, 300);
  }

  saveData(){
    if (this.addEventHolidayF.invalid) {
      this.addEventHolidayF.markAllAsTouched();
      return this.toastr.showError("Please fill all the required fields");
    }

    const payload = {
      ...this.pageType == 'holiday' && ({
        holidays: this.addEventHolidayF.value?.events?.map((card) => ({
          ...card,
          batches: this.CommonService.getID(card?.batches),
          users: this.CommonService.getID(card?.users) 
        }))
      }),
      ...this.pageType == 'event' && ({
        events: this.addEventHolidayF.value?.events?.map((card) => ({
          ...card,
          batches: this.CommonService.getID(card?.batches),
          users: this.CommonService.getID(card?.users) 
        }))
      }),
      modalFor: this.pageType
    }
    this.isShowLoading = true;
    this.calendarService.createUpdateEventHoliday(payload, null).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.isShowLoading = false;
      if(res?.status){
        this.toastr.showSuccess(res?.message);
        this.router.navigate([this.CommonService.setUrl(URLConstants.CALENDAR)]);
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.isShowLoading = false;
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.error?.error);
    });
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.addEventHolidayF = this._fb.group({
      events: this._fb.array([]),
    })
  }
   
  get eventCards(): FormArray {
    return this.addEventHolidayF.get('events') as FormArray;
  }

  createCards(eventData?: any){
    const formGroup = this._fb.group({
      name: [null,[Validators.required]],
      assignTo: ['1'],
      batches: [null,[Validators.required]],
      users: [null],
      event_type_id: [null, this.pageType == 'event' ? [Validators.required] : []],
      color: ['#000000'],
      start_date: [null,[Validators.required]],
      end_date: [null,[Validators.required]],
      description: [null],
      reference: [null, [ClassCareValidatores.pattern(/^(https?:\/\/)?([\w\-]+\.)+[\w]{2,}(\/\S*)?$/, "Please enter valid link")]]
    });

    formGroup?.get('assignTo')?.valueChanges.pipe(takeUntil(this.$destroy)).subscribe(value => {
      const controls = formGroup?.controls;
    
      controls["batches"].clearValidators();  
      controls["users"].clearValidators();
    
      if (value == "1") {
        controls["batches"].setValidators([Validators.required]);
      } else if (value == "2") {
        controls["users"].setValidators([Validators.required]);
      } 
      controls["batches"].updateValueAndValidity();
      controls["users"].updateValueAndValidity();
    
      formGroup?.markAsPristine();
      formGroup?.markAsUntouched();
    });
    formGroup?.get('event_type_id')?.valueChanges?.pipe(takeUntil(this.$destroy)).subscribe(value => {
      if(value){
        formGroup?.controls['color'].patchValue(this.eventTypeList.find(event => event?.id == value)?.color)
      }
    })
    return formGroup;
  }

  async getDropDownData(){
    try {
      const [batchList, facultyList, eventTypeList] = await Promise.all([
        this.getBatchList(),
        this.getFacultyList(),
        this.getEventTypeList(this.pageType)
      ]);
      this.batchList = batchList;
      this.facultyList = facultyList;
      this.eventTypeList = eventTypeList;
    } catch (err: any) {
      return this.toastr.showError(err?.message);
    }
  }

  getBatchList(){
    return new Promise((resolve, reject) => {
      this.homeworkService.getBatchOnClass({}).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if(res?.status){
          resolve(res?.data);
        } else {
          reject(new Error('No batches found. Please add batches first.'));
        }
      }, () => reject(new Error('Failed to fetch batches.')));
    });
  }

  getFacultyList(){
    return new Promise((resolve, reject) => {
      this.homeworkService.getFacultyList().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if(res?.status){
          resolve(res?.data);
        } else {
          reject(new Error('No faculty found. Please add faculty first.'));
        }
      }, () => reject(new Error('Failed to fetch faculty.')));
    });
  }

  getEventTypeList(pageType: any){
    return new Promise((resolve, reject) => {
      this.calendarService.getEventTypeList().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res?.status && Array.isArray(res?.data) && res.data.length > 0) {
          resolve(res.data);
        } else {
          if (pageType == 'event') {
            reject(new Error('No event types found. Please add event types first.'));
          } else {
            resolve([]);
          }
        }
      }, () => {
        if (pageType == 'event') {
          reject(new Error('Failed to fetch event types.'));
        } else {
          resolve([]);
        }
      });
    });
  }

  //#endregion Private methods
}