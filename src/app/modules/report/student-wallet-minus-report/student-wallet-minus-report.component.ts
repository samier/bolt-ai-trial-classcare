import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ReportService } from '../report.service';
import { BatchService } from '../../batch/batch.service';
import { Toastr } from 'src/app/core/services/toastr';
import { takeUntil } from 'rxjs/operators';
import { HomeworkService } from 'src/app/modules/homework/homework.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';

@Component({
  selector: 'app-student-wallet-minus-report',
  templateUrl: './student-wallet-minus-report.component.html',
  styleUrls: ['./student-wallet-minus-report.component.scss']
})
export class StudentWalletMinusReportComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  walletFilterF : FormGroup = new FormGroup({})
  sectionList: any[] = [];
  classList: any[] = [];
  filter: boolean = true;
  filterCount: number = 0;
  isShowLoading: boolean = false;
  isResetLoading: boolean = false;
  isPdfLoading: boolean = false;
  isExcelLoading: boolean = false;
  htmlContent: any = null;
  user_id: any = window.localStorage.getItem('user_id');
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _fb : FormBuilder,
    private sanitizer: DomSanitizer,
    private reportService: ReportService,
    private batchService: BatchService,
    private toastr: Toastr,
    private homeWorkService: HomeworkService,
    private formValidationService: FormValidationService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getSectionsList();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.walletFilterF = this._fb.group({
      section_id: [null, [Validators.required]],
      class_id: [null, [Validators.required]]
    })

    this.walletFilterF?.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((value: any) => {
      this.filterCount = this.CommonService.countFilters(value);
    })
  }
	
  getSectionsList() {
    this.batchService.getUserWiseSectionList({ user_id: this.user_id })
      .pipe(takeUntil(this.$destroy))
      .subscribe((res: any) => {
        if (res?.status) {
          this.sectionList = res?.data;
        }
      });
  }

  onSectionChange() {
    this.classList = [];
    this.walletFilterF.controls['class_id'].patchValue([]);
    this.walletFilterF?.markAsUntouched();
    if (this.walletFilterF?.value?.section_id?.length > 0) {
      const payload = {
        user_id: this.user_id,
        section: this.CommonService.getID(this.walletFilterF?.value?.section_id) ?? null
      };
      this.homeWorkService.getClassByMultipleSection(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if(res?.status){
          this.classList = res?.data;
        }
      })
    }
  }

  onShow() {
    this.formValidationService.getFormTouchedAndValidation(this.walletFilterF);
    if (this.walletFilterF.invalid) {
      this.toastr.showError('Please select required fields');
      return;
    }
    this.isShowLoading = true;
    this.htmlContent = null;
    const payload = {
      section_id: this.CommonService.getID(this.walletFilterF?.value?.section_id),
      class_id: this.CommonService.getID(this.walletFilterF?.value?.class_id)
    };
    this.reportService.getWalletMinusReport(payload)
      .pipe(takeUntil(this.$destroy))
      .subscribe(
        (res: any) => {
          this.isShowLoading = false;
          this.htmlContent = this.sanitizer?.bypassSecurityTrustHtml(res?.body);
        },
        (error: any) => {
          this.isShowLoading = false;
          this.toastr.showError(error?.message ?? error?.error?.message);
        }
      );
  }

  onReset(event: any) {
    if (event) event.stopPropagation();
    this.isResetLoading = true;
    this.walletFilterF.reset();
    this.walletFilterF?.markAsPristine();
    this.classList = [];
    this.htmlContent = null;
    setTimeout(() => {
      this.isResetLoading = false;
    }, 500);
    this.filterCount = 0;
  }

  downloadReport(format: 'pdf' | 'excel') {
    this.formValidationService.getFormTouchedAndValidation(this.walletFilterF);
    if (this.walletFilterF.invalid) {
      this.toastr.showError('Please select required filters');
      return;
    }
    if (format === 'pdf') this.isPdfLoading = true;
    if (format === 'excel') this.isExcelLoading = true;
    const payload = {
      section_id: this.CommonService.getID(this.walletFilterF?.value?.section_id),
      class_id: this.CommonService.getID(this.walletFilterF?.value?.class_id)
    };
    this.reportService.downloadWalletMinusReport(payload, format)
      .pipe(takeUntil(this.$destroy))
      .subscribe({
        next: (res: any) => {
          this.isPdfLoading = false;
          this.isExcelLoading = false;
          this.CommonService.downloadFile(res, 'student-wallet-report', format);
        },
        error:(error) => {
          this.isPdfLoading = false;
          this.isExcelLoading = false;
          this.toastr.showError(error?.message ?? error?.error?.message);
        }
      });
  }
	
  //#endregion Private methods
}