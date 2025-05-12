import { Component, OnInit } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';
import { ReportService } from '../report.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-student-gender-report',
  templateUrl: './student-gender-report.component.html',
  styleUrls: ['./student-gender-report.component.scss']
})
export class StudentGenderReportComponent implements OnInit {

  dtOptionsForGender: DataTables.Settings = {};
  datatableElementGender: DataTableDirective | null = null;
  studentGenderData:any = []
  isPdfLoading:boolean = false
  isExcelLoading:boolean = false
  isStudentGenderLoading:boolean = false

  constructor(public commonService:CommonService,
      private _reportService:ReportService,
      private _toaster : Toastr
  ) { }

  ngOnInit(): void {
    this.isStudentGenderLoading = true
    this.defineDtoptionForGenderReport()
  }

  defineDtoptionForGenderReport() {
    this.dtOptionsForGender = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: false,
      // scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback: any) => {
        this.loadDataForGenderReport(dataTablesParameters, callback);
      },
      columns: [
        { data: 'class_name' },
        { data: 'boys' },
        { data: 'girls' },
        { data: 'total' },
      ],
    };
  }

  loadDataForGenderReport(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {
      ...dataTablesParameters
    };
    this._reportService.getStudentReportByGender(dataTablesParameters).subscribe(
      (resp: any) => {
        this.isStudentGenderLoading = false
        this.studentGenderData = resp?.data;
        callback({
          recordsTotal: resp?.recordsTotal,
          recordsFiltered: resp?.recordsFiltered,
          data: [],
        });
        // setTimeout(() => {
        //   this.datatableElementGender?.dtInstance.then(
        //     (dtInstance: DataTables.Api) => {
        //       dtInstance.columns.adjust();
        //     }
        //   );
        // }, 10);
      }
    );
  }

  downloadPdfAndExcel(value: string) {
    if(value == 'pdf'){
      this.isPdfLoading = true
    }else {
      this.isExcelLoading = true
    }
    this._reportService.downloadClasswiseStudentGenderSummaryReport(value
    ).subscribe((res: any) => {
      this.isPdfLoading = false
      this.isExcelLoading = false
      this.downloadFile(res, 'student-active-inactive-report', value);
    },(error)=>{
      this.isPdfLoading = false
      this.isExcelLoading = false
    });
  }

  downloadFile(res: any, file: any, format: any) {
    if (this.studentGenderData.length == 0) {
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
