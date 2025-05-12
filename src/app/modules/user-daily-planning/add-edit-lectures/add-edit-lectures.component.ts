import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HomeworkService } from '../../homework/homework.service';
import { UserDailyPlanningService } from '../user-daily-planning.service';
import { lectureStatus } from 'src/app/common-config/static-value';
import { BatchService } from '../../batch/batch.service';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';
import { ResultService } from '../../result/result.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';

@Component({
  selector: 'app-add-edit-lectures',
  templateUrl: './add-edit-lectures.component.html',
  styleUrls: ['./add-edit-lectures.component.scss']
})
export class AddEditLecturesComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  addLectureForm : FormGroup = new FormGroup({});
  @ViewChild('file') fileSelect!: ElementRef;
  user_id: any = window.localStorage.getItem('user_id');
  user_role: any = window.localStorage.getItem('role');  
  URLConstants = URLConstants;
  currentAcademicYear: any;
  minDate: any;
  maxDate: any;
  hasLectureID: any;
  chapter_id: any;
  sectionsList: any = [];
  classList: any = [];
  batchList: any = [];
  facultiesList: any = [];
  subjectList: any = [];
  chapterList: any = [];
  statusList: any = lectureStatus;
  isSaveLoading: boolean = false;
  lectureCompleted: boolean = false;

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public CommonService: CommonService,
    private _fb : FormBuilder,
    private activatedRouteService: ActivatedRoute,
    private homeWorkService: HomeworkService,
    private userDailyPlanningService: UserDailyPlanningService,
    private batchService: BatchService,
    private toastr: Toastr,
    private router: Router,
    private resultService: ResultService,
    private formValidationService: FormValidationService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getSectionsList();
    this.resultService.getAcademicYearsList({current_branch_id: [localStorage.getItem('branch')]}).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.currentAcademicYear = res?.data?.find(ele => ele.current);
      this.minDate = this.currentAcademicYear?.start_time
      this.maxDate = this.currentAcademicYear?.end_time
    })
    this.hasLectureID = this.activatedRouteService?.snapshot?.params['id'];
    const chapterControl = this.addLectureForm.get('chapter_id');
    if(chapterControl){
      chapterControl.valueChanges.subscribe((value) => {
        chapterControl.setErrors(!value ? { required: true } : null);
      });
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

  resetFieldsAndLists(fields: string[], lists: string[]) {
    lists.forEach(list => this[list] = []);
    fields.forEach(field => this.addLectureForm.controls[field].patchValue(null));
  }
  
  onSectionChange() {
    this.resetFieldsAndLists(
      ['class_id', 'batch_id', 'subject_id', 'user_id', 'chapter_id'],
      ['classList', 'batchList', 'chapterList', 'subjectList', 'facultiesList']
    );
    this.getClassList();
  }
  
  onClassChange() {
    this.resetFieldsAndLists(
      ['batch_id', 'subject_id', 'user_id', 'chapter_id'],
      ['batchList', 'chapterList', 'subjectList', 'facultiesList']
    );
    this.getBatchList();
    this.getSubjectList();
  }

  onBatchChange(){
    this.resetFieldsAndLists(
      ['user_id'],
      ['facultiesList']
    );
    if (this.user_role !== 'ROLE_FACULTY') this.getFacultiesList();
  }
  
  onSubjectChange() {
    this.resetFieldsAndLists(
      ['chapter_id', 'user_id'],
      ['chapterList', 'facultiesList']
    );
    if (this.user_role !== 'ROLE_FACULTY') this.getFacultiesList();
    this.getChapterList('');
  }

  onStatusChange(){
    const dateControl = this.addLectureForm?.controls['remark_date'];
    if(this.addLectureForm.controls['status'].value == '1'){
      this.lectureCompleted = true;
      dateControl?.setValidators([Validators.required]);
      dateControl?.updateValueAndValidity();
    }else{
      this.lectureCompleted = false;
      dateControl?.clearValidators();
      dateControl?.updateValueAndValidity();
    }
  }

  selectionChange(event: any = '', controlName: any = '') {
    this.addLectureForm.controls[controlName].patchValue(event?.id);
  }

  createUpdateChapter(event: any){

    const formControls = this.addLectureForm?.controls || {};

    ['section_id', 'class_id', 'batch_id', 'subject_id'].forEach((field) => {
        if (formControls[field]) {
          formControls[field].markAsTouched();
          formControls[field].updateValueAndValidity();
        }
    });

    const { class_id, batch_id, subject_id } = this.addLectureForm?.value || {};
    if (!class_id || !batch_id || !subject_id) {
      return this.toastr.showError("Please select Class, Batch and Subject to Create Chapter");
    }

    if(!event?.id && !event?.name ){
      return this.toastr.showError("Please add category name in search")
    }
    
    const payload = {
      ...event?.id && ({id: event.id}),
      class_id: this.addLectureForm?.value?.class_id,
      batch_id: this.addLectureForm?.value?.batch_id,
      subject_id: this.addLectureForm?.value?.subject_id,
      chapter_name: event?.name ,
    }
    
    this.userDailyPlanningService.createUpdateChapter(payload).subscribe((res: any) => {
      if(res?.status){
        event?.id ?  this.toastr.showSuccess("Updated Successfully") : this.toastr.showSuccess("Created Successfully"); 
        this.getChapterList(event?.name);
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.errors?.message ?? 'An Unexpected error occurred');
    });
  }

  deleteChapter(event: any){
    this.userDailyPlanningService.deleteChapter(event).subscribe((res: any) => {
      if(res?.status){
        this.toastr.showSuccess(res?.message);
        this.getChapterList('');
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.errors?.message ?? 'An Unexpected error occurred');
    });
  }

  async onSaveLecture(){
    if (this.addLectureForm?.invalid) {
      this.formValidationService.getFormTouchedAndValidation(this.addLectureForm);
      this.addLectureForm.controls['chapter_id'].markAsTouched();
      this.addLectureForm.controls['remark_date'].markAsTouched();
      return this.toastr.showError("Please fill all required fields");
    }
    const payload = {
      ...(this.hasLectureID && ({id: this.hasLectureID})),
      ...this.addLectureForm.value,
      user_id: this.addLectureForm?.value?.user_id ?? this.user_id,
      attachments: []
    }
    const file = this.addLectureForm?.value?.upload;
    if (file) {
      for (let index = 0; index < file?.length; index++) {
        const element = file[index];
        const imagebase64 = await this.CommonService.convertToBase64(element);
        const data = {
          fileName    : element?.name,
          imagebase64 : imagebase64,
        }
        payload?.attachments?.push(data);
      }
    }
    this.isSaveLoading = true;
    this.userDailyPlanningService.createUpdateLecture(payload).subscribe((res: any) => {
      this.isSaveLoading = false;
      if(res?.status){
        this.toastr.showSuccess(res?.message);
        this.router.navigate([this.CommonService.setUrl(URLConstants.LECTURES_LIST)]);
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.isSaveLoading = false;
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.errors?.message ?? 'An unexpected error occured')
    });
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.addLectureForm = this._fb.group({
      section_id: [null, [Validators.required]],
      class_id: [null, [Validators.required]],
      batch_id: [null, [Validators.required]],
      subject_id: [null, [Validators.required]],
      user_id: [null, this.user_role !== 'ROLE_FACULTY' ? [Validators.required] : null],
      chapter_id: [null, [Validators.required]],
      no_of_lecture: [null, [Validators.required]],
      remark_date: [null],
      status: ['0'],
      reference_link: [null, [ClassCareValidatores.pattern(/^(https?:\/\/)?([\w\-]+\.)+[\w]{2,}(\/\S*)?$/, "Please enter valid link")]],
      remark: [null],
      upload: [null]
    })
  }
	 
  getSectionsList(){
    this.batchService.getUserWiseSectionList({user_id : this.user_id}).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if(res?.status){
        this.sectionsList = res?.data
        if(this.hasLectureID){
          this.getClassList();
        }
      }
    })
  }

  getClassList(){
    const payload = {
      section_id: this.addLectureForm?.value?.section_id ?? null,
      user_id: this.user_id ?? null,
    }
    this.homeWorkService.getClass(payload, 0).subscribe((res: any) => {
      if(res.status){
        this.classList = res?.data;
        if(this.hasLectureID){
          this.getBatchList();
          this.getSubjectList();
        }
      }
    })    
  }

  getBatchList(){
    const payload = {
      classes: this.addLectureForm?.value?.class_id ? [this.addLectureForm.value.class_id] : [],
    }
    this.homeWorkService.getBatchOnClass(payload).subscribe((res: any) => {
      if(res?.status){
        this.batchList = res?.data
      }
    })
  }

  getFacultiesList(){
    const payload = {
      batch_id: [this.addLectureForm?.value?.batch_id],
      subject_id: [this.addLectureForm?.value?.subject_id],
    }
    this.userDailyPlanningService.getFacultyList(payload).subscribe((res: any) => {
      if(res?.status){
        this.facultiesList = res?.data?.map((faculty) => {
          return {
            id: faculty.id,
            name: faculty.full_name,
          }
        })
      }
    })
  }

  getSubjectList(){
    const payload = {
      class_id: this.addLectureForm?.value?.class_id ?? null,
    }
    this.batchService.getClassWiseSubject(payload).pipe(takeUntil(this.$destroy))?.subscribe((res: any) => {
      if (res.status) {
        this.subjectList = res.data.map((ele) => {
          return {
            id: ele.subject_id,
            name: ele.subject_name
          }
        })
        this.getChapterList('');
      }
    })
  }

  getChapterList(name: any){
    const payload = {
      subject_id: [this.addLectureForm?.value?.subject_id],
    }
    this.userDailyPlanningService.getChapterList(payload).subscribe((res: any) => {
      if(res?.status){
        this.chapterList = res?.data.map((chapter) => {
          return {
            id: chapter.id,
            name: chapter.chapter_name
          }
        })
      }
      if(name){
        this.chapter_id = this.chapterList?.find(ele=>ele.name == name )?.id
      }
      this.addLectureForm?.controls['chapter_id'].patchValue(this.chapter_id)
    })
  }

  //#endregion Private methods
}
