import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { InquiryService } from '../inquiryservice';
import {Toastr} from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';

@Component({
  selector: 'app-inquiry-import',
  templateUrl: './inquiry-import.component.html',
  styleUrls: ['./inquiry-import.component.scss']
})
export class InquiryImportComponent implements OnInit {


  //#region Public | Private Variables

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;
  
  academicOpenState :boolean = true
  
  $destroy: Subject<void> = new Subject<void>();
  inquiryImportForm : FormGroup = new FormGroup({})

  branch_id: any = window.localStorage.getItem('branch');
  user_id :any   = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  classList : any = []
  is_import : boolean = false
  isExcelLoading : boolean = false
  selectedFile : any = null

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public CommonService: CommonService,
    private _fb : FormBuilder,
    private inquiryService : InquiryService,
    private toaster : Toastr,
    private _formValidationService : FormValidationService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this.getClassList()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  getClassList(){
    const payload = {
      academic_year_id : this.currentYear_id ,
      branch_id        : this.branch_id ,
      section : null
    }

    this.inquiryService.getClassList(payload).subscribe((res: any) => { 
      if(res?.status){
        this.classList = []
        this.classList =  res?.data 
      }
    } )
  }

  handleImport(){

    if(this.inquiryImportForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.inquiryImportForm);
      return;
    }

    const formData = new FormData();
        
    formData.append('file', this.selectedFile );
    formData.append('class_id', this.inquiryImportForm?.value?.class_id )

    this.is_import = true

    this.inquiryService.importInquiry(formData).subscribe((res:any)=>{
      this.is_import = false
      if(res.status) {
        this.toaster.showSuccess(res.message)
        this.inquiryImportForm.reset();
      } else {
        this.toaster.showError(res.message)
      }
    },(error:any)=>{
      this.is_import = false
      this.toaster.showError(error?.error?.message ?? error?.message)
    })
  }

  fileChange(event) {
    if (event) {
      this.selectedFile = event.target.files[0]
      console.log('this.selectedFile: ', this.selectedFile);
    }
  }

  clear() {
    this.inquiryImportForm.reset();
    this.selectedFile = null
  }

  exportSampleExcel() {
    this.inquiryService.exportSampleExcel().subscribe((res:any)=>{
      this.isExcelLoading = false;
      this.CommonService.downloadFile(res, 'Inquiry Sample File', 'excel');
    },(error) => {
      this.isExcelLoading = false;
      this.toaster.showError(error?.error?.message ?? error?.message)
    })
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

    initForm() {
      this.inquiryImportForm = this._fb.group({
        file : [ null, [Validators.required] ],
        class_id : [ null, [Validators.required] ],
      })
    }

  //#endregion Private methods
// }
}
