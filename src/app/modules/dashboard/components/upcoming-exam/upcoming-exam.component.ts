import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DashboardService } from '../../dashboard.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { distinctUntilChanged,Subject, takeLast, takeUntil } from 'rxjs';
import { Toastr } from 'src/app/core/services/toastr';
import moment from 'moment';

@Component({
  selector: 'app-upcoming-exam',
  templateUrl: './upcoming-exam.component.html',
  styleUrls: ['./upcoming-exam.component.scss']
})
export class UpcomingExamComponent implements OnInit {
  //#region Public | Private Variables  
  $destroy: Subject<void> = new Subject<void>();
  examListF: FormGroup = new FormGroup({})

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  branch_id: any = window.localStorage.getItem('branch');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  examList   : any = []
  is_loading    : boolean = false;

  currentPage = 1
  startDate = null
  endDate = null
  todayDate : any
  selectedRange: any

  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _modalService: NgbModal,
    private dashboardService: DashboardService,
    private toastr: Toastr,
    private chd : ChangeDetectorRef,
  ) { }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }


  //#endregion constructor  
  // --------------------------------------------------------------------------------------------------------------

  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.todayDate = this.dashboardService.getStartAndEndDate(7)
    // this.getUpcomingExam(todayDate?.startDate, todayDate?.endDate)
    this.selectedRange =   {
      startDate: moment().startOf('day'),
      endDate: moment().add(7, 'days').startOf('day')
    };
    this.initForm();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  initForm() {
    this.examListF = this._fb.group({
      date : [ null ]
    })
    
    setTimeout(() => {
      this.examListF.patchValue({
        date: this.selectedRange
      });
    }, 0);

    this.examListF.valueChanges.pipe(distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),takeUntil(this.$destroy)).subscribe((res:any)=>{
      this.examList = []

      if (this.examListF.value.date) {

        this.startDate = this.examListF?.value?.date?.startDate?.format('DD-MM-YYYY')
        this.endDate   = this.examListF?.value?.date?.endDate?.format('DD-MM-YYYY')

        this.currentPage = 1
        this.getUpcomingExam(this.startDate,this.endDate)
      }
    })
  }

  getUpcomingExam(startDate, endDate) {

    this.is_loading = true

    const payload = {
      academic_year_id: this.currentYear_id,
      branch_id: this.branch_id,
      role_id: null,
      start_date: startDate,
      end_date: endDate,
      start : (this.currentPage - 1) * 10,
      length : 10
    }
    this.dashboardService.geExamList(payload).subscribe((res: any) => {

      if (res?.data) {
        this.examList = [...this.examList,...res?.data?.original?.data]

        // if (this.tosterNoti) {
        //   if (this.examList.length == 0) {
        //     this.toastr.showInfo("Upcoming Exam not Found in Range", "No Data Found")
        //   }
        //   this.tosterNoti = false
        // }

        if (this.examList?.length != 0) {
          this.examList = this.examList?.map((item: any) => {
            return { ...item, start_time: this.extractTime(item?.start_date), end_time: this.extractTime(item?.end_date) };
          });
        }

        this.is_loading = false
        this.chd.detectChanges()
      }
      else{
        this.is_loading = false
        this.chd.detectChanges()
      }
    })
  }

  extractTime(dateTimeString) {
    const [date, time, period] = dateTimeString.split(' ');
    const [hours, minutes] = time.split(':');
    const formattedTime = `${hours}:${minutes} ${period}`;

    return formattedTime;
  }

  onScrollChange() {
    this.currentPage++;
    this.getUpcomingExam(this.startDate,this.endDate)
  }

}
