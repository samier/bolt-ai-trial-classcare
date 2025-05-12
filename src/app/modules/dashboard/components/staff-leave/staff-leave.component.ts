import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DashboardService } from '../../dashboard.service';
@Component({
  selector: 'app-staff-leave',
  templateUrl: './staff-leave.component.html',
  styleUrls: ['./staff-leave.component.scss']
})
export class PendingLeaveComponent implements OnInit {

  //#region Public | Private Variables  
  branch_id: any = window.localStorage.getItem('branch');
  user_id: any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  start : number = 0
  length : number = 20

  $destroy: Subject<void> = new Subject<void>();
  staffLeaveF: FormGroup = new FormGroup({})

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  staffLeaveList :any = []
  is_loading : boolean = true
  activePopover: NgbPopover | null = null;

  leaveStatus :any = [
    {id: "", name: 'All Leave'},
    {id: "0", name: 'Pending'},
    {id: "1", name: 'Approved'},
    {id: "2", name: 'Reject'},
  ]
  dropdownDate: string | undefined;
  todayDate : any


  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _modalService: NgbModal,
    public dashBoardService: DashboardService,
    private chd: ChangeDetectorRef

  ) { }

  //#endregion constructor  
  // --------------------------------------------------------------------------------------------------------------

  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.dropdownDate = this.dashBoardService.getDate()
    this.todayDate = this.dashBoardService?.getStartAndEndDate(0)  // DD-MM-YYYY formate
    this.initForm();
    // this.getLeaveList()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks  
  // --------------------------------------------------------------------------------------------------------------

  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  getLeaveList(startDate:any=null , endDate:any=null) {
    this.is_loading = true
    const payload = {
      academic_year_id : this.currentYear_id ,
      branch_id        : this.branch_id,
      type             : 1,
      start            : this.start,
      length           : this.length,

      ...( startDate && { start_date :  this.staffLeaveF?.value?.date?.startDate?.format('DD-MM-YYYY')} ) ,
      // ...( startDate && { start_date : startDate} ) ,
      ...( endDate   && { end_date :  this.staffLeaveF?.value?.date?.endDate?.format('DD-MM-YYYY')} ) ,
      // ...( endDate   && { end_date : endDate} ) ,
      ...( this.staffLeaveF?.value?.leave_status !== "" && this.staffLeaveF?.value?.leave_status != null && { leave_status: this.staffLeaveF?.value?.leave_status }),
    };

    this.dashBoardService.getStaffLeave(payload).subscribe((res:any)=>{

      this.staffLeaveList = [ ...this.staffLeaveList , ...res?.data ]
      this.is_loading = false
      this.chd.detectChanges()

    },(error)=>{
      console.log(error)
      this.is_loading = false
      this.chd.detectChanges()
    })
  }
  handleChange(){
    this.start = 0
    this.staffLeaveList = []
    this.getLeaveList()
  }

  togglePopover(popover: NgbPopover) {
    if (this.activePopover && this.activePopover !== popover) {
      this.activePopover.close();
    }
    this.activePopover = popover.isOpen() ? null : popover;
  }

  onScrollChange(){
    this.start = this.start + this.length
    this.getLeaveList()
  }
  //#endregion Public methods  
  // --------------------------------------------------------------------------------------------------------------

  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.staffLeaveF = this._fb.group({
      leave_status: [""] ,
      date  : [ null ]
    })

    this.staffLeaveF?.get('date')?.valueChanges?.pipe(takeUntil(this.$destroy))?.subscribe((res:any)=>{
      if(res){
        const startDate = res.startDate?.format('YYYY-MM-DD')
        const endDate   = res.endDate?.format('YYYY-MM-DD')
        this.start = 0
        this.staffLeaveList = []
        this.getLeaveList(startDate,endDate)
      }
    })

  }

  //#endregion Private methods

}
