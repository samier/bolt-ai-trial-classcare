import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { Toastr } from 'src/app/core/services/toastr';
import { StudentRemarkService } from '../student-remark.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CommonService } from 'src/app/core/services/common.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { remarkType } from 'src/app/common-config/static-value';

@Component({
  selector: 'app-predefine-remark-form',
  templateUrl: './predefine-remark-form.component.html',
  styleUrls: ['./predefine-remark-form.component.scss']
})
export class PredefineRemarkFormComponent implements OnInit {
  //#region Public | Private Variables
  URLConstants = URLConstants;
  remarkTitleForm : FormGroup = new FormGroup({})
  isEdit : any
  editData : any
  remarkTypesList = remarkType;
  isSave: boolean = false;
  id: any

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr : Toastr,
    private modalRef: NgbActiveModal,
    private formValidationService: FormValidationService,
    public studentRemarkService : StudentRemarkService,    
    public CommonService: CommonService,
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    if(this.isEdit){
      this.remarkTitleForm.controls['remark'].patchValue(this.editData.remark)
      this.remarkTitleForm.controls['remark_type'].patchValue(this.editData.remark_type)      
    }
  }

   //#endregion Lifecycle hooks

   // --------------------------------------------------------------------------------------------------------------
   // #region Public methods
   // --------------------------------------------------------------------------------------------------------------

  onSubmit(isTrue:boolean=false) {
    if (this.remarkTitleForm.invalid) {
      this.formValidationService.getFormTouchedAndValidation(this.remarkTitleForm)
      this.toastr.showError("Please fill all the required field")      
      return;
    }
    this.isSave = true;
    this.studentRemarkService.addTitle(this.editData?.id,this.remarkTitleForm.value).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
        this.isSave = false;
      }else{
        this.toastr.showSuccess(res.message)
        this.modalRef.close( { status : true } );
      }
    },(err:any)=>{
      this.isSave = false;
      this.toastr.showError(err.error.message);
    });
  }

  close() {
    this.modalService.dismissAll()
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm()
  {
    this.remarkTitleForm = this.fb.group({
      remark    : ['' , [Validators.required] ],
      remark_type  : [null , [Validators.required] ],
    })
  }

  //#endregion Private methods
}
