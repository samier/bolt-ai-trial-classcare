import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { InquiryService } from '../inquiryservice';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-inquiry-field-setting',
  templateUrl: './inquiry-field-setting.component.html',
  styleUrls: ['./inquiry-field-setting.component.scss']
})
export class InquiryFieldSettingComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  inquiryFieldData: any 
  isSave : boolean = false
  URLConstants = URLConstants;
  @Input() isSettingLoad
  settingData : any
  isLoader : boolean = false
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    private _inquiryService : InquiryService,
    private _toster : Toastr,
    public commonService: CommonService,
    public CommonService: CommonService,
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.getFieldData();
    // this.getNotificationSetting();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  saveSetting() {
    // const payload = {}
    // Object.keys(this.inquiryFieldData.format_data_details).forEach((j) => {
    //   payload[j] = this.inquiryFieldData.format_data_details[j].is_visible ? 1 : 0
    // });

    const payload = this.inquiryFieldData.reduce((acc, item:any) => {
      acc[item.key] = {
        is_visible: item.is_visible ? 1 : 0,
        required: item.is_visible ? (item.required ? 1 : 0) : 0,
      };
      return acc;
    }, {});

    this.isSave = true

    this._inquiryService.updateFieldData(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if (res.status) { 
        this.isSave = false
        this._toster.showSuccess(res.message);
        this.getFieldData();
      } else {
        this._toster.showError(res.message)
      }
    },(error)=>{
      this._toster.showError(error?.error?.message ?? error?.message)
    })
  }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  getFieldData() {
    // this._inquiryService.getFieldData().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
    //   this.inquiryFieldData = res.data
    // })
    this.isLoader = true
    this._inquiryService.getFieldData().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      this.isLoader = false
      if (res.status) {
        this.inquiryFieldData = res.data.formated_data
      } else {
        this._toster.showError(res.message)
      }
    }, (error) => {
      this.isLoader = false
      this._toster.showError(error?.error?.message ?? error?.message)
    })
  }

  // getNotificationSetting () {
  //   this._inquiryService.getInquiryFeesSetting().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
  //     if(res.status){
  //       this.settingData = res.data
  //     }
  //   })
  // }
  
  //#endregion Private methods
}