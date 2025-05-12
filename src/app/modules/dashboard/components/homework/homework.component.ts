import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-homework',
  templateUrl: './homework.component.html',
  styleUrls: ['./homework.component.scss']
})
export class HomeworkComponent implements OnInit {

  @Input() classlist: any ;
  @Input() batchList: any ;

  //#region Public | Private Variables  
  $destroy: Subject<void> = new Subject<void>();
  homeworkForm: FormGroup = new FormGroup({})
  URLConstants = URLConstants; 
  // classlist: any = [ { id : "" , name : "All Class" } ]
  // batchList: any = []
  homework: any = []
  isHomeWork: boolean = false
  is_loading: boolean = false
  selector = '11'

  branch_id: any = window.localStorage.getItem('branch');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );
  currentPage: number = 1
  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _modalService: NgbModal,
    public dashboardService: DashboardService,
    private chd: ChangeDetectorRef
  ) { }

  //#endregion constructor  
  // --------------------------------------------------------------------------------------------------------------

  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    // this.getClasslist();
    // this.getBatchList()
    this.homework = []
    this.currentPage = 1
    this.homeworkList();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks  
  // --------------------------------------------------------------------------------------------------------------

  // #region Public methods

  onScrollChange() {
    this.currentPage++;
    this.homeworkList();
  }

  classChange(){
    this.currentPage = 1;
    this.batchList   = []
    this.homeworkForm.controls['batch_id'].patchValue([])
    this.getBatchList()
    this.homework    = [];
    this.homeworkList()
  }
  batchChange(){
    this.currentPage = 1;
    this.homework = [];
    this.homeworkList()
  }
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods  
  // --------------------------------------------------------------------------------------------------------------


  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  initForm() {
    this.homeworkForm = this._fb.group({
      class_id : [""],
      batch_id : [null],
      date     : [null]
    })

    this.homeworkForm?.get('date')?.valueChanges?.pipe(takeUntil(this.$destroy))?.subscribe((res:any)=>{
      if(res){
        const startDate = res.startDate?.format('YYYY-MM-DD')
        const endDate   = res.endDate?.format('YYYY-MM-DD')
        this.homework = [];
        this.currentPage = 1;
        this.homeworkList(startDate,endDate)
      }
    })
  }

  homeworkList(startDate :any = null, endDate :any = null) {
    this.is_loading = true
    const payLoad = {
      branchId: this.branch_id,
      academicYear: this.currentYear_id,
      isDraft: "0",
      attachmentType: 'homework',
      // submissionDate : this.homeworkForm.value.date ? this.homeworkForm.value.date.endDate.format('YYYY-MM-DD') : null,                       
      submissionDate : endDate,
      // workDate : this.homeworkForm.value.date ? this.homeworkForm.value.date.startDate.format('YYYY-MM-DD') : null ,                             
      workDate : startDate ,                            
      page : this.currentPage,
      classId : this.homeworkForm?.value?.class_id || "" ,
      batchId : this.homeworkForm?.value?.batch_id?.length > 0 ? this.homeworkForm?.value?.batch_id?.map((ele)=> ele.id) : null
    }

    this.getHomeworkList(payLoad)
    this.getHomeworkList({ ...payLoad, isDraft: "1" })

  }
  
  getHomeworkList(payLoad: any) {
    this.is_loading = true
    this.isHomeWork = true
    this.dashboardService.getHomeWork(payLoad).subscribe((res: any) => {
      this.isHomeWork = false
      this.is_loading = false
      const data = Object.keys(res?.data?.data)?.map((dt: string) => ({ date: dt, data: res?.data?.data[dt] }))?.flatMap((d: any) => d?.data);
      this.homework = [...this.homework, ...data];
      this.chd.detectChanges()
    },(error)=>{
      this.is_loading = false
      this.chd.detectChanges()
    });
  }

  getClasslist() {
    const payload = {}
    this.dashboardService.getClasslist(payload).subscribe((res: any) => {
      this.classlist = [ ...this.classlist , ...res?.data ]
    })
  }

  getBatchList() {
    const payload = {
      classes: this.homeworkForm.value.class_id ? [this.homeworkForm.value.class_id] : []
    }
    this.dashboardService.getBatcheList(payload).subscribe((res: any) => {
      this.batchList = res?.data
    })
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  //#endregion Private methods

}
