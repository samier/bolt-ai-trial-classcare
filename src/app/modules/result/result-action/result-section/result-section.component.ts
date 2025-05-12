import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { ResultService } from '../../result.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';

@Component({
  selector: 'app-result-section',
  templateUrl: './result-section.component.html',
  styleUrls: ['./result-section.component.scss']
})
export class ResultSectionComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  resultSectionForm: FormGroup = new FormGroup({});
  resultSectionEditForm: FormGroup = new FormGroup({});
  is_edit : boolean = false
  markSheetClassId:string | null = null;
  isResultSection : boolean = false
  isSectionSave : boolean = false
  isSectionUpdate : boolean = false
  isSectionDelete : boolean = false
  resultSectionList:any = []
  selectedRowId
  is_co_scholastic:boolean = false
  skill_subject:boolean =  true
  isCreateResultSection :boolean = false

  get resultSectionArray(): FormArray {
    return this.resultSectionForm.get('resultSecArray') as FormArray;
  }

  @Output() next:any = new EventEmitter<any>();

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _modalService:NgbModal,
    private _activatedRoute : ActivatedRoute,
    private _resultService : ResultService,
    private _toaster: Toastr,
    private _formValidationService : FormValidationService
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.markSheetClassId = this._activatedRoute.snapshot.paramMap.get('id') || null;
    this._activatedRoute.queryParams.subscribe(params => {
      this.is_co_scholastic = JSON.parse(params['is_co_scholastic'])
      this.skill_subject = JSON.parse(params['skill_subjects'])
    });
    // this.initForm();
    this.editSectionInitForm(null);
    this.getSectionList()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  openPublishModal(modalName,id=null) {
    if (id == null) {
      const coScolastic = this.resultSectionList.filter(ele => !ele.is_co_scholastic &&  !ele.is_skill_subject);
      this.isCreateResultSection = coScolastic?.length > 0 && coScolastic?.length < 2 ? true : false;
      if(this.isCreateResultSection) {
        window.alert('You can not create multiple section');
        return;
      }
    };

    this.selectedRowId = id;
    this._modalService.open(modalName);
  }
  
  closeModel() {
    this._modalService.dismissAll();
    this.resultSectionEditForm.reset();
    // this.resultSectionArray.controls = []
    // this.addSection();
  }

  editSection(data,modalName) {
    this.is_edit = true;
    this.editSectionInitForm(data);
    this._modalService.open(modalName);
  }

  createSection() {

    // if (this.resultSectionForm.invalid) {
    //   this.resultSectionArray.controls.forEach((form:any)=>{
    //     this._formValidationService.getFormTouchedAndValidation(form);
    //   })
    //   return;
    // }

    if (this.resultSectionEditForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.resultSectionEditForm);
      return;
    }

    this.isSectionSave = true;

    const payload = {
      sections : [this.resultSectionEditForm.value]
    }

    this._resultService.storeMarksheetResultSection(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      this.isSectionSave = false
      if (res.status){
        this._toaster.showSuccess(res.message);
        this.getSectionList();
        // this.resultSectionArray.controls = []
        // this.addSection();
        this.closeModel();
      } else {
        this._toaster.showError(res.message);
      }
    },(error)=> {
      this.isSectionSave = false
      this._toaster.showError(error?.error?.message);
    });

  }

  updateSection() {

    if (this.resultSectionEditForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.resultSectionEditForm);
      return;
    }
    
    this.isSectionUpdate = true;
    const payload = {
       ...this.resultSectionEditForm.value
    }

    this._resultService.updateMarksheetResultSection(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      this.isSectionUpdate = false;
      if (res.status){
        this._toaster.showSuccess(res.message);
        this.getSectionList();
        this.closeModel();
      } else {
        this._toaster.showError(res.message);
      }
    },(error)=> {
      this.isSectionUpdate = false;
      this._toaster.showError(error?.error?.message);
    });

  }

  deleteSection(isMessage) {
    this.isSectionDelete = true;
    this._resultService.deleteMarksheetResultSection(this.selectedRowId).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      this.isSectionDelete = false;
      if (res.status){
        this.selectedRowId = null
        if (isMessage) {
          this._toaster.showSuccess(res.message);
        }
        this.getSectionList();
        this.closeModel();
      } else {
        this._toaster.showError(res.message);
      }
    },(error)=> {
      this.isSectionDelete = false;
      this._toaster.showError(error?.error?.message);
    });
  }

  nextSection() {
    this.next.emit()
  }


  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  // initForm() {
  //   this.resultSectionForm = this._fb.group({
  //     resultSecArray: new FormArray([])
  //   })
  //   this.addSection();
  // }

  editSectionInitForm (data) {
    this.resultSectionEditForm = this._fb.group({
      mark_sheet_section_name: [data?.mark_sheet_section_name ?? '',[Validators.required]],
      marks : [data?.marks ?? null,[Validators.required,Validators.min(0),Validators.pattern('^[0-9]*$')]],
      mark_sheet_classes_id : [data?.mark_sheet_classes_id ?? this.markSheetClassId],
      is_co_scholastic : [data?.is_co_scholastic ?? false],
      id : [data?.id ?? '']
    });
  }

  // private _createResultSection () {
  //   return this._fb.group({
  //     mark_sheet_section_name: ['',[Validators.required]],
  //     marks : [null,[Validators.required,Validators.min(0),Validators.pattern('^[0-9]*$')]],
  //     mark_sheet_classes_id : this.markSheetClassId,
  //     is_co_scholastic : false
  //   });
  // }

  // addSection(): void {
  //   this.resultSectionArray.push(this._createResultSection());
  // }

  removeSection(i: number): void {
    this.resultSectionArray.removeAt(i);
  }

  getSectionList() {
    this.isResultSection = true
    const payload = {
      mark_sheet_class_id : this.markSheetClassId
    }

    this._resultService.getMarksheetResultSection(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      this.isResultSection = false
      if(res.status){
        this.resultSectionList = res.data;
        let sections:any = [];
        const is_co_scholastic_exist = this.resultSectionList.find(ele => ele.is_co_scholastic)
        if(is_co_scholastic_exist && !this.is_co_scholastic) {
          this.selectedRowId = is_co_scholastic_exist.id
          this.deleteSection(0);
        } else if (!is_co_scholastic_exist && this.is_co_scholastic) {
          sections.push({
            mark_sheet_section_name: "co-scholastic",
            marks: null,
            mark_sheet_classes_id: this.markSheetClassId,
            is_co_scholastic: true,
            is_skill_subject: false
          })
        }

        const is_skill_subject_exist = this.resultSectionList.find(ele => ele.is_skill_subject)
        if(is_skill_subject_exist && !this.skill_subject) {
          this.selectedRowId = is_skill_subject_exist.id
          this.deleteSection(0);
        } else if(!is_skill_subject_exist && this.skill_subject){
          sections.push({
            mark_sheet_section_name: "Skill Subject",
            marks: null,
            mark_sheet_classes_id: this.markSheetClassId,
            is_co_scholastic: false,
            is_skill_subject: true
          })
        }

        if(sections.length > 0){
          let payload = {sections : sections}
          this._resultService.storeMarksheetResultSection(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
            this.isSectionSave = false
            if (res.status){
              this.getSectionList();
            } else {
              this._toaster.showError(res.message);
            }
          },(error)=> {
            this.isSectionSave = false
            this._toaster.showError(error?.error?.message);
          });
        }
         
      } else {
        this._toaster.showError(res.message);
      }
    })
  }

  //#endregion Private methods
}