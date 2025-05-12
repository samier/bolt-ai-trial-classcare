import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { UserServiceService } from '../user-service.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';

@Component({
  selector: 'app-user-branch-add-edit',
  templateUrl: './user-branch-add-edit.component.html',
  styleUrls: ['./user-branch-add-edit.component.scss']
})
export class UserBranchAddEditComponent implements OnInit {
  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  
  $destroy: Subject<void> = new Subject <void>();
  branchAdd : FormGroup = new FormGroup({})
  
  URLConstants = URLConstants;

  branchID : any = null

  isSaveLoading : boolean = false

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    private _fb                 : FormBuilder,
    private _toaster            : Toastr,
    private userService         : UserServiceService,
    public CommonService        : CommonService,
    private _activeRoute        : ActivatedRoute,
    private validationService   : FormValidationService,
    private _router             : Router,
  ) {}
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.branchID = this._activeRoute.snapshot.paramMap.get('id')

    if(this.branchID){
      this.getBranchDetails()
    }
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

  handleSaveBranch(){
    if(this.branchAdd.invalid){
      this.validationService.getFormTouchedAndValidation(this.branchAdd)
      this._toaster.showError("Please fill Required Details")
      return
    }
    this.isSaveLoading = true
    const payload = this.branchAdd.value
    this.userService.addBranch(payload , this.branchID).subscribe((res:any)=>{
      if(res.status){
        this.isSaveLoading = false
        this._toaster.showSuccess("Branch Added Successfully")
        this.handleRedirect()
      }
      else{
        this.isSaveLoading = false
        this._toaster.showError(res.message)
      }
    },(error:any)=>{
      this.isSaveLoading = false
      this._toaster.showError( error?.error?.message || error?.message)
    })
  }

  handleRedirect(){
    this._router.navigate([this.setUrl(this.URLConstants.USER_BRANCH_LIST)]);
  }
  
  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
  
    if (fileInput.files && fileInput.files[0]) {
      const file: File = fileInput.files[0];
  
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        const reader = new FileReader();
  
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const image64 = e.target?.result as string;
          this.branchAdd.controls['path'].patchValue(image64);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a valid image file (JPG or PNG).');
      }
    }
  }
  setUrl(url:string){
    return '/'+url;
  }
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  getBranchDetails(){
    this.userService.getBranchDetails(this.branchID).subscribe((res:any)=>{
      if(res.status){
        const data = {
          branchName      : res.data?.branchName ,
          location        : res.data?.location,
          branchContactno : res.data?.branchContactno ,
          Contactno       : res.data?.Contactno ,
          address         : res.data?.address ,
          city            : res.data?.city ,
          attendance_type : Number(res.data?.attendance)  ,
          branch_prefix   : res.data?.branch_prefix ,
          is_live         : res.data?.is_live ,
        }
        this.branchAdd.patchValue(data)
      }
      else{
        this._toaster.showError(res.message)
      }
    },(error:any)=>{
      this._toaster.showError( error?.error?.message || error?.message)
    })
  }

  initForm() {
    this.branchAdd = this._fb.group({

      path            : [''], //image
      branchName      : ['',  [ Validators.required] ],
      location        : ['' , [ Validators.required] ],
      branchContactno : [null,[ Validators.required , ClassCareValidatores.pattern(/^\d{10}$/,"Please enter valid Number") , ClassCareValidatores.min(1000000000, "Please enter minimum 10 digits number") ,ClassCareValidatores.max(9999999999, "Please enter maximum 10 digits number") ] ],
      Contactno       : ['' , [ClassCareValidatores.pattern(/^\d{10}$/,"Please enter valid Number") , ClassCareValidatores.min(1000000000, "Please enter minimum 10 digits number") ,ClassCareValidatores.max(9999999999, "Please enter maximum 10 digits number") ] ],
      address         : ['' , [ Validators.required] ],
      city            : ['' , [ Validators.required] ],
      attendance_type : [''],
      branch_prefix   : [''],
      is_live         : [true],
    })
  }
	
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------
}
