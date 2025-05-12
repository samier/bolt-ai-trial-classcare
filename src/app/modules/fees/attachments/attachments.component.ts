import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { FeesService } from '../fees.service';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit {

  loader:boolean = true;
  showDelete:boolean = true;
  receipt_no:any;
  group_id:any;
  refund_id:any;
  receiptModes:any;
  attachments:any = [];
  fileIcons:any = {
    "pdf" : './assets/img/files/file.png',
    "png" : './assets/img/files/image.png',
    "jpg" : './assets/img/files/image.png',
    "jpeg" : './assets/img/files/image.png',
    "gif" : './assets/img/files/image.png',
    "webp" : './assets/img/files/image.png',
  };

  constructor(
    public commonService: CommonService,
    public feesService: FeesService,
    public modalRef: NgbActiveModal,
    public toastr: Toastr,
  ) {}

  ngOnInit(): void {
    this.getList();
  }

  getList(){
    if(!this.refund_id){
      this.feesService.feesAttachments({receipt_no:this.receipt_no,group_id:this.group_id}).subscribe((res:any) => {
        this.attachments = res.data;
        this.loader = false;
      })
    }else{
      this.feesService.feesRefundAttachments({refund_id:this.refund_id}).subscribe((res:any) => {
        this.attachments = res.data;
        this.loader = false;
      })
    }
  } 

  closeModal() {
    this.modalRef.dismiss();
  }

  deleteAttachement(file:any){
    this.loader = true;
    
    const params = {
      attachment_id : file.id,
      receipt_no : this.receipt_no,
      group_id : this.group_id,
    };

    this.feesService.deleteAttachement(params).subscribe((response:any) => {
      this.loader = false;
      if(response.status){
        this.toastr.showSuccess(response.message);
        this.attachments = response.data;
      }else{
        this.toastr.showError(response.message);
      }
    },(error:any)=>{
        this.toastr.showError(error.error.message);
    });
  }

  deleteRefundAttachement(file:any){
    this.loader = true;
    
    const params = {
      attachment_id : file.id,
      refund_id : this.refund_id,
    };

    this.feesService.deleteRefundAttachement(params).subscribe((response:any) => {
      this.loader = false;
      if(response.status){
        this.toastr.showSuccess(response.message);
        this.attachments = response.data;
      }else{
        this.toastr.showError(response.message);
      }
    },(error:any)=>{
        this.toastr.showError(error.error.message);
    });
  }

  hasAccess(mode:any){
    return this.receiptModes?.find((item:any)=>{return item.mode == mode});
  }
}
