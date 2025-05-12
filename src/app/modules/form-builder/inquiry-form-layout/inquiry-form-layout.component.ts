import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { FormBuilderService } from '../form-builder.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-inquiry-form-layout',
  templateUrl: './inquiry-form-layout.component.html',
  styleUrls: ['./inquiry-form-layout.component.scss']
})
export class InquiryFormLayoutComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  type : number = 1
  formSetupData: any
  inquiryFormId: any
  isLoader : boolean = false
  editData : any
  URLConstants = URLConstants
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _activatedRoute : ActivatedRoute,
    private _formBuilderService : FormBuilderService,
    private _toaster : Toastr
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    const id =  this._activatedRoute.snapshot.paramMap.get('id') || null
    
    if(id) {
      this.isLoader = true
      this.getDataOnId(id);
      // this.inquiryFormId = id
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

  typeChange (event) {
    this.type = event
  }
  
  formSetupChange(event) {
    this.formSetupData = event
  }

  formBuilderChange(event) {
    this.inquiryFormId = event
  }

  getDataOnId(id) {
    this._formBuilderService.getInquiryFieldsOnId(id).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if(res.status) {
        this.editData = res.data
        this.inquiryFormId = res.data.form_unique_id
        this.isLoader = false
      } else {
        this._toaster.showError(res.message);
        this.isLoader = false
      }
    },(error) => {
      this._toaster.showError(error.error.message ?? error.message);
      this.isLoader = false;
    })
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
    initForm() {
    
    }
	
  //#endregion Private methods
}