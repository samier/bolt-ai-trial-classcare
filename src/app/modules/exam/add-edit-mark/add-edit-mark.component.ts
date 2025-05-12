import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common-components/common.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { TransportService } from '../../transport-management/transport.service';
import { ExamServiceService } from '../exam-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { status } from 'src/app/common-config/static-value';
import { IDropdown } from 'src/app/types/interfaces';

@Component({
  selector: 'app-add-edit-mark',
  templateUrl: './add-edit-mark.component.html',
  styleUrls: ['./add-edit-mark.component.scss']
})
export class AddEditMarkComponent implements OnInit {
 
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  enterMarksForm: FormGroup = new FormGroup({})
  marksDataForm: FormGroup = new FormGroup({})

  subjectList:any = []
  batchList = []
  selectedSubject:any = []
  examData: any
  studentList = []
  gradeList:any = []
  // examId: number | string = 0
  isTableShow : boolean = false
  examID : string | null = null
  isMarkField : boolean = false
  isMarkShow : boolean = false
  isDisabled : boolean = false
  allIds
  isUpdate : boolean = false
  isCheckAttendance = false

  isMarkFieldAndNew : boolean = false
  is_queryParams : boolean = false

  statusList:any = status
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _formValidationService:FormValidationService,
    private _transportService:TransportService,
    public examService:ExamServiceService,
    private _activatedRoute:ActivatedRoute,
    private _toaster: Toastr,
    private _router: Router
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.examID = this._activatedRoute.snapshot.paramMap.get('id') || null
    this._activatedRoute.queryParams.subscribe(params => {
      this.allIds = params
      Object.keys(this.allIds)?.length == 0 ? this.is_queryParams = false : this.is_queryParams = true
    });
    if (this.examID) {
      this.getExam(this.examID);
      this.initForm(null);
    }
    this.checkAttendance()
    // this.getBatches();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  get studentArray(): FormArray {
    return this.enterMarksForm.get("marks") as FormArray
  }

  subjectArray(index: number): FormArray {
    return this.studentArray.at(index).get("subject_marks") as FormArray;
  }

  subjectTitleArray(index: number): any {
    if (this.studentArray.controls.length){
      return (this.studentArray.at(index) as FormGroup).get('subject_marks') as FormArray;
    }
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
          const subject = this.subjectList.find(ele => ele.id == this.allIds.subject_id);
          this.marksDataForm.controls['subject_id'].patchValue([subject]);
          this.isDisabled = true
          this.showData()
        }
      }
    })
  }

  saveMarks(is_reset:boolean=false) {
    if (this.enterMarksForm.valid) {
      const payload = {
        ...this.marksDataForm.value,
        ...this.enterMarksForm.value
      }

      this.allIds.batch_id ? payload.batch_id = this.allIds.batch_id : ''     
      payload.subject_id = payload.subject_id.map(ele => ele.id)
      payload.marks.forEach((ele) => {
        ele.subject_marks.forEach((mark) => {
          if ((mark.grade_details_id == null || mark.grade_details_id == 0)  && (mark.subject_mark == null || mark.subject_mark == 0)) {
            mark.subject_mark = 0
            mark.is_absent = true
          }
          else if (mark.grade_details_id) {
            mark.subject_mark = 0
            mark.is_absent = false
          } 
          // After Last Discussed
          else {
            mark.is_absent = false
          }

          if (mark.is_present && this.isCheckAttendance) {
            mark.is_absent = false
          }

          // After Last Discussed
          if (mark.is_absent) {
            mark.is_present = false
          } else {
            mark.is_present = true
          }

        })
        let filteredSubjects = ele.subject_marks.filter(subject => subject.is_optional !== 0);
        ele.subject_marks = filteredSubjects
      })

      payload.marks = payload.marks.filter(ele => ele.subject_marks.length > 0);

      is_reset ? this.isMarkFieldAndNew = true : this.isMarkField = true

      this.examService.markStore(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        this.isMarkField = false
        this.isMarkFieldAndNew = false
        if (res.status) {
          this._toaster.showSuccess(res.message)
          if(is_reset){
            this.clearData()
          }
          else{
            this.goToListPage()
          }
        } else {
          this._toaster.showError(res?.message)
        }
      }, (error) => {
        this._toaster.showError(error?.error?.message ?? error?.message)
        this.isMarkField = false
        this.isMarkFieldAndNew = false
      })
    }

  }

  showData() {
    if (this.marksDataForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.marksDataForm)
      return;
    }

    // this.selectedSubject = this.marksDataForm.getRawValue().subject_id.map(selected => {
    //   const fullDetails = this.subjectList.find(subject => subject.id === selected.id);
    //   return fullDetails ;
    // });

    // this.selectedSubject = this.selectedSubject.sort((a,b) => {return a.id - b.id}); 

    const payload = {
      ...this.marksDataForm.getRawValue(),
      exam_id : this.examID
    }
    
    payload.subject_id = payload.subject_id.map(ele => ele.id)
    
    this.isMarkShow = true
      
      this.examService.getStudentOnMark(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        this.isMarkShow = false
        if (res.status) {
          this.isTableShow = true
          res.data.grade_id ? this.getBranchDetails(res.data.grade_id) : null
          if(this.allIds.batch_id && this.allIds.subject_id) {
            res.data.marks.forEach((ele) => {
              let filteredSubjects = ele.subject_marks.filter(subject => subject.is_optional !== 0);
              ele.subject_marks = filteredSubjects
            })
  
            res.data.marks = res.data.marks.filter(ele => ele.subject_marks.length > 0);
          }
          
          this.isUpdate = res.data.marks.some(student => 
            student.subject_marks.some(mark => mark.subject_mark !== null && mark.subject_mark > 0)
          );

          if(res.data.marks.length > 0){
            this.examMarks(res.data.marks);
            this.isCheckAll(res.data.marks)
          } else {
            this.examMarks(null);
          }
      } else {
        this._toaster.showError(res?.message)
      }
    },(error)=> {
      this._toaster.showError(error?.error?.message ?? error?.message)
      this.isMarkShow = false
    })
  }

  clearData() {
    this.isTableShow = false
    this.enterMarksForm.reset();

    this.marksDataForm.controls['batch_id'].patchValue([])
    this.marksDataForm.controls['exam_id'].patchValue(this.examID)
    this.marksDataForm.controls['subject_id'].patchValue([])
  }

  getBatches() {
    const payload = {
      classes: [this.examData.class_id]
    }
    this._transportService.getBatchesList(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.batchList = this.examData.batch_id.map(id => {
        const fullDetails = res.data.find(subject => subject.id === id);
        return fullDetails ;
      });
    })
  }

  goToListPage() {
    if(this.allIds.batch_id && this.allIds.subject_id) {
      this._router.navigate([`${window.localStorage.getItem('branch')}/exam/view/${this.examID}`])
    } else {
      this._router.navigate([`${window.localStorage.getItem('branch')}/exam/list`])
    }
  }

  editMarks(i,j) {
    this.subjectArray(i).controls[j]['controls'].is_present.patchValue(true)
  }

  allEditEnable(i) {
    this.subjectTitleArray(0).controls[i]['controls'].all_present.patchValue(true)
    this.studentArray.controls.forEach((control,index)=>{
      this.subjectTitleArray(index).controls.forEach((control,index)=>{
        if (index == i) {
          control['controls'].is_present.patchValue(true)
        }
      })
    })
  }

  isCheckAll(newData) {

    const data = newData
    const subjectGroups = {};

    data.forEach((student) => {
      student.subject_marks.forEach((subject) => {
        const { subject_id, subject_name, is_present } = subject;
        if (!subjectGroups[subject_id]) {
          subjectGroups[subject_id] = {
            subject_name,
            all_present: true,  // Assume all are present initially
          };
        }
        if (!is_present) {
          subjectGroups[subject_id].all_present = false;
        }
      });
    });

    const result = Object.values(subjectGroups);
    result.forEach((ele: any, index) => {
      this.subjectTitleArray(0).controls[index]['controls'].all_present.patchValue(ele.all_present)
    })

  }

  handleMarksEnter(subject:any,i:any){
    if(this.studentArray?.value?.[i]?.roll_no == '' && ![null,'',undefined].includes(subject?.value?.subject_mark)){
      subject.get('subject_mark').setValue(null);
      this._toaster.showError('Student roll number is required to enter')
    }
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm(data) {
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

  examMarks(data) {
    this.enterMarksForm = this._fb.group({
      marks: this._subFormArray(data)
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
      gr_number: [data?.gr_number ?? ''],
      roll_no: [data?.roll_no ?? ''],
      student_id: [data?.student_id ?? ''],
      status: [data?.status ?? ''],
      student_name: [data?.student_name ?? ''],
      subject_marks: this._subToSubFormArray(data.subject_marks ?? null)
    });
    return fa;
  }

  private _subToSubFormArray(data): FormArray {
    const formArry: any = this._fb.array([]);
    if (data?.length > 0) {
      data.forEach((ele: any, index) => {
        formArry.push(this._subtosubArrayGroup(ele, index));
      });
    }

    return formArry;
  }


  // private _subtosubArrayGroup(data: any, i) {
  //   const fa: FormGroup = this._fb.group({
  //     subject_exam_id: [data?.subject_exam_id],
  //     subject_name: [data?.subject_name],
  //     total_mark: [data?.total_mark],
  //     passing_mark: [data?.passing_mark],
  //     grade_details_id: [data?.grade_details_id ?? null],
  //     exam_marking_type: [data?.exam_marking_type],
  //     subject_id: [data?.subject_id ?? ''],
  //     subject_mark: [data?.subject_mark ?? null, [Validators.min(0), Validators.max(data.total_mark)]],
  //     is_absent: [data.is_absent ?? false],
  //     is_present: [data.is_present ?? null],
  //     all_present: [false],
  //     is_optional: [data.is_optional ?? null],
  //     start_date: [data.start_date ?? null]
  //   });
  //   return fa;
  // }

  private _subtosubArrayGroup(data: any, i: number): FormGroup {
    const fa: FormGroup = this._fb.group({
      subject_exam_id: [data?.subject_exam_id],
      subject_name: [data?.subject_name],
      total_mark: [data?.total_mark],
      passing_mark: [data?.passing_mark],
      grade_details_id: [data?.grade_details_id ?? null],
      exam_marking_type: [data?.exam_marking_type],
      subject_id: [data?.subject_id ?? ''],
      subject_mark: [data?.subject_mark ?? null], // no validators initially
      is_absent: [data.is_absent ?? false],
      is_present: [data.is_present ?? null],
      all_present: [false],
      is_optional: [data.is_optional ?? null],
      start_date: [data.start_date ?? null]
    });
  
    // Function to set or clear validators based on exam_marking_type
    const updateSubjectMarkValidators = (type: number) => {
      const control:any = fa.get('subject_mark');
      if (type === 1 || type === 3) {
        control.clearValidators();
      } else {
        control.setValidators([Validators.min(0), Validators.max(data.total_mark)]);
      }
      control.updateValueAndValidity();
    };
  
    // Initial validator setup
    updateSubjectMarkValidators(data?.exam_marking_type);
  
    return fa;
  }

  getBranchDetails(id) {
    this.examService.getGradeListOnId(id).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if(res.status) {
        this.gradeList = [{id:null,name:'select grade'}, ...res.data]
      } else {
        this._toaster.showError(res?.message)
      }
    })
  }

  checkAttendance() {
    this.examService.getNotification().pipe(takeUntil(this.$destroy)).subscribe((res:any) => {
      if(res.status) {
        this.isCheckAttendance = res.data.exam_attendance ? false : true
      } else {
        this._toaster.showError(res?.message)
      }
    });
  }

  //#endregion Private methods
}