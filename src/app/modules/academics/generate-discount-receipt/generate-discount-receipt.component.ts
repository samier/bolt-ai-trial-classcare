import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { AcademicService } from '../academics.service';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';
import * as moment from 'moment';
import { FeesService } from 'src/app/modules/fees/fees.service';

@Component({
  selector: 'app-generate-discount-receipt',
  templateUrl: './generate-discount-receipt.component.html',
  styleUrls: ['./generate-discount-receipt.component.scss']
})
export class GenerateDiscountReceiptComponent implements OnInit {
  //#region Public | Private Variables
  saving:boolean = false;
  student:any;
  student_category_fees:any;
  backDate:any;
  payment_date:any = moment(new Date()).format('yyyy-MM-DD');
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public academicService: AcademicService,
    public commonService: CommonService,
    private feesService: FeesService,
    public modalRef: NgbActiveModal,
    public toastr: Toastr,
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.student_category_fees = this.student_category_fees.filter(item => item.remaining_discount > 0);
  }


  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  closeModal() {
    this.modalRef.close();
  }

  changePaymentDate(event){
    const today = new Date();
    const date = new Date(event.target.value);
    if (today.getTime() < date.getTime()) {
      this.payment_date = this.changeDateFormat(new Date());
      event.target.value = this.payment_date;
      this.toastr.showError('Future Date Not Allowed');
    }else if(this.backDate != 1 && today.getTime() > date.getTime()){
      this.payment_date = this.changeDateFormat(new Date());
      event.target.value = this.payment_date;
      this.toastr.showError('Past Date Not Allowed');
    }
  }

  changeDateFormat(dateString: any, format:any = 'yyyy-MM-DD') {
    try {
        const parsedDate = moment(dateString);
        return parsedDate.format(format);
    } catch (error) {
        return 'Invalid Date';
    }
  }

  submit() {
    this.saving = true;
    const formData:any = new FormData();
    formData.append('payment_mode',1);
    formData.append('student_id',this.student?.id);
    formData.append('payment_date',this.payment_date);
    formData.append('is_discount_receipt',1);
    formData.append('total_amount',1);
    this.student_category_fees.forEach((scf:any)=>{
      if(scf.is_one_time == 1){
        formData.append(`onetime_fees[${scf?.category_id}]`,scf.remaining_discount);
      }else{
        formData.append(`fees[${scf.month}][${scf?.category_id ?? scf.month}]`,scf.remaining_discount);
      }
    });

    this.feesService.collectFees(formData).subscribe((response:any)=>{
      if(response.status){
        this.toastr.showSuccess(response.message);
        this.modalRef.close(true);
      }else{
        this.toastr.showError(response.message);
      }
      this.saving = false;
    },(error:any)=>{
      this.saving = false;
      this.toastr.showError(error.error.message);
    });


  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  //#endregion Private methods
}
