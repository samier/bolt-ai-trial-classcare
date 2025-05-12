import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from '../../common-components/common.service';
import { HomeworkService } from '../homework.service';
import { ActivatedRoute } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { enviroment } from 'src/environments/environment.staging';
import { debounceTime ,takeUntil  } from 'rxjs/operators';
@Component({
  selector: 'app-view-notice',
  templateUrl: './view-notice.component.html',
  styleUrls: ['./view-notice.component.scss']
})
export class ViewNoticeComponent implements OnInit {

  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  id: any
  showData: any
  URLConstants = URLConstants;
  enviroment  = enviroment
  attachmentType : any
  searchText : any = ''
  datatable : any = []
  
  male   :any =  'https://'+ enviroment?.symfonyDomain+'/public/images/student-male.png'
  female :any =  'https://'+ enviroment?.symfonyDomain+'/public/images/student-female.png'
  
  male_professor   :any = 'http://'+enviroment?.symfonyDomain+'/public/upload/facultyImage/professor-male.png'
  female_professor :any = 'http://'+enviroment?.symfonyDomain+'/public/upload/facultyImage/professor-female.png'
  
  // viewStatus : boolean = true
  
  tbody : any = []
  type         : number= 1;

  payload : any = {
    student_page : 1,
    user_page : 1,
    per_page : 40 ,
    user_type : "both",
    student_name : "",
    faculty_name : ""
  }
  is_loading : boolean = false
  read_status:any = ""

  private searchSubject: Subject<string> = new Subject();

  $destroy: Subject<void> = new Subject<void>();

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public CommonService: CommonService,
    public homeworkService : HomeworkService,
    private route: ActivatedRoute,
    private toastr: Toastr,
  ) {
    this.id = this.route.snapshot.paramMap.get('id');

    const params = this.route?.snapshot?.routeConfig?.path;
    let parts = params?.split('/')[0].split('-')[1];
    this.attachmentType = parts

    this.searchSubject.pipe(debounceTime(200),takeUntil(this.$destroy) ).subscribe((searchValue) => {
      this.onSearchChange(searchValue);
    });
  }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.showNotice(this.id);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  switch_to (type:any, isInit?) {
    this.type = type;
    this.payload.user_page    = 1
    this.payload.student_page = 1
    this.tbody = []
    this.getStudentAnEmployees()
  }

  download(url: string) {
    window.open(url, '_blank')
  }

  profilePhoto(profile:any){

    if(profile?.image ==  null || profile?.image ==  undefined || profile?.image ==  '') {
      if(this.type == 1){
        return profile.gender = 'm' ?  this.male : this.female
      }else{
        return profile.gender = 'm' ?  this.male_professor : this.female_professor
      } 
    }else{
      return profile?.image
    }

  }

  onScrollChange() {
    this.type == 1 ? this.payload.student_page++ : this.payload.user_page++
    this.getStudentAnEmployees()
  }

  getStudentAnEmployees(){

    this.is_loading = true

    const payload = {
      student_page  : this.payload.student_page ,
      user_page     : this.payload.user_page ,
      per_page      : this.payload.per_page,
      // user_type     : "both",
      user_type     : this.type == 1 ? 'students' : 'users' ,
      student_name  : this.payload.student_name || "",
      faculty_name  : this.payload.faculty_name || "",
      read_status: this.read_status
    }

    this.homeworkService.getStudentAnEmployees(payload,this.id).subscribe((res:any)=>{
      if(res?.status){
        if(this.type == 1){
          this.tbody = [ ...this.tbody , ...res?.data?.students ]
        }else{
          this.tbody = [ ...this.tbody , ...res?.data?.users ]
        }
        this.is_loading = false
      }
    },(error:any)=>{
      this.is_loading = false
      this.toastr.showError(error.error.message)
    })
  }

  onInputChange(event: any): void {
    const searchValue = event.target.value;
    this.searchSubject.next(searchValue); 
  }

  onSearchChange(searchValue: string): void {

    this.payload.user_page = 1 
    this.payload.student_page = 1 
    this.tbody = []
    this.type == 1 ? this.payload.student_name = searchValue : this.payload.faculty_name = searchValue
    this.getStudentAnEmployees()
  }

  onReadStatusChange(){
    this.payload.user_page = 1 
    this.payload.student_page = 1 
    this.tbody = []
    this.getStudentAnEmployees()
  }
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------


  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  

  private showNotice(id: string): void {
    this.homeworkService.showNotice(id).subscribe((res: any) => {
      this.showData = res?.data;
      this.showData?.role_id == null ? this.showData.role_id = "" :  this.showData.role_id 

      if(this.showData?.notice_type == 2) {
        this.type = 2
      }
      if(this.showData.notice_type == (null || "" ) ){
        this.showData.notice_type == 3
      }

      const date_time = this.data_time(this.showData?.create_at)

      this.showData.date = date_time[0]
      this.showData.time = date_time[1]

      // this.viewStatus && this.updateStatus()
      this.getStudentAnEmployees();
    })

  }
  data_time(data: any) {
    const utcDate = new Date(data);

    const options = {
      timeZone: 'Asia/Kolkata',
      day    : '2-digit' as '2-digit' ,
      month  : '2-digit' as '2-digit',
      year   : 'numeric' as 'numeric' ,
      hour   : '2-digit' as '2-digit',
      minute : '2-digit' as '2-digit',
    };

    const istDateStr = utcDate.toLocaleString('en-IN', options);

    const [date, time]       = istDateStr.split(', ');
    const [day, month, year] = date.split('/');

    const formattedDate = `${day}-${month}-${year}`;

    return [formattedDate , time]
  }
  //#endregion Private methods
}
