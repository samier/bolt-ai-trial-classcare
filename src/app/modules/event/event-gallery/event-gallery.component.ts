import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { DateFormatService } from 'src/app/service/date-format.service';
import { eventGalleryFor } from 'src/app/common-config/static-value';
import { EventService } from '../event.service';
import { TeacherDiaryService } from '../../teacher-diary/teacher-diary.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddEventGalleryComponent } from '../add-event-gallery/add-event-gallery.component';
import { HomeworkService } from '../../homework/homework.service';
@Component({
  selector: 'app-event-gallery',
  templateUrl: './event-gallery.component.html',
  styleUrls: ['./event-gallery.component.scss']
})
export class EventGalleryComponent implements OnInit {
  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  filterCount: any = 0;
  filter: any = false;
  filterForm: FormGroup | any;
  eventFor: any = eventGalleryFor;
  batches: any = []
  employee: any = []
  isEvent: any
  event: any;
  user_id: any = window.localStorage.getItem('user_id');
  user_role: any = window.localStorage.getItem('role')?.split(',') || [];
  URLConstants = URLConstants;
  isDisabled: boolean = false

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    public dateFormateService: DateFormatService,
    private formBuilder: FormBuilder,
    private eventService: EventService,
    private teacherDiarySerice: TeacherDiaryService,
    private toastr: Toastr,
    private _activatedRoute: ActivatedRoute,
    private router: Router,
    private _modalService: NgbModal,
    private homeworkService: HomeworkService
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.show();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  show() {
    this.countFilters();
    const payload = {
      batch_id: this.filterForm.value.batches ? this.filterForm.value.batches.map((item) => item.id) : [],
      users_id: this.filterForm.value.employee ? this.filterForm.value.employee.map((item) => item.id) : [],
      eventFor: this.filterForm.value.eventFor,
      date: this.filterForm?.value?.date?.startDate ? [this.filterForm?.value?.date.startDate?.format('YYYY-MM-DD'), this.filterForm?.value?.date.endDate?.format('YYYY-MM-DD')] : [],
      user_id: this.user_id,
    }

    this.eventService.getEventList(payload).subscribe((res: any) => {
      if (res.status == true) {
        this.event = Object.values(res.data).flat();
        this.event = this.event.sort((a, b) => {
          if (a.eventName == 'Mobile Slider') return -1;
          if (b.eventName == 'Mobile Slider') return 1;
          return 0;
        });
      } else {
        this.event = null
        this.toastr.showError(res.message);
      }

    }, (error: any) => {

    })
  }

  HandleViewEvent(event: any) {
    this.router.navigate([this.CommonService.setUrl(`${URLConstants.EVENT_GALLERY_DETAIL}/${event.id}`)]);
  }

  clearAll(event: any) {
    if (event) {
      event.stopPropagation();
    }
    this.filterForm.reset();
    this.isEvent = null;
    this.filterForm.get('date').setValue(null);
    this.show();
  }

  openModal(isEdit: boolean = false) {
    const modalRef = this._modalService.open(AddEventGalleryComponent, {
      size: 'md',
      windowClass: 'duplicate-modal-section latest-design-modal',
      backdropClass: 'duplicate-modal-backdrop',
      backdrop: true,
    });
    modalRef.componentInstance.isEdit = isEdit

    modalRef.result.then((response: any) => {
      if (response.status) {
        this.show()
      }
    })
  }

  countFilters() {
    this.filterCount = 0;
    Object.keys(this.filterForm.value).forEach((item: any) => {
      if (this.filterForm.value[item] != '' && this.filterForm.value[item] != null) {
        this.filterCount++;
      }
    })
    if (this.filterForm.value?.date && this.filterForm.value?.date?.startDate == null) {
      this.filterCount--;
    }
  }

  changeEventFor(event: any) {
    this.isEvent = event.id
    if (this.isEvent == 2) {
      this.filterForm.value.employee = null;
      this.getBatchList();
    }
    else if (this.isEvent == 3) {
      this.getEmployeeList();
    }

  }

  getEmployeeList() {
    this.teacherDiarySerice.getAllFaculty().subscribe((res: any) => {
      if (this.user_role.includes('ROLE_ADMIN')) {
        this.employee = res?.data;
      } else {
        const currentUser = this.employee.find(emp => emp.id == this.user_id);
        if (currentUser) {
          this.filterForm.get('employee').setValue([{
            id: currentUser.id,
            name: currentUser.name
          }]);
        }
        this.isDisabled = true;
      }
    });
  }

  getBatchList() {
    this.homeworkService.getBatchOnClass({}).subscribe((res: any) => {
      this.batches = res?.data;
    });
  }

  onAdd(id: any, isEventAdd: boolean = false, event: any) {
    event.stopPropagation();
    const modalRef = this._modalService.open(AddEventGalleryComponent, {
      size: 'md',
      windowClass: 'duplicate-modal-section latest-design-modal',
      backdropClass: 'duplicate-modal-backdrop',
      backdrop: true,
    });
    modalRef.componentInstance.isEventAdd = isEventAdd
    modalRef.componentInstance.eventDetailId = id

    modalRef.result.then((response: any) => {
      if (response.status) {
        this.show();
      }
    })
  }

  onDelete(id: any, event: any) {
    event.stopPropagation();
    let confirm = window.confirm('Are you sure you want to delete this event')
    if (confirm) {
      this.eventService.deleteEvent(id).subscribe((resp: any) => {
        if (resp.status) {
          this.toastr.showSuccess(resp.message);
          this.show();
        }
      })
    }
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.filterForm = this.formBuilder.group({
      date: [null],
      eventFor: [null],
      batches: [null],
      employee: [null],
    })
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------
}