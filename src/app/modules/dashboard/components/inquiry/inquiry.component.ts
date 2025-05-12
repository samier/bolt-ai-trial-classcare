import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { DashboardService } from '../../dashboard.service';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { distinctUntilChanged,Subject, takeLast, takeUntil ,debounceTime} from 'rxjs';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
@Component({
  selector: 'app-inquiry',
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.scss']
})
export class InquiryComponent implements OnInit {

  //#region Public | Private Variables  

  @Input() classlist:any

  $destroy: Subject<void> = new Subject<void>();
  inquiryF: FormGroup = new FormGroup({})

  branch_id: any = window.localStorage.getItem('branch');
  user_id: any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );
  inquiryList: any = []
  currentPage: number = 1

  todayDate = this.dashboardService.getStartAndEndDate(0)

  // classlist: any = [{ id: "", name: "All Classes" }]
  batchList: any = []

  is_loading: boolean = false

  start : number = 0
  length: number = 20

  URLConstants = URLConstants;

  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _modalService: NgbModal,
    public dashboardService: DashboardService,
    private chd: ChangeDetectorRef,
  ) { }

  //#endregion constructor  
  // --------------------------------------------------------------------------------------------------------------

  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this.getInquiryList()
    // this.getClasslist()
    // this.getBatchList()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks  
  // --------------------------------------------------------------------------------------------------------------

  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  getInquiryList(startDate: any = null, endDate: any = null) {
    this.is_loading = true

    const params = {
      
      branch_id         : this.branch_id,
      academic_year_id  : this.currentYear_id,
      start             : this.start ,
      length            : this.length,
      
      ...( startDate && { start_date  : startDate } ),
      ...( endDate   && { end_date    : endDate   } ),
      ...(this.inquiryF?.value?.class && { class_id : [ this.inquiryF?.value?.class ] }),

      // class_id          : null ,
      // start_date        : this.inquiryF?.value?.date?.startDate?.format('DD-MM-YYYY') ?? null,
      // start_date        : startDate ,
      // end_date          : this.inquiryF?.value?.date?.endDate?.format('DD-MM-YYYY') ?? null,
      // end_date          : endDate ,
    }

    this.dashboardService.getInquiry(params).subscribe((res: any) => {

      this.inquiryList = [...this.inquiryList, ...res?.data]
      this.is_loading = false
      this.chd.detectChanges()

    }, (error) => {
      this.is_loading = false
      this.chd.detectChanges()
    })
  }

  onScrollChange() {
    this.start = this.start + this.length 
    this.getInquiryList();
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  classChange() {
    this.start = 0
    this.inquiryList = [];
    this.getInquiryList()
    // this.currentPage = 1;
    // this.batchList = []
    // this.inquiryF.controls['batch_id'].patchValue([])
    // this.getBatchList()
  }
  // batchChange() {
  //   this.currentPage = 1;
  //   this.inquiryList = [];
  //   this.getInquiryList()
  // }
//   setUrl(url: string) {
//     return '/' + window.localStorage.getItem("branch") + '/' + url;
//  }

  getClasslist() {
    const payload = {}
    this.dashboardService.getClasslist(payload).subscribe((res: any) => {
      this.classlist = [ ...this.classlist , ...res?.data ]
    })
  }

  getBatchList() {
    const payload = {
      classes: this.inquiryF.value.class_id ? [this.inquiryF.value.class_id] : []
    }
    this.dashboardService.getBatcheList(payload).subscribe((res: any) => {
      this.batchList = res?.data
    })
  }

  //#endregion Public methods  
  // --------------------------------------------------------------------------------------------------------------

  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.inquiryF = this._fb.group({
      class: [null],
      date: [null]
    })

    this.inquiryF.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      takeUntil(this.$destroy)
    )
    .subscribe((res: any) => {
      const classId = this.inquiryF.value.class;
      const dateRange = this.inquiryF.value.date;

      this.inquiryList = [];
      this.currentPage = 1;

      if (classId || dateRange) {
        const startDate = dateRange?.startDate?.format('YYYY-MM-DD') ?? null;
        const endDate = dateRange?.endDate?.format('YYYY-MM-DD') ?? null;
        this.getInquiryList(startDate, endDate);
      }
    });
  }

  selectBatch() {
    // this.getAttendance()
  }


  //#endregion Private methods

}
