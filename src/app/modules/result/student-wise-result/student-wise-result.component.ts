import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { ResultService } from '../result.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { forkJoin, interval, Subject, switchMap, take, takeUntil, takeWhile, timer } from 'rxjs';
import { status } from 'src/app/common-config/static-value';

@Component({
  selector: 'app-student-wise-result',
  templateUrl: './student-wise-result.component.html',
  styleUrls: ['./student-wise-result.component.scss']
})
export class StudentWiseResultComponent implements OnInit {
  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  $destroy: Subject<void> = new Subject<void>();
  filterForm: FormGroup = new FormGroup({})
  dtOptions: DataTables.Settings = {}

  is_show: boolean = false

  branch_id: any = window.localStorage.getItem('branch');
  user_id: any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  sectionList: any = [];
  classList: any = []
  batchList: any = []

  tbody: any = []
  allChecked: boolean = false

  is_multiDownload: boolean = false
  isDownloadMarkSheet: boolean = false

  selectedOption: any

  searchQuery: any = ""
  mainData: any = []
  filterData: any = []

  selectedArray: any = []
  markSheetId: string | null = null
  className: string | null = null
  publish_type: any | null = null;
  marksheetList: any = [];
  selectedMarksheet: any;
  isPublishing: boolean = false;
  studentStatus = status
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private resultService: ResultService,
    private toaster: Toastr,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
  ) { }
  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm()
    this.loadComponent();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------


  loadComponent() {
    this.classList = [];
    this.batchList = [];
    this.selectedArray = [];
    this.allChecked = false;
    this.markSheetId = this._activatedRoute.snapshot.paramMap.get('id') || null;
    this.className = this._activatedRoute.snapshot.queryParams['class'] || null;
    this.publish_type = this._activatedRoute.snapshot.queryParams['publish_type'] || null;
    this.getMarksheetList();
    this.filterForm.reset();
    this.filterForm.controls['student_status'].patchValue(2)
    this.getSectionList()
    this.handleShow()
  }

  handleShow(is_showBTN: boolean = false) {

    this.is_show = is_showBTN ? true : this.is_show;

    const payload = {
      exam_result_id: this.markSheetId,
      class_ids: this.getID(this.filterForm.value.class),
      batch_ids: this.getID(this.filterForm.value.batch),
      status: this.filterForm.value.student_status
    }
    this.resultService.getMarkSheetResultList(payload).subscribe((res: any) => {
      if (res.status) {

        this.filterData = []
        this.mainData = []

        this.mainData = res.data.map((item: any) => ({
          ...item,
          searchKey: `${item.student_roll_no ?? ''} ${item.student_full_name ?? ''} ${item.batch_name ?? ''}`,
          loading: false
        })).sort((a, b) => {
          if (a.batch_name === b.batch_name) {
            return a.student_roll_no - b.student_roll_no;
          }
          return a.batch_name.localeCompare(b.batch_name);
        });
        this.filterData = [...this.mainData]

        this.is_show = false

      }
      else {
        this.is_show = false
      }
    })
  }

  trackById(index: number, item: any): any {
    return item.student_id;
  }

  handleClear() {
    this.filterForm.controls['section'].patchValue(null)
    this.filterForm.controls['class'].patchValue(null)
    this.filterForm.controls['batch'].patchValue(null)

    this.handleShow()
  }

  singleDownload(obj: any) {
    if (obj) {
      obj.loading = true
      this.downloadMarksheet([obj?.result_file_url], true, obj)
    }
  }

  downloadResult() {
    if (this.selectedArray?.length == 0) {
      this.toaster.showError("Please Select the Checkbox")
      return
    }
    const urlArray = this.selectedArray?.map((obj: any) => obj?.result_file_url)
    this.downloadMarksheet(urlArray)
  }

  downloadMarksheet(urlArray: any[], is_singleDownload: boolean = false, obj: any = {}) {
    if (urlArray?.length == 0) {
      this.toaster.showError('Data not found')
    } else {

      is_singleDownload ? obj.loading = true : this.is_multiDownload = true

      const requests = urlArray.map(url => this.resultService.downlaodMarkSheet(url));
      forkJoin(requests).pipe(takeUntil(this.$destroy)).subscribe((res) => {

        this.downloadFile(res, 'Marksheet-list', 'pdf', is_singleDownload, obj);
      }, (error) => {

        is_singleDownload ? obj.loading = false : this.is_multiDownload = false
        console.error('Error occurred:', error);
      });
    }
  }

  downloadFile(res: any, file: any, format: any, is_singleDownload: boolean = false, obj: any = {}) {

    let fileName = file;
    let blob = res.map(ele => ele.body as Blob);
    const mergedBlob = new Blob(blob, { type: blob[0].type });
    let pdfSrc = window.URL.createObjectURL(mergedBlob);
    if (format == 'pdf') {
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      setTimeout(() => {
        iframe.contentWindow?.print();
        is_singleDownload ? obj.loading = false : this.is_multiDownload = false
      }, 200);
    } else {
      let a = document.createElement('a');
      a.download = fileName;
      a.href = pdfSrc;
      a.click();
      is_singleDownload ? obj.loading = false : this.is_multiDownload = false
    }
  }

  // CHECKBOX THING
  handleSelectAll(event: any) {
    const isSelected = event.target.checked;
    this.selectedArray = [];

    this.filterData.forEach((element: any) => {
      element.selected = isSelected;
      if (isSelected) {
        this.selectedArray.push(element);
      }
    });

    this.allChecked = isSelected;
  }

  handleSelect(event: any, id: number) {
    const selected = event.target.checked;

    const arr = this.filterData?.find((item: any) => item.id === id);
    if (arr) {
      arr.selected = selected;

      if (selected) {
        this.selectedArray?.push(arr);
      } else {
        this.selectedArray = this.selectedArray.filter((item: any) => item.id !== id);
      }

      this.allChecked = this.selectedArray?.length === this.filterData?.length;
    }
  }

  searchData() {
    if (!this.searchQuery) {
      this.filterData = this.mainData;
    }
    else {
      const searchWords = this.searchQuery.toLowerCase().split(' ');
      this.filterData = this.mainData.filter((item: any) => {
        const searchKeyLower = item.searchKey.toLowerCase();
        return searchWords.every(word => searchKeyLower.includes(word));
      });
    }
  }

  // DROPDOWN THINGS
  // Section dropdown data
  getSectionList() {

    const payload = {
      exam_result_id: this.markSheetId
    }
    this.resultService.getSectionList(payload).subscribe((res: any) => {
      if (res.status) {
        this.sectionList = res?.data;
        if(this.className){
          this.filterForm?.controls['section'].patchValue(this.sectionList[0]?.id)
          this.getClassList();
        }
      }
    });
  }

  // Class dropdown data
  getClassList() {

    this.filterForm?.controls['class']?.patchValue([])
    this.filterForm?.controls['batch']?.patchValue([])
    this.classList = []
    this.batchList = []

    const payload = {
      exam_result_id: this.markSheetId,
      section_id: [this.filterForm?.value?.section]
    }
    this.resultService.getClassList(payload).subscribe((res: any) => {
      if (res?.status) {
        // this.classList = res?.data
        this.classList  = res?.data?.filter(item => item !== null);
        if(this.className) {
          this.filterForm.controls['class']?.patchValue([this.classList?.find(c => c.name == this.className)]);
          this.getBatchList();
        }
      }
    })
  }

  getBatchList() {
    this.filterForm?.controls['batch']?.patchValue([])
    this.batchList = []

    const payload = {
      mark_sheet_classes_ids: this.getID(this.filterForm?.value?.class)
    }
    if(payload?.mark_sheet_classes_ids?.length == 0){
      return 
    }

    this.resultService.getBatchList(payload).subscribe((res: any) => {

      if (typeof res?.data === "object" && res?.data !== null) {
        this.batchList = Object.values(res?.data);
      }
      this.batchList = this.batchList?.map((obj: any) => {
        return (
          {
            ...obj,
            id: obj?.batch_id,
            name: obj?.batch_name
          }
        )
      })
      if(this.className){
        this.filterForm.controls['batch']?.patchValue(this.batchList);
        this.handleShow()
      }
    })

  }

  onMarksheetChange(event: any){
    this._router.navigate([this.CommonService.setUrl(URLConstants.STUDENT_WISE_RESULT),event?.id]).then(() => {
      this.loadComponent(); // Reset form & reload data
    });
  }

  publishResult(result?: any){
    if(!result && this.selectedArray.length == 0){
      return this.toaster.showError("Please Select the Checkbox")
    }
    const payload = {
      result_id: result ? [result?.id] : this.selectedArray.map(item => {return item.id})
    }
    result?.id ? result.publish_loading = true : this.isPublishing = true;  
    this.resultService.publishMarksheetManually(payload).subscribe((res: any) => {
      result?.id ? result.publish_loading = false : this.isPublishing = false;
      if(res?.status){
        this.toaster.showSuccess(res?.message);
      }else{
        this.toaster.showError(res?.message);
      }
    },
    (error: any) => {
      result?.id ? result.publish_loading = false : this.isPublishing = false;
      this.toaster.showError(error?.message ?? error?.error?.message ?? error?.error?.error);
    }
  )
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.filterForm = this._fb.group({
      section: [null],
      class: [null],
      batch: [null],
      student_status: [2]
    })
  }

  getID(data: any) {
    if (data == null || data?.length == 0) {
      return []
    }
    return data.map(item => item.id)
  }

  getMarksheetList(){
    this.resultService.getMarkSheetList().pipe(takeUntil(this.$destroy)).subscribe(
        (res: any) => {
          if (res.status) {
            this.marksheetList = res?.data
            this.selectedMarksheet = this.marksheetList.find(m => m.id == this.markSheetId).id
          }
        },(error: any) => {
          this.toaster.showError(error?.error?.message ?? error?.error?.error ?? error?.message)
        }
      );
  }
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------

}