import { Component,ViewChild ,OnInit, Input} from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { LeaveManagmentService } from 'src/app/modules/leave-management/leave-managment.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { enviroment } from 'src/environments/environment.staging';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-student-tab-wallet',
  templateUrl: './student-tab-wallet.component.html',
  styleUrls: ['./student-tab-wallet.component.scss']
})
export class StudentTabWalletComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  login_id:any=4;
  profile_image:any;
  username:any;
  mobile_number:any;
  branch_id:any;
  unique_id:any

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
    private httpRequest: HttpClient,
    public CommonService: CommonService
  ){
    this.login_id = this.route.snapshot.paramMap.get('unique_id');
    this.branch_id = window.localStorage.getItem("branch");
    this.httpRequest.get(this.API_URL+'api/get-institute-modules').subscribe((res:any) => {
      this.institute_modules = res.data;
    });
  }
  URLConstants=URLConstants;
  symfonyHost = enviroment.symfonyHost;
  ngOnInit(): void {
    this.leaveManagementSerivce.getStudentProfileDetail(this.login_id).subscribe((resp:any) => {
      if(resp.status == false && !resp.id){
        this.router.navigate([this.setUrl(URLConstants.STUDENT_LIST)]);
        return;
      }   
      this.profile_image = resp?.profile_url;
      this.username = resp?.full_name;
      this.mobile_number = resp?.phone_number;
      this.batch = resp?.batch;
      this.unique_id = resp?.unique_id

      if(!this.profile_image){
        this.profile_image = this.symfonyHost + resp?.profile
      }

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
  
  getInstituteModule(module_name:string){
      return this.institute_modules.includes(module_name);
  }

}
  