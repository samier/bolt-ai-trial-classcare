import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../common-components/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ResultService } from '../result.service';
import { ReportService } from '../../report/report.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { ExamServiceService } from '../../exam/exam-service.service';

@Component({
  selector: 'app-create-marksheet',
  templateUrl: './create-marksheet.component.html',
  styleUrls: ['./create-marksheet.component.scss']
})
export class CreateMarksheetComponent implements OnInit {

  //#region Public | Private Variables  
  $destroy: Subject<void> = new Subject<void>();
  createMarksheetForm: FormGroup = new FormGroup({})
  URLConstants = URLConstants;
  sectionList:any = []
  classList:any = []
  markSheetTempId : any = null
  isCreateTemp : boolean = false
  singleMarkSheetTemplate:any = []
  templatesList:any = []
  isCheckAttendance : boolean = false

  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _reportService: ReportService,
    public resultService : ResultService,
    private validationService : FormValidationService,
    private _activatedRoute : ActivatedRoute,
    private toastr: Toastr,
    private _router : Router,
    private _examService:ExamServiceService
  ) { }

  //#endregion constructor  
  // --------------------------------------------------------------------------------------------------------------

  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this.getSectionList();
    this.getTemplatesList();
    this.markSheetTempId = this._activatedRoute.snapshot.paramMap.get('id') || null
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks  
  // --------------------------------------------------------------------------------------------------------------

  // #region Public methods

  getTemplatesList(){
    this.resultService.getTemplatesList().subscribe((response:any)=>{
      this.templatesList = response?.data?.map((item:any)=>{
        return {
          id : item.id,
          name : item.template_name,
        }
      });
    })
  }

  createMarkSheet () {
    if(this.createMarksheetForm.invalid) {
      this.validationService.getFormTouchedAndValidation(this.createMarksheetForm);
      return
    }

    const payload = this.createMarksheetForm.value
    
    payload.class_id = payload.class_id.map(ele => ele.id);
    
    this.isCreateTemp = true

    if (this.markSheetTempId) {
      this.resultService.updateMarkSheet(this.markSheetTempId ,payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        this.isCreateTemp = false
        if(res.data) {
          this.toastr.showSuccess(res.message);
          this._router.navigate([this.resultService.setUrl(URLConstants.MARKSHEET_LIST)])
        } else { 
          this.toastr.showError(res.message);
        }
      },(error)=> {
        this.isCreateTemp = false
        this.toastr.showError(error.error.message);
      })
    } else {
      this.resultService.storeMarkSheet(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        this.isCreateTemp = false
        if(res.data) {
          this.toastr.showSuccess(res.message);
          this._router.navigate([this.resultService.setUrl(URLConstants.MARKSHEET_LIST)])
        } else { 
          this.toastr.showError(res.message);
        }
      },(error)=> {
        this.isCreateTemp = false
        this.toastr.showError(error.error.message);
      })
    }

  }

  clearForm() {
    this.createMarksheetForm.reset();
    this.createMarksheetForm.controls['section_id'].patchValue(null);
    this.createMarksheetForm.controls['show_attendance'].patchValue(false);
  }

  checkAttendance() {
    this._examService.getNotification().pipe(takeUntil(this.$destroy)).subscribe((res:any) => {
      if(res.status) {
        this.isCheckAttendance = res.data.exam_attendance ? false : true
      }
    });
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods  
  // --------------------------------------------------------------------------------------------------------------

  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.createMarksheetForm = this._fb.group({
      section_id: [null,[Validators.required]],
      class_id: [null,[Validators.required]],
      template_name: [null,[Validators.required]],
      template_id: [null,[Validators.required]],
      show_attendance: [false],
      marks_type : [0],
      krupa_siddhi_gun : [false]
    })

    this.createMarksheetForm.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res) => {
      this.createMarksheetForm.controls['class_id'].markAsPristine();
      this.createMarksheetForm.controls['class_id'].markAsUntouched();
    })
  }

  getSectionList() {
    this._reportService.getSectionList("").pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
      if (res.status) {
        this.sectionList = res.data;
        if (this.markSheetTempId) {
          this.resultService.showMarkSheet(this.markSheetTempId).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
            if (res.status) {
              this.singleMarkSheetTemplate = res.data
              this.createMarksheetForm.patchValue({
                section_id : res.data.section_id,
                class_id : res.data.mark_sheet_class,
                template_name: res.data.mark_sheet_name,
                template_id: res.data.template_type.id,
                show_attendance: res.data.mark_sheet_setting?.show_attendance == 1 ? true : false,
                marks_type : res.data.mark_sheet_setting?.marks_type,
                krupa_siddhi_gun : res.data.mark_sheet_setting?.krupa_siddhi_gun
              });
              this.getClasses()
            }
          })
        }
      }
    })
  }

  getClasses () {
    this.createMarksheetForm.controls['class_id'].reset()
    const selectedSection = this.createMarksheetForm.value.section_id ? this.createMarksheetForm.value.section_id : '' 
    this._reportService.getStudentClassList(selectedSection).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
      if (res.status) {
        this.classList = res.data
        if(this.markSheetTempId){
          this.createMarksheetForm.patchValue({
            class_id : this.singleMarkSheetTemplate.mark_sheet_class,
          });
        }
      }
    })
  }

  //#endregion Private methods

}
