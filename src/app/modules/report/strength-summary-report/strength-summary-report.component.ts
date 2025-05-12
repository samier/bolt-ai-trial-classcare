import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ReportService } from "../../report/report.service";
import { Toastr } from 'src/app/core/services/toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { BatchService } from '../../batch/batch.service';

@Component({
  selector: 'app-strength-summary-report',
  templateUrl: './strength-summary-report.component.html',
  styleUrls: ['./strength-summary-report.component.scss']
})
export class StrengthSummaryReportComponent implements OnInit {

  //#region Public | Private Variables
  @ViewChild(DataTableDirective, { static: false }) datatableElement!: DataTableDirective;
  filterCount: any = 0;
  strenthReportFilter: FormGroup = new FormGroup({});
  isResetLoading: boolean = false;
  filter: boolean = true;
  sectionsList: any = [];
  user_id: any = window.localStorage.getItem('user_id');
  classList: any = [];
  batchList: any = [];
  pdfLoading = false;
  excelLoading = false;
  isShowLoading: boolean = false;
  getDataLoading: boolean = false;
  isGetReport: boolean = false;
  html: any
  transform(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    private _reportService: ReportService,
    private _fb: FormBuilder,
    private batchService: BatchService,
    private toastr: Toastr,
    private sanitizer: DomSanitizer,
    public commonService: CommonService,
    public formValidationService: FormValidationService,
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.getSectionsList();

  }
  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  countFilters() {
    this.filterCount = 0;
    const filter = this.strenthReportFilter?.value;
    Object.keys(filter).forEach((item) => {
      if (item === 'date') {
        if (filter[item]?.startDate && filter[item]?.endDate) {
          this.filterCount++;
        }
      } else if (filter[item] && (Array.isArray(filter[item]) ? filter[item].length : true)) {
        this.filterCount++;
      }
    })
  }

  reset() {
    this.strenthReportFilter?.reset();;
    this.filterCount = 0;
    this.isResetLoading = true;
    this.strenthReportFilter?.reset();
    this.resetFieldsAndLists(
      ['section_id', 'class_id', 'user_id', 'batch_id'],
      ['classList', 'batchList']
    );
    this.html = null;
    const params = {
      section_id: null,
      class_id: null,
      batch_id: null,
    };

    this.strenthReportFilter?.markAsUntouched();
    this.isResetLoading = false;
  }

  onSectionChange() {
    this.resetFieldsAndLists(
      ['class_id', 'batch_id', 'user_id'],
      ['classList', 'batchList',]
    );

    this.getClassList();
  }

  onClassChange() {
    this.resetFieldsAndLists(
      ['batch_id', 'user_id',],
      ['batchList',]
    );
    this.getBatchList();
  }

  onBatchChange() {
    this.resetFieldsAndLists(
      ['user_id'], ['batch_id']

    );
  }

  onShow() {
    this.countFilters();
    this.formValidationService.getFormTouchedAndValidation(this.strenthReportFilter)
    if (!this.strenthReportFilter.valid) {
      return; 
    }
    const params = {
      section_id: this.getID(this.strenthReportFilter?.value?.section_id) ?? null,
      class_id: this.getID(this.strenthReportFilter?.value?.class_id) ?? null,
      batch_id: this.getID(this.strenthReportFilter?.value?.batch_id) ?? null,
    };
    this.getReport(params);
  }

  downloadReport(format: any) {
    
    this.isGetReport = false
    this.formValidationService.getFormTouchedAndValidation(this.strenthReportFilter)
    if (!this.strenthReportFilter.valid) {
      return; 
    }
    if (format == 'pdf') {
      this.pdfLoading = true;
    }
    if (format == 'excel') {
      this.excelLoading = true;
    }
    const params = {
      section_id: this.getID(this.strenthReportFilter?.value?.section_id) ?? null,
      class_id: this.getID(this.strenthReportFilter?.value?.class_id) ?? null,
      batch_id: this.getID(this.strenthReportFilter?.value?.batch_id) ?? null,
      
    };
    this.countFilters();
    this._reportService.downloadStudentStrengthReport(params, format).subscribe((resp: any) => {

      this.pdfLoading = false;
      this.excelLoading = false;
      this.commonService.downloadFile(resp, 'fees-due-report', format);
      this.isGetReport = false
    }, 
    async(error: any) => {
      this.isGetReport = false
      this.pdfLoading = false;
      this.excelLoading = false;
      
      if(error?.error?.type == 'application/json') {
        const data = JSON.parse(await error?.error.text());
        if(!data.status){
          this.toastr.showError(data?.message);
        }
      }
    });

  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  initForm() {
    this.strenthReportFilter = this._fb.group({
      section_id: [null, [Validators.required]],
      class_id: [null, [Validators.required]],
      batch_id: [null],
      user_id: [null],
    });
    
  }

  getSectionsList() {

    this.batchService.getUserWiseSectionList({ user_id: this.user_id }).subscribe((res: any) => {
      if (res?.status) {
        this.sectionsList = res?.data
      }
    })
  }

  getBatchList() {
    const payload = {
      classes: this.getID(this.strenthReportFilter?.value?.class_id) ?? null
    }
    this._reportService.getBatchOnClass(payload).subscribe((res: any) => {
      if (res?.status) {
        this.batchList = res?.data
      }
    })
  }

  resetFieldsAndLists(fields: string[], lists: string[]) {
    lists.forEach(list => this[list] = []);
    fields.forEach(field => this.strenthReportFilter.controls[field].patchValue(null));
    this.strenthReportFilter.markAsPristine()
  }


  getClassList() {
    const payload = {
      user_id: this.user_id,
      section: this.getID(this.strenthReportFilter?.value?.section_id) ?? null
    };
    this._reportService.getClassByMultipleSection(payload).subscribe((res: any) => {
      if (res.status) {
        this.classList = res?.data;
      }
    })
  }

  getID(obj: any) {
    if (!obj || obj?.length == 0) {
      return
    }
    const ids = obj?.map(obj => obj.id) ?? []
    return ids
  }

  getReport(params: any) {
    this.isShowLoading = true
    this._reportService.getStudentStrenthReport(params).subscribe(
      (resp: any) => {
        this.html = this.sanitizer.bypassSecurityTrustHtml(resp);
        this.isShowLoading = false
      },
      
    );
  }
}
