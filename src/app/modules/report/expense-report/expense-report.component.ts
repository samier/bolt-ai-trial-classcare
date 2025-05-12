// import { data } from './../../../shared/data/dashboard/dashboard';
import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { ReportService } from '../report.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { months } from 'src/app/common-config/static-value';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject, takeUntil } from 'rxjs';
import { StudentService } from '../../student/student.service';
import moment from 'moment';

@Component({
  selector: 'app-expense-report',
  templateUrl: './expense-report.component.html',
  styleUrls: ['./expense-report.component.scss'],
})
export class ExpenseReportComponent implements OnInit {
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  isPdfLoading: boolean = false;
  isExcelLoading: boolean = false;
  expenseReportForm:FormGroup = new FormGroup({})
  isGetReport:boolean = false
  htmlContent
  monthList = months
  startMonthsList = months
  endMonthsList = months
  classDropdownSettings: IDropdownSettings = {};
  expenseCategoryList = []
  isSubmit:boolean = false
  isEndMonth :boolean = true
  startMonth:number = 0

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public CommonService: CommonService,
    private _reportService:ReportService,
    private _fb : FormBuilder,
    private sanitizer: DomSanitizer,
    private _studentService : StudentService
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.formInit();
    this.classDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'categoryName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.getExpenseCategory()
    this.getAcademicYear()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  downloadPdfAndExcel(value: string) {

    if(this.expenseReportForm.invalid) {
      return;
    }

    if (value == 'pdf') {
      this.isPdfLoading = true;
    } else {
      this.isExcelLoading = true;
    }

    const categoryID = this.expenseReportForm.value.category_id ? this.expenseReportForm.value.category_id.map(ele => ele.id) : null

    const payload = {
      category_id : categoryID,
      end_month : this.expenseReportForm.value.end_month,
      start_month : this.expenseReportForm.value.start_month
    };

    this._reportService.getPdfAndExcelReport(payload, value).pipe(takeUntil(this.$destroy)).subscribe(
      (res: any) => {
        this.isPdfLoading = false;
        this.isExcelLoading = false;
        this._reportService.downloadFile(res, 'expense-report', value);
      },
      (error) => {
        this.isPdfLoading = false;
        this.isExcelLoading = false;
      }
    );
  }

  clearForm(){
    this.expenseReportForm.reset()
    this.htmlContent = ''
    this.expenseReportForm.controls['end_month'].clearValidators();
    this.expenseReportForm.controls['end_month'].updateValueAndValidity();
    // this.expenseReportForm.get('end_month')?.disable();
    this.expenseReportForm.controls['start_month'].setValue(this.startMonth)
    this.expenseReportForm.controls['end_month'].setValue(this.startMonth !== 1 ? (this.startMonth - 1) : 12)
  }

  getReport() {
    this.isSubmit = true

    if(this.expenseReportForm.invalid) {
      return;
    }
    this.isGetReport = true

    const categoryID = this.expenseReportForm.value.category_id ? this.expenseReportForm.value.category_id.map(ele => ele.id) : null

    const payload = {
      category_id : categoryID,
      end_month : this.expenseReportForm.value.end_month,
      start_month : this.expenseReportForm.value.start_month
    };

    this._reportService.getExpenseReport(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
      this.isGetReport = false
      this.isSubmit = false
        this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(res.html);
    },(error) => {
      this.isGetReport = false;
      this.isSubmit = false
    })
  }

  changeStartMonth(event) {
    if (event) {
      this.expenseReportForm.get('end_month')?.enable();
      this.expenseReportForm.controls['end_month'].reset()
      this.expenseReportForm.controls['end_month'].setValidators([Validators.required]);
      this.expenseReportForm.controls['end_month'].updateValueAndValidity();
    }
    this.endMonthsList = this.startMonthsList

    this.updateEndMonthOptions(event.value)
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  formInit(){
    this.expenseReportForm = this._fb.group({
      start_month : [null],
      end_month : [null],
      category_id : []
    })
    // this.expenseReportForm.get('end_month')?.disable();

  }

  getExpenseCategory () {
    this._reportService.getExpenseCategory().pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
      this.expenseCategoryList = res.data
    })
  }

  reorderMonths(startMonth: number) {
    const startIndex = this.monthList.findIndex(month => month.value == startMonth);
    if (startIndex === -1) {
       this.startMonthsList = this.monthList;
       this.endMonthsList = this.monthList;
    }
    this.startMonthsList = [...this.monthList.slice(startIndex), ...this.monthList.slice(0, startIndex)];
    this.endMonthsList = this.startMonthsList

    this.expenseReportForm.controls['start_month'].setValue(this.startMonth)
    this.expenseReportForm.controls['end_month'].setValue(this.startMonth !== 1 ? (this.startMonth - 1) : 12)
  }

  updateEndMonthOptions(startMonthValue): void {
    this.endMonthsList.forEach(month => {
      if (startMonthValue >= this.startMonth) {
        month.isDisabled = month.value < startMonthValue && month.value > (this.startMonth-1);
      } else {
        month.isDisabled = month.value < startMonthValue || month.value > (this.startMonth-1);
      }
    });
  }

  getAcademicYear () {
    const payload = {
      current_branch_id: [localStorage.getItem("branch")]
    }
    this._studentService.getAcadamicYearList(payload).subscribe((res: any) => {
      if (res.status) {
        const currentYearId = Number(('; '+document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0])
        const currentYear = res.data.find(ele => ele.id ==  currentYearId);
        this.startMonth = ((moment(currentYear.start_time, 'YYYY-MM-DD').month()) + 1);

        this.reorderMonths(this.startMonth)
      }
    });
  }

  //#endregion Private methods
}
