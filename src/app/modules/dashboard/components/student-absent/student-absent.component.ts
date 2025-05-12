import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { DashboardService } from '../../dashboard.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
@Component({
  selector: 'app-student-absent',
  templateUrl: './student-absent.component.html',
  styleUrls: ['./student-absent.component.scss']
})
export class UpcomingLeaveComponent implements OnInit {

  //#region Public | Private Variables  

  @Input() classlist :any
  @Input() batchList :any

  $destroy: Subject<void> = new Subject<void>();
  studentAbsent: FormGroup = new FormGroup({})

  branch_id: any = window.localStorage.getItem('branch');
  user_id: any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  absentStudentList: any = []
  is_loading: any = false

  start: number = 0
  length: number = 20
  activePopover: NgbPopover | null = null;

  // classlist: any = [ { id: "" , name : "All Class"} ]
  // batchList: any = []


  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _modalService: NgbModal,
    private dashBoardService: DashboardService,
    private chd: ChangeDetectorRef,
  ) { }

  //#endregion constructor  
  // --------------------------------------------------------------------------------------------------------------

  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    // this.getClasslist()
    // this.getBatchList()
    this.initForm();
    this.getStudentAbsent()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks  
  // --------------------------------------------------------------------------------------------------------------

  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  getStudentAbsent() {
    this.is_loading = true

    const payload = {
      branch_id         : this.branch_id,
      academic_year_id  : this.currentYear_id,
      start     : this.start,
      length    : this.length,
      ...( this.studentAbsent?.value?.class_id && {class_id : this.studentAbsent?.value?.class_id } ) ,
      ...( this.studentAbsent?.value?.batch_id?.length != 0 && { batch_id :  this.getID(this.studentAbsent?.value?.batch_id) } ) ,
      // batch_id : this.getID(this.studentAbsent?.value?.batch_id) || [],
    }
    this.dashBoardService.getAbsentStudent(payload).subscribe((res: any) => {

      if (res?.status) {
        this.absentStudentList = [...this.absentStudentList, ...res?.data?.original?.data]
        this.chd.detectChanges()
        this.is_loading = false
      } else {
        this.chd.detectChanges()
        this.is_loading = false
      }

    }, (error) => {
      this.is_loading = false
      this.chd.detectChanges()
      console.log(error)
    })
  }

  onScrollChange() {
    this.start = this.start + this.length
    this.getStudentAbsent()
  }

  classChange(){
    this.start = 0
    this.batchList   = []
    this.absentStudentList = [];
    this.studentAbsent.controls['batch_id'].patchValue([])
    this.getBatchList()
    this.getStudentAbsent()
  }
  batchChange(){
    this.start = 0
    this.absentStudentList = [];
    this.getStudentAbsent()
  }

  getClasslist() {
    const payload = {}
    this.dashBoardService.getClasslist(payload).subscribe((res: any) => {
      this.classlist = [ ...this.classlist , ...res?.data ]
    })
  }

  getBatchList() {
    const payload = {
      classes: this.studentAbsent?.value?.class_id ? [ this.studentAbsent?.value?.class_id ] : ""
    }
    this.dashBoardService.getBatcheList(payload).subscribe((res: any) => {
      this.batchList = res?.data
    })
  }

  getID(data: any) {
    if (data == null || data?.length == 0) {
      return []
    }
    return data.map(item => item.id)
  }

  togglePopover(popover: NgbPopover) {
    if (this.activePopover && this.activePopover !== popover) {
      this.activePopover.close();
    }
    this.activePopover = popover.isOpen() ? null : popover;
  }

  //#endregion Public methods  
  // --------------------------------------------------------------------------------------------------------------

  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.studentAbsent = this._fb.group({
      class_id : [ "" ] ,
      batch_id : [ [] ]
    })
  }

  //#endregion Private methods

}
