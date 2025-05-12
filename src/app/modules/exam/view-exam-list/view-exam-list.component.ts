import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ExamServiceService } from '../exam-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Toastr } from 'src/app/core/services/toastr';
import moment from 'moment';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { status } from 'src/app/common-config/static-value';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-view-exam-list',
  templateUrl: './view-exam-list.component.html',
  styleUrls: ['./view-exam-list.component.scss']
})
export class ViewExamListComponent implements OnInit {
  //#region Public | Private Variables

  URLConstants = URLConstants;
  $destroy: Subject<void> = new Subject<void>();
  examID: string | null = null
  examList: any = []
  isExamList: boolean = false
  message = {
    is_student_message:false,
    is_mother_message:false,
    is_father_message:false
  }
  isCheckAttendance : boolean = false;
  selectedRow: any
  examViewForm: FormGroup = new FormGroup({});
  downloadPDFExcelForm: FormGroup = new FormGroup({});
  exportExcel: FormGroup = new FormGroup({});
  filteredData:any = []
  isSendPublishMarks : boolean = false
  selectAll:boolean = false
  isSelectAllModal:boolean = false
  isMultiDownload:boolean = false
  gradeTypeList: any = []
  allIds : any
  statusList:any = status
  isExportingMarks: boolean = false;
  file:any = null;
  isImportExcel:boolean = false
  

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private _activatedRoute: ActivatedRoute,
    public examService: ExamServiceService,
    private _router: Router,
    private _examService: ExamServiceService,
    private _modalService: NgbModal,
    private toastr: Toastr,
    private _fb : FormBuilder,
    private _formValidationService : FormValidationService
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.examID = this._activatedRoute.snapshot.paramMap.get('id') || null

    if (this.examID) {
      this.checkAttendance()
      this.getBathWiseData(this.examID)
    }

    this._activatedRoute.queryParams.subscribe(params => {      
      this.allIds = params
      this.getExamAndGradeList();
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  attendenceAndResult(item,type) {

    let queryParams: NavigationExtras = {
      queryParams: {
        sub_exam_id: item.exam_id,
        batch_id: item.batch_id,
        subject_id: item.subject_id
      }
    };

    if(type === 'attendance') {
      this._router.navigate([`${window.localStorage.getItem('branch')}/exam/attendance/${this.examList.id}`],queryParams)
    } else if(type === 'result') {
      this._router.navigate([`${window.localStorage.getItem('branch')}/exam/result/${this.examList.id}`],queryParams)
    }
  }

  goToExamList() {
    this._router.navigate([`${window.localStorage.getItem('branch')}/exam/list`]);
  }

  closeModel() {
    this._modalService.dismissAll();
    this.downloadPDFExcelForm.reset();
    this.downloadPDFExcelForm.controls['download_type'].patchValue('pdf')
    this.downloadPDFExcelForm.controls['status'].patchValue(1)
    this.downloadPDFExcelForm.controls['absent_grade_and_marks'].patchValue(true)
    this.downloadPDFExcelForm.controls['rank_type'].patchValue('batch')

    this.exportExcel.reset();
    this.exportExcel.controls['status'].patchValue(1)
    this.exportExcel.updateValueAndValidity()

  }

  openPublishModal(item,modalName) {
    this.selectedRow = item;
    this._modalService.open(modalName);
    // let confirm = window.confirm('Are you sure you want to publish this exam marks ?');
    // if(confirm) {
    //   const payload = {
    //     main_exam_id : this.examID,
    //     subject_exam_id : item.exam_id,
    //     batch_id : item.batch_id,
    //     subject_id : item.subject_id
    //   }

    //   this._examService.publishSingleSubjectExamMarks(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
    //     if(res.status){
    //       this.toastr.showSuccess(res.message);
    //       this.getBathWiseData(this.examID)
    //     }
    //   })
    // }
  }

  showFilteredData() {
    const { batch_id, subject_id } = this.examViewForm.value;

    this.filteredData = this.examList.exam_subjects.filter((ele) => {
      return (!batch_id || ele.batch_id == batch_id) && (!subject_id || ele.subject_id == subject_id);
    });

  }

  clearData() {
    this.examViewForm.reset();
    this.filteredData = this.examList.exam_subjects
  }

  downloadPdfAndExcel(value,id) {
    if(value == 'pdf'){
      // this.isPdfLoading = true
    }else {
      // this.isExcelLoading = true
    }
    const payload = {
      subject_exam_id : id
    }
    this.examService.getStudentPdfAndExcel(value,payload).subscribe((res: any) => {
      // this.isPdfLoading = false
      // this.isExcelLoading = false
      this.downloadFile(res, 'student-marks', value);
    },(error)=>{
      this.toastr.showError(error?.error?.message ?? error?.message)
      // this.isPdfLoading = false
      // this.isExcelLoading = false
    });
  }

  sendPublishMarks() {
    if (!this.isSelectAllModal) {
      if (!this.selectedRow) {
        return;
      }
  
      this.isSendPublishMarks = true
      const payload = {
        main_exam_id: this.examID,
        subject_exam_id: this.selectedRow.exam_id,
        batch_id: this.selectedRow.batch_id,
        subject_id: this.selectedRow.subject_id,
        ...this.message
      }
  
      this._examService.publishSingleSubjectExamMarks(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        this.isSendPublishMarks = false;
        if (res.status) {
          this.toastr.showSuccess(res.message);
          this.getBathWiseData(this.examID);
          this.closeModel();
          this.selectedRow = null
        } else {
          this.toastr.showError(res.message);
        }
      }, (error) => {
        this.isSendPublishMarks = false;
        this.toastr.showError(error?.error?.message ?? error?.message)
        this.closeModel();
      })
    } else {
      this.isSelectAllModal = false

      const selectedData = this.filteredData.filter(ele => ele.isSelected == true).map(ele => ele.exam_id);

      const payload = {
        ...this.message,
        main_exam_id : this.examID,
        subject_exam_ids : selectedData
      }

      this._examService.publishAllExam(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        this.selectAll = false
        if (res.status) {
          this.toastr.showSuccess(res.message);
          this.getBathWiseData(this.examID);
          this.closeModel();
          this.selectedRow = null
        } else {
          this.toastr.showError(res.message);
        }
      }, (error) => {
        this.isSendPublishMarks = false;
        this.toastr.showError(error?.error?.message ?? error?.message)
        this.closeModel();
      })
    }
    
  }

