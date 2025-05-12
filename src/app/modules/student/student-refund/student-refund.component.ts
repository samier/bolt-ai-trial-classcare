import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Toastr } from 'src/app/core/services/toastr';
import { StudentService } from "../student.service";
import { ActivatedRoute } from '@angular/router';
import { LeaveManagmentService } from '../../leave-management/leave-managment.service';
import { AddFeesRefundComponent } from '../../fees/add-fees-refund/add-fees-refund.component';

@Component({
  selector: 'app-student-refund',
  templateUrl: './student-refund.component.html',
  styleUrls: ['./student-refund.component.scss']
})
export class studentRefundComponent implements OnInit {
  //#region Public | Private Variables
  student:any;
  unique_id: any;
  refundListReload:any;
  refundReload:any;
  refund_id:any;
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public studentService: StudentService,
    public toastr: Toastr,
    private route: ActivatedRoute,
    public activatedRouteService: ActivatedRoute,
    private leaveManagementSerivce:LeaveManagmentService,
    private modalService: NgbModal,
  ) {}
  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.unique_id = this.route.snapshot.params['unique_id'];
    this.leaveManagementSerivce.getStudentProfileDetail(this.unique_id).subscribe((resp:any) => {
      this.student = resp
    })
  }
  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  refundRefresh(){
    this.refund_id = null
    this.refundListReload = Date.now()    
  }

  refundListRefresh(){
    this.refundReload = Date.now()    

  }

  editModal(refund){
    this.refund_id = refund.id;
    window.scrollTo({
      top: 200, // Scroll 100 pixels from the top
      behavior: 'smooth'
    });
  }
  
}
