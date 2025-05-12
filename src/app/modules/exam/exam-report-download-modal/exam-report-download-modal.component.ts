import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { ExamServiceService } from '../exam-service.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { status } from 'src/app/common-config/static-value';

@Component({
  selector: 'app-exam-report-download-modal',
  templateUrl: './exam-report-download-modal.component.html',
  styleUrls: ['./exam-report-download-modal.component.scss']
})
export class ExamReportDownloadModalComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  examReportForm : FormGroup = new FormGroup({})
  sectionList: any = []
  classList: any = []
  examList: any = []
  gradeTypeList: any = []
  statusList:any = status

  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      private modalRef: NgbActiveModal,
      private _examService : ExamServiceService,
      private _formValidationService : FormValidationService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getSectionList();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------


  closeModal() {
    this.modalRef.dismiss();
  }

  download() {
    if(this.examReportForm.invalid){
      this._formValidationService.getFormTouchedAndValidation(this.examReportForm)
      return;
    }
    const payload = {
      ...this.examReportForm.value
    }

    payload.exam_ids = payload.exam_ids.length > 0 ? payload.exam_ids.map((ele)=> ele.id) : []

    this.modalRef.close({
      data: payload
    })
  }

  getClasses() {
    this.examReportForm.controls['class_id'].reset();
    this.examReportForm.controls['grade_type'].reset();
    this.examReportForm.controls['exam_ids'].reset();
    this.classList = []
    this.gradeTypeList = []
    this.examList = []

    const section = this.examReportForm.value.section_id && this.examReportForm.value.section_id != "" ? this.examReportForm.value.section_id : null
    
    const paylaod = {
      user_id : window.localStorage.getItem('user_id'), 
      section_id : section,
    }
    this._examService.getClassFilterList(paylaod).pipe(takeUntil(this.$destroy))?.subscribe((res: any) => {
      if (res.status) {
        this.classList = res.data
      }
    })
  }

  getExamAndGradeList() {

    const payload = {
      class_id : this.examReportForm.value.class_id ?? null
    }

    if(payload.class_id){
      this.examReportForm.controls['grade_type'].reset();
      this.examReportForm.controls['exam_ids'].reset();
      this.gradeTypeList = []
      this.examList = []
      
      this._examService.getGradeList(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        this.gradeTypeList = res.data
      });

      this._examService.getExamNameOnBatch(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        if(res.data){
          this.examList = res.data.map((ele) => {
            return {
              id: ele.id,
              name: ele.exam_name
            }
          })
        }
      });
    }
  }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
    initForm() {
      this.examReportForm = this._fb.group({
        section_id: [''],
        class_id: [null,[Validators.required]],
        exam_ids : [null,[Validators.required]],
        grade_type : [''],
        status : [1],
        download_type : ['pdf'],
        absent_grade_and_marks: [true],
        rank_type: ['batch']
      })

      this.examReportForm.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res) => {
        this.examReportForm.controls['exam_ids'].markAsPristine();
        this.examReportForm.controls['exam_ids'].markAsUntouched();
      })

    }

    getSectionList() {
      const payload = {
        branch : localStorage.getItem('branch')
      }
      this._examService.getSectionFilterList(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.sectionList = [{ id: '', name: 'All Section' }].concat(res.data);
          this.getClasses()
        }
      })
    }
	
  //#endregion Private methods
}