import { ChangeDetectorRef, Component, OnInit, Input} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { DashboardService } from '../../dashboard.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Subject, takeLast, takeUntil } from 'rxjs';
// import { Input } from 'hammerjs';

@Component({
  selector: 'app-exam-mark',
  templateUrl: './exam-mark.component.html',
  styleUrls: ['./exam-mark.component.scss']
})
export class ExamMarkComponent implements OnInit {

  @Input() classlist: any ;
  @Input() batchList: any ;

  //#region Public | Private Variables  
  $destroy: Subject<void> = new Subject<void>();
  exammarklist: FormGroup = new FormGroup({})

  user_id: any = window.localStorage.getItem('user_id');
  branch_id: any = window.localStorage.getItem('branch');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );
  
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  is_loading: boolean = false;
  
  currentPage = 1
  startDate = null
  endDate = null

  start  : number = 0
  length : number = 20

  examList: any = []
  // classlist: any = [ { id:"" , name: "ALL Class"} ]
  // batchList: any = []

  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _modalService: NgbModal,
    public dashboardService: DashboardService,
    private chd : ChangeDetectorRef,
    
  ) { }

  //#endregion constructor  
  // --------------------------------------------------------------------------------------------------------------

  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    // this.getClasslist()
    // this.getBatchList()
    this.getExamMarkList();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks  
  // --------------------------------------------------------------------------------------------------------------

  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  getExamMarkList(startDate:any=null,endDate:any=null) {

    this.is_loading = true

    const payload = {
      academic_year_id : this.currentYear_id,
      branch_id        : this.branch_id,
      start  : this.start,
      length : this.length,
      ...( this.exammarklist?.value?.class_id && { class_id : this.exammarklist?.value?.class_id } ) ,
      ...( this.exammarklist?.value?.batch_id && { batch_id : this.getID(this.exammarklist?.value?.batch_id) } ) ,
      ...( startDate && { start_date : startDate } ) ,
      ...( endDate   && { end_date : endDate } ) ,
    }


    // if (this.exammarklist?.value?.date) {

    //   this.startDate = this.exammarklist?.value?.date?.startDate?.format('DD-MM-YYYY')
    //   this.endDate   = this.exammarklist?.value?.date?.endDate?.format('DD-MM-YYYY')

    // }


    this.dashboardService.geExamList(payload).subscribe((res: any) => {

      if (res?.data) {
        this.examList = [...this.examList, ...res?.data?.original?.data]

        this.is_loading = false
        this.chd.detectChanges()
      }
      else {
        this.is_loading = false
        this.chd.detectChanges()
      }
    })
  }
  onScrollChange(){
    this.start = this.start + this.length
    this.getExamMarkList()
  }

  classChange(){
    this.start = 0
    this.batchList   = []
    this.exammarklist.controls['batch_id'].patchValue([])
    this.getBatchList()
    this.examList    = [];
    this.getExamMarkList()
  }
  batchChange(){
    this.start = 0
    this.examList = [];
    this.getExamMarkList()
  }

  getClasslist() {
    // const payload = {}
    const payload = {
      academic_year_id: this.currentYear_id,
      branch_id    : this.branch_id,
      user_id      : this.user_id,
    }
    this.dashboardService.getClasslist(payload).subscribe((res: any) => {
      this.classlist = [ ...this.classlist , ...res?.data ]
    })
  }

  getBatchList() {
    const payload = {
      classes: this.exammarklist.value.class_id ? [this.exammarklist.value.class_id] : []
    }
    this.dashboardService.getBatcheList(payload).subscribe((res: any) => {
      this.batchList = res?.data
    })
  }
  getID(data:any){
    if(data == null || data?.length == 0){
        return []
      }
      return data.map(item =>item.id)
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
 }
  //#endregion Public methods  
  // --------------------------------------------------------------------------------------------------------------

  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.exammarklist = this._fb.group({
      class_id : [ "" ],
      batch_id : [ [] ],
      date     : [null]
    })

    this.exammarklist?.get('date')?.valueChanges?.pipe(takeUntil(this.$destroy))?.subscribe((res:any)=>{
      if(res){
        const startDate = res.startDate?.format('YYYY-MM-DD')
        const endDate   = res.endDate?.format('YYYY-MM-DD')
        this.start = 0
        this.examList = [];
        // this.currentPage = 1;
        this.getExamMarkList(startDate,endDate)
      }
    })
  }

  //#endregion Private methods

}