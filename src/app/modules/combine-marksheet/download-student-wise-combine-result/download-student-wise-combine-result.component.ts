import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { forkJoin, interval, Subject, Subscription, switchMap, take, takeUntil, takeWhile, timer } from 'rxjs';
import { CombineMarksheetService } from '../combine-marksheet.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-download-student-wise-combine-result',
  templateUrl: './download-student-wise-combine-result.component.html',
  styleUrls: ['./download-student-wise-combine-result.component.scss']
})
export class DownloadStudentWiseCombineResultComponent implements OnInit {

  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  $destroy: Subject<void> = new Subject<void>();
  filterForm: FormGroup = new FormGroup({})
  dtOptions: DataTables.Settings = {}

  is_show: boolean = false

  resultForQ: any
  typeQ: any
  publish_typeQ: any
  schoolTemplateQ: boolean = false
  // isStudentWiseQ: boolean = false
  private queryParamsSubscription!: Subscription;

  classListDP: any = []
  batchListDP: any = []
  URLConstants = URLConstants;

  allChecked: boolean = false

  is_multiDownload: boolean = false
  isDownloadMarkSheet: boolean = false

  searchQuery: any = ""
  mainData: any = []
  filterData: any = []

  selectedArray: any = []
  markSheetId: string | null = null

  filterCount: number = 0
  filter: boolean = true

