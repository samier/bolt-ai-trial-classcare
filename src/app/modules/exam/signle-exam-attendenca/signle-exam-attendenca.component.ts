import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../common-components/common.service';
import { ExamServiceService } from '../exam-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { status } from 'src/app/common-config/static-value';

@Component({
  selector: 'app-signle-exam-attendenca',
  templateUrl: './signle-exam-attendenca.component.html',
  styleUrls: ['./signle-exam-attendenca.component.scss']
})
export class SignleExamAttendencaComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  examAttendenceForm : FormGroup = new FormGroup({})
  examData : any
  examID :string | null = null
  allIds : any
  isStudent:boolean = false
  marksDataForm: FormGroup = new FormGroup({})
  subjectList:any = []
  batchList = []
  isAttendanceShow : boolean = false
  isTableShow:boolean = false
  subject_exam_id
  statusList:any = status
  

  loadingNdReset:boolean = false
  loadingNdRedirect:boolean = false
  is_queryParams : boolean = false

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      public examService : ExamServiceService,
      private _activatedRoute: ActivatedRoute,
      private _router : Router,
      private toastr: Toastr,
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.examID = this._activatedRoute.snapshot.paramMap.get('id') || null
    this._activatedRoute.queryParams.subscribe(params => {
      this.allIds = params
      Object.keys(this.allIds)?.length == 0 ? this.is_queryParams = false : this.is_queryParams = true
      if (this.examID) {
        this.getExam(this.examID);
        this.initAttendenceForm(null);
      }
    });
    // if(!this.examData){
    //   this._router.navigate([`${window.localStorage.getItem('branch')}/exam/view/${this.examID}`])
    // } else {
    // }
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  get attendanceArray(): FormArray {
    return this.examAttendenceForm.get("attendance") as FormArray
  }

  saveAttendance(is_reset:boolean=false) {
    const payload = {
      main_exam_id : this.examID,
      subject_exam_id : this.allIds.sub_exam_id ? this.allIds.sub_exam_id : this.subject_exam_id,
      subject_id : this.marksDataForm.getRawValue().subject_id,
      batch_id : this.marksDataForm.getRawValue().batch_id,
      attendance : this.examAttendenceForm.value.attendance
    }
    is_reset ? this.loadingNdReset = true : this.loadingNdRedirect = true
    
    this.examService.storeStudentAttendence(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if (res.status) {
        this.toastr.showSuccess(res.message);
        this.loadingNdReset = false 
        this.loadingNdRedirect = false
        
        if(is_reset){
          this.clearData()
        }
        else{
          this.goToViewPage();
        }
      } else {
        this.toastr.showError(res?.message)
      }
    },(error)=> {
      this.toastr.showError(error?.error?.message ?? error?.message)
    })
  }

  goToViewPage() {
    this._router.navigate([`${window.localStorage.getItem('branch')}/exam/view/${this.examID}`])
  }

  clearData() {
    this.isTableShow = false
    this.marksDataForm.reset();
    this.examAttendenceForm.reset();
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
    initForm(data) {
      this.examAttendenceForm = this._fb.group({
        attendance: this._subFormArray(data)
      })
    }
  
    private _subFormArray(data): FormArray {
      const formArry: any = this._fb.array([]);
      if (data?.length > 0) {
        data.forEach((ele: any, index) => {
          formArry.push(this._subArrayGroup(ele, index));
        });
      }
  
      return formArry;
    }
  
    private _subArrayGroup(data: any, i) {
      const fa: FormGroup = this._fb.group({
        gr_number : [data?.gr_number ?? '' ],
        roll_no: [data?.roll_no ?? ''],
        student_id: [data?.student_id ?? ''],
        student_name: [data?.student_name ?? ''],
        status: [data?.status ?? ''],
        type: [data?.type != '' ? data?.type : 'p'],
      });
      return fa;
    }

    getStudentOnBatches() {
      this.subject_exam_id  = this.examData.batch_wise_exam.find(ele => (ele.batch_id == this.marksDataForm.getRawValue().batch_id) && (ele.subject_id == this.marksDataForm.getRawValue().subject_id))?.subject_exam_id
      if (!this.subject_exam_id) {
        this.toastr.showError('Subject exam not found');
        this.isTableShow = false
        this.examAttendenceForm.reset();
        return;
      }
      this.isStudent = true
      this.isAttendanceShow = true
      const payload = {
        main_exam_id : this.examID,
        subject_exam_id : this.allIds.sub_exam_id ? this.allIds.sub_exam_id : this.subject_exam_id,
        subject_id : this.marksDataForm.getRawValue().subject_id,
        batch_id : this.marksDataForm.getRawValue().batch_id,
        status : this.marksDataForm.getRawValue().status
      }
      this.examService.getStudentOnAttendence(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        this.isStudent = false
        this.isAttendanceShow = false
        if (res.status) {
          this.isTableShow = true
          // this.subject_exam_id = res?.data?.subject_exam_id
          // this.examData = res.data
          this.examData.attendance = res.data.attendance.sort((a,b) => a.roll_no - b.roll_no )
          this.initForm(this.examData.attendance);
        } else {
          this.toastr.showError(res.message);
        }
      }, (error)=>{
        this.toastr.showError(error?.error?.message ?? error?.message)
        this.isStudent = false
        this.isAttendanceShow = false
      })
    }

    initAttendenceForm(data) {
      this.marksDataForm = this._fb.group({
        batch_id: [data?.batch_id ?? [],[Validators.required]],
        exam_id: this.examID,
        subject_id: [data?.subject_id ?? [],[Validators.required]],
        status : [1,[Validators.required]]
      })
  
      this.marksDataForm.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res) => {
        this.marksDataForm.controls['batch_id'].markAsPristine();
        this.marksDataForm.controls['batch_id'].markAsUntouched();
        this.marksDataForm.controls['subject_id'].markAsPristine();
        this.marksDataForm.controls['subject_id'].markAsUntouched();
      })
    }

    getExam(id) {
      this.examService.getExamOnId(id).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.examData = res.data
  
          this.batchList = this.examData.batch_details.map(ele => {
            return {id:ele.batch_id,name:ele.batch_name}
          })
          this.subjectList = this.examData.subjects.map((ele:any) => {
            return {id :ele.subject_id,name:ele.subject_name,...ele}
          })
  
          this.subjectList.forEach((ele)=> {
            ele.id = ele.subject_id
            ele['name'] = ele.subject_name
          })
  
          if(this.allIds.batch_id && this.allIds.subject_id) {
            this.marksDataForm.controls['batch_id'].patchValue(Number(this.allIds.batch_id))
            this.marksDataForm.controls['batch_id'].disable()
            this.marksDataForm.controls['subject_id'].patchValue(Number(this.allIds.subject_id));
            this.marksDataForm.controls['subject_id'].disable()
            this.getStudentOnBatches()
          }
        } else {
          this.toastr.showError(res?.message)
        }
      },(error)=> {
        this.toastr.showError(error?.error?.message ?? error?.message)
      })
    }
	
  //#endregion Private methods
}