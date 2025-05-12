import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { distinctUntilChanged, Subject, take, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { DashboardService } from '../../dashboard.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';


@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.scss']
})
export class AssignmentComponent implements OnInit {

  @Input() classes: any ;
  @Input() batches: any ;
  //#region Public | Private Variables  
  $destroy: Subject<void> = new Subject<void>();
  assignmentF: FormGroup = new FormGroup({})

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;
  is_loading: boolean = false

  branch_id: any = window.localStorage.getItem('branch');
  user_id: any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  // classes: any = [{id:"",name:"All Class"}];
  // batches: any = [];

  assignmentList: any = []
  currentPage: number = 1
  todayDate: string | undefined;
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
    this.currentPage = 1
    this.initForm();
    // this.getClass()
    // this.getBatchList()
    this.show()
    this.todayDate = this.dashboardService.getDate()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks  
  // --------------------------------------------------------------------------------------------------------------

  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  onScrollChange() {
    this.currentPage++;
    this.show();
  }

  show(startDate=null,endDate=null) {
    this.is_loading = true
    let payLoad = {
      branchId: this.branch_id,
      academicYear: this.currentYear_id,
      sectionId: "",
      classId: this.assignmentF?.value?.class_id ?? "",
      batchId: this.getID(this.assignmentF?.value?.batch_id) ?? [],
      subjectId: null,
      workDate: startDate,
      submissionDate: endDate,
      isDraft: 0,
      attachmentType: 'assignment',
      page: this.currentPage,
    }
    this.getHomeworkList(payLoad)
    this.getHomeworkList({ ...payLoad, isDraft: 1 })
  }

  getHomeworkList(payLoad: any) {
    this.is_loading = true
    this.dashboardService.getHomeWork(payLoad).subscribe((res: any) => {

        let data = Object.keys(res?.data?.data)?.map((dt: string) => ({ date: dt, data: res?.data?.data[dt] }))?.flatMap((d: any) => d?.data);
        data = this.formatSubmissionDate(data);
        this.assignmentList = [...this.assignmentList, ...data]
        this.is_loading = false
        this.chd.detectChanges()
      },(error)=>{
        this.is_loading = false
        this.chd.detectChanges()
      });
  }

  // Class Change
  onClassChange() {
    this.batches = []
    this.assignmentList = []
    this.currentPage = 1;
    this.assignmentF.controls['batch_id'].patchValue([])
    // this.getBatchList(this.assignmentF.value.class_id)
    this.getBatchList()
    this.show()
  }
  handleChange() {
    this.assignmentList = []
    this.currentPage = 1;
    this.show()
  }

  getClass() {
    const payload = {
      academic_year_id: this.currentYear_id,
      branch_id: this.branch_id,
      user_id: this.user_id,
    }
    this.dashboardService.getClasslist(payload).subscribe((res: any) => {
      if (res?.status) {
        this.classes = [ ...this.classes , ...res?.data ]
      }
    })
  }

  // getBatchList(id: number) {
  //   this.dashboardService.getBatcheList({ classes: [id] }).subscribe((res: any) => {
  //     this.batches = res.data;
  //   });
  // }

  getBatchList() {
    const payload = {
      classes: this.assignmentF.value.class_id ? [this.assignmentF.value.class_id] : []
    }
    this.dashboardService.getBatcheList(payload).subscribe((res: any) => {
      this.batches = res?.data
    })
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  
  //#endregion Public methods  
  // --------------------------------------------------------------------------------------------------------------

  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.assignmentF = this._fb.group({
      class_id: [""],
      batch_id: [[]],
      date: [null]
    })
    this.assignmentF.controls['date'].valueChanges?.pipe(takeUntil(this.$destroy), distinctUntilChanged()).subscribe((res: any) => {
      if (res) {
        const startDate = res.startDate?.format('YYYY-MM-DD')
        const endDate   = res.endDate?.format('YYYY-MM-DD')
        this.currentPage = 1;
        this.assignmentList = []
        this.show(startDate, endDate)
      }
    })

  }

  getID(data: any) {
    if (data == null || data?.length == 0) {
      return []
    }
    return data.map(item => item.id)
  }
  formatSubmissionDate(objects?: any) {
    return objects?.map(obj => {
      let newObj = obj;

      if (obj?.hasOwnProperty('submission_date')) {
        obj.submission_date = obj?.submission_date?.split(' ')[0];
      }
      if (obj.hasOwnProperty('work_date')) {

        const [date, time] = obj.work_date.split(' ');

        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const isPM = hour >= 12;
        const formattedHours = hour % 12 || 12;
        const ampm = isPM ? 'PM' : 'AM';

        const formattedTime = `${formattedHours}:${minutes} ${ampm}`;

        newObj.work_date = date;
        newObj.time = formattedTime;
        // newObj.work_date = newObj?.work_date?.split(' ')[0];
      }

      return newObj;
    });
  }
  //#endregion Private methods

}
