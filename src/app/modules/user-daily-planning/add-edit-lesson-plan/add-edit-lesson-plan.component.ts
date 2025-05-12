import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { HomeworkService } from '../../homework/homework.service';
import { UserDailyPlanningService } from '../user-daily-planning.service';
import { Toastr } from 'src/app/core/services/toastr';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { BatchService } from '../../batch/batch.service';
import { lessonPlanStatus } from 'src/app/common-config/static-value';
import moment from 'moment';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';

@Component({
  selector: 'app-add-edit-lesson-plan',
  templateUrl: './add-edit-lesson-plan.component.html',
  styleUrls: ['./add-edit-lesson-plan.component.scss']
})
export class AddEditLessonPlanComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  addLessonPlanF : FormGroup = new FormGroup({});
  user_id: any = window.localStorage.getItem('user_id');
  user_role: any = window.localStorage.getItem('role');  
  URLConstants = URLConstants;
  hasLessonPlanID: any;
  chapter_id: any;
  sectionsList: any = [];
  classList: any = [];
  batchList: any = [];
  facultiesList: any = [];
  subjectList: any = [];
  chapterList: any = [''];
  statusList: any = lessonPlanStatus;
  isSaveLoading: boolean = false;

  editorConfig: AngularEditorConfig = {
    editable: true,
      spellcheck: true,
      height: 'auto',
      minHeight: '0',
      maxHeight: 'auto',
      width: 'auto',
      minWidth: '0',
      translate: 'yes',
      enableToolbar: true,
      showToolbar: true,
      placeholder: 'Enter text here...',
      defaultParagraphSeparator: '',
      defaultFontName: '',
      defaultFontSize: '',
      fonts: [
        {class: 'arial', name: 'Arial'},
        {class: 'times-new-roman', name: 'Times New Roman'},
        {class: 'calibri', name: 'Calibri'},
        {class: 'comic-sans-ms', name: 'Comic Sans MS'}
      ],
      customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      [
        'insertImage', 
        'insertVideo', 
        'link', 
        'unlink',
        'subscript', 
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'justifyFull',
        'indent',
        'outdent',
        'toggleEditorMode',
        'customClasses'
      ],
    ]
  };
  
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
    private formValidationService: FormValidationService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getSectionsList();
    this.hasLessonPlanID = this.activatedRouteService?.snapshot?.params['id'];
    if(this.hasLessonPlanID){
      this.getLessonPlan();
    }
    const dateControl = this.addLessonPlanF.get('date');
    const chapterControl = this.addLessonPlanF.get('chapter_id');
    if (dateControl && chapterControl) {
      dateControl.valueChanges.subscribe((value) => {
        const isDateInvalid = !value.startDate && !value.endDate;
        dateControl.setErrors(isDateInvalid ? { required: true } : null);
      });
    
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
  
  selectionChange(event: any = '', controlName: any = '') {
    this.addLessonPlanF.controls[controlName].patchValue(event?.id);
  }

  resetFieldsAndLists(fields: string[], lists: string[]) {
    lists.forEach(list => this[list] = []);
    fields.forEach(field => this.addLessonPlanF.controls[field].patchValue(null));
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

  createUpdateChapter(event: any){

    const formControls = this.addLessonPlanF?.controls || {};

    ['section_id', 'class_id', 'batch_id', 'subject_id'].forEach((field) => {
        if (formControls[field]) {
          formControls[field].markAsTouched();
          formControls[field].updateValueAndValidity();
        }
    });

    const { class_id, batch_id, subject_id } = this.addLessonPlanF?.value || {};
    if (!class_id || !batch_id || !subject_id) {
      return this.toastr.showError("Please select Class, Batch and Subject");
    }

    if(!event?.id && !event?.name ){
      return this.toastr.showError("Please add category name in search")
    }
    
    const payload = {
      ...event?.id && ({id: event.id}),
      class_id: this.addLessonPlanF?.value?.class_id,
      batch_id: this.addLessonPlanF?.value?.batch_id,
      subject_id: this.addLessonPlanF?.value?.subject_id,
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
      this.toastr.showError(error?.message ?? error?.error?.message ?? 'An Unexpected error occurred');
    });
  }

  deleteChapter(event: any){
    this.userDailyPlanningService.deleteChapter(event).subscribe((res: any) => {
      if(res?.status){
        this.getChapterList('');
        this.toastr.showSuccess(res?.message);
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.toastr.showError(error?.message ?? error?.error?.message ?? 'An Unexpected error occurred');
    });
  }

  onSave(){
    if(this.addLessonPlanF.invalid){
      this.formValidationService.getFormTouchedAndValidation(this.addLessonPlanF)
      this.addLessonPlanF.markAllAsTouched();
      return this.toastr.showError("Please fill all required Fields");
    }
    const startDate = this.addLessonPlanF?.value?.date?.startDate ?? null;
    const endDate = this.addLessonPlanF?.value?.date?.endDate?? null
    const payload = {
      ...(this.hasLessonPlanID && ({id: this.hasLessonPlanID})),
      ...this.addLessonPlanF?.value,
      start_date: startDate.format('DD-MM-YYYY'),
      end_date: endDate.format('DD-MM-YYYY'),
      user_id: this.addLessonPlanF?.value?.user_id ?? this.user_id
    }
    this.isSaveLoading = true;
    this.userDailyPlanningService.createUpdateLessonPlan(payload).subscribe((res: any) => {
      this.isSaveLoading = false;
      if(res?.status){
        this.toastr.showSuccess(res?.message);
        this.router.navigate([this.CommonService.setUrl(URLConstants.LESSON_PLAN_LIST)]);
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.isSaveLoading = false
      this.toastr.showError(error?.error?.message ?? error?.errors?.message ?? error?.message);
    });
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.addLessonPlanF = this._fb.group({
      section_id: [null, [Validators.required]],
      class_id: [null, [Validators.required]],
      batch_id: [null, [Validators.required]],
      user_id: [null, this.user_role !== 'ROLE_FACULTY' ? [Validators.required] : null],
      subject_id: [null, [Validators.required]],
      chapter_id: [null, [Validators.required]],
      mark: [null, Validators.required],
      topic: [null],
      date: [null,[Validators.required]],
      no_of_lecture: [null, [Validators.required]],
      reference_link: [null, [ClassCareValidatores.pattern(/^(https?:\/\/)?([\w\-]+\.)+[\w]{2,}(\/\S*)?$/, "Please enter valid link")]],
      status: ['1'],
      homework: [null],
      classwork: [null]
    })
  }
	
  getLessonPlan(){
    this.userDailyPlanningService.getLessonPlan(this.hasLessonPlanID).subscribe((res: any) => {
      if(res?.status){
        this.addLessonPlanF.patchValue({
          ...res?.data,
          date: {
            startDate: moment(res?.data?.start_date), 
            endDate: moment(res?.data?.end_date)
          },
          chapter_id: res?.data?.chapter_id
        });
        this.chapter_id = res?.data?.chapter_id
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.toastr.showError(error?.message ?? error?.error?.message ?? 'An Unexpected error occured');
    });
  }

  getSectionsList(){
    this.batchService.getUserWiseSectionList({user_id : this.user_id}).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if(res?.status){
        this.sectionsList = res?.data
        if(this.hasLessonPlanID){
          this.getClassList();
        }
      }
    })
  }

  getClassList(){
    const payload = {
      section_id: this.addLessonPlanF?.value?.section_id ?? null,
      user_id: this.user_id ?? null,
    }
    this.homeWorkService.getClass(payload, 0).subscribe((res: any) => {
      if(res.status){
        this.classList = res?.data;
        if(this.hasLessonPlanID){
          this.getBatchList();
          this.getSubjectList();
        }
      }
    })    
  }

  getBatchList(){
    const payload = {
      classes: this.addLessonPlanF?.value?.class_id ? [this.addLessonPlanF.value.class_id] : [],
    }
    this.homeWorkService.getBatchOnClass(payload).subscribe((res: any) => {
      if(res?.status){
        this.batchList = res?.data
      }
    })
  }

  getFacultiesList(){
    const payload = {
      batch_id: [this.addLessonPlanF?.value?.batch_id],
      subject_id: [this.addLessonPlanF?.value?.subject_id],
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
      class_id: this.addLessonPlanF?.value?.class_id ?? null,
    }
    this.batchService.getClassWiseSubject(payload).pipe(takeUntil(this.$destroy))?.subscribe((res: any) => {
      if (res.status) {
        this.subjectList = res.data.map((ele) => {
          return {
            id: ele.subject_id,
            name: ele.subject_name
          }
        })
        this.addLessonPlanF?.value?.subject_id ? this.getChapterList('') : '';
        if(this.hasLessonPlanID) this.getFacultiesList();
      }
    })
  }

  getChapterList(name: any){
    const payload = {
      subject_id: [this.addLessonPlanF?.value?.subject_id],
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
      this.addLessonPlanF?.controls['chapter_id'].patchValue(this.chapter_id)
    })
  }
  //#endregion Private methods
}