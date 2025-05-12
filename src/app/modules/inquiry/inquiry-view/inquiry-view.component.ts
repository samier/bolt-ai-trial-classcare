import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { InquiryService } from '../inquiryservice';
import { ActivatedRoute } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { DateFormatService } from 'src/app/service/date-format.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-inquiry-view',
  templateUrl: './inquiry-view.component.html',
  styleUrls: ['./inquiry-view.component.scss']
})
export class InquiryViewComponent implements OnInit {

  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  
  $destroy: Subject<void> = new Subject<void>();
  id: any;
  inquiryDetail: any;
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    private inquiryService : InquiryService,
    private route: ActivatedRoute,
    private toastr: Toastr,
    public dateFormateService: DateFormatService,
    public commonService : CommonService
  ) { 
  }
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.id = this.route?.snapshot?.paramMap?.get('id');
    this.getInquiryDetails(this.id);
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

  getInquiryDetails(id: any){
    // API call to get inquiry details
    this.inquiryService.viewInquiry(id).subscribe((res: any) => {
      if(res?.status){
        this.inquiryDetail = res?.data
        this.inquiryDetail.customFieldsObject = JSON.parse(this.inquiryDetail?.custom_field_data)
        this.inquiryDetail.customFieldsObject = Object.keys(this.inquiryDetail.customFieldsObject).reduce((acc, key) => {
          const newKey = key.replace('extra_', '');
          acc[newKey] = this.inquiryDetail.customFieldsObject[key];
          return acc;
        }, {});
      }else{
        this.toastr.showError(res.message);
      }
    },
    (error: any) => {
      this.toastr.showError(error?.message ?? error?.error?.message)
    });
  }

  //#endregion Private methods
}


