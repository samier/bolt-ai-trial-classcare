import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { UserService } from '../../user/user.service';
import { UserServiceService } from '../user-service.service';
import { Toastr } from 'src/app/core/services/toastr';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  $destroy: Subject<void> = new Subject<void>();
  userProfile  : FormGroup = new FormGroup({})
  userPassword : FormGroup = new FormGroup({})

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  branch_id: any = window.localStorage.getItem('branch');
  userID : any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  male_professor   :any = 'http://'+enviroment?.symfonyDomain+'/public/upload/facultyImage/professor-male.png'
  female_professor :any = 'http://'+enviroment?.symfonyDomain+'/public/upload/facultyImage/professor-female.png'

  userDetails: any = {}

  isCUPVisible : boolean = false
  isNPVisible  : boolean = false
  isCPVisible  : boolean = false

  isProfileLoading  : boolean = false
  isPasswordLoading  : boolean = false

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private _fb: FormBuilder,
    private _userService: UserServiceService,
    private _toaster: Toastr,
    private validationService: FormValidationService,
  ) { }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.getUserProfile();
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

  handleSave(){
    if(this.userProfile.invalid){
      this.validationService.getFormTouchedAndValidation(this.userProfile)
      this._toaster.showError("Please fill Required Details")
      return 
    }
    this.isProfileLoading = true
    const payload = this.userProfile.value
    this._userService.saveUserDetails(payload).subscribe((res: any) => {
      if(res.status){
        this.isProfileLoading = false
        this.getUserProfile()
        this.CommonService.notifyPhotoUpdated();
        this._toaster.showSuccess(res.message)
      }
      else{
        this.isProfileLoading = false
        this._toaster.showError(res.message)
      }
    },(error:any)=>{
      this.isProfileLoading = false
      this._toaster.showError(error.message)
    })
  }
  handlePasswordSave(){
    if (this.userPassword.invalid) {
      this.validationService.getFormTouchedAndValidation(this.userPassword)
      this._toaster.showError("Please fill all the required field")
      return;
    }
    if(this.userPassword.controls['confirmPassword'].value !== this.userPassword.controls['newPassword'].value ){
      this._toaster.showError("New Password and Confirm Password should be same")
      return
    }
    this.isPasswordLoading = true

    const payload = {
      current_password : this.userPassword.controls['currentPassword'].value,
      new_password : this.userPassword.controls['newPassword'].value,
      new_password_confirmation : this.userPassword.controls['confirmPassword'].value
    }

    this._userService.savePassword(payload).subscribe((res:any)=>{
      if(res.status){
        this.userPassword.reset()
        this._toaster.showSuccess(res.message)
        this.isPasswordLoading = false
      }
      else{
        this._toaster.showError(res.message)
        this.isPasswordLoading = false
      }
     },(error:any)=>{
      this.isPasswordLoading = false
      this._toaster.showError(error?.error?.message ?? error?.message)
    })
  }
  handlePasswordClear(){
    this.userPassword.reset()
  }

  getUserProfile(){

    this._userService.getUserDetails(this.userID).subscribe((res: any) => { 
      if(res.status){

        this.userDetails = res.data;
        const data = {
          first_name : res.data.first_name ,
          last_name  : res.data.last_name ,
          email      : res.data.email ,
          gender     : res.data.gender ,
          birth_date : res.data.birth_date ,
          phone_number : res.data.phone_number ,
          // image :""
        }
        this.userProfile.patchValue(data);
        
      }
      else{
        this._toaster.showError(res.message)
      }
    },(error:any)=>{
      this._toaster.showError(error?.error?.message ?? error?.message)
    })
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
  
    if (fileInput.files && fileInput.files[0]) {
      const file: File = fileInput.files[0];
  
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        const reader = new FileReader();
  
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const image64 = e.target?.result as string;
          this.userProfile.controls['image'].patchValue(image64);
          // this.uploadImage(image64);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a valid image file (JPG or PNG).');
      }
    }
  }
  
  setUrl(url: string) {
    return '/' + url;
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.userProfile = this._fb.group({

      first_name    : [ '' , [ Validators.required , ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter your first name" ) ]],
      last_name     : [ '' , [ Validators.required , ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter your last name" )  ]],
      email         : [ '' , [ Validators.required  ] ],
      birth_date    : [ null ],
      gender        : [ 'm' , [ Validators.required ] ],
      phone_number  : [ null , [ Validators.required , ClassCareValidatores.pattern(/^\d{10}$/,"Please enter valid Number") , ClassCareValidatores.min(1000000000, "Please enter minimum 10 digits number") ,ClassCareValidatores.max(9999999999, "Please enter maximum 10 digits number") ] ],
      image         : [ null ],
    })

    this.userPassword = this._fb.group({

      currentPassword : [ null , [ Validators.required ] ],
      newPassword     : [ null , [ Validators.required ] ],
      confirmPassword : [ null , [ Validators.required ] ],
    })
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------
}