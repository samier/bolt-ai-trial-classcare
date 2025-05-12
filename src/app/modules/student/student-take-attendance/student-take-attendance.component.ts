import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs/internal/Subject';
import { CommonService } from 'src/app/core/services/common.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { StudentService } from '../student.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-student-take-attendance',
  templateUrl: './student-take-attendance.component.html',
  styleUrls: ['./student-take-attendance.component.scss']
})
export class StudentTakeAttendanceComponent implements OnInit {

  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  $destroy: Subject<void> = new Subject<void>();
  homeworkForm: FormGroup = new FormGroup({})

  branch_id: any = window.localStorage.getItem('branch');
  user_id: any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  attendanceForm: FormGroup = new FormGroup({})

  sessionList = [
    { id: 1, name: 'Session 1' },
    { id: 2, name: 'Session 2' }
  ]

  columnList = [
    { id: 1, name: 'Father Contact No' },
    { id: 2, name: 'Mother Contact No' },
    { id: 3, name: 'Student Contact NO' },
  ]

  message: any = {
    send_father: false,
    send_mother: false,
    send_student: false
  }

  colArray: any = []
  maxDate: any = null
  sectionList: any = []
  classList: any = []
  batchList: any = []
  filteredPost: any = []
  data: any = []

  is_showAttendance: boolean = false
  is_show: boolean = false
  is_updateL: boolean = false
  is_modalL: boolean = false
  is_update: boolean = false
  is_selected: boolean = true
  is_send_sms: boolean = true

  search: any
  selectedOption: any = 'n'

