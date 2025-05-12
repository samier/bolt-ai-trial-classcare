import { Component, OnInit } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';
import { ReportService } from '../report.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-student-active-inactive-report',
  templateUrl: './student-active-inactive-report.component.html',
  styleUrls: ['./student-active-inactive-report.component.scss']
})
export class StudentActiveInactiveReportComponent implements OnInit {

  dtOptionsForActiveStatus: DataTables.Settings = {};
  datatableElemenActiveStatus: DataTableDirective | null = null;
  studentActiveInactiveData:any = []
  isPdfLoading:boolean = false
  isExcelLoading:boolean = false
  isStudentActiveInactiveLoading:boolean = false

  constructor(public commonService:CommonService,
      private _reportService : ReportService,
      private _toaster: Toastr
  ) { }

  ngOnInit(): void {
    this.isStudentActiveInactiveLoading = true
    this.defineDtoptionForActiveStatusReport()
  }

  defineDtoptionForActiveStatusReport() {
    this.dtOptionsForActiveStatus = {
      pagingType: 'full_numbers',
      pageLength: 50,
      serverSide: true,
      processing: true,
      searching: false,
      // scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback: any) => {
        this.loadDataForActiveStatusReport(dataTablesParameters, callback);
      },
      columns: [
        { data: 'class_name' },
        { data: 'gender' },
        { data: 'active' },
        { data: 'inactive' },
        { data: 'total' },
      ],
    };
  }

  loadDataForActiveStatusReport(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {
      ...dataTablesParameters,
    };
    this._reportService.getStudentReportByActiveStatus(
      dataTablesParameters
    ).subscribe((resp: any) => {
      this.isStudentActiveInactiveLoading = false
      this.studentActiveInactiveData = resp?.data;
      callback({
        recordsTotal: resp?.recordsTotal,
        recordsFiltered: resp?.recordsFiltered,
        data: [],
      });
      // setTimeout(() => {
      //   this.datatableElemenActiveStatus?.dtInstance.then(
      //     (dtInstance: DataTables.Api) => {
      //       dtInstance.columns.adjust();
      //     }
      //   );
      // }, 10);
    });
  }

  downloadPdfAndExcel(value: string) {
    if(value == 'pdf'){
      this.isPdfLoading = true
    }else {
      this.isExcelLoading = true
    }
    this._reportService.downloadClasswiseStudentActiveInActiveSummaryReport(value
    ).subscribe((res: any) => {
      this.isPdfLoading = false
      this.isExcelLoading = false
      this.downloadFile(res, 'student-gender-report', value);
    },(error)=>{
      this.isPdfLoading = false
      this.isExcelLoading = false
    });
  }

  downloadFile(res: any, file: any, format: any) {
    if (this.studentActiveInactiveData.length == 0) {
      return this._toaster.showInfo('There is no records', 'INFO');
    }
    let fileName = file;
    let blob: Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob);
    if (format == 'pdf') {
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      setTimeout(() => {
        iframe.contentWindow?.print();
      }, 200);
      //iframe.contentWindow?.print();
    } else {
      let a = document.createElement('a');
      a.download = fileName;
      a.href = pdfSrc;
      a.click();
    }
  }

}
