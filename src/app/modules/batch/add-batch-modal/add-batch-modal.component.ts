import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { ExamServiceService } from '../../exam/exam-service.service';
import { CommonService } from 'src/app/core/services/common.service';
import { BatchService } from '../batch.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-add-batch-modal',
  templateUrl: './add-batch-modal.component.html',
  styleUrls: ['./add-batch-modal.component.scss']
})
export class AddBatchModalComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  batchForm : FormGroup = new FormGroup({})
  classList: any = []
  classTeacherList: any = []
  subjectList: any = []
  showSubjectError: boolean = false;
  @Input() batchData
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      private modalRef: NgbActiveModal,
      private _examService : ExamServiceService,
      private _formValidationService : FormValidationService,
      private _batchService : BatchService,
      private _toaster : Toastr
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getClasses()
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


  getClasses() {
    const paylaod = {
      user_id : window.localStorage.getItem('user_id'), 
    }

    this._examService.getClassFilterList(paylaod).pipe(takeUntil(this.$destroy))?.subscribe((res: any) => {
      if (res.status) {
        this.classList = res.data
        if (this.batchData && this.batchData.classes_id) {
          this.batchForm.controls['class_id'].patchValue(this.batchData.classes_id)
        }
      }
    })

    this._batchService.getClassTeacherList().pipe(takeUntil(this.$destroy))?.subscribe((res: any) => {
      if (res.status) {
        this.classTeacherList = []
        this.classTeacherList = res.data.map((ele) => {
          return {
            id: ele.id,
            name: ele.full_name
          }
        })
        this.classTeacherList.push({
            id: this.batchData.class_teacher.id,
            name: this.batchData.class_teacher.full_name
        });
        if (this.batchData && this.batchData.class_teacher_id) {
          this.batchForm.controls['class_teacher_id'].patchValue(this.batchData.class_teacher_id)
        }
        
        if(this.batchData.classes_id){
          this.batchForm.controls['subject_id'].patchValue(this.batchData.class_teacher_subject.subject_id)
        }
      }
    })
    this.getSubjects()
  }

  getSubjects(){
    this.batchForm.controls['subject_id'].patchValue(null);
    this.subjectList = [];
    const paylaod = {
      class_id : this.batchForm.controls['class_id'].value ?? this.batchData.classes_id ?? null
    }

    this._batchService.getClassWiseSubject(paylaod).pipe(takeUntil(this.$destroy))?.subscribe((res: any) => {
      if (res.status) {
        this.subjectList = res.data.map((ele) => {
          return {
            id: ele.subject_id,
            name: ele.subject_name
          }
        })
      }
    })
  }

  saveData() {
    if(this.batchForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.batchForm);
      return;
    }

    const batchOperation = this.batchData?.id
      ? this._batchService.updateBatch(this.batchForm.value, this.batchData.id)
      : this._batchService.createBatch(this.batchForm.value);

    batchOperation.pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this._toaster.showSuccess(res.message);
        this.modalRef.close({
          data: true
        })
      } else {
        this._toaster.showError(res.message)
      }
    }, (error) => {
      this._toaster.showError(error?.error?.message ?? error?.error?.error ?? error?.message ?? 'An unexpected error occurred')
    });

  }

  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
    initForm() {
      this.batchForm = this._fb.group({
        class_id: [this.batchData?.class_id ?? null,[Validators.required]],
        name : [this.batchData?.name ?? null,[Validators.required]],
        class_teacher_id : [this.batchData?.class_teacher_id ?? null],
        subject_id : [this.batchData?.class_teacher_subject ?? null],
      })

      this.batchForm.controls['class_teacher_id'].valueChanges.subscribe(value => {
        if (!value) {
          this.batchForm.controls['subject_id'].disable();
        } else {
          this.batchForm.controls['subject_id'].enable();
        }
      });
    
      if (!this.batchForm.controls['class_teacher_id'].value) {
        this.batchForm.controls['subject_id'].disable();
      }
    }

  //#endregion Private methods
}