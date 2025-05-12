import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TransportService } from '../../transport-management/transport.service';
import { DataTableDirective } from 'angular-datatables';
import { ExamServiceService } from '../exam-service.service';
import { Toastr } from 'src/app/core/services/toastr';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ExamReportDownloadModalComponent } from '../exam-report-download-modal/exam-report-download-modal.component';

@Component({
  selector: 'app-exam-list',
  templateUrl: './exam-list.component.html',
  styleUrls: ['./exam-list.component.scss']
})
export class ExamListComponent implements OnInit {

  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  examViewForm: FormGroup = new FormGroup({});
  sectionList: any = []
  classList: any = []
  batchList: any = []
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  // dtRendered = true
  examList:any = []
  isExamDataLoadOnFilter:boolean = false
  examTypeList = []
  message = {
    is_student_message:false,
    is_mother_message:false,
    is_father_message:false
  }
  examId :number = 0
  isStatusUpdate :boolean = false
  modelType:string = ''
  indexStart : number = 1
  isPdfLoading : boolean = false
  isExcelLoading : boolean = false
  URLConstants = URLConstants
  isCheckAttendance : boolean = false
  isGetReport : boolean = false
  filterCount: any = 0;
  filter:any = true;
  dataTableState :any = null
  subjectList: any = []
  //#endregion Public | Private Variables

