import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { ReportService } from '../report.service';
import { Toastr } from 'src/app/core/services/toastr';
import { DataTableDirective } from 'angular-datatables';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-student-category-report',
  templateUrl: './student-category-report.component.html',
  styleUrls: ['./student-category-report.component.scss'],
})
export class StudentCategoryReportComponent implements OnInit {

  dtOptionsForCategory: DataTables.Settings = {};
  datatableElementCategory: DataTableDirective | null = null;
  studentCategoryData:any = []
  isPdfLoading:boolean = false
  isExcelLoading:boolean = false
  isStudentCategoryLoading:boolean = false
  htmlContent: any;
  sectionList: any;
  categoryReportFilterForm: FormGroup | any = this.formBuilder.group({
    section: []
  });

  constructor(
      public commonService: CommonService,
      private _reportService:ReportService,
      private formBuilder: FormBuilder,
      private _toaster : Toastr
  ) {}

  ngOnInit(): void {
    this.getSectionList();
    this.getStudentReportByCategory();
  }

  getSectionList() {
    this._reportService.getSectionList({school:""}).subscribe((res: any) => {
      if (res.status) {
        this.sectionList = [{ id: '', name: 'All Section' }].concat(res?.data);
      }
    });
  }

  getStudentReportByCategory()
  {
    this.isStudentCategoryLoading = true;
    this._reportService.getStudentCategoryReport(this.categoryReportFilterForm.value).subscribe((resp: any) => {
      this.isStudentCategoryLoading = false;
      this.htmlContent = resp?.html;
    })
  }

  downloadPdfAndExcel(value: string) {
    if(value == 'pdf'){
      this.isPdfLoading = true
    }else {
      this.isExcelLoading = true
    }
    this._reportService.downloadStudentCategoryReport(this.categoryReportFilterForm.value,value
    ).subscribe((res: any) => {
      this.isPdfLoading = false
      this.isExcelLoading = false
      this.commonService.downloadFile(res, 'Student-category-report', value);
    },(error)=>{
      this.isPdfLoading = false
      this.isExcelLoading = false
    });
  }
}