  wiseDP : any = [
    {name : 'Class Wise' , id : 1},
    {name : 'Batch Wise' , id : 0},
  ]
  selectedType : number = 0
  tableLoading : boolean = false
  isPublishing : boolean = false
  studentBatchClassWise : boolean = false
  combineMarksheetList: any;
  selectedCombineMarksheet: any;

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private _fb: FormBuilder,
    private combineMarkSheetService: CombineMarksheetService,
    private _activatedRoute: ActivatedRoute,
    private toaster: Toastr,
    private router: Router
  ) { }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.queryParamsSubscription = this._activatedRoute.queryParams.subscribe(params => {
      this.resultForQ = params['result_for'];
      this.typeQ = params['type'];
      this.publish_typeQ = params['publish_type']
      this.schoolTemplateQ = params['schoolTemplate'] == "true" ? true : false
    });
    this.studentBatchClassWise = this.resultForQ == 1 && this.typeQ != 2 ? true : false ;
    this.markSheetId = this._activatedRoute.snapshot.paramMap.get('id') || null;
    this.initForm()
    this.fetchClassList()
    this.fetchBatchList()
    this.getCombineMarksheetList();
    this.handleShow()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  handleShow(is_showBTN: boolean = false) {

    this.is_show = is_showBTN ? true : this.is_show;
    this.tableLoading = true

    const payload = {
      combine_result_id: this.markSheetId,
      batch_id: this.CommonService.getID(this.filterForm.value.batchF) || [],
      type : this.typeQ
      // type : this.resultForQ == 1 && this.isStudentWiseQ ? 2 : this.filterForm.value.typeF ,
    }
    this.selectedType = this.filterForm.value.typeF
    this.countFilters()

    this.combineMarkSheetService.downLoadCombineResult(payload, this.resultForQ, this.studentBatchClassWise,this.schoolTemplateQ).subscribe((res: any) => { // resultQ  0-fac ,1-std
      if (res.status) {
        this.filterData = []
        this.mainData = []

        this.mainData = res.data?.map((item: any) => ({
          ...item,
          loading: false,
          selected: false,
          searchKey: this.resultForQ == 1 && this.typeQ == 2 ? `${item.student_roll_no ?? ''} ${item.student_full_name ?? ''} ${item.batch_name ?? ''} ${item.mark_sheet_name ?? ''} ` : `${item.mark_sheet_name ?? ''} ${item.batch_name ?? ''}`,
          // searchKey: this.resultForQ == 1 && this.isStudentWiseQ ? `${item.student_roll_no ?? ''} ${item.student_full_name ?? ''} ${item.batch_name ?? ''} ${item.mark_sheet_name ?? ''} ` : `${item.mark_sheet_name ?? ''} ${item.batch_name ?? ''}`,
        }))
        .sort((a, b) => {
          const extractBatchParts = (batchName: string) => {
            const match = batchName.match(/(\d+)-([A-Za-z]+)/);
            return match ? { number: parseInt(match[1]), section: match[2] } : { number: 0, section: "" };
          };
        
          const batchA = extractBatchParts(a.batch_name);
          const batchB = extractBatchParts(b.batch_name);
        
          if (batchA.number !== batchB.number) {
            return batchA.number - batchB.number;
          }
        
          let batchComparison = batchA.section.localeCompare(batchB.section);
        
          if (this.resultForQ == 1 && this.typeQ == 2 ) {
            if (batchComparison === 0) {
              return (Number(a.student_roll_no) || 0) - (Number(b.student_roll_no) || 0);
            }
          }
        
          return batchComparison;
        });
        this.filterData = [...this.mainData]

        this.is_show = false
        this.tableLoading = false

      }
      else {
        this.is_show = false
        this.tableLoading = false
      }
    },(error:any)=>{
      this.toaster.showError(error.error.message || error.message)
      this.is_show = false
      this.tableLoading = false
    })
  }

  countFilters() {
    this.filterCount = 0;
    Object.keys(this.filterForm.value).forEach((item: any) => {
      if ( item != 'typeF'  && (this.filterForm.value[item] != '' && this.filterForm.value[item] != null)) {
        this.filterCount++;
      }
    })
  }

  trackById(index: number, item: any): any {
    return item.student_id;
  }

  handleClear() {
    this.filterForm.reset()
    this.fetchClassList()
    this.fetchBatchList()
    this.handleShow()
  }
  //? --------------------------------------------   SINGLE DOWNLOAD

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

      const requests = urlArray.map(url => this.combineMarkSheetService.downloadMarkSheet(url));
      forkJoin(requests).pipe(takeUntil(this.$destroy)).subscribe((res) => {
        this.downloadFile(res, 'MarkSheet-list', 'pdf', is_singleDownload, obj);
      }, (error: any) => {
        is_singleDownload ? obj.loading = false : this.is_multiDownload = false
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
  //? --------------------------------------------   MULTI SELECT CHECKBOX
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

  //? --------------------------------------------   SINGLE SELECT CHECKBOX
  handleSelect(event: any, id: number) {
    const selected = event.target.checked;

    const arr = this.filterData?.find((item: any) => item.id === id);
    if (arr) {
      arr.selected = selected;

      if (selected) {
        this.selectedArray?.push(arr);
      } else {
        this.selectedArray = this.selectedArray?.filter((item: any) => item.id !== id);
      }

      this.allChecked = this.selectedArray?.length === this.filterData?.length;
    }
  }
  switch_to(value:string){
    // this.type = value
    this.allChecked = false
    this.handleClear()
    this.fetchClassList()
    this.fetchBatchList()
  }

  //? --------------------------------------------   INPUT SEARCH 
  searchData() {
    if (!this.searchQuery) {
      this.filterData = [...this.mainData];
    } else {
      const searchWords = this.searchQuery.toLowerCase().split(' ');
      this.filterData = this.mainData.filter((item: any) => {
        const searchKeyLower = item.searchKey.toLowerCase();
        return searchWords.every((word: any) => searchKeyLower.includes(word));
      });
    }
  }

  // DROPDOWN THINGS

  fetchClassList() {

    this.filterForm?.controls['classF']?.patchValue([])
    this.classListDP = []

    const payload = {
      combine_result_id: this.markSheetId,
      result_for: +this.resultForQ, // 0 fac 1 student
      type: +this.typeQ
      // type: this.resultForQ == 1 && this.isStudentWiseQ ? 2 : this.filterForm.value.typeF    //0- batch wise , 1- class- wise, 2- student result
    }

    this.combineMarkSheetService.fetchClasses(payload).subscribe((res: any) => {
      if (res.status) {
        this.classListDP = res.data
      }
      else {
        this.toaster.showError(res.message)
      }
    }, (error: any) => {
      this.toaster.showError(error.error.message || error.message)
    })
  }
  fetchBatchList() {

    this.filterForm?.controls['batchF']?.patchValue([])
    this.batchListDP = []

    const payload = {
      combine_result_id: this.markSheetId,
      class_id: this.filterForm.value.classF,
      result_for: +this.resultForQ, // 0 fac 1 student
      type: +this.typeQ
      // type: this.resultForQ == 1 && this.isStudentWiseQ ? 2 : this.filterForm.value.typeF    //0- batch wise , 1- class- wise, 2- student result
    }

    this.combineMarkSheetService.fetchBatches(payload).subscribe((res: any) => {
      if (res.status) {
        this.batchListDP = res.data
      }
      else {
        this.toaster.showError(res.message)
      }
    }, (error: any) => {
      this.toaster.showError(error.error.message || error.message)
    })
  }

  handleWiseChange(){
    this.fetchClassList()
    this.fetchBatchList()
  }

  publishMarksheet(result?: any){
    if(!result && this.selectedArray?.length == 0){
      return this.toaster.showError("Please Select the Checkbox")
    }
    const payload = {
      result_id: result ? [result?.id] : this.selectedArray.map(item => {return item.id})
    }
    result?.id ? result.publish_loading = true : this.isPublishing = true;  
    this.combineMarkSheetService.publishMarksheetManually(payload).subscribe((res: any) => {
      result?.id ? result.publish_loading = false : this.isPublishing = false;
      if(res?.status){
        this.toaster.showSuccess(res?.message);
        this.handleShow()
      }else{
        this.toaster.showError(res?.message);
      }
    },
    (error: any) => {
      result?.id ? result.publish_loading = false : this.isPublishing = false;
      this.toaster.showError(error?.message ?? error?.error?.message ?? error?.error?.error);
    })
  }

  onMarksheetChange(event: any){

    const currentMarkSheet = this.combineMarksheetList.find((markSheet:any)=>markSheet.id == this.markSheetId)
    const nextMarkSheet    = this.combineMarksheetList.find((markSheet:any)=>markSheet.id == event.id )

    if( ( this.resultForQ==1 && this.typeQ == 2 ) ){
      if(nextMarkSheet.student_is_completed && nextMarkSheet.student_result_job_process && nextMarkSheet.add_publish_type == 0 ){
        this.toaster.showError(`Download/Publish Student Wise Result for ${nextMarkSheet.mark_sheet_name} is not Setup. `)
        setTimeout(()=>{
          this.selectedCombineMarksheet = currentMarkSheet.id
        },200)
        return
      }
    }

    let queryParams : NavigationExtras = {
      queryParams: {
        type: this.typeQ,
        result_for: this.resultForQ,
        ...( this.publish_typeQ != null   && { publish_type   : this.combineMarksheetList?.find((markSheet:any)=>markSheet.id==event.id).add_publish_type }) ,
        ...( this.schoolTemplateQ == true && { schoolTemplate : this.schoolTemplateQ } ) 
      }
    }
    this.router.navigate([`${window.localStorage.getItem('branch')}/combine-marksheet/download-combine-result/${event?.id}`],queryParams);
    setTimeout(() => this.ngOnInit());
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.filterForm = this._fb.group({
      typeF: [1],
      classF: [null],
      batchF: [null],
    })
  }

  getCombineMarksheetList(){
    this.combineMarkSheetService.listCombineMarkSheet().subscribe((res: any) => {
      if(res?.status){
        this.combineMarksheetList = res.data;
        this.selectedCombineMarksheet = this.combineMarksheetList.find(m => m.id == this.markSheetId).id
      }
    })
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------

}
