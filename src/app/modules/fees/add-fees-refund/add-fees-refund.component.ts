import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FeesService } from '../fees.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/services/common.service';
import { FeesConfirmationComponent } from 'src/app/modules/fees/fees-confirmation/fees-confirmation.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-add-fees-refund',
  templateUrl: './add-fees-refund.component.html',
  styleUrls: ['./add-fees-refund.component.scss']
})

export class AddFeesRefundComponent implements OnInit {
  @Input() studentDetail:any;
  @Input() refundReload:any;
  @Input() refundData:any;
  @Output() refundRefresh:any = new EventEmitter<any>();
  payment_modes: any;
  payment_mode: any = 1;
  edit: any;
  card_type:any = "1";
  feesHistory:any;
  total_paid:any = 0;
  total_refund:any = 0; 
  backDate:any; 
  receiptModes:any; 
  student:any; 
  refund_id:any; 
  feesRefund:any; 
  refund_date:any = moment(new Date()).format('yyyy-MM-DD');
  disableSave:Number=0;
  editableCategories:any;
  errors:any;
  formSubmitted:boolean = false;

  constructor(
    private feesService: FeesService,
    private toastr:Toastr,
    private router: Router,
    private route: ActivatedRoute,
    public commonService: CommonService,
    private modalService: NgbModal,
    private _dateFormatService: DateFormatService,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['refundReload'] && changes['refundReload'].currentValue) {
      this.onStudentSelect(this.studentDetail);
      
    }
    if (changes['refundData'] && changes['refundData'].currentValue) {
     this.refund_id = this.refundData;
     if(this.refund_id){
      const editableCategories = localStorage.getItem('edit_refund_categories_'+this.refund_id);
      if(editableCategories){
        this.editableCategories = editableCategories.split(',');
      }
      this.onStudentSelect();
    }
    }
  }

  ngOnInit(): void {
    if(this.studentDetail){
      this.onStudentSelect(this.studentDetail);
    }
    this.refund_id = this.route.snapshot.params['id'];
    if(this.refund_id){
      const editableCategories = localStorage.getItem('edit_refund_categories_'+this.refund_id);
      if(editableCategories){
        this.editableCategories = editableCategories.split(',');
      }
      this.onStudentSelect();
    }
    this.getPaymentModes();
  }

  ngOnDestroy(){
    localStorage.removeItem('edit_refund_categories_'+this.refund_id);
  }

  getPaymentModes(){
    this.feesService.getPermissionsList({ permission: true }).subscribe((response:any)=>{
      this.payment_modes = response.data.payment_modes;
      this.receiptModes = response.data.receipt_mode;
      if(this.feesRefund?.payment_mode?.id && !this.payment_modes?.find(item=>item.id == this.feesRefund?.payment_mode?.id)){
        this.payment_modes.push(this.feesRefund?.payment_mode);
      }
      this.backDate = response.data?.back_date;
    })
  }

  paymentModeValidate(delay = 0){
    if(this.formSubmitted){
      setTimeout(()=>{
        const form = document.getElementById('fees-refund') as HTMLFormElement;
        const formData:any = new FormData(form);
        this.errors = this.commonService.paymentModeValidator(formData,this.payment_mode);
      },delay);
    }
  }

  onSubmit(print = false) {
    this.formSubmitted = true;
    if(!this.student?.id){
      this.toastr.showError('Please select student');
      return;
    }
    if(this.total_refund == 0){
      this.toastr.showError('Refund amount can not be 0');
      return;
    }
    const form = document.getElementById('fees-refund') as HTMLFormElement;
    const formData:any = new FormData(form);
    this.errors = this.commonService.paymentModeValidator(formData,this.payment_mode);
    if(Object.keys(this.errors)?.length > 0){
      return;
    }

    const modalRef = this.modalService.open(FeesConfirmationComponent,{
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.student = this.student;
    modalRef.componentInstance.selectedFees = this.feesHistory?.filter((item:any)=>item.refund_amount > 0);
    modalRef.componentInstance.payment_date = this.refund_date;
    modalRef.componentInstance.total_amount = this.total_refund;
    modalRef.componentInstance.type = 2;
    modalRef.componentInstance.payment_mode = this.payment_modes?.find((item:any)=>item.id == this.payment_mode);
    modalRef.result?.then((response:any) => {
      if(response && response.save)
      {
        formData.append('student_id',this.student.id);
        formData.append('payment_mode',this.payment_mode);
        formData.append('refund_date',this.refund_date);
        if(this.refund_id){
          formData.append('refund_id',this.refund_id);
        }
        this.disableSave = print ? 2 : 1;
        this.feesService.saveStudentRefund(formData).then((response:any) => {
          if(response.status) {
            if(print){
              this.feesReceipt(response.data);
            }
            if(!this.studentDetail){
              this.router.navigate([this.setUrl('/fees/fees-refund-list')])
            }else{
              this.clear();
            }
            this.toastr.showSuccess(response?.message);
          }else{
            this.toastr.showError(response?.message);
          }
          this.disableSave = 0;
        }).catch((error) => {
          this.disableSave = 0;
          this.toastr.showError(error?.error?.message);
        });
      }
    });
  }

  feesReceipt(row){
    const params = {
      receipt_no      : row.receipt_no,
      is_refund       : true,
      refund_id       : row.refund_id,
    }
    this.feesService.feesReceipt(params).subscribe((response:any)=>{
      this.commonService.downloadFile(response,'Fees Receipt','pdf');
    },(error:any)=>{
        this.toastr.showError(error.error.message);
    });
  }

  onStudentSelect(student?: any) {
    this.student = student;
    const params = {
      student_id:this.student?.id,
      refund_id:this.refund_id
    };
    this.feesService.getStudentFeesHistory(params).then((response:any) => {
      if(response.status) {
        this.feesHistory = response.data.feesHistory;
        this.feesRefund = response.data.feesRefund;
        if(this.feesRefund){
          this.payment_mode = this.feesRefund.payment_mode_id;
          this.refund_date = this.feesRefund.refund_date;
          this.card_type = this.feesRefund?.card_detail?.card_type?.toString();
          this.student = this.feesRefund?.student;
          if(!this.payment_modes?.find(item=>item.id == this.feesRefund?.payment_mode?.id)){
            this.payment_modes?.push(this.feesRefund?.payment_mode);
          }
        }
        this.calculateTotalFees();
        this.calculateTotalRefund();
      }else{
        this.toastr.showError(response?.message);
      }
    }).catch((error) => {
      this.toastr.showError(error?.error?.message);
    });
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  changeRefundAmount(fees,event){
    const amount = Number(event.target.value);
    if(amount > fees.paid_amount){
      fees.refund_amount = event.target.value = fees.paid_amount;
      this.toastr.showError('Refund can not be higher than '+fees.paid_amount);
    }else if(amount < 0){
      fees.refund_amount = event.target.value = 0;
      this.toastr.showError('Refund can not be lower than 0');
    }else{
      fees.refund_amount = amount;
    }
    this.calculateTotalRefund();
  }

  calculateTotalRefund(){
    this.total_refund = 0;
    this.total_refund = this.feesHistory?.reduce((sum, current) => sum + (current.refund_amount??0), 0);
  }

  calculateTotalFees(){
    this.total_paid = 0;
    this.total_paid = this.feesHistory?.reduce((sum, current) => sum + (current.paid_amount??0), 0);
  }

  changeDateFormat(dateString: any, format:any = 'yyyy-MM-DD') {
    try {
        const parsedDate = moment(dateString);
        return parsedDate.format(format);
    } catch (error) {
        return 'Invalid Date';
    }
  }

  changeRefundDate(event){
    const today = new Date();
    const date = new Date(event.target.value);
    if (today.getTime() < date.getTime()) {
      event.target.value = this.changeDateFormat(new Date());
      this.toastr.showError('Future Date Not Allowed');
    }else if(this.backDate == 0 && today.getTime() > date.getTime()){
      event.target.value = this.changeDateFormat(new Date());
      this.toastr.showError('Past Date Not Allowed');
    }
  }

  clear(){
    const textarea:any = document.querySelector('textarea[name="remarks"]') as HTMLFormElement;
    textarea.value = null;
    this.formSubmitted = false;
    this.payment_mode = 1; 
    this.refund_date = moment(new Date()).format('yyyy-MM-DD');
    this.feesRefund = null;
    this.feesHistory.remark
    this.refund_id = null;
    this.onStudentSelect(this.studentDetail);
    this.refundRefresh.emit();
  }

  currentDate():string {
    const date = moment(new Date()).format('yyyy-MM-DD');
    return date;
  }
}
