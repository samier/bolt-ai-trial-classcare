import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CombineMarksheetService } from '../combine-marksheet.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';

@Component({
  selector: 'app-create-edit-combine-marksheet',
  templateUrl: './create-edit-combine-marksheet.component.html',
  styleUrls: ['./create-edit-combine-marksheet.component.scss']
})
export class CreateEditCombineMarksheetComponent implements OnInit {

  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  
  $destroy: Subject<void> = new Subject<void>();
  createCombineMarkSheetF : FormGroup = new FormGroup({})
  URLConstants = URLConstants;
  id : any = null;
  is_createLoading : boolean = false;
  templateDesignList : any = [];
  combineMarkSheetList : any = [];

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public CommonService: CommonService,
    private combineMarkSheetService: CombineMarksheetService,
    private activatedRoute: ActivatedRoute,
    private _router: Router,
    private toaster: Toastr,
    private _fb : FormBuilder,
    private validationService: FormValidationService,
  ) {
    this.id = this.activatedRoute?.snapshot?.paramMap.get('id') || null
    if(this.id){
      this.viewMarkSheetDetail()
    }
  }
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getTemplateDesignList();
    this.getCombineMarkSheetList();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  // ADD/EDIT FUNCTION 
  createOrUpdateMarkSheet(){

    if (this.createCombineMarkSheetF.invalid) {
      this.validationService.getFormTouchedAndValidation(this.createCombineMarkSheetF)
      this.toaster.showError("Please fill all the required field")
      return 
    }
    const payload = {
      mark_sheet_name : this.createCombineMarkSheetF.value.combine_markSheet_name ,
      mark_sheet_ids  : this.CommonService.getID( this.createCombineMarkSheetF.value.combine_markSheet_id ) || [] ,
      result_templates_id       : this.createCombineMarkSheetF.value.template_id ,
      school_result_template_id : this.createCombineMarkSheetF.value.school_result_template_id ,
      show_attendance     : this.createCombineMarkSheetF.value.show_attendance ? 1 : 0 ,
      marks_type          : this.createCombineMarkSheetF.value.marks_type || 0
    }
    this.is_createLoading = true;

    this.combineMarkSheetService.addEditMarkSheet(payload ,this.id ).subscribe((res: any) => {
      if (res?.status) {
        this.is_createLoading = false;
        this._router.navigate([this.CommonService.setUrl(URLConstants.COMBINE_MARKSHEET_LIST)]);
        this.toaster.showSuccess(res?.message);
      }
      else {
        this.is_createLoading = false;
        this.toaster.showError(res?.message);
      }
    },(error: any) => {
        this.is_createLoading = false;
        this.toaster.showError(error?.message ?? error?.error?.message);
    });
  }

  viewMarkSheetDetail(){
    this.combineMarkSheetService.viewCombineMarkSheet(this.id).subscribe((res:any)=>{
      if(res.status){
        const markSheetDetails = res.data[0]

        this.createCombineMarkSheetF.patchValue({
          combine_markSheet_name    : markSheetDetails.mark_sheet_name ,
          combine_markSheet_id      : markSheetDetails.assigned_mark_sheet?.map((markSheet:any)=>({id:markSheet.id,name:markSheet.mark_sheet_name})) ,
          template_id               : markSheetDetails.result_templates_id ,
          school_result_template_id : markSheetDetails.school_result_template_id ,
          show_attendance           : markSheetDetails.show_attendance ,
          marks_type                : markSheetDetails.marks_type ,
        })

      }
      else{
        this.toaster.showError(res.message)
      }
    },(error:any)=>{
      this.toaster.showError(error?.message ?? error?.error?.message);
    })
  }

  clear(){
    this.createCombineMarkSheetF.reset()
    this.createCombineMarkSheetF.controls['marks_type'].patchValue(0)
    this.createCombineMarkSheetF.markAsPristine();
    this.createCombineMarkSheetF.markAsUntouched();
    // this.createCombineMarkSheetF?.controls['combine_markSheet_id']?.markAsPristine();
    // this.createCombineMarkSheetF?.controls['combine_markSheet_id']?.markAsUntouched();
  }
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.createCombineMarkSheetF = this._fb.group({
      combine_markSheet_name : [null, [Validators.required]],
      combine_markSheet_id   : [[], [Validators.required]],
      template_id            : [null],
      school_result_template_id : [null],
      show_attendance: [false],
      marks_type: [0],
    })
  }

  // TEMPLATE DROP DOWN LIST
  getTemplateDesignList(){
    this.combineMarkSheetService.getTemplateDesignList().subscribe((res: any) => {
      this.templateDesignList = res?.data?.map((item:any)=>{
        return {
          id : item.id,
          name : item.template_name,
        }
      });
    })
  }

  getCombineMarkSheetList(){
    this.combineMarkSheetService.combineMarkSheetList().subscribe((res:any)=>{
      if(res.status){
        this.combineMarkSheetList = res.data?.map((markSheet:any)=>({
          id : markSheet.id,
          name : markSheet.mark_sheet_name
        }))
      }
      else{
        this.toaster.showError(res.message);
      }
    },(error:any)=>{
      this.toaster.showError(error?.message ?? error?.error?.message);
    })
  }
	
  //#endregion Private methods
}