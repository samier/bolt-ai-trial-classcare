import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Toastr } from 'src/app/core/services/toastr';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-delete-or-cancel-reason',
  templateUrl: './delete-or-cancel-reason.component.html',
  styleUrls: ['./delete-or-cancel-reason.component.scss']
})
export class DeleteOrCancelReasonComponent implements OnInit {

  is_cancelled:boolean = false;
  is_edit:boolean = false;
  reason:any;
  receipt_no:any;
  wallet:any;

  constructor(
    private modalRef: NgbActiveModal,
    private toastr: Toastr,
    public  dateFormateService : DateFormatService,
  ) { }

  ngOnInit(): void {
  }

  closeModal() {
    this.modalRef.close({status:false});
  }

  deleteOrCancelFees(){
    if(this.reason){
      this.modalRef.close({status:true,reason:this.reason});
    }else{
      this.toastr.showError('Please enter reason');
    }
  }
}
