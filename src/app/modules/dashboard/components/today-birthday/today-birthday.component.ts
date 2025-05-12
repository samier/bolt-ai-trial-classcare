import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { distinctUntilChanged,Subject, takeLast, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import moment from 'moment'
import { DashboardService } from '../../dashboard.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
// import dayjs from 'dayjs';

@Component({
  selector: 'app-today-birthday',
  templateUrl: './today-birthday.component.html',
  styleUrls: ['./today-birthday.component.scss']
})
export class TodayBirthdayComponent implements OnInit {

  //#region Public | Private Variables  
  $destroy: Subject<void> = new Subject<void>();
  staffBirthdayF: FormGroup = new FormGroup({})

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  branch_id: any = window.localStorage.getItem('branch');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  male_professor   :any = 'http://'+enviroment?.symfonyDomain+'/public/upload/facultyImage/professor-male.png'
  female_professor :any = 'http://'+enviroment?.symfonyDomain+'/public/upload/facultyImage/professor-female.png'

  staffBirthdayR:any= []
  tosterNoti : boolean = false
  is_data    : boolean = false
  is_loading : boolean = false
  todayDate : any
  currentPage: number = 1

  start : number = 0
  length: number = 20

  dropdownDate: string | undefined;
  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _modalService: NgbModal,
    public dashBoardService : DashboardService,
    private toastr: Toastr,
    private chd : ChangeDetectorRef,
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
    this.todayDate = this.dashBoardService?.getStartAndEndDate(0)  // DD-MM-YYYY formate
    // this.getStaffBirthdateR()
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
    this.getStaffBirthdateR();
  }

  getStaffBirthdateR() {
    this.is_loading      = true

    const payload = {
      
      academic_year_id: this.currentYear_id ,
      branch_id: this.branch_id ,
      // role_id: null,
      start_date : this.staffBirthdayF?.value?.date?.startDate?.format('DD-MM-YYYY') ??  this.todayDate?.startDate ,
      end_date   : this.staffBirthdayF?.value?.date?.endDate?.format('DD-MM-YYYY')   ??  this.todayDate?.endDate   ,

      start      : this.start  ,
      length     : this.length ,
    }

    this.dashBoardService.geEmployeeBirthdate(payload).subscribe((res: any) => {
      if (res?.data) {

        let data = res?.data

        if (data != 0) {

          data = data?.map( ( item : any ) => {
            const [year, month, day] = item?.birth_date?.split('-');
            const formattedDate = `${day}-${month}-${year}`;
            
            return { ...item, birth_date: formattedDate };
          });
        }
        this.staffBirthdayR = [ ...this.staffBirthdayR , ...data]
        this.is_loading = false
      }
      else{
        this.is_loading = false
      }
      this.chd.detectChanges()
    })
  }
  handleClick(day:number){
    const selectedRange =   {
      startDate: moment().startOf('day'),
      endDate: moment().add(day, 'days').startOf('day')
    };
    this.staffBirthdayF.get('date')?.patchValue(selectedRange);
  }

quiryParams(item: number) {
  let queryParams: NavigationExtras = {
    queryParams: {
      type: item,  
    }
  };

  this._router.navigate([`${window.localStorage.getItem('branch')}/report/birthday-list`], queryParams);
}

  profilePhoto(profile:any){
    if(profile?.image == ( null || undefined ) ){
      return profile?.gender == 'm' ? this.male_professor : this.female_professor
    }
    else{
      return profile?.image
    }
  }
  //#endregion Public methods  
  // --------------------------------------------------------------------------------------------------------------

  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  initForm() {
    this.staffBirthdayF = this._fb.group({
      date: [ this.todayDate ]
    })

    this.staffBirthdayF.valueChanges.pipe(distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),takeUntil(this.$destroy)).subscribe((res:any)=>{
      if (this.staffBirthdayF?.value?.date) {
        this.staffBirthdayR = []
        this.start = 0
        this.getStaffBirthdateR()
      }
    })
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }
  //#endregion Private methods

}