  saveExam(item) {
    const payload = {
      start_date: item.new_start_date ? moment(item.new_start_date).format('DD-MM-YYYY') : null,
      start_time: item.new_start_time ? moment(item.new_start_time, 'HH:mm').format('h:mm A') : null,
      end_time: item.new_end_time ? moment(item.new_end_time, 'HH:mm').format('h:mm A') : null,
    }
    this._examService.saveExam(payload, item.exam_id).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.toastr.showSuccess(res?.message)
        this.getBathWiseData(this.examID)
      } else {
        this.cancelEdit(item);
        this.toastr.showError(res?.message)
      }
    }, (error) => {
      this.cancelEdit(item);
      this.toastr.showError(error?.error?.message ?? error?.message)
    })

  }

  cancelEdit(item) {
    if(item) {
      item.new_start_date = item.start_date
      item.new_start_time =  this.examService.dateFormate(item.start_time,4)
      item.new_end_time = this.examService.dateFormate(item.end_time,4) 
      item.isEdit = false
    }
  }

  selectAllCheck(event) {
    this.filteredData.forEach(element => {
      if (element.is_marks_filled && element.is_result_published != 1) {
        element.isSelected = event
      }
    });
  }

  singleCheck() {
    const selectedCheck = this.filteredData.filter(ele => ele.is_marks_filled && ele.is_result_published != 1).map(ele => ele.isSelected)

    if(selectedCheck.includes(false)) {
      this.selectAll = false
    } else {
      this.selectAll = true
    }
  }

  openPublishAllModel(modalName) {
    const selectedData = this.filteredData.filter(ele => ele.isSelected == true).map(ele => ele.exam_id)
    if(selectedData?.length > 0) {
      this.isSelectAllModal = true
      this._modalService.open(modalName);
    } else {
      this.toastr.showError('please select exam');
    }
  }

  openDownloadModel (modalName) {
    this._modalService.open(modalName,{
      windowClass: 'duplicate-modal-section',
      backdrop: true,
      backdropClass: 'duplicate-modal-backdrop'
    });
  }

  getExamAndGradeList() {    
    const payload = {
      class_id : this.allIds.class_id ?? null
    }

    if(payload.class_id){
      this.gradeTypeList = []
      this.examList = []
      this._examService.getGradeList(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        this.gradeTypeList = res.data
      });
    }
  }

  DownloadPdfAndExcelBatchWise() {
    if (this.downloadPDFExcelForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.downloadPDFExcelForm);
      return;
    }

    const payload = {
      main_exam_id : this.examID,
      batch_id : this.getID(this.downloadPDFExcelForm.value.batch_id),
      grade_id : this.downloadPDFExcelForm.value.grade_id,
      status : this.downloadPDFExcelForm.value.status,
      absent_grade_and_marks:  this.downloadPDFExcelForm.value.absent_grade_and_marks,
      rank_type:  this.downloadPDFExcelForm.value.rank_type
    }

    const type = this.downloadPDFExcelForm.value.download_type
    this.isMultiDownload = true
    // this._examService.downloadPdfAndExcel(payload, type).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
    //   this.isMultiDownload = false
    //   this.downloadFile(res, 'student-marks', type);
    //   this.closeModel();
    // }, (error) => {
    //   this.isMultiDownload = false
    //   this.toastr.showError(error?.error?.message ?? error?.message)
    // })

    this._examService.downloadPdfAndExcel(payload, type)
  .pipe(takeUntil(this.$destroy))
  .subscribe((res: any) => {
      this.isMultiDownload = false;
      this.downloadFile(res, 'student-marks', type);
      this.closeModel();
  }, (error) => {
      this.isMultiDownload = false;
      if (error.status === 404) {
          // Handle 404 error
          const errorMessage = error?.error?.message ?? 'Exam marks not entered for selected batch';
          this.toastr.showError(errorMessage);
      } else {
          // Handle other errors
          const errorMessage = error?.error?.message ?? error?.message;
          this.toastr.showError(errorMessage);
      }
  });
  }

  openExportModal(modalName){
    this._modalService.open(modalName,{
      windowClass: 'duplicate-modal-section',
      backdrop: true,
      backdropClass: 'duplicate-modal-backdrop'
    });
  }

  downloadMarksExcel(){
    if(this.examList.result_status == 0){
      return this.toastr.showInfo('Please publish the exam.', 'INFO');
    }

    if(this.examList.attendance_status == false && this.examList.attendance == 0){
      return this.toastr.showInfo('Please take attendnace.', 'INFO');
    }
    const payload = {
      exam_name_id : this.examID,
      ...this.exportExcel.value,
    }

    const type = 'excel'
    this.isExportingMarks = true

    this._examService.exportMarks(payload)
  .pipe(takeUntil(this.$destroy))
  .subscribe((res: any) => {
      this.isExportingMarks = false;
      let date = new Date();
      let date_time = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
      this.downloadFile(res, 'student-marks-'+date_time, type);
      this.closeModel();
  }, (error:any) => {
      this.isExportingMarks = false;
      if (error.status === 404) {
          // Handle 404 error
          const errorMessage = error?.error?.message ?? 'No student found';
          this.toastr.showError(errorMessage);
      } else {
          // Handle other errors
          const errorMessage = error?.error?.message ?? error?.message;
          this.toastr.showError(errorMessage);
      }
  });
  }

  importMarks(content:any){
    if(this.examList.result_status == 0){
      return this.toastr.showInfo('Please publish the exam.', 'INFO');
    }
    if(this.examList.attendance_status == false && this.examList.attendance == 0){
      return this.toastr.showInfo('Please take attendnace.', 'INFO');
    }
    this._modalService.open(content,{
      windowClass: 'duplicate-modal-section',
      backdrop: true,
      backdropClass: 'duplicate-modal-backdrop'
    });
  }

  examImportedMarks(){
    if(this.examList.result_status == 0){
      return this.toastr.showInfo('Please publish the exam.', 'INFO');
    }
    if(this.examList.attendance_status == false && this.examList.attendance == 0){
      return this.toastr.showInfo('Please take attendnace.', 'INFO');
    }
    this._router.navigate( [this.CommonService.setUrl(URLConstants.EXAM_IMPORTED_MARKS),this.examID])
  }

  selectAttachment(event:any) {
    const file = event.target.files[0]
    this.file = file
  }

  importMarksExcel(){
    if(this.file == null){
      return this.toastr.showInfo('Please Upload excel file.', 'INFO');
    }
    
    const formData:any = new FormData();
    formData.append('file', this.file);
    formData.append('exam_name_id', this.examID);
    this.isImportExcel = true;
    this.examService.importMarks(formData).subscribe((resp:any)=>{
      if(resp.status){
        this.toastr.showSuccess(resp.message)
      }else{
        this.toastr.showError(resp.message)
      }
      this.isImportExcel = false
      this.closeModel();
    },(error:any) => {
      this.isImportExcel = false
      this.toastr.showError(error.error.message || error.message)      
      this.closeModel();
    })
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  getBathWiseData(id) {
    this.isExamList = true
    this.examService.getBatchAndSubjectWiseExamData(id).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.examList = res.data
        if(this.examList.main_exam_result_status){
          const main_exam_result_status = this.examList.exam_subjects.map((ele)=> ele.is_result_published).includes(1) ? true : false
          this.examList.main_exam_result_status = main_exam_result_status
        }
        this.filteredData = this.examList?.exam_subjects
        this.filteredData.forEach(element => {
          element.start_date = this.examService.dateFormate(element.start_time,3)
          element.new_start_date = this.examService.dateFormate(element.start_time,3)
          element.new_start_time = this.examService.dateFormate(element.start_time,4)
          element.new_end_time = this.examService.dateFormate(element.end_time,4)
          element.isEdit = false
          element.isSelected = false
        });
      } else {
        this.toastr.showError(res?.message)
      }
      this.isExamList = false
    }, (error) => {
      this.toastr.showError(error?.error?.message ?? error?.message)
      this.isExamList = false
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

  getID(data:any){
    if(data == null || data?.length == 0){
        return []
      }
      return data.map(item =>item.id)
  }

  initForm() {
    this.examViewForm = this._fb.group({
      batch_id: [null], 
      subject_id: [ null], 
    })

    this.downloadPDFExcelForm = this._fb.group({
      batch_id: [null, [Validators.required]], 
      download_type: ['pdf'], 
      grade_id : [], 
      status : [1], 
      absent_grade_and_marks: [true],
      rank_type: ['batch']
    })

    this.exportExcel = this._fb.group({
      batch_id: [null], 
      status : [1], 
    })
  }

  downloadFile(res: any, file: any, format: any) {

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
  //#endregion Private methods
}