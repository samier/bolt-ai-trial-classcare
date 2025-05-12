import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { LeaveManagmentService } from '../leave-managment.service';
import { DatePipe, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { enviroment } from 'src/environments/environment.staging';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-admin-student-leave-list-tab',
  templateUrl: './admin-student-leave-list-tab.component.html',
  styleUrls: ['./admin-student-leave-list-tab.component.scss']
})
export class AdminStudentLeaveListTabComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  unique_id:any
  tbody:any;
  login_id:any=4;
  p: number = 1;
  profile_image:any;
  username:any;
  mobile_number:any;
  branch_id:any;
  batch:string = "-";
  URLConstants=URLConstants;
  symfonyHost = enviroment.symfonyHost;
  public institute_modules:any = [];
  private API_URL = enviroment.apiUrl;
  student:any;

  constructor(
    private leaveManagementSerivce:LeaveManagmentService, 
    public datePipe: DatePipe,
    public route:ActivatedRoute,
    private httpRequest: HttpClient,
    public CommonService: CommonService,
    public router: Router,
  ){
    this.login_id = this.route.snapshot.paramMap.get('unique_id');
    this.branch_id = window.localStorage.getItem("branch");
    this.httpRequest.get(this.API_URL+'api/get-institute-modules').subscribe((res:any) => {
      this.institute_modules = res.data;
    });
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      paging:         false,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'id' }, 
        { data: 'name'}, 
        { data: 'leave_type' }, 
        { data: 'start_date' }, 
        { data: 'end_date' }, 
        { data: 'status' },         
      ]
    };   
    this.leaveManagementSerivce.getStudentProfileDetail(this.login_id).subscribe((resp:any) => {
      if(resp.status == false && !resp.id){
        this.router.navigate([this.setUrl(URLConstants.STUDENT_LIST)]);
        return;
      }   
      this.student = resp;
      this.username = resp?.full_name;
      this.profile_image = resp?.profile_url;
      this.mobile_number = resp.phone_number;
      this.batch = resp.batch;
      this.unique_id = resp.unique_id

      if(!this.profile_image){
        this.profile_image = this.symfonyHost + resp?.profile
      }
      this.reloadData();
    });
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    Object.assign(dataTablesParameters,{'sender_id':this.student?.id??this.login_id});
    Object.assign(dataTablesParameters,{'type':2});
    this.leaveManagementSerivce.getStudentListForAdmin(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;            
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
  setsymfonyUrlAdmin(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }
  delete(id:number){
    let c = confirm("Are you sure? You want to delete it ?");
    if(c){
      this.leaveManagementSerivce.deleteStudentLeaveByAdmin(id).subscribe((res:any) => {      
        console.log(res); 
        this.reloadData();
      });             
    }
  }  
  setsymfonyUrl(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url+'/'+this.login_id;
  }
  getInstituteModule(module_name:string){
    return this.institute_modules.includes(module_name);
  }
}
