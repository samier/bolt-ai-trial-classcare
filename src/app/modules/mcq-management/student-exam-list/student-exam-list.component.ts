import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { LeaveManagmentService } from 'src/app/modules/leave-management/leave-managment.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import * as moment from 'moment';
import { StudentExamService } from 'src/app/modules/student-exam-management/student-exam.service';
import { enviroment } from 'src/environments/environment.staging';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/core/services/common.service';
import { DateFormatService } from 'src/app/service/date-format.service';
@Component({
  selector: 'app-student-exam-list',
  templateUrl: './student-exam-list.component.html',
  styleUrls: ['./student-exam-list.component.scss']
})
export class StudentExamListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  login_id:any=4;
  profile_image:any;
  username:any;
  mobile_number:any;
  branch_id:any;

  // new
  for:string = "exam";
  batch:string = "-";
  exam_list:any = [];
  results:any = [];
  today = new Date();
  public institute_modules:any = [];
  private API_URL = enviroment.apiUrl;
  public page_name: any = null;  
  constructor( public router: Router,
    private leaveManagementSerivce:LeaveManagmentService,
    public datePipe: DatePipe,
    public route:ActivatedRoute,
    private studentExamService: StudentExamService,
    private httpRequest: HttpClient,
    public CommonService: CommonService,
    private _dateFormatService: DateFormatService,
  ){
    this.login_id = this.route.snapshot.paramMap.get('unique_id');
    this.branch_id = window.localStorage.getItem("branch");
    this.httpRequest.get(this.API_URL+'api/get-institute-modules').subscribe((res:any) => {
      this.institute_modules = res.data;
    });
  }
  URLConstants=URLConstants;
  // getPageName(){
  //   console.log('in',this.router.url);
  //   if(this.router.url == URLConstants.ADMIN_STUDENT_EXAM){
  //     this.page_name = 'Student Online Exam';
      
  //   }
  //   if(this.router.url == URLConstants.ADMIN_STUDENT_TAB){
  //     this.page_name = 'Student Leave';
  //   }
  //   return this.page_name;
  // }
  symfonyHost = enviroment.symfonyHost;
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.getlist(dataTablesParameters,callback)
      },
     columns: [
        { data: 'exam_name' }, 
        { data: 'start_time' }, 
        { data: 'subject' }, 
        { data: 'total_marks' }, 
        { data: 'final_marks' }, 
        { data: 'attempt_question' }, 
        { data: 'correct_answer' },
        { data: 'result' }
      ]
    };
    this.studentExamService.getTodaysExam(this.login_id).subscribe((res:any) => {  
      this.exam_list = res.data;
    });
    setInterval(()=> {
      this.today = new Date();
    }, 1000);

    this.leaveManagementSerivce.getStudentProfileDetail(this.login_id).subscribe((resp:any) => {
      if(resp.status == false && !resp.id){
        this.router.navigate([this.setUrl(URLConstants.STUDENT_LIST)]);
        return;
      }                 
      this.profile_image = resp?.profile_url;
      this.username = resp.full_name;
      this.mobile_number = resp.phone_number;
      this.batch = resp.batch;

      if(!this.profile_image){
        this.profile_image = this.symfonyHost + resp?.profile
      }

    });

  }


  getlist(dataTablesParameters?: any, callback?:any ){
    Object.assign(dataTablesParameters,{"student_id":this.login_id});
    this.studentExamService.getResultList(dataTablesParameters).subscribe((resp:any) => {
      this.results = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  } 

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  setsymfonyUrl(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url+'/'+this.login_id;
  }

  setsymfonyUrlAdmin(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }

  // new
  get_for(t_for:any){
    this.for = t_for;
  }

  format_date(datetime:string){
    return new Date(datetime);
  }

  date(datetime:string){
    return moment(datetime, 'YYYY-MM-DD').format(this._dateFormatService.getFormat());
  }

  getInstituteModule(module_name:string){
    return this.institute_modules.includes(module_name);
  }
}
