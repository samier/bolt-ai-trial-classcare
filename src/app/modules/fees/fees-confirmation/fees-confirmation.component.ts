import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-fees-confirmation',
  templateUrl: './fees-confirmation.component.html',
  styleUrls: ['./fees-confirmation.component.scss']
})
export class FeesConfirmationComponent implements OnInit {
  //#region Public | Private Variables
  student:any;
  selectedFees:any;
  total:any = 0;
  total_discount:any = 0;
  payment_date:any;
  total_amount:any = 0;
  payment_mode:any;
  type:number = 1;

  message : any ={
    is_father_message : false ,
    is_mother_message : false,
    is_student_message: false
  }

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public modalRef: NgbActiveModal,
    public modalService: NgbModal,
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    if(this.type == 1){
      this.total_discount = this.selectedFees?.reduce((sum, item) => sum + (item.added_discount??0), 0);
    }
    this.total = this.selectedFees?.reduce((sum, item) => sum + (item.paying_amount??item.refund_amount??0), 0);
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  closeModal(save = false) {
    this.modalRef.close({save:save,message:this.message});
  }
  //#endregion Public methods
}
