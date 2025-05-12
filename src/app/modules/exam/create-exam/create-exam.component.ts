import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TransportService } from '../../transport-management/transport.service';
import { ExamServiceService } from '../exam-service.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-create-exam',
  templateUrl: './create-exam.component.html',
  styleUrls: ['./create-exam.component.scss']
})
export class CreateExamComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  createExamForm: FormGroup = new FormGroup({});
  sectionList: any = []
  classList: any = []
  batchList: any = []
  subjectList: any = []
  examTypeList: any = []
  examForm: FormGroup = new FormGroup({});
  examEditData
  examID: string | null = null
  isGradeRequired: boolean = false
  gradeList = []
  isCreateExam: boolean = false
  URLConstants = URLConstants;
  isCreateExamAndNew: boolean = false

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _transportService: TransportService,
    private _examService: ExamServiceService,
    private _formValidationService: FormValidationService,
    private _activatedRoute: ActivatedRoute,
    private toastr: Toastr,
    private _router: Router
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.examID = this._activatedRoute.snapshot.paramMap.get('id') || null
    this.getSectionList();
    this.getExamTypeList();
    this.initForm(null);
    if (this.examID) {
      this.getExamData(this.examID);
    }
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
    this.createExamForm.controls['class_id'].reset();
    this.createExamForm.controls['batch_id'].reset();
    this.classList = []
    this.batchList = []
    this.subjectList = []
    this.examInitForm(null);
    const section = this.createExamForm.value.section_id && this.createExamForm.value.section_id != "" ? this.createExamForm.value.section_id : null
    const paylaod = {
      user_id : window.localStorage.getItem('user_id'), 
      section_id : section,
    }
    this._examService.getClassFilterList(paylaod).pipe(takeUntil(this.$destroy))?.subscribe((res: any) => {
      if (res.status) {
        this.classList = res.data
        if (this.examEditData) {
          this.createExamForm.controls['class_id'].patchValue(this.examEditData.class_id[0]);
          this.getBatches();
        }
      } else {
        this.toastr.showError(res?.message)
      }
    })
  }

  getBatches() {
    if (!this.examID) {
      this.createExamForm.controls['batch_id'].reset();
    }
    this.batchList = []
    this.subjectList = []
    this.examInitForm(null);

    const classes = this.createExamForm.value ? this.createExamForm.value.class_id : ''
    if (classes) {
      const json = {
        class_id: classes
      }
      this._examService.getGradeList(json).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.gradeList = res.data
          if (this.examEditData) {
            this.createExamForm.controls['grade_id'].patchValue(this.examEditData.subjects[0].grade_id)
          }
        } else {
          this.toastr.showError(res?.message)
        }
      })

      const payload = {
        classes: [classes],
        hasStudents: true
      }
      this._transportService.getBatchesList(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.batchList = res.data
          if (this.examID) {
            let selectedBatch: any = []
            if (this.batchList.length > 0 && this.examEditData?.batch_ids.length > 0) {
              this.batchList.forEach(element => {
                if (this.examEditData.batch_ids.includes(element.id)) {
                  selectedBatch.push(element);
                }
              });
              this.createExamForm.controls['batch_id'].patchValue(selectedBatch)
            }
          }
        } else {
          this.toastr.showError(res?.message)
        }
        if (this.examID) {
          this.getSubjects();
        }
      })
    }
  }

  getSubjects() {
    this.subjectList = []
    const payload = {
      branchId : localStorage.getItem('branch'),
      academicYear : Number(('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]),
      batchId: this.createExamForm.value.batch_id ? this.createExamForm.value.batch_id.map(ele => ele.id) : []
    }
    if (payload?.batchId?.length > 0) {
      this._examService.getSubjectOnbatch(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.subjectList = res.data.map(ele => {
            return {
              name: ele.subject_name,
              id: ele.subject_id
            }
          });
          if (this.examEditData) {
            const existingSubjectIds = this.examEditData.subjects.map(exam => exam.subject_id);
            this.subjectList.forEach(subject => {
              if (!existingSubjectIds.includes(subject.id)) {
                this.examEditData.subjects.push({
                  subject_name: subject.name,
                  subject_id: subject.id,
                  is_checked: false
                });
              } else {
                const index = this.examEditData.subjects.findIndex(ele => ele.subject_id === subject.id)
                this.examEditData.subjects[index]['subject_name'] = subject.name
                this.examEditData.subjects[index]['is_checked'] = true
              }
            });
            this.examInitForm(this.examEditData.subjects);
            this.examEditData.subjects.forEach((element, i) => {
              this.formEnableDisable(element.is_checked, i)
              if (element.exam_marking_type === 2) {
                const index = this.examForm.value.subjects.findIndex(ele => ele.subject_id === element.subject_id)
                this.markTypeChange(element.exam_marking_type, index)
              }
            });
            this.selectAllCheck();
          } else {
            this.subjectList.forEach(element => {
              element['subject_id'] = element.id
              element['subject_name'] = element.name
            });
            this.examInitForm(this.subjectList);
          }
        } else {
          this.toastr.showError(res?.message)
        }
      })
    }
  }

  selectAllCheckbox(event: any) {
    this.examArray.controls.forEach((item: any, index) => {
      item.get('is_checked').patchValue(event.target.checked)
      this.formEnableDisable(event.target.checked, index)
    })
  }

  selectCheckbox(event: any, index: number) {
    this.formEnableDisable(event.target.checked, index)

    if (this.examForm.getRawValue().subjects[index].exam_marking_type == 2) {
      const validateKey = ['total_mark', 'passing_mark']

      validateKey.forEach(ele => {
        this.examArray.controls[index]['controls'][ele].disable();
      })
    }
    
    const resetKey = ['total_mark', 'passing_mark','start_date',"start_time","end_time","exam_topic","exam_marking_type"]

    if(!event.target.checked) {
      this.examArray.controls[index]['controls']['exam_marking_type'].patchValue(1)
      this.markTypeChange(1,index)

      resetKey.forEach(ele => {
        this.examArray.controls[index]['controls'][ele].reset();
      })

    } else if (this.examEditData.subjects.length > 0) {
      const data = this.examEditData.subjects[index]
      if(data){
        this.examArray.controls[index].patchValue({
          exam_marking_type: data.exam_marking_type,
          total_mark : data.total_mark,
          passing_mark : data.passing_mark,
          start_date: data.start_date ? moment(data.start_date,'DD-MM-YYYY hh:mm:ss A').format('YYYY-MM-DD') : null,
          start_time: data.start_time ? moment(data.start_time, 'DD-MM-YYYY hh:mm:ss A').format('HH:mm') : null,
          end_time: data.end_time ? moment(data.end_time, 'DD-MM-YYYY hh:mm:ss A').format('HH:mm') : null,
          exam_topic : data.exam_topic
        })
      }
    }

    this.selectAllCheck();
  }

  selectAllCheck() {
    const checkSelect = this.examForm.value.subjects.map(ele => ele.is_checked)
    if (checkSelect.includes(false)) {
      this.examForm.get('isSelectAll')?.patchValue(false)
    } else {
      this.examForm.get('isSelectAll')?.patchValue(true)
    }
  }


  formEnableDisable(flag: boolean, index: number) {

    for (let item in this.examArray.controls[index]['controls']) {
      if (flag) {
        this.examArray.controls[index]['controls'][item].enable()
      } else {
        this.examArray.controls[index]['controls'][item].disable()
      }
      this.examArray.controls[index]['controls']['is_checked'].enable()
      this.examArray.controls[index]['controls']['subject_name'].enable()
    }

  }

  createExam(is_new:boolean = false) {

    if (this.createExamForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.createExamForm);
      return;
    }

    if (this.examForm.invalid) {
      this.examArray.controls.forEach((formGroup: any) => {
        this._formValidationService.getFormTouchedAndValidation(formGroup)
      })
      return;
    }
    
    const payload = {
      ...this.createExamForm.value,
      // subjects: this.examForm.value.subjects.length > 0 ? this.examForm.value.subjects.filter(ele => ele.is_checked === true) : []
      subjects: this.examForm.getRawValue().subjects.length > 0 ? this.examForm.getRawValue().subjects.filter(ele => ele.is_checked === true) : []
    }
    
    payload.batch_id = this.createExamForm.value.batch_id?.length > 0 ? this.createExamForm.value.batch_id?.map(ele => ele.id) : []

    payload.subjects.forEach(element => {
      element.grade_id = payload.grade_id
      element.start_date = element.start_date ? moment(element.start_date).format('DD-MM-YYYY') : null
      element.start_time = element.start_time ? moment(element.start_time, 'HH:mm').format('h:mm A') : null
      element.end_time = element.end_time ? moment(element.end_time, 'HH:mm').format('h:mm A') : null
    });

    if(payload.subjects.length === 0) {
      this.toastr.showError('Please Add subject then You can Create or update exam');
      return
    }

    is_new ? this.isCreateExamAndNew = true : this.isCreateExam = true

    if (this.examID) {
      this._examService.editExam(payload, this.examID).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.isCreateExam = false
          this.isCreateExamAndNew = false
          this.toastr.showSuccess(res.message)
          this.goToExamList()
        } else {
          this.toastr.showError(res?.message)
        }
      },(error)=> {
        this.isCreateExam = false
        this.isCreateExamAndNew = false
        this.toastr.showError(error.error.message);
      })
    } else {
      this._examService.createExam(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.isCreateExam = false
          this.isCreateExamAndNew = false
          this.toastr.showSuccess(res.message)
          if(is_new){
            this.resetPage()
          }
          else{
            this.goToExamList()
          }
        }
      },(error)=> {
        this.isCreateExam = false
        this.isCreateExamAndNew = false
        this.toastr.showError(error.error.message);
      })
    }
  }

  resetPage(){
    this.resetcreateExamForm()
    this.resetExamForm()
    // exam_publish_date: [data?.exam_publish_date ?? moment().format('YYYY-MM-DD')],
  }
  resetcreateExamForm() {
    this.createExamForm.reset({
      section_id: '',
      class_id: null,
      batch_id: [],
      exam_name: null,
      exam_type_id: null,
      exam_type_name: null,
      description: null,
      grade_id: null,
    });
  }
  
  resetExamForm() {
    const subjectsArray = this.examForm.get('subjects') as FormArray;
    while (subjectsArray.length) {
      subjectsArray.removeAt(0);
    }
  
    this.examForm.reset({
      subjects: [],
      isSelectAll: true,
    });
  }

  markTypeChange(event, i) {
    const validateKey = ['total_mark', 'passing_mark']

    const examMarkingType = this.examForm.value.subjects.map(ele => ele.exam_marking_type)
    this.isGradeRequired = examMarkingType.includes(2) || examMarkingType.includes(3)
    if (this.isGradeRequired) {
      this.createExamForm.controls['grade_id'].setValidators([Validators.required])
    } else {
      this.createExamForm.controls['grade_id'].clearValidators()
    }

    this.createExamForm.controls['grade_id'].updateValueAndValidity();

    validateKey.forEach(ele => {
      if (event == 2) {
        this.examArray.controls[i]['controls'][ele].patchValue(null);
        this.examArray.controls[i]['controls'][ele].clearValidators();
        this.examArray.controls[i]['controls'][ele].disable();
      } else {
        if(this.examArray.value[i].is_checked) {
          this.examArray.controls[i]['controls'][ele].setValidators([Validators.required]);
          this.examArray.controls[i]['controls'][ele].enable();
        }
      }
      this.examArray.controls[i]['controls'][ele].updateValueAndValidity();
    })
  }

  gradeChange(event) {
    this.examArray.controls.forEach((formGroup: any) => {
      formGroup.controls['grade_id'].patchValue(event.id)
    })
  }

  getExamTypeList() {
    this._examService.getExamTypeList().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.examTypeList = res.data
      } else {
        this.toastr.showError(res?.message)
      }
    })
  }

  examTypeChange(event) {
    this.createExamForm.controls['exam_type_name'].patchValue(event.name)
  }

  goToExamList(data='list') {
    if(data == 'type') {
      this._router.navigate([`${window.localStorage.getItem('branch')}/${URLConstants.EXAM_TYPE_LIST}`]);
    } else if (data == 'grade') {
      this._router.navigate([`${window.localStorage.getItem('branch')}/${URLConstants.LIST_EXAM_GRADE}`]);
    } else {
      this._router.navigate([`${window.localStorage.getItem('branch')}/${URLConstants.EXAM_VIEW_LIST}`]);
    }
  }

  changeTotalMarks(event,control) {
    control.setValidators([Validators.max(Number(event)),Validators.pattern('^[0-9]*$')]);
    control.updateValueAndValidity();
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm(data) {
    this.createExamForm = this._fb.group({
      section_id: [data?.section_id[0] ?? ''],
      class_id: [data?.class_id[0] ?? null, [Validators.required]],
      batch_id: [data?.batch_ids ?? [], [Validators.required]],
      exam_name: [data?.exam_name ?? null, [Validators.required]],
      exam_type_id: [data?.exam_type_id ?? null, [Validators.required]],
      exam_type_name: [data?.exam_type_name ?? null],
      description: [data?.description ?? null , [Validators.maxLength(250)]],
      // exam_publish_date: [data?.exam_publish_date ?? moment().format('YYYY-MM-DD')],
      grade_id: [data?.grade_id ?? null],
    })
    this.examInitForm(null);
    this.createExamForm.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res) => {
      // if (this.createExamForm?.get('batch_id')) {
      this.createExamForm.controls['batch_id'].markAsPristine();
      this.createExamForm.controls['batch_id'].markAsUntouched();
      // }
    })
  }

  get examArray(): FormArray {
    return this.examForm.get("subjects") as FormArray
  }

  examInitForm(data) {
    this.examForm = this._fb.group({
      subjects: this._subFormArray(data),
      isSelectAll: [this.examID ? false : true]
    });
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
      subject_name: [data?.subject_name ?? ''],
      subject_id: [data?.subject_id ?? ''],
      exam_marking_type: [data?.exam_marking_type ?? 1],
      total_mark: [data?.total_mark ?? null, [Validators.required,Validators.min(0),Validators.pattern('^[0-9]*$')]],
      passing_mark: [data?.passing_mark ?? null, [Validators.pattern('^[0-9]*$'), Validators.required,Validators.min(0), Validators.max(data.total_marks)]],
      start_date: [data?.start_date ? moment(data?.start_date, 'DD-MM-YYYY hh:mm:ss A').format('YYYY-MM-DD') : null, [Validators.required]],
      start_time: [data?.start_time ? moment(data?.start_time, 'DD-MM-YYYY hh:mm:ss A').format("HH:mm") : null],
      end_time: [data?.end_time ? moment(data?.end_time, 'DD-MM-YYYY hh:mm:ss A').format("HH:mm") : null],
      exam_topic: [data?.exam_topic ?? null, [Validators.maxLength(250)]],
      is_checked: [data?.is_checked ?? true],
      grade_id: [data?.grade_id ?? null]
    },{ validator: this.passingMarkValidator() });
    return fa;
  }

  getSectionList() {
    const payload = {
      branch : localStorage.getItem('branch')
    }
    this._examService.getSectionFilterList(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        if (!this.examID) {
          this.sectionList = res.data
          this.getClasses() 
        }
        this.sectionList = [{ id: '', name: 'All Section' }].concat(res.data);
      }
    })
  }

  getExamData(id) {
    this._examService.getExamOnId(id).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.examEditData = res.data
        this.createExamForm.patchValue(this.examEditData);
        this.createExamForm.controls['class_id'].patchValue(this.examEditData.class_id[0]);
        this.createExamForm.controls['section_id'].patchValue(this.examEditData.section_id[0]);
        this.getClasses()
      }
    })
  }

  passingMarkValidator(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const totalMarkControl = formGroup.get('total_mark');
      const passingMarkControl = formGroup.get('passing_mark');
  
      if (!totalMarkControl || !passingMarkControl) {
        return null;
      }
      
      const totalMark = totalMarkControl.value;
      const passingMark = passingMarkControl.value;

      if (Number(passingMark) > Number(totalMark)) {
        return { 'passingMarkInvalid': true };
      }
  
      return null;
    };
  }

  //#endregion Private methods
}

