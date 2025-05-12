import { Component, OnInit ,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { SectionService } from '../section.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-section-add-edit',
  templateUrl: './section-add-edit.component.html',
  styleUrls: ['./section-add-edit.component.scss']
})
export class SectionAddEditComponent implements OnInit {
  //#region Public | Private Variables

  isEdit : any
  section : any
  
  $destroy: Subject<void> = new Subject<void>();
  addSectionForm : FormGroup = new FormGroup({})

  mediumList : any = []
  schoolList : any = []
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public CommonService: CommonService,
    private _fb : FormBuilder,
    private modalRef: NgbActiveModal,
    private SectionService : SectionService,
    private toaster : Toastr,
    private chd: ChangeDetectorRef,
    private validationService: FormValidationService,
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getSchoolList();
    this.getMediumList();
    if(this.isEdit){
      this.addSectionForm.controls['name'].patchValue(this.section.name)
      this.addSectionForm.controls['school'].patchValue(this.section.school_id)
      this.addSectionForm.controls['medium'].patchValue(this.section.medium_id)
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
  
  handleSave(is_Save:boolean){

    if(!is_Save){
      this.modalRef.close( { status : false  } );
      return;
    }

    if(this.addSectionForm.invalid){
      this.toaster.showError("Please fill all the required field")
      this.validationService.getFormTouchedAndValidation(this.addSectionForm)
      return 
    }

    const payload = {
      name      : this.addSectionForm.controls['name'].value,
      school_id : this.addSectionForm.controls['school'].value,
      medium_id : this.addSectionForm.controls['medium'].value
    }
    this.SectionService.addEditSection( this.isEdit , payload , this.section.id ).subscribe((res:any)=>{
      if(res.status){
        this.toaster.showSuccess(res.message)
        this.modalRef.close( { status : true } );
      }
      else{
        this.toaster.showError(res.message)
      }
    },(error:any)=>{
      this.toaster.showError(error?.error?.message || error?.message)
    })
  }

  getSchoolList(){

    this.SectionService.getSchoolList().subscribe((res:any)=>{
      if(res){
        this.schoolList = res.data?.map((school:any)=>({id:school.id,name:school.name}))
        this.chd.detectChanges()
      }
      else{
        this.toaster.showError(res.message)
      }
    },(error:any)=>{
      this.toaster.showError(error?.error?.message || error?.message )
    })
  }

  getMediumList(){

    this.SectionService.getMediumList().subscribe((res:any)=>{
      if(res.status){
        this.mediumList = res.data?.map((medium:any)=>  ( { id:medium.id , name : medium.name}))
        this.chd.detectChanges()
      }
      else{
        this.toaster.showError(res.message)
      }
    },(error:any)=>{
      this.toaster.showError(error?.error?.message || error?.message )
    })
  }
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.addSectionForm = this._fb.group({
      name    : ['' , [Validators.required] ],
      school  : [null , [Validators.required] ],
      medium  : [null , [Validators.required] ],
    })
  }
	
  //#endregion Private methods
}