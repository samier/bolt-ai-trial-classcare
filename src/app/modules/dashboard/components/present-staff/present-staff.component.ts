import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { DashboardService } from '../../dashboard.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-present-staff',
  templateUrl: './present-staff.component.html',
  styleUrls: ['./present-staff.component.scss']
})
export class PresentStaffComponent implements OnInit {

  //#region Public | Private Variables  
  $destroy: Subject<void> = new Subject<void>();
  presentStaffF: FormGroup = new FormGroup({})

  branch_id: any = window.localStorage.getItem('branch');
  user_id: any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  male_professor   :any = 'http://'+enviroment?.symfonyDomain+'/public/upload/facultyImage/professor-male.png'
  female_professor :any = 'http://'+enviroment?.symfonyDomain+'/public/upload/facultyImage/professor-female.png'

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  start: number = 0
  length: number = 20

  presentStaffList: any = []
  is_loading: boolean = false


  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _modalService: NgbModal,
    private dashBoardService: DashboardService,
    private chd : ChangeDetectorRef,
  ) { }

  //#endregion constructor  
  // --------------------------------------------------------------------------------------------------------------

  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this.todayPresentStaff()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks  
  // --------------------------------------------------------------------------------------------------------------

  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  todayPresentStaff() {
    this.is_loading = true

    const payload = {
      branch_id: this.branch_id,
      academic_year_id: this.currentYear_id,
      start: this.start,
      length: this.length,
    }

    this.dashBoardService.todayPresentStaff(payload).subscribe((res: any) => {

      if (res?.status) {
        this.presentStaffList = [...this.presentStaffList, ...res?.data?.original?.data]
        this.is_loading = false
        this.chd.detectChanges()
      } else {
        console.log(res?.message)
        this.is_loading = false
        this.chd.detectChanges()
      }
    }, (error) => {
      console.log(error)
      this.is_loading = false
      this.chd.detectChanges()
    })
  }

  onScrollChange() {
    this.start = this.start + this.length
    this.todayPresentStaff()
  }

  profilePhoto(profile: any) {

    if (profile?.faculty_image == (null || undefined)) {
      return profile?.gender == 'm' ? this.male_professor : this.female_professor
    }
    else {
      return profile?.faculty_image
    }
  }
  //#endregion Public methods  
  // --------------------------------------------------------------------------------------------------------------

  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.presentStaffF = this._fb.group({
      date: [null]
    })
  }

  //#endregion Private methods

}
