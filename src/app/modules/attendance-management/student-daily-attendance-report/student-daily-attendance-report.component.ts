import { Component,ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { enviroment } from 'src/environments/environment.staging';
import { DatePipe } from '@angular/common';
import { AttendanceManagementService } from '../attendance-management.service';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';
@Component({
  selector: 'app-student-daily-attendance-report',
  templateUrl: './student-daily-attendance-report.component.html',
  styleUrls: ['./student-daily-attendance-report.component.scss']
})
export class StudentDailyAttendanceReportComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  URLConstants = URLConstants;  
  todayDate: any = "";
  attendantsData: any = [];

  constructor( 
      private router: Router,
      private activatedRouteService: ActivatedRoute,
      private fb: FormBuilder,
      private toastr: Toastr,
      private datePipe: DatePipe,
      private attendanceManagementService: AttendanceManagementService,
      public CommonService: CommonService,
  ) {
    const currentDate = new Date();
    this.todayDate = this.datePipe.transform(currentDate, 'yyyy-MM-dd');
  }

  ngOnInit(): void {
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
        { data: 'class_name' }, 
        { data: 'p_boy' },
        { data: 'p_girl' },
        { data: 'l_boy' },
        { data: 'l_girl' },
        { data: 'a_boy' },
        { data: 'a_girl' },
        { data: 'total_boy' },
        { data: 'total_girl' },
        { data: 'total' },
        { data: 'new_addmission_boy' },
        { data: 'new_addmission_girl' },
        { data: 'l_boy' },
        { data: 'l_girl' },
        { data: 'sign',orderable:false,searchable:false }
      ]
    };
  }

  form = this.fb.group({
    date: ['',[Validators.required]]
  });

  generatePdf() {
    const formValue = this.form.value;
    Object.assign(this.form.value, {file_type:"pdf"});
    const params = {
      file_type:"pdf",
      date:this.todayDate
    }
    this.attendanceManagementService.generateStudentDailyReport(params).subscribe((res:any) => {  
      this.downloadFile(res,'student-daily-attendance-report', "pdf");
    }, (err:any) => {
      this.toastr.showError(err.error.message);
      console.log("error : ", err);
    });
  }

  generateExcel() {
    const formValue = this.form.value;
    Object.assign(this.form.value, {file_type:"excel"});
    const params = {
      file_type:"excel",
      date:this.todayDate
    }
    this.attendanceManagementService.generateStudentDailyReport(params).subscribe((res:any) => {  
      this.downloadFile(res,'student-daily-attendance-report', "excel");
    }, (err:any) => {
      this.toastr.showError(err.error.message);
      console.log("error : ", err);
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
  }

  goToViewAttendancePage() {
    this.attendanceManagementService.goToViewAttendanceReportPage();
  }

  getlist(dataTablesParameters?: any, callback?:any ){
    Object.assign(dataTablesParameters,{date: this.todayDate});
    this.attendanceManagementService.getDailyAttendanceReportList(dataTablesParameters).subscribe((resp:any) => {
      this.attendantsData = resp.data;
      //console.log("response : ", this.attendantsData);
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

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  onDateChange(event: any) {
    this.todayDate = event.target.value;
    this.reloadData();
  }
}
