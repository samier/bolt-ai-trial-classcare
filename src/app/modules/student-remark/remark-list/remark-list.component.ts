import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { StudentRemarkService } from '../student-remark.service';
import { Toastr } from '../../../core/services/toastr';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-remark-list',
  templateUrl: './remark-list.component.html',
  styleUrls: ['./remark-list.component.scss']
})
export class RemarkListComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  public studentDetails:any = ('; '+document.cookie)?.split(`; studentDetails=`)?.pop()?.split(';')[0];
  tbody:any;
  studentId: any = null;
  branchID: any = null;
  acedemicYearId:any = null;
  generate = false;
  // public branch_id = window.localStorage?.getItem("branch");  

  constructor( private studentRemarkService: StudentRemarkService,private toastr: Toastr,public datePipe: DatePipe) {
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

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollCollapse:true,
      scrollX:true,
      order: [[2, 'asc']],
      ajax: (dataTablesParameters: any, callback) => {
        this.getlist(dataTablesParameters,callback)
      },
      columns: [
        { data: 'comment' },
        { data: 'user.full_name' }, 
        { data: 'created_at'},       
      ]
    };
    this.studentRemarkService.getAcademicYearId(this.branchID).subscribe((res:any) => {
      this.acedemicYearId = (res?.data) ? res?.data : '';      
    });
  }

  getlist(dataTablesParameters?: any, callback?:any ){   
    dataTablesParameters = {      
      ...dataTablesParameters,
      student_id:this.studentId,
    };     
    this.studentRemarkService.getRemarkList(dataTablesParameters).subscribe((resp:any) => {      
      this.tbody = resp?.data;
      console.log("list : ", this.tbody);
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

  downloadPdf()
  {
    let param={student_id:this.studentId};
    console.log('student',param);

    if (this.tbody.length == 0) {
      this.toastr.showError('No Records Found !');
      return;
    }
    
    this.studentRemarkService.download(param).subscribe(async(res:any) => {        
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

}