  is_queryParam: boolean = false
  queryParams!: any
  private API_URL = enviroment.apiUrl;
  attendanceSession: any
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private _fb: FormBuilder,
    public studentService: StudentService,
    private validationService: FormValidationService,
    private toastr: Toastr,
    private _modalService: NgbModal,
    private _activatedRoute: ActivatedRoute,
    private httpRequest: HttpClient,
  ) {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.getSectionList()
    this.getClassesList()
    this.getBatchList()
    this.getBranchNotification()

    this._activatedRoute.queryParams.subscribe(params => {

      if (Object.keys(params).length > 0) {
        this.is_queryParam = true
        this.queryParams = params
      }
    })
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.attendanceForm = this._fb.group({
      section: [""],
      class: [""],
      batch: [null, [Validators.required]],
      date: [this.getDate(), [Validators.required]],
      session: [1],
      col: [null],
    })
    this.colArray = []
  }

  sectionChange() {
    this.classList = []
    this.batchList = []

    this.attendanceForm.controls['class'].patchValue("")
    this.attendanceForm.controls['batch'].patchValue(null)
    this.getClassesList()
  }

  classChange() {
    this.batchList = []
    this.attendanceForm.controls['batch'].patchValue(null)
    this.getBatchList()
  }

  showAttendance() {

    if (this.attendanceForm.invalid) {
      this.validationService.getFormTouchedAndValidation(this.attendanceForm)
      this.toastr.showError("Please Select the Required Field")
      return;
    }
    this.is_selected = false
    this.is_showAttendance = true
    this.is_show = true

    const payload = {
      academic_year_id: this.currentYear_id,
      branch_id: this.branch_id,
      session: this.attendanceForm.value.session,
      class: this.attendanceForm.value.class,
      batch: this.attendanceForm.value.batch,
      date: this.attendanceForm.value.date,
    }

    this.studentService.getStudentAttendance(payload).subscribe((res: any) => {
      this.is_update = res?.is_taken
      this.data = res?.data
      this.data?.forEach(element => { element.searchField = `${element?.full_name || ''}_${element?.student_rollno || ''}`
      if(element.attendance_status == '')
      {
        element.attendance_status = 'p';
      }
      });
      this.filteredPost = this.data
      this.is_show = false
      this.is_showAttendance = false
    }, (error: any) => {
      this.is_show = false
      this.is_selected = true
      this.is_showAttendance = false
      this.is_selected = true
      this.toastr.showError(error?.error?.message ?? error?.message)
    })
  }

  searchData() {
    if (!this.search) {
      this.filteredPost = this.data
    }
    else {
      this.filteredPost = this.data?.filter(post =>
        post.searchField?.toLowerCase()?.includes(this.search?.toLowerCase())
      )
    }
  }

  saveBroadcast() {
    this.saveAttendance()
  }

  attendanceSaOrUp(modalName: any) {

    if (!this.is_update) {
      this._modalService.open(modalName)
    }
    else {
      this.saveAttendance()
    }
  }

  saveAttendance() {

    this.is_update ? this.is_updateL = true : this.is_modalL = true

    const formData = new FormData();

    formData.append('academic_year_id', this.currentYear_id);
    formData.append('batch_id', this.attendanceForm.value.batch);
    formData.append('date', this.attendanceForm.value.date);
    formData.append('session', this.attendanceForm.value.session);
    // formData.append('broadcastSms', this.selectedOption);
    formData.append('send_sms_father', this.message?.send_father);
    formData.append('send_sms_mother', this.message?.send_mother);
    formData.append('send_sms_student', this.message?.send_student);

    this.data?.forEach((student: any) => {
      formData.append(`student[${student.id}][roll_number]`, student?.student_rollno || null);
      formData.append(`student[${student.id}][status]`, student?.attendance_status || 'p');
      formData.append(`student[${student.id}][notes]`, student?.notes || '');
    });

    this.studentService.saveOrUpdateAtt(formData).subscribe((res: any) => {
      if (res?.status) {
        this.toastr.showSuccess(res?.message);
        this.data = []
        this.filteredPost = []
        this.is_modalL = false
        this.is_updateL = false
        this.resetForm()
        this._modalService.dismissAll()
      } else {
        this.is_modalL = false
        this.is_updateL = false
        this._modalService.dismissAll()
        this.toastr.showError(res?.message);
      }
    }, (error: any) => {
      this.is_modalL = false
      this.is_updateL = false
      this.toastr.showError(error?.error?.message ?? error?.message)
    })
  }

  resetForm() {
    this.data = []
    this.filteredPost = []
    this.attendanceForm.reset()
    this.attendanceForm.controls['section'].patchValue('')
    this.attendanceForm.controls['class'].patchValue('')
    this.attendanceForm.controls['batch'].patchValue(null)
    this.attendanceForm.controls['date'].patchValue(this.getDate())
    this.attendanceForm.controls['session'].patchValue(1)
    this.is_selected = true
    this.message.send_father = false,
      this.message.send_mother = false,
      this.message.send_student = false,
      this.getSectionList()
    this.getClassesList()
    this.getBatchList()

  }

  closeModel() {
    this.message.send_father = false,
      this.message.send_mother = false,
      this.message.send_student = false,

      this.is_modalL = false
    this._modalService.dismissAll()
  }

  getSectionList() {
    this.studentService.fetchSectionList({ branch: this.branch_id }).subscribe((res: any) => {
      if (res.status) {
        this.sectionList = [...[{ id: "", name: "All Section" }], ...res.data];
      }
    });
  }

  getClassesList() {
    const payload = {
      academic_year_id: this.currentYear_id,
      branch_id: this.branch_id,
      user_id: this.user_id,
      ...(this.attendanceForm?.value?.section && { section: this.attendanceForm?.value?.section || "" }),
    }
    this.studentService.fetchClassList(payload, this.user_id).subscribe((res: any) => {
      if (res?.status) {
        this.classList = [...[{ id: "", name: "All Class" }], ...res?.data];
      }
    })
  }

  colChange() {
    this.colArray = []
    this.colArray = this.getID(this.attendanceForm.value.col)
  }

  getBatchList() {

    let id = this.attendanceForm.value.class == '' ? [] : [this.attendanceForm.value.class]

    this.studentService.fetchBatchesList({ classes: id }).subscribe((res: any) => {
      this.batchList = res.data;

      if (this.is_queryParam) {
        this.attendanceForm.controls['batch'].patchValue(Number(this.queryParams.batchId))
        this.attendanceForm.controls['date'].patchValue(this.queryParams.date)
        this.showAttendance()
        this.is_queryParam = false
      }
    });
  }

  getBranchNotification()
  {
    this.httpRequest
        .get(this.API_URL + 'api/get-branch-notification/' + this.branch_id).subscribe((res: any) => {
          if (res.status)
          {
            this.attendanceSession = res?.data?.attendance_session;
          }
        });
  }
  
  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  setsymfonyUrl(url: string) {
    return this.symfonyHost + window.localStorage.getItem("branch") + '/' + url;
  }
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  getID(data: any) {
    if (data == null || data?.length == 0) {
      return []
    }
    return data.map(item => item.id)
  }
  getDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------
}
