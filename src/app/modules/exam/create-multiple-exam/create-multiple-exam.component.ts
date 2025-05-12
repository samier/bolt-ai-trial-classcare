import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../../transport-management/transport.service';
import { ExamServiceService } from '../exam-service.service';
import { CommonService } from 'src/app/core/services/common.service';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-create-multiple-exam',
  templateUrl: './create-multiple-exam.component.html',
  styleUrls: ['./create-multiple-exam.component.scss']
})
export class CreateMultipleExamComponent implements OnInit {
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
  grade = []
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
    private _router: Router,
    public _dateFormateService: DateFormatService
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
    this.examInitForm(null);
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
    this.resetExamForm()
    const section = this.createExamForm.value.section_id && this.createExamForm.value.section_id != "" ? this.createExamForm.value.section_id : null
    const paylaod = {
      user_id: window.localStorage.getItem('user_id'),
      section_id: section,
    }
    this._examService.getClassFilterList(paylaod).pipe(takeUntil(this.$destroy))?.subscribe((res: any) => {
      if (res.status) {
        this.classList = res.data
        if (this.examEditData) {
          this.createExamForm.controls['class_id'].patchValue(this.examEditData.class_id[0]);
          this.getBatchesAndSubjectList();
        }
      } else {
        this.toastr.showError(res?.message)
      }
    })
  }


  getBatchesAndSubjectList() {
    this.batchList = []
    this.subjectList = []
    this.createExamForm.controls['batch_id'].reset();
    this.resetExamForm();

    const payload = {
      class_id: this.createExamForm.value.class_id?.length > 0 ? this.createExamForm.value.class_id.map(ele => ele.id) : []
    }

    if (payload.class_id.length > 0) {
      this._examService.getMultipleClassOnSubject(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.subjectList = res.data
          const batchData: any[] = []
          this.subjectList.forEach(element => {
            batchData.push(...element.batch)
          });
          this.batchList = batchData
          this.examInitForm(this.subjectList);
        } else {
          this.toastr.showError(res?.message)
        }
      },(error) => {
        this.toastr.showError(error?.error ?? error?.error.errors ?? error?.error.message)
      })
    }
  }

  getClassFormGroup(index: number): FormGroup {
    return this.classesArray.at(index) as FormGroup
  }

  formEnableDisable(flag: boolean, classIndex: number, subjectIndex: number) {
    const subjectForm = (this.classesArray.at(classIndex).get('subjects') as FormArray).at(subjectIndex) as FormGroup;

    Object.keys(subjectForm.controls).forEach(key => {
      if (flag) {
        subjectForm.get(key)?.enable();
      } else {
        subjectForm.get(key)?.disable();
      }
    });

    // Ensure 'is_checked' and 'subject_name' remain enabled at all times
    subjectForm.get('is_checked')?.enable();
    subjectForm.get('subject_name')?.enable();
  }

  removeGradeList(classes: any[]): any[] {
    return classes.map(({ grade, ...rest }) => rest);
  }

  createExam(is_new: boolean = false) {

    if (this.createExamForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.createExamForm);
      return;
    }

    if (this.examForm.invalid) {
      this.classesArray.controls.forEach((formGroup: any) => {
        this._formValidationService.getFormTouchedAndValidation(formGroup);
        const subjectArray = formGroup.get('subjects') as FormArray;
        subjectArray.controls.forEach((formGroup: any) => {
          this._formValidationService.getFormTouchedAndValidation(formGroup);
        })
      })
      return;
    }

    let updatedData = this.removeGradeList(this.examForm.value.classes);

    updatedData.forEach(ele => {
      ele.subjects = ele?.subjects?.filter(subject => subject.is_checked) || [];
      ele.subjects.forEach(subject => {
        subject.grade_id = ele.grade_id;
      });
    
      if (ele.batch_id?.length) {
        const selectedBatch = this.createExamForm.value.batch_id?.map(batch => batch.id) || [];
        ele.batch_id = ele.batch_id.filter(batch => selectedBatch.includes(batch.id)).map(batch => batch.id);
      } else {
        ele.batch_id = [];
      }
    });

    const payload = {
      ...this.createExamForm.value,
      exams: updatedData
    }

    delete (payload.batch_id)
    delete (payload.class_id)

    payload.exams.forEach((ele) => {
      ele.subjects.forEach(element => {
        element.start_date = element.start_date ? moment(element.start_date).format('DD-MM-YYYY') : null
        element.start_time = element.start_time ? moment(element.start_time, 'HH:mm').format('h:mm A') : null
        element.end_time = element.end_time ? moment(element.end_time, 'HH:mm').format('h:mm A') : null
      });
    })

    is_new ? this.isCreateExamAndNew = true : this.isCreateExam = true

    // return
    this._examService.createMultipleExam(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.isCreateExam = false
        this.isCreateExamAndNew = false
        this.toastr.showSuccess(res.message)
        if (is_new) {
          this.resetPage()
        }
        else {
          this.goToExamList()
        }
      }
    }, (error) => {
      this.isCreateExam = false
      this.isCreateExamAndNew = false
      this.toastr.showError(error.error.message);
    })

  }


  resetPage() {
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
    this.examForm.reset();
    this.classesArray.controls = []
  }

  markTypeChange(event: any, classIndex: number, subjectIndex: number) {

    const validateKey = ['total_mark', 'passing_mark'];

    // Get the current class and subject
    const classGroup = this.classesArray.at(classIndex) as FormGroup;
    const subjectsArray = classGroup.get('subjects') as FormArray;
    const subjectControl = subjectsArray.at(subjectIndex) as FormGroup;

    // Check if grading is required
    const examMarkingTypes = this.classesArray.controls.flatMap(classCtrl =>
      (classCtrl.get('subjects') as FormArray).controls.map(subject => subject.get('exam_marking_type')?.value)
    );

    const isRequired = examMarkingTypes.includes(2) || examMarkingTypes.includes(3)
    classGroup.controls['isGradeRequired']?.patchValue(isRequired);

    if (classGroup.value.isGradeRequired) {
      classGroup.controls['grade_id'].setValidators([Validators.required]);
    } else {
      classGroup.controls['grade_id'].clearValidators();
    }
    classGroup.controls['grade_id'].updateValueAndValidity();

    // Apply validation and enable/disable logic
    validateKey.forEach(key => {
      if (event == 2) {
        subjectControl.get(key)?.patchValue(null);
        subjectControl.get(key)?.clearValidators();
        subjectControl.get(key)?.disable();
      } else {
        if (subjectControl.get('is_checked')?.value) {
          subjectControl.get(key)?.setValidators([Validators.required]);
          subjectControl.get(key)?.enable();
        }
      }
      subjectControl.get(key)?.updateValueAndValidity();
    });
  }

  gradeChange(event) {
    this.subjectArray.controls.forEach((formGroup: any) => {
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

  goToExamList(data = 'list') {
    if (data == 'type') {
      this._router.navigate([`${window.localStorage.getItem('branch')}/${URLConstants.EXAM_TYPE_LIST}`]);
    } else if (data == 'grade') {
      this._router.navigate([`${window.localStorage.getItem('branch')}/${URLConstants.LIST_EXAM_GRADE}`]);
    } else {
      this._router.navigate([`${window.localStorage.getItem('branch')}/${URLConstants.EXAM_VIEW_LIST}`]);
    }
  }

  changeTotalMarks(event, control, classIndex, subjectIndex) {
    const marks = event?.target?.value
    const subIndex = this.examForm?.value?.classes[0].subjects.findIndex(ele => ele.exam_marking_type != 2 && ele.is_checked) ?? 0
    if (classIndex === 0 && subjectIndex === subIndex) {
      this.classesArray.controls.forEach((classGroup) => {
        const subjectsArray = classGroup.get('subjects') as FormArray;
        subjectsArray.controls.forEach((ele) => {
          if (ele.value.exam_marking_type != 2 && ele.value.is_checked) {
            ele.get('total_mark')?.patchValue(marks)
          }
        })
      })
    }
    control.setValidators([Validators.max(Number(event)), Validators.pattern('^[0-9]*$')]);
    control.updateValueAndValidity();
  }

  changePassingMarks(event, classIndex, subjectIndex) {
    const marks = event?.target?.value
    const subIndex = this.examForm?.value?.classes[0].subjects.findIndex(ele => ele.exam_marking_type != 2 && ele.is_checked) ?? 0
    if (classIndex === 0 && subjectIndex === subIndex) {
      this.classesArray.controls.forEach((classGroup) => {
        const subjectsArray = classGroup.get('subjects') as FormArray;
        subjectsArray.controls.forEach((ele) => {
          if (ele.value.exam_marking_type != 2 && ele.value.is_checked) {
            ele.get('passing_mark')?.patchValue(marks)
          }
        })
      })
    }
  }

  timeChange(event, controlName, classIndex, subjectIndex) {
    const time = event?.target?.value
    const subIndex = this.examForm?.value?.classes[0].subjects.findIndex(ele => ele.is_checked) ?? 0
    if (classIndex === 0 && subjectIndex === subIndex) {
      this.classesArray.controls.forEach((classGroup) => {
        const subjectsArray = classGroup.get('subjects') as FormArray;
        subjectsArray.controls.forEach((ele) => {
          // ele.value.exam_marking_type != 2 && 
          if (ele.value.is_checked) {
            ele.get(controlName)?.patchValue(time)
          }
        })
      })
    }
  }

  clearReactiveDate(control) {
    control?.setValue(null); // Clears the selected date in reactive form
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
      description: [data?.description ?? null, [Validators.maxLength(250)]],
      // exam_publish_date: [data?.exam_publish_date ?? moment().format('YYYY-MM-DD')],
      // grade_id: [data?.grade_id ?? null],
    })
    // this.examInitForm(null);
    // this.examInitForm(this.subjectList);
    this.createExamForm.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res) => {
      if (this.createExamForm?.get('batch_id')) {
        this.createExamForm.controls['batch_id'].markAsPristine();
        this.createExamForm.controls['batch_id'].markAsUntouched();
      }
      if (this.createExamForm?.get('class_id')) {
        this.createExamForm.controls['class_id'].markAsPristine();
        this.createExamForm.controls['class_id'].markAsUntouched();
      }
    })
  }


  get subjectArray(): FormArray {
    return this.examForm.get("subjects") as FormArray
  }

  get classesArray(): FormArray {
    return this.examForm.get('classes') as FormArray;
  }


  examInitForm(data) {
    this.examForm = this._fb.group({
      classes: this._classFormArray(data),
    });
  }

  private _classFormArray(data): FormArray {
    const formArry: any = this._fb.array([]);
    if (data?.length > 0) {
      data.forEach((classData: any, index) => {
        formArry.push(this._classArrayGroup(classData, index));
      });
    }
    return formArry;
  }

  private _classArrayGroup(classData: any, i) {
    return this._fb.group({
      class_id: [classData?.class_id ?? null],
      class_name: [classData?.class_name ?? ''],
      grade_id: [classData?.grade_id ?? null],
      isGradeRequired: [false],
      grade: [classData?.grade ?? null],
      batch_id: [classData?.batch ?? null],
      subjects: this._subFormArray(classData.subjects)
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
      subject_id: [data?.id ?? ''],
      exam_marking_type: [data?.exam_marking_type ?? 1],
      total_mark: [data?.total_mark ?? null, [Validators.required, Validators.min(0), Validators.pattern('^[0-9]*$')]],
      passing_mark: [data?.passing_mark ?? null, [Validators.pattern('^[0-9]*$'), Validators.required, Validators.min(0), Validators.max(data.total_marks)]],
      start_date: [data?.start_date ? moment(data?.start_date, 'DD-MM-YYYY hh:mm:ss A').format('YYYY-MM-DD') : null, [Validators.required]],
      start_time: [data?.start_time ? moment(data?.start_time, 'DD-MM-YYYY hh:mm:ss A').format("HH:mm") : null],
      end_time: [data?.end_time ? moment(data?.end_time, 'DD-MM-YYYY hh:mm:ss A').format("HH:mm") : null],
      exam_topic: [data?.exam_topic ?? null, [Validators.maxLength(250)]],
      is_checked: [data?.is_checked ?? true],
      grade_id: [data?.grade_id ?? null]
    }, { validator: this.passingMarkValidator() });
    return fa;
  }

  selectAllCheckbox(event: any) {
    const isChecked = event.target.checked;
    this.classesArray.controls.forEach((classGroup, classIndex) => {
      const subjectsArray = (classGroup as FormGroup).get('subjects') as FormArray;
      subjectsArray.controls.forEach((subject, subjectIndex) => {
        subject.get('is_checked')?.patchValue(isChecked);
        this.formEnableDisable(isChecked, classIndex, subjectIndex);
      });
    });
  }

  // Select/Deselect all subjects for a specific class
  selectClassCheckbox(event: Event, classIndex: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const classGroup = this.classesArray.at(classIndex) as FormGroup;
    const subjectsArray = classGroup.get('subjects') as FormArray;

    subjectsArray.controls.forEach((subject, subjectIndex) => {
      subject.get('is_checked')?.setValue(isChecked);
      this.formEnableDisable(isChecked, classIndex, subjectIndex)
      if (isChecked && subject.value.exam_marking_type) {
        this.markTypeChange(subject.value.exam_marking_type, classIndex, subjectIndex)
      }
    });

  }

  // Select/Deselect individual subject checkboxes
  selectCheckbox(event: any, classIndex: number, subjectIndex: number) {
    const isChecked = event.target.checked;
    this.formEnableDisable(isChecked, classIndex, subjectIndex);

    const subjectForm = this.classesArray.at(classIndex).get('subjects') as FormArray;
    const selectedSubject = subjectForm.at(subjectIndex) as FormGroup;

    if (isChecked) {
      // Restore exam data if available
      if (this.examEditData?.subjects?.length > 0) {
        const data = this.examEditData.subjects.find(ele => ele.subject_id === selectedSubject.get('subject_id')?.value);
        if (data) {
          selectedSubject.patchValue({
            exam_marking_type: data.exam_marking_type,
            total_mark: data.total_mark,
            passing_mark: data.passing_mark,
            start_date: data.start_date ? moment(data.start_date, 'DD-MM-YYYY hh:mm:ss A').format('YYYY-MM-DD') : null,
            start_time: data.start_time ? moment(data.start_time, 'DD-MM-YYYY hh:mm:ss A').format('HH:mm') : null,
            end_time: data.end_time ? moment(data.end_time, 'DD-MM-YYYY hh:mm:ss A').format('HH:mm') : null,
            exam_topic: data.exam_topic
          });
        }
      }
    } else {
      // Reset values if unchecked
      selectedSubject.patchValue({ exam_marking_type: 1 }); // Default to 'Marks'
      this.markTypeChange(1, classIndex, subjectIndex);

      const resetKeys = ['total_mark', 'passing_mark', 'start_date', 'start_time', 'end_time', 'exam_topic'];
      resetKeys.forEach(field => {
        selectedSubject.get(field)?.reset();
      });
    }

    // Disable fields if exam marking type is Grade
    if (selectedSubject.get('exam_marking_type')?.value == 2) {
      ['total_mark', 'passing_mark'].forEach(field => {
        selectedSubject.get(field)?.disable();
      });
    }

    // this.updateSelectAllState();
  }

  // Check if all subjects in a class are selected
  isClassSelected(classIndex: number): boolean {
    const classGroup = this.classesArray.at(classIndex) as FormGroup;
    const subjectsArray = classGroup.get('subjects') as FormArray;
    return subjectsArray.controls.every(subject => subject.get('is_checked')?.value);
  }

  // Check if all classes and subjects are selected
  isAllSelected(): boolean {
    return this.classesArray.controls.every(classGroup => {
      const subjectsArray = classGroup.get('subjects') as FormArray;
      return subjectsArray.controls.every(subject => subject.get('is_checked')?.value);
    });
  }

  getSectionList() {
    const payload = {
      branch: localStorage.getItem('branch')
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