  isOpenByClick: boolean = true

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _transportService:TransportService,
    private _fb: FormBuilder,
    private toastr: Toastr,
    public examService:ExamServiceService,
    private _router : Router,
    private _modalService: NgbModal,
    private activatedRouteService: ActivatedRoute
  ) { }

  //#endregion constructor


  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.getSectionList();
    this.isExamDataLoadOnFilter = true
    this.initExamTable();
    this.checkAttendance();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  getClasses() {
    this.examViewForm.controls['class_id'].reset();
    this.examViewForm.controls['batch_id'].reset();
    this.classList = []
    this.batchList = []

    this.subjectList = []
    this.examViewForm.controls['subject_ids'].reset();

    const section = this.examViewForm.value.section_id && this.examViewForm.value.section_id != "" ? this.examViewForm.value.section_id : null
    
    const payload = {
      user_id : window.localStorage.getItem('user_id'), 
      section_id : section,
    }

    this.examService.getClassFilterList(payload).pipe(takeUntil(this.$destroy))?.subscribe((res: any) => {
      if (res.status) {
        this.classList = res.data
        if(this.dataTableState !== null){
          if(this.dataTableState?.class_id && this.dataTableState.class_id != ""){
            this.examViewForm.controls['class_id'].patchValue(this.dataTableState?.class_id);
            this.dataTableState.class_id = null
          }
          this.getBatches();
        }
        // this.examViewForm.controls['class_id'].patchValue()
      }
    })
  }

  getBatches() {
    this.batchList = []
    this.examViewForm.controls['batch_id'].reset();

    this.subjectList = []
    this.examViewForm.controls['subject_ids'].reset();

    const classes = this.examViewForm?.value ? this.examViewForm?.value.class_id : ''
    // if (classes) {
      const payload = {
        classes: classes ? [classes] : []
      }
      
      this._transportService.getBatchesList(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.batchList = res.data
          if(this.dataTableState !== null){
            if(this.dataTableState?.batch_id && this.dataTableState.batch_id != ""){
              this.examViewForm.controls['batch_id'].patchValue(this.dataTableState?.batch_id);
              this.dataTableState.batch_id = null
            }
            this.getSubjectsByBatch()
          }
        } else {
          this.toastr.showError(res?.message)
        }
      })
    // }
  }

  getSubjectsByBatch() {

    this.subjectList = []
    this.examViewForm.controls['subject_ids'].reset();

    const payload = {
      branchId : localStorage.getItem('branch'),
      academicYear : Number(('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]),
      batchId : this.CommonService.getID(this.examViewForm.value.batch_id) || []
    }
    // I have found error here without batch id API is call That's Why add condition.
    if(payload.batchId?.length > 0) {
      this.examService.getSubjectOnbatch(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.subjectList = res.data?.map((subject:any)=>({
            name: subject.subject_name,
            id: subject.subject_id
          }));
          if(this.dataTableState !== null){
            if(this.dataTableState?.subject_ids && this.dataTableState.subject_ids != ""){
              this.examViewForm.controls['subject_ids'].patchValue(this.dataTableState?.subject_ids);
              this.dataTableState.subject_ids = null
            }
          }
        }
        else{
          this.toastr.showError(res.message)
        }
      })
    }
  }

  clearData(event:any = null) {
    if(event){
      event.stopPropagation();
    }
    this.examViewForm.reset()
    this.examViewForm.controls['section_id']?.patchValue('');
    this.getClasses()
    this.reloadData()
  }

  showExamData() {
    this.isExamDataLoadOnFilter = true
    this.reloadData() 
  }

  initExamTable () {
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      lengthMenu : [10,50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      ordering: false,
      stateSave: true,
      // deferLoading: 0,
      // destroy: true,
      stateSaveCallback: (settings, data) => {
        Object.assign(data, {
          section_id: this.examViewForm.value.section_id,
          class_id: this.examViewForm.value.class_id,
          batch_id: this.examViewForm.value.batch_id,
          subject_ids: this.examViewForm.value.subject_ids,
          exam_type_id: this.examViewForm.value.exam_type_id,
          date: this.examViewForm.value.date,
        })

        localStorage.setItem('DataTables_' + URLConstants.EXAM_VIEW_LIST, JSON.stringify(data))
      },
       stateLoadCallback: function (settings) {
        const isModuleActive = that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if (isModuleActive) {
          let state: any = localStorage.getItem('DataTables_' + URLConstants.EXAM_VIEW_LIST)
          that.dataTableState = JSON.parse(state) || null
          that.setFormState(that.dataTableState)
          return that.dataTableState
        } else {
          that.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.state.clear();
          });
          return null;
        }
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.loadExamData(dataTablesParameters, callback);
      },
      columns: this.CommonService.hasPermission('student_marks_visiblity', 'has_access') ?  [
        {data: 'exam_name'},
        {data: 'exam_name'},
        {data: 'description'},
        {data: 'exam_name'},
        {data: 'exam_name'},
        {data: 'exam_name'},
        {data: 'exam_name'},
        {data: 'exam_name'},
      ] : [
        {data: 'exam_name'},
        {data: 'exam_name'},
        {data: 'description'},
        {data: 'exam_name'},
        {data: 'exam_name'},
        {data: 'exam_name'},
        {data: 'exam_name'},
      ]
      ,
      // language: {
      //   info: '',
      //   zeroRecords: 'No records found!'
      // }
    };
  }

  loadExamData(dataTablesParameters?: any, callback?: any) {
    this.countFilters();
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.examViewForm.value,
      subject_ids : this.CommonService.getID(this.examViewForm.value.subject_ids) || []
    };
    
    dataTablesParameters.batch_id = dataTablesParameters?.batch_id?.length > 0 ? dataTablesParameters.batch_id.map(ele => ele.id): []
    dataTablesParameters.start_date = dataTablesParameters?.date?.startDate ? dataTablesParameters?.date.startDate.format('DD-MM-YYYY') : null
    dataTablesParameters.end_date = dataTablesParameters?.date?.endDate ? dataTablesParameters?.date.endDate.format('DD-MM-YYYY') : null

    delete dataTablesParameters["date"];
    this.examService.getExamList(
      dataTablesParameters
    ).subscribe((resp: any) => {
      this.isExamDataLoadOnFilter = false
      this.examList = resp?.data?.original.data
      this.indexStart =  (dataTablesParameters.start / dataTablesParameters.length) * dataTablesParameters.length
      callback({
        recordsTotal: resp?.data?.original.recordsTotal,
        recordsFiltered: resp?.data?.original.recordsFiltered,
        data: [],
      });
      // if(!resp?.data?.original.data.length) {
      //   this.toastr.showError("No records found!");    
      // }
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
    } ,(error) => {
      this.isExamDataLoadOnFilter = false
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  } 

  goTocreateExam() {
    this._router.navigate([`${window.localStorage.getItem('branch')}/exam/create`])
  }

  
  editExam(id:string) {
    this._router.navigate([this.CommonService.setUrl(URLConstants.EDIT_EXAM),id])
  }

  deleteExam(id:string) {
    let confirm = window.confirm('Are you sure you want to delete this exam.?')
    if(confirm){
      this.examService.deleteExam(id).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
        if (res.status) {
          this.reloadData()
          this.toastr.showSuccess(res.message)
        } else {
          this.toastr.showError(res?.message)
        }
      },(error) => {
        this.toastr.showError(error?.error?.message ?? error?.message)
      })
    }
  }

  viewExam(id,class_id) {
    let queryParams: NavigationExtras = {
      queryParams: {  
        class_id: class_id,
      }
    };
    
    this._router.navigate([`${window.localStorage.getItem('branch')}/exam/view/${id}`],queryParams)
  }

  marksField(id) {
    this._router.navigate([`${window.localStorage.getItem('branch')}/exam/result/${id}`])
  }

  takeAttendance(id) {
    this._router.navigate([`${window.localStorage.getItem('branch')}/exam/attendance/${id}`])
  }
  
  openPublishModal(modalName,id,type) {
    this.modelType = type
    this._modalService.open(modalName);
    this.examId = id
  }

  closeModel() {
    this._modalService.dismissAll()
  }

  sendStatus() {

    const payload = {
      exam_status :  this.modelType == 'resultDeclare' ? '4' : '1',
      ...this.message
    }
    this.isStatusUpdate = true
    this.examService.examStatusUpdate(payload,this.examId).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      this.isStatusUpdate = false
      if(res.status) {
        this.toastr.showSuccess(res?.message)
        this.reloadData();
        this.closeModel();
      } else {
        this.toastr.showError(res?.message)
      }
    }, (error)=> {
      this.toastr.showError(error?.error?.message ?? error?.message)
      this.isStatusUpdate = false
    })
    
  }

  publishMarks(id) {
    const payload = {
      main_exam_id : id
    }
    this.examService.publishMultipleSubjectExamMarks(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if(res.status) {
        this.toastr.showSuccess(res.message)
      } else {
        this.toastr.showError(res.message)
      }
    }, (error)=> {
      this.toastr.showError(error?.error?.message ?? error?.message)
    })
  }

  goToGenerateExamTimetable() {
    this._router.navigate([`${window.localStorage.getItem('branch')}/exam-timetable/exam-timetable-form`])
  }

  goToGenerateHallTicket() {
    this._router.navigate([`${window.localStorage.getItem('branch')}/hall-ticket`])
  }

  onCheckboxChange(event: Event, item: any) {
    const checkbox = event.target as HTMLInputElement;
    const newValue = checkbox.checked;
  
    let confirmMessage = newValue
      ? 'Exam marks will remain visible, notifications or messages about exam marks will be sent, and students can download their exam results on the mobile app.'
      : 'Are you sure you want to proceed without making the exam marks visible, sending notifications or messages about exam marks, and allowing students to download their exam results on the mobile app?';
  
    const confirm = window.confirm(confirmMessage);
  
    if (confirm) {
      item.exam_marks_enable_for_student = newValue;
  
      const payload = { visible_for_student: newValue };
      this.examService.studentMarkVisible(payload, item.id).pipe(takeUntil(this.$destroy)).subscribe(
        (res: any) => {
          if (res.status) {
            this.toastr.showSuccess(res?.message);
          } else {
            this.toastr.showError(res?.message);
          }
        },
        (error) => {
          this.toastr.showError(error?.error?.message ?? error?.message);
        }
      );
    } else {
      // Revert the checkbox to its original value if not confirmed
      checkbox.checked = item.exam_marks_enable_for_student;
    }
  }

  generateExamReport() {
    const modalRef = this._modalService.open(ExamReportDownloadModalComponent,{
      size: 'lg',
      // centered: true,
      backdrop: 'static',
      windowClass: 'duplicate-modal-section',
      backdropClass: 'duplicate-modal-backdrop'
    });

    modalRef.result.then((response: any) => {
      if(response.data) {
        this.downloadPDFAndEXCEL(response.data)
      }
    })
  }

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.examViewForm.value).forEach((item:any)=>{
      if(this.examViewForm.value[item] != '' && this.examViewForm.value[item] != null){
        this.filterCount++;
      }
    })  
    if(this.examViewForm.value?.date && this.examViewForm.value?.date?.startDate == null){
      this.filterCount--;
    }  
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.examViewForm = this._fb.group({
      section_id: [''],
      class_id: [null], //[Validators.required]
      batch_id: [ null], //[Validators.required]
      exam_type_id:[null],
      subject_ids :[null],
      date: [null]
    })

    this.examViewForm.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res) => {
      this.examViewForm.controls['batch_id'].markAsPristine();
      this.examViewForm.controls['batch_id'].markAsUntouched();
    })
  }

  getSectionList() {
    const payload = {
      branch : localStorage.getItem('branch')
    }
    this.examService.getSectionFilterList(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.sectionList = [{ id: '', name: 'All Section' }].concat(res.data);
        this.getClasses()
      }
    })

    this.examService.getExamTypeList().pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
      if(res.status) {
        this.examTypeList = res.data
      }
    })
  }

  checkAttendance() {
    this.examService.getNotification().pipe(takeUntil(this.$destroy)).subscribe((res:any) => {
      if(res.status) {
        this.isCheckAttendance = res.data.exam_attendance ? false : true
      } else {
        this.toastr.showError(res?.message)
      }
    });
  }

  downloadPDFAndEXCEL(payload) {
    this.isGetReport = true
    this.examService.getPdfAndExcelExamReport(payload).pipe(takeUntil(this.$destroy)).subscribe((res)=>{
      this.CommonService.downloadFile(res, 'exam-report', payload.download_type);
      this.isGetReport = false
    },(error)=> {
      this.toastr.showError(error?.error?.message ?? error?.message)
      this.isGetReport = false
    })
  }

  setFormState(state:any) {
    this.examViewForm.controls['section_id'].patchValue(state?.section_id);
    this.examViewForm.controls['class_id'].patchValue(state?.class_id);
    this.examViewForm.controls['batch_id'].patchValue(state?.batch_id);
    this.examViewForm.controls['subject_ids'].patchValue(state?.subject_ids);
    this.examViewForm.controls['exam_type_id'].patchValue(state?.exam_type_id);
    this.examViewForm.controls['date'].patchValue(state?.date);
  }

  //#endregion Private methods

}
