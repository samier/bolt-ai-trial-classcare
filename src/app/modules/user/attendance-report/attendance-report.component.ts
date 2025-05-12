import { Component, OnInit, ViewChild } from '@angular/core';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { UserService } from '../user.service';
import { CommonService } from 'src/app/core/services/common.service';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { HomeworkService } from '../../homework/homework.service';

@Component({
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.scss']
})
export class AttendanceReportComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  attendenceReportForm : FormGroup = new FormGroup({})
  URLConstants = URLConstants;
  roles = [];
  submitted = false;
  reports:any = [];
  userList:any = [];
  @ViewChild('picker', { static: false })
  private picker!: any;  
  formattedMonth: string = '';
  maxDate : Date = moment().startOf('month').toDate();
  totalDays: number = 0;
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      private UserService: UserService,
      private toastr: Toastr,
      private _formValidationService : FormValidationService,
      private _homeworkService : HomeworkService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.UserService.getRoleList().subscribe((resp:any) => {
      if(resp.status){
        this.roles = resp.data
      }
    })
    this.formattedMonth = moment().format('YYYY-MM');
    this.attendenceReportForm.get('start_date')?.setValue(moment().startOf('month').toDate());
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  onSubmit() {

    const payload = {
      role_id: this.attendenceReportForm.value?.role_id?.length > 0 ? this.attendenceReportForm.value?.role_id.map(ele => ele.id) : [],
      start_date: this.attendenceReportForm?.value?.start_date ? moment(this.attendenceReportForm?.value?.start_date).format('MM-YYYY') : null,
      user_id: this.attendenceReportForm.value?.user_id?.length > 0 ? this.attendenceReportForm.value?.user_id.map(ele => ele.id) : []
    }

    if (this.attendenceReportForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.attendenceReportForm);
      return
    }

    this.submitted = true;
    this.UserService.getFacultyAttendanceReport(payload, '').subscribe(
      (resp: any) => {
        if (resp.status) {
          this.reports = resp.data
          this.totalDays =  Object.keys(this.reports[0]?.days).length; 
          if (this.reports.length == 0) {
            this.toastr.showInfo('No data found.', 'INFO');
          }
          this.submitted = false;
        }
        else {
          this.submitted = false;
          this.toastr.showError(resp.message)
        }
      },
      (err: any) => {
        this.submitted = false;
        this.toastr.showError(err.error.message)
      }
    );
  }

  download(type:any){
    let data = {
      role_id: this.attendenceReportForm.value?.role_id?.length > 0 ? this.attendenceReportForm.value?.role_id.map(ele=> ele.id) : [],
      start_date: this.attendenceReportForm?.value?.start_date ? moment(this.attendenceReportForm?.value?.start_date).format('MM-YYYY') : null,
      user_id : this.attendenceReportForm.value?.user_id?.length > 0 ? this.attendenceReportForm.value?.user_id.map(ele => ele.id) : []
    }
    if(data.role_id != null && data.start_date != null){
    this.UserService.downloadFacultyAttendanceReport(data, type).subscribe(
      (resp: any) => {
        this.CommonService.downloadFile(resp, 'staff-attendance-report', type);
      },
      (err: any) => { 
        this.toastr.showError('Something went wrong.')
      }
    );
    } 
  }


  clearData() {
    this.attendenceReportForm.reset();
    this.formattedMonth = moment().format('YYYY-MM');
    this.attendenceReportForm.get('start_date')?.setValue(moment().startOf('month').toDate());
    this.userList = [];
    this.reports = [];
    this.attendenceReportForm.controls['role_id'].markAsPristine();
    this.attendenceReportForm.controls['role_id'].markAsUntouched();
  }

  getUserList() {
    this.userList = []  
    this.attendenceReportForm.controls['user_id'].reset();
    const payload = {
      role_id: this.attendenceReportForm.value?.role_id.length > 0 ? this.attendenceReportForm.value?.role_id.map(ele => ele.id) : [],
    }
    this._homeworkService.getEmployeeList(payload).pipe(takeUntil(this.$destroy)).subscribe((resp: any) => {
      if (resp.status) {
        this.userList = resp.data.map((ele: any) => {
          return {
            id: ele.id,
            name: ele.full_name
          }
        });
      } else {
        this.toastr.showError(resp.message)
      }
    }, (error) => {
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.error?.error ?? 'An Unexpected Error Occurred');
    })
  }

  chosenMonthHandler(event: Date): void {
    const selectedMonth = moment(event).startOf('month');
    this.picker.close();
    this.formattedMonth = selectedMonth.format('YYYY-MM');
    this.attendenceReportForm.get('start_date')?.setValue(selectedMonth.toDate());
  }
  
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
    initForm() {
      this.attendenceReportForm = this._fb.group({
        role_id: [null , [Validators.required]],
        start_date: [null],
        user_id: [],
      })
    }

    formatDate(value:any){
      if(!value){
        this.attendenceReportForm.value.start_date = null
        return null;
      }
      const date = new Date(value);
      const month = date.toLocaleString('en-US', { month: '2-digit' });
      const year = date.getFullYear();
  
      return `${month}-${year}`;
    }

    createRange(number){
      // return new Array(number);
      return new Array(number).fill(0)
      .map((n, index) => (index + 1 < 10 ? '0' : '') + (index + 1));
    }
	
  //#endregion Private methods
}
