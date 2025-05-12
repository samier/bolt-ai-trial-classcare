import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { StudentRemarkService } from '../student-remark.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { LeaveManagmentService } from '../../leave-management/leave-managment.service';
import { DatePipe } from '@angular/common';
import { Toastr } from '../../../core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';
import { DateFormatService } from 'src/app/service/date-format.service';
import { remarkType } from 'src/app/common-config/static-value';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-admin-student-remark-list-tab',
  templateUrl: './admin-student-remark-list-tab.component.html',
  styleUrls: ['./admin-student-remark-list-tab.component.scss']
})
export class AdminStudentRemarkListTabComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  public studentDetails:any = ('; '+document.cookie)?.split(`; studentDetails=`)?.pop()?.split(';')[0];
  tbody:any;
  studentId: any = null;
  branchID: any = null;
  acedemicYearId:any = null;
  login_id:any=4;
  username:any;
  batch:string = "-";
  profile_image:any;
  mobile_number:any;
  generate = false;
  public institute_modules:any = [];
  private API_URL = enviroment.apiUrl;
  remarkType: any = remarkType;
  remarkTitle: any = null;
  title: any;
  remarkFilterForm: FormGroup | any;
  isshow: boolean = false;

  constructor(
    private studentRemarkService: StudentRemarkService, 
    public route:ActivatedRoute,
    private httpRequest: HttpClient,
    private leaveManagementSerivce: LeaveManagmentService,
    public datePipe: DatePipe,
    private toastr: Toastr, 
    public CommonService: CommonService,
    private router: Router,
    public dateFormatService: DateFormatService,
    private formBuilder: FormBuilder,
  ) {
    this.login_id = this.route.snapshot.paramMap.get('unique_id');
    this.httpRequest.get(this.API_URL+'api/get-institute-modules').subscribe((res:any) => {
      this.institute_modules = res.data;
    });
    const studentDetailsDecodedData = decodeURIComponent(this.studentDetails);
    var keyValuePairs = studentDetailsDecodedData.split('|');
    var studentidValue = "";
    var studentbranchidValue = "";   
    
    for (var i = 0; i < keyValuePairs.length; i++) {
      var keyValue = keyValuePairs[i].split('=');
      if (keyValue[0] === 'studentid') {
        studentidValue = keyValue[1];
      } else if (keyValue[0] === 'studentbranchid') {
        studentbranchidValue = keyValue[1];
      }
    }
    this.studentId = studentidValue;
    this.branchID = studentbranchidValue; 

   }
   URLConstants=URLConstants;
  symfonyHost = enviroment.symfonyHost;
  ngOnInit(): void {
    this.initForm()
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollCollapse:true,
      scrollX:true,
      ajax: (dataTablesParameters: any, callback) => {
        this.getlist(dataTablesParameters,callback)
      },
      columns: [
        { data: 'remark_type' },
        { data: 'comment' },
        { data: 'user.first_name' },
        { data: 'updated_at'},
      ]
    };
    this.studentRemarkService.getAcademicYearId(this.branchID).subscribe((res:any) => {
      this.acedemicYearId = (res?.data) ? res?.data : '';      
    });
    this.leaveManagementSerivce.getStudentProfileDetail(this.login_id).subscribe((resp:any) => {
      if(resp.status == false && !resp.id){
        this.router.navigate([this.setUrl(URLConstants.STUDENT_LIST)]);
        return;
      } 
      this.username = resp?.full_name;
      //this.username = resp.full_name;
      this.profile_image = resp?.profile_url;
      this.mobile_number = resp.phone_number;
      this.batch = resp.batch;
      if(!this.profile_image){
        this.profile_image = this.symfonyHost + resp?.profile
      }
    });
  }

  getlist(dataTablesParameters?: any, callback?:any ){   
    dataTablesParameters = {      
      ...dataTablesParameters,
      ...this.remarkFilterForm.value,
      student_id:this.login_id,
    };
    dataTablesParameters.start_date = dataTablesParameters?.date?.startDate ? dataTablesParameters?.date.startDate.format('DD-MM-YYYY') : null
    dataTablesParameters.end_date = dataTablesParameters?.date?.endDate ? dataTablesParameters?.date.endDate.format('DD-MM-YYYY') : null
    this.studentRemarkService.getRemarkList(dataTablesParameters).subscribe((resp:any) => {      
      this.tbody = resp?.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
    });
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  getInstituteModule(module_name:string){
    return this.institute_modules.includes(module_name);
  }

  setsymfonyUrlAdmin(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }

  setsymfonyUrl(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url+'/'+this.login_id;
  }

  downloadPdf()
  {
    const payload = {
      ...this.remarkFilterForm.value,
      student_id:this.login_id,
      start_date: this.remarkFilterForm.value?.date?.startDate ? this.remarkFilterForm.value?.date.startDate.format('DD-MM-YYYY') : null,
      end_date: this.remarkFilterForm.value?.date?.endDate ? this.remarkFilterForm.value?.date.endDate.format('DD-MM-YYYY') : null
    }
    if (this.tbody.length == 0) {
      this.toastr.showError('No Records Found !');
      return;
    }
    
    this.studentRemarkService.download(payload).subscribe(async(res:any) => {        
      if(res?.body?.type == 'application/json') {
        const data = JSON.parse(await res.body.text());
        if(data.status == false){
          this.toastr.showError(data.message);
        }
      } else {        
        this.downloadFile(res,'remark', "pdf");        
      }  
      this.generate = false;    
    });
  }

  downloadFile(res: any,file: any, format:any) {
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if(format == 'pdf') {
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
    } else {
      let a = document.createElement('a');
      a.download = fileName;
      a.href =  pdfSrc
      a.click();
    }
    this.generate = false;
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  changeRemarkType(item:any)
  {
    this.studentRemarkService.getRemarkTitle({remark_type:item?.id}).subscribe((res:any) => {
      this.title = res?.data;
      this.remarkTitle = this.title.map((ele) => {
        return { id: ele?.id, name: ele?.remark }
      })        
    });
  }

  initForm() {
    this.remarkFilterForm = this.formBuilder.group({
      date: [null],
      remarkType: [null],
      remarkTitle: [null],      
    });
  }

  clear()
  {
    this.remarkFilterForm.reset();
    this.reloadData();
  }

}
