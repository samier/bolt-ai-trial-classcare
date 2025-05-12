import { Component, OnInit, Pipe} from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService } from "../../report/report.service";
import { DomSanitizer } from '@angular/platform-browser';
import { status } from 'src/app/common-config/static-value';
import { StudentLeavingCertificateService } from '../../student-leaving-certificate/student-leaving-certificate.service';

@Component({
  selector: 'app-section-wise-fees-report',
  templateUrl: './section-wise-fees-report.component.html',
  styleUrls: ['./section-wise-fees-report.component.scss']
})
export class SectionWiseFeesReportComponent implements OnInit {

  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  @Pipe({ name: 'safeHtml' })
  sectionwisefeesform: FormGroup | any;
  filterCount: any = 0;
  filter:any = true;
  sectionList: any = []
  classList  : any = []
  batchList  : any = []
  settings:any;
  statusList = status
  is_form : boolean = false
  isFormsubmitted : boolean = false
  pdf_loading : boolean = false
  excel_loading : boolean = false
  htmlContent: any;
  branch_id: any = window.localStorage.getItem('branch');
  user_id  : any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );
  paginateData:any;
  lastPage:any;
  pages:any;
  limit:any = 50
  page:any = 1
  offset:any 
  months:any = [];

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    private toaster:Toastr,
    public commonService: CommonService,
    private validationService: FormValidationService,
    private _fb: FormBuilder,
    private ReportService: ReportService,
    private sanitizer: DomSanitizer,
    private leavingCertificateService: StudentLeavingCertificateService,
  ) { }
  transform(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.formInit()
    this.getSectionList()
    this.getClassesList()
    this.getQuarters()    
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  getSectionList() {

    this.ReportService.getSectionList({ branch: this.branch_id }).subscribe((res: any) => {
      if (res.status) {
        this.sectionList = [...this.sectionList, ...res.data];
      }
    });
  }

  handleSection(){
    this.classList = []
    this.batchList = []
    this.sectionwisefeesform.controls['class_id'].patchValue(null)
    this.sectionwisefeesform.controls['batch_id'].patchValue([])
    
    this.getClassesList()
  }

  getClassesList(){
    let section_id = this.sectionwisefeesform.value.section_id ? this.sectionwisefeesform.value.section_id.map(item => item?.id) : []
    this.leavingCertificateService.getClassesList({'section_id': section_id}).subscribe((res: any) => { 
      if(res?.status){
        this.classList = res?.data;
      }
    } )
  }

  handleClass(){
    this.batchList = [] 
    this.sectionwisefeesform.controls['batch_id'].patchValue([])

    this.getBatchList()
  }

  getBatchList(){
    const payload = {
      classes: this.getID(this.sectionwisefeesform?.value?.class_id) || []
    }
    this.ReportService.getBatchesList(payload).subscribe((res: any) => {
      this.batchList = res.data;
    });
  }

  handleFeeCategoryChange(){
    this.sectionwisefeesform.controls['month'].patchValue([])
      const payload = {
        category_id: this.sectionwisefeesform?.value?.fees_category
      }
      this.ReportService.getFeesCategoryMonth(payload).subscribe((resp:any) => {
        if(resp.status){
          this.months = resp.data;
        }
      })
  }

  getID(data: any) {
    if (data == null || data?.length == 0) {
      return []
    }
    return data?.map(item => item?.id)
  }

  getQuarters(){
    this.ReportService.quarters().subscribe((resp: any) => {
      if(resp.status){
        this.settings = resp.data;
        this.settings.months = this.settings?.months?.map((month:any)=>{
          return {
            id: month,
            name: month
          }
        })
        this.settings.categories = this.settings?.categories?.map((item:any)=>{
          return {
            id: item.id,
            name: item.type_name
          }
        })
        this.settings.categories = [...[{id:'school_fees', name:'School Fees'}],...this.settings.categories]
      }else{
        this.toaster.showError(resp?.message)
      }
    },(error)=>{
      this.toaster.showError(error?.error?.message)
    })
  }

  onFormSubmit(type?:any)
  {
    if(!type){
      this.page = 1;
      this.offset = 0;
    }
    this.isFormsubmitted = true;
    Object.keys(this.sectionwisefeesform.controls).forEach(controlName => {
      const control = this.sectionwisefeesform.get(controlName);
      if (control) {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });
    
    if (this.sectionwisefeesform.invalid) {      
      this.validationService.getFormTouchedAndValidation(this.sectionwisefeesform);
      return;
    }
    this.is_form = true;
    this.countFilters();
    const payload = {
      offset : this.offset,
      limit: this.limit,
      page: this.page,
      section_id: this.getID(this.sectionwisefeesform?.value?.section_id) || [],
      class_id: this.getID(this.sectionwisefeesform?.value?.class_id) || [],
      batch_id: this.getID(this.sectionwisefeesform?.value?.batch_id) || [],
      fees_category: this.sectionwisefeesform?.value?.fees_category || "",
      is_refund: this.sectionwisefeesform?.value?.is_refund,
      student_status: this.sectionwisefeesform?.value?.student_status,
      months: this.getID(this.sectionwisefeesform?.value?.month),
      dates: this.sectionwisefeesform?.value?.date?.startDate ? [this.sectionwisefeesform?.value?.date.startDate?.format('YYYY-MM-DD'),this.sectionwisefeesform?.value?.date.endDate?.format('YYYY-MM-DD')] :null,
    }
    this.ReportService.getSectionWiseFeesReport(payload).subscribe((resp: any) => {      
      this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(resp.html);
      this.paginateData = resp.data
      this.pagination();
      this.is_form = false;
    })
  }

  pagination(){
    let pages = Math.ceil(this.paginateData.total/this.limit)
    let pagination:any = [];
    this.lastPage = this.paginateData.last_page

    if (pages <= 5) {
        // If there are 5 or fewer pages, just show them all
        for (let index = 0; index < pages; index++) {
            pagination.push(index + 1);
        }
    } else {
        if (this.page <= 3) {
            // Show the first 5 pages and '...' if the current page is 1, 2, or 3
            for (let index = 0; index < 5; index++) {
                pagination.push(index + 1);
            }
            pagination.push('...');
            pagination.push(this.lastPage);
        } else if (this.page > 3 && this.page < pages - 2) {
            // Show '...' before and after the current page if it's between 4 and (total pages - 3)
            pagination.push(1);
            pagination.push('...');
            for (let index = this.page - 1; index <= this.page + 1; index++) {
                pagination.push(index);
            }
            pagination.push('...');
            pagination.push(this.lastPage);
        } else {
            // Show '...' before the last 5 pages if the current page is near the end
            pagination.push(1);
            pagination.push('...');
            for (let index = pages - 5; index < pages; index++) {
                pagination.push(index + 1);
            }
        }
    }

    this.pages = pagination;
    this.offset = (this.page - 1) * this.limit
  }
  prev(){
    this.page = this.page - 1;
    this.pagination()
    this.onFormSubmit('page');
  }

  next(){
    this.page = this.page + 1;
    this.pagination()
    this.onFormSubmit('page');

  }

  jumpToPage(page:any){
    this.page = page;
    this.pagination()
    this.onFormSubmit('page');
  }

  handleLimitChange(){
    this.page = 1;
    this.pagination()
    this.onFormSubmit();
  }

  downloadReport(format:any){
    this.isFormsubmitted = true;
    if (this.sectionwisefeesform.invalid) {
      this.validationService.getFormTouchedAndValidation(this.sectionwisefeesform);      
      return;
    }
    if(format == 'pdf'){
      this.pdf_loading = true
    }
    if(format == 'excel'){
      this.excel_loading = true
    }
    const payload = {
      section_id: this.getID(this.sectionwisefeesform?.value?.section_id) || [],
      class_id: this.getID(this.sectionwisefeesform?.value?.class_id) || [],
      batch_id: this.getID(this.sectionwisefeesform?.value?.batch_id) || [],
      fees_category: this.sectionwisefeesform?.value?.fees_category || "",
      is_refund: this.sectionwisefeesform?.value?.is_refund,
      student_status: this.sectionwisefeesform?.value?.student_status,
      months: this.getID(this.sectionwisefeesform?.value?.month),
      dates: this.sectionwisefeesform?.value?.date?.startDate ? [this.sectionwisefeesform?.value?.date.startDate?.format('YYYY-MM-DD'),this.sectionwisefeesform?.value?.date.endDate?.format('YYYY-MM-DD')] :[],
    }
    this.ReportService.downloadSectionWiseFeesReport(payload, format).subscribe((resp: any) => {
      this.commonService.downloadFile(resp, 'Section Wise Fees Report', format)      
      this.pdf_loading = false
      this.excel_loading = false
    },(error:any)=>{
      this.pdf_loading = false
      this.excel_loading = false
    })
  }

  clearAll(){
    this.sectionwisefeesform.reset();
    this.sectionwisefeesform.controls['section_id'].patchValue(null)
    this.sectionwisefeesform.controls['class_id'].patchValue(null)
    this.sectionwisefeesform.controls['class_id'].markAsPristine();
    this.sectionwisefeesform.controls['class_id'].markAsUntouched();
    this.sectionwisefeesform.controls['class_id'].updateValueAndValidity();
    this.sectionwisefeesform.controls['batch_id'].patchValue(null)
    this.sectionwisefeesform.controls['student_status'].patchValue(1)
    this.sectionwisefeesform.controls['fees_category'].patchValue(null)
    this.sectionwisefeesform.controls['date'].patchValue(null)
    this.sectionwisefeesform.controls['is_refund'].patchValue(false)
    this.sectionwisefeesform.controls['month'].patchValue(null)
    this.htmlContent = null;
    this.filterCount = 0;
    this.limit = 50;
    this.page = 1;
    this.paginateData = null
  }

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.sectionwisefeesform.value).forEach((item:any)=>{
      if((this.sectionwisefeesform.value[item] != '' && this.sectionwisefeesform.value[item] != null) || item == 'student_status'){
        this.filterCount++;
      }
    })
    if(this.sectionwisefeesform.value?.date && this.sectionwisefeesform.value?.date?.startDate == null){
      this.filterCount--;
    }
  }
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  formInit(){
    this.sectionwisefeesform = this._fb.group({
      section_id : [null] ,
      class_id : [null, [Validators.required]] ,
      batch_id : [null] ,
      student_status : [1],
      fees_category : [null, [Validators.required]],
      date: [null],
      month: [null],
      is_refund: [false],
    })
  }


  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------

}
