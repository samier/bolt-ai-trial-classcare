import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { InquiryService } from '../inquiryservice';
import { ActivatedRoute, Router } from '@angular/router';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import {Toastr} from 'src/app/core/services/toastr';
import { followUpType } from 'src/app/common-config/static-value';
import moment from 'moment';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-follow-up',
  templateUrl: './add-follow-up.component.html',
  styleUrls: ['./add-follow-up.component.scss']
})
export class AddFollowUpComponent implements OnInit {

  //#region Public | Private Variables
  
  inquiryForm : FormGroup = new FormGroup({})

  // URLConstants : any = URLConstants;
  branch_id : any = window.localStorage.getItem('branch');
  id : any
  message : any
  followUpType = followUpType
  sendL : boolean = false
  showData: any

  editData : any = null
  inquiryData : any = null
  todaysDate: any = new Date();

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public commonService: CommonService,
    public _fb: FormBuilder,
    private inquiryService: InquiryService,
    public route: ActivatedRoute,
    private validationService: FormValidationService,
    private toastr: Toastr,
    public router: Router,
    private modalRef: NgbActiveModal,
  ) { 
    // this.id = this.route.snapshot.paramMap.get('id');
    // this.followUpId = this.route.snapshot.paramMap.get('followUpId');
  }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {    
    this.initForm()
    if(this.editData){
      this.viewFollowUp()
    }
  }  

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  viewFollowUp() {
    this.inquiryService.viewFollowUp(this.editData.id).subscribe((res: any) => {
      this.showData = res?.data?.inquiry
      if (res.status) {
        this.inquiryForm.patchValue({
          date: res?.data?.date,
          type: res?.data?.type,
          message: res?.data?.message,
          next_follow_up_date : res?.data?.next_follow_up_date
        })
      }
    }, (error: any) => {
      this.toastr.showError(error.message)
    })
  }

    send() {
      this.sendL = true
      if (this.inquiryForm.invalid) {
        this.validationService.getFormTouchedAndValidation(this.inquiryForm)
        this.sendL = false
        return;
      }
      const payload:any = {
        inquiry_id : this.id,
        ... this.inquiryForm.value
      }
      
      this.inquiryService.addUpdateFollowUp(payload,this.editData?.id).subscribe((res: any) => {
        if (res?.status) {
          if(this.id){
            this.toastr.showSuccess(res?.message);
            this.inquiryForm.reset()
            this.modalRef.close( { status : true } );
          }
          else{
            this.toastr.showSuccess(res?.message);
          }
          this.sendL = false
          this.inquiryForm.reset()
          this.modalRef.close( { status : true } );

        }
        else{
          this.sendL = false
          this.toastr.showError(res?.message);
        }
      })
    }

    handleCloseModal(){
      this.inquiryForm.reset()
      this.modalRef.close( { status : false  } );
    }

    getDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      const formattedDate = `${year}-${month}-${day}`;
  
      return formattedDate
    }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.inquiryForm = this._fb.group({
      type: [ null ,[Validators.required]],
      message: [ null ,[Validators.required]],
      date: [ this.getDate() ,[Validators.required]],
      next_follow_up_date : [null],
    });    
  }

  //#endregion Private methods
}
