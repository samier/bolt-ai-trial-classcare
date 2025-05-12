import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DashboardService } from '../../dashboard.service';
import { distinctUntilChanged, Subject, takeLast, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Toastr } from 'src/app/core/services/toastr';
import moment from 'moment';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-student-birthday',
  templateUrl: './student-birthday.component.html',
  styleUrls: ['./student-birthday.component.scss']
})
export class StudentBirthdayComponent implements OnInit {

  //#region Public | Private Variables  
  $destroy: Subject<void> = new Subject<void>();
  studentBirthdayF: FormGroup = new FormGroup({})

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  male   :any =  'https://'+ enviroment?.symfonyDomain+'/public/images/student-male.png'
  female :any =  'https://'+ enviroment?.symfonyDomain+'/public/images/student-female.png'

  branch_id: any = window.localStorage.getItem('branch');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  studentBirthdayR :any = []
  tosterNoti :any = []

  is_data : boolean = false 
  is_loading : boolean = false 
  currentPage: number = 1

  start : number = 0
  length: number = 20

  todayDate :any = null
  dropdownDate: string | undefined;

  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------



  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _modalService: NgbModal,
    public dashBoardService: DashboardService,
    private chd : ChangeDetectorRef,
    private toastr: Toastr,
    private _router: Router
  ) { }
  //#endregion constructor  
  // --------------------------------------------------------------------------------------------------------------



  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.dropdownDate = this.dashBoardService.getDate()
    this.initForm();
    this.start = 0
    this.todayDate = this.dashBoardService.getStartAndEndDate(0)
    // this.getStudentBirthdate()
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
    this.start = this.start + this.length ;
    this.getStudentBirthdate();
  }

  getStudentBirthdate() {
    this.is_loading = true

    const payload = {
      academic_year_id: this.currentYear_id,
      branch_id  : this.branch_id,
      start_date : this.studentBirthdayF?.value?.date?.startDate?.format('DD-MM-YYYY') ?? this.todayDate?.startDate ,
      end_date   : this.studentBirthdayF?.value?.date?.endDate?.format('DD-MM-YYYY')   ?? this.todayDate?.endDate   ,
      start      : this.start  ,
      length     : this.length ,
    }
    this.dashBoardService.getStudentBirthdate(payload).subscribe((res: any) => {
      if (res?.data) {

        let data = res?.data

        if (data != 0) {

          data = data?.map(item => {
            const [year, month, day] = item?.date_of_birth?.split('-');
            const formattedDate = `${day}-${month}-${year}`;

            return { ...item, date_of_birth: formattedDate };
          });
          this.studentBirthdayR = [ ...this.studentBirthdayR,...data]
        }
        this.is_loading = false
      }
      else{
        this.is_loading = false
      }
      this.chd.detectChanges()
    })
  }
  quiryParams(item: number) {
    let queryParams: NavigationExtras = {
      queryParams: {
        type: item,  
      }
    };
  
    this._router.navigate([`${window.localStorage.getItem('branch')}/report/birthday-list`], queryParams);
  }
  
  
  handleClick(day:number){
      const selectedRange =   {
        startDate: moment().startOf('day'),
        endDate: moment().add(day, 'days').startOf('day')
      };
      this.studentBirthdayF.get('date')?.patchValue(selectedRange);
  }

  convertDateFormat(dateString) {
    const parts = dateString.split('-');
    
    const year = parts[2];
    const month = parts[1];
    const day = parts[0];
    
    return `${year}-${month}-${day}`;
}

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }
  //#endregion Public methods  
  // --------------------------------------------------------------------------------------------------------------



  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  initForm() {
    this.studentBirthdayF = this._fb.group({
      date: [ this.todayDate ]
    })

    this.studentBirthdayF?.valueChanges?.pipe(distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),takeUntil(this.$destroy)).subscribe((res:any)=>{
      if (this.studentBirthdayF?.value?.date) {
        this.studentBirthdayR = []
        this.start = 0
        this.getStudentBirthdate()
      }
    })
  }

  profilePhoto(profile:any){
    if(profile?.image ==  null ||  profile?.image == undefined  ){
      return profile?.gender == 'm' ? this.male : this.female
    }
    else{
      return profile?.image
    }
  }

  //#endregion Private methods

}
