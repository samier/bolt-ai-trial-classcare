import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../student.service';
import { Toastr } from 'src/app/core/services/toastr';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-student-profile',
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.scss']
})
export class StudentProfileComponent implements OnInit {

  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  
  $destroy: Subject<void> = new Subject<void>();

  user_id :any   = window.localStorage.getItem('user_id');
  branch_id: any = window.localStorage.getItem('branch');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  uniqueId! : any
  studentProfile! : any
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public CommonService: CommonService,
    private _activatedRoute:ActivatedRoute,
    private studentService : StudentService,
    private toaster : Toastr,
    private cdr: ChangeDetectorRef,
    public  dateFormateService : DateFormatService,
  ) {

  }
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this._activatedRoute.params.subscribe(params => {
      this.uniqueId = params['id'] || params['unique_id'];
    });
    this.getStudentProfile()
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  getStudentProfile(){
    const payload = {
      branch_id : Number(this.branch_id ),
      academic_year_id : Number(this.currentYear_id ),
      student_id : this.uniqueId
    }

    this.studentService.fetStudentProfile(payload).subscribe((res:any)=>{
      if(res?.status) {
        this.studentProfile = res?.data
        this.studentProfile?.sameAddress ? this.studentProfile?.sameAddress : this.studentProfile['sameAddress'] = 0 
        if(this.studentProfile?.custom_field_data){
          let custom: Array<any> = [];
          
          Object.keys(this.studentProfile?.custom_field_data).forEach(key => {
            let newKey = key.replace("extra_", "");
            custom.push({ [newKey]: this.studentProfile?.custom_field_data[key] });
          });
          this.studentProfile['custom'] = custom
        }

        if(this.studentProfile){
          this.admissionList()
        }
        this.cdr.detectChanges();
      } else {
        this.toaster.showError(res?.message)
      }
    }, (error:any)=> {
      this.toaster.showError(error?.error?.message ?? error?.message)
    })
  }

  formatKey(key: any) {
    return key.replace(/_/g, ' ');
  }
  
  admissionList(){
    // this.studentService.getSchoolDetails().subscribe((res:any)=>{
    //   const admission_year = res?.data?.admission_year
    //   this.studentProfile['admission_year_name'] = admission_year?.find((year:any)=> year.id == this.studentProfile?.admission_year )?.year
    // })
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------
}

