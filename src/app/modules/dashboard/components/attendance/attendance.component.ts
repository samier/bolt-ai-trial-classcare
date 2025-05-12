import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { Subject, takeLast, takeUntil } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

  @Input() batchList: any ;

  //#region Public | Private Variables  
  $destroy: Subject<void> = new Subject<void>();
  attendance: FormGroup = new FormGroup({})
  branch_id: any = window.localStorage.getItem('branch');
  user_id: any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );
  attendanceList: any = []

  start: number = 0
  length: number = 20

  todayDate = this.dashboardService.getStartAndEndDate(0)

  classlist: any = []
  // batchList: any = [{id:"",name:"All Batch"}]

  is_data: boolean = true
  is_loading: boolean = false

  sessionList : any = [
    {id: 1, name: 'Session 1'},
    {id: 2, name: 'Session 2'},
  ]
  maxDate: string;

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public dashboardService: DashboardService,
    private chd: ChangeDetectorRef,
    public CommonService: CommonService,
    private _fb: FormBuilder,
    private _modalService: NgbModal,
    private _router: Router
  ) { 
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    this.maxDate = `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    this.initForm();
    // this.getClasslist()
    // this.getBatchList()
    this.getAttendance()
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['batchList'] && changes['batchList'].currentValue) {
      this.batchList = [{ id: "", name: "All Batch" }, ...this.batchList];
      
      const currentBatch = this.attendance.get('batch')?.value;
      if (!currentBatch || currentBatch === "") {
        this.attendance.get('batch')?.setValue("");
      }
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onScrollChange() {
    this.start = this.start + this.length;
    this.getAttendance();
  }

  getAttendance() {
    this.is_loading = true

    const payload = {
      branch_id         : this.branch_id,
      academic_year_id  : this.currentYear_id,
      date              : this.attendance?.value?.date ||  this.todayDate?.startDate,
      session           : this.attendance?.value?.session || 1,
      start             : this.start,
      length            : this.length,
      ...( this.attendance?.value?.batch_id && { batch_id : this.attendance?.value?.batch_id } ) ,
    }

    this.dashboardService.getAttendance(payload).subscribe((res: any) => {

      if(res?.status){
        this.attendanceList = [...this.attendanceList, ...res?.data?.original?.data]
        this.is_loading = false
        this.chd.detectChanges()
      }else{
        this.is_loading = false
        this.chd.detectChanges()
      }

    },(error)=>{
      this.chd.detectChanges()
      this.is_loading = false
    })
  }

  batchChange(){
    this.start = 0
    this.attendanceList = []
    this.getAttendance()
  }

  selectBatch() {
    if(this.attendance.value.date === ""){
      this.attendance.controls['date'].patchValue(this.dashboardService.getDate())
    }
    this.start = 0
    this.attendanceList = []
    this.getAttendance()
  }

  getClasslist() {
    const payload = {
      user_id: this.user_id
    }
    this.dashboardService.getClasslist(payload).subscribe((res: any) => {
      this.classlist = res?.data
    })
  }
  getBatchList() {
    const payload = {}
    this.dashboardService.getBatcheList(payload).subscribe((res: any) => {
      this.batchList = [ ...this.batchList , ...res?.data ]
    })
  }
  getFormValues(form: NgForm) {
  
    const batchValue = form.value.batch;
    const startDateValue = form.value.startDate;
    const classSessionValue = form.value.classSession;
  
    if (form.valid) {
      const formElement = document.getElementById('form' + batchValue) as HTMLFormElement;
      if (formElement) {
        formElement.submit();
      } else {
        console.log('Form not Found');
      }
    }
  }

  quiryParams(batchId:number,date:any) {
    let queryParams: NavigationExtras = {
      queryParams: {
        date: date,  
        batchId: batchId,  
      }
    };
    this._router.navigate([`${window.localStorage.getItem('branch')}/${URLConstants.STUDENT_TAKE_ATTENDANCE}`], queryParams);
  }

  setsymfonyUrl(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }
  // onScroll() {
  //   this.start = this.start + this.length + 1
  //   this.getAttendance()
  // }

  initForm() {
    this.attendance = this._fb.group({
      batch_id: [""],
      session: [ 1 ],
      date: [this.dashboardService.getDate()],
    })
    // this.attendance.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
    //   if (this.attendance?.value?.date) {
    //     this.attendanceList = []
    //     this.is_loading = true
    //     this.start = 0
    //     this.getAttendance()
    //   }
    // })
  }

}
