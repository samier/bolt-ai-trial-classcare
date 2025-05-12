import { Component, ViewChild, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { FeesService } from '../fees.service';
import { Subject } from 'rxjs';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import Swal from 'sweetalert2';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';
import { AttachmentsComponent } from 'src/app/modules/fees/attachments/attachments.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteOrCancelReasonComponent } from 'src/app/modules/fees/delete-or-cancel-reason/delete-or-cancel-reason.component';
import { ActivatedRoute } from '@angular/router';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-fees-refund-list',
  templateUrl: './fees-refund-list.component.html',
  styleUrls: ['./fees-refund-list.component.scss']
})
export class FeesRefundListComponent implements OnInit {
  @Input() studentDetail:any;
  @Input() refundListReload:any;
  @Output() refundListRefresh:any = new EventEmitter<any>();
  @Output() editModal:any = new EventEmitter<any>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  branchId: any = window.localStorage.getItem('branch');
  academicYearId = null
  feeRefundHistoryData: any = []
  dtTrigger: Subject<any> = new Subject();
  URLConstants = URLConstants;
  receiptModes:any; 
  backDate:any; 

  
  isOpenByClick: boolean = true

  constructor(
    private feesService: FeesService,
    private toastr: Toastr,
    public commonService: CommonService,
    private modalService: NgbModal,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    public  dateFormateService : DateFormatService,
  ) { }

  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['refundListReload'] && changes['refundListReload'].currentValue) {
      this.reloadData()
      
    }
  }

  ngOnInit(): void {
    this.getPermissionsList();
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching : true,
      // scrollX: true,
      scrollCollapse: true, 
      order: [[0, 'desc']],
      stateSave: true,
      stateSaveCallback: function(settings,data) {
        localStorage.setItem('DataTables_' + URLConstants.FEES_REFUND_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.FEES_REFUND_LIST)
          let dataTableState = JSON.parse(state)
          return dataTableState
        } else {
          that.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.state.clear();
          });
          return null;
        }
      },
      ajax: (dataTablesParameters: any, callback) => that.fetchFeesRefundHistory(dataTablesParameters, callback),
      columns: [
        {
          data: 'student.unique_id'
        }, 
        {
          data: 'batch.name'
        }, 
        {
          data: 'student.first_name'
        }, 
        {
          data: 'fees_data.total_amount'
        }, 
        {
          data: 'fees_data.paid_amount'
        }, 
        {
          data: 'fees_data.remaining_fees'
        }, 
        {
          data: 'payment_mode.name'
        }, 
        {
          data: 'total_amount' 
        },
        {
          data: 'categoryRefund.category.type_name'
        },
        {
          data: 'receipt_no'
        },
        { 
          data: 'action', 
          orderable:false, 
          searchable:false 
        },
      ]
    };
  }

  getPermissionsList(){
    this.feesService.getPermissionsList({ permission: true }).subscribe((response:any)=>{
      this.receiptModes = response.data.receipt_mode;
      this.backDate = response.data?.back_date;
    })
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

   async fetchFeesRefundHistory(dataTablesParameters, callback) {
    const requestPayload = {
      ...dataTablesParameters,
      student_id: this.studentDetail ? this.studentDetail.id : null
    }
    this.feesService.fetchFeesRefundHistory(requestPayload).then((response) => {
      this.feeRefundHistoryData = response.data;
      callback({
        recordsTotal: response.recordsTotal,
        recordsFiltered: response.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
    }).catch((error) => {
    });
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  delete(refund,is_cancelled = false){
    if(refund.has_paid_after){
      this.toastr.showError('You can not '+(is_cancelled ? 'cancel' : 'delete')+' this refund, as this category fees has been paid after this refund.');
      return;
    }
    const modalRef = this.modalService.open(DeleteOrCancelReasonComponent,{
      size: 'lg',
      centered: true
    });
    
    const receipt_no = this.getReceiptNumbers(refund?.category_refund);
    modalRef.componentInstance.receipt_no = Object.values(receipt_no);
    modalRef.componentInstance.is_cancelled = is_cancelled;
    modalRef.result?.then((response:any) => {
      if(response && response.status){
        this.feesService.deleteRefund(refund?.id,{reason : response.reason, is_cancelled : is_cancelled}).subscribe((response:any)=>{
          if(response.status) {
            this.reloadData();
            this.toastr.showSuccess(response?.message);
          }else{
            this.toastr.showError(response?.message);
          }
          this.refundListRefresh.emit();
        },(error) => {
          this.toastr.showError(error?.error?.message);
        });
      }
    });
  }

  getReceiptNumbers(category_refund:any){
    const array:any = [];
    category_refund.filter(item => {
        array[item.group_id] = item.receipt_no;
    });
    return array;
  }

  getReceipt(item:any, receipt_no:any){
    const params = {
      receipt_no      : receipt_no.value,
      group_id        : receipt_no.key == 'null' ? null : receipt_no.key,
      is_refund       : true,
      refund_id       : item.id,
    }
    this.feesService.feesReceipt(params).subscribe((response:any)=>{
      this.commonService.downloadFile(response,'Fees Refund Receipt','pdf');
    },(error:any)=>{
        this.toastr.showError(error.error.message);
    });
  }

  attachment(row){
    const modalRef = this.modalService.open(AttachmentsComponent,{
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.refund_id = row.id;
    modalRef.componentInstance.receiptModes = this.receiptModes;
  }

  hasAccess(mode:any){
    return this.receiptModes?.find((item:any)=>{return item.mode == mode});
  }

  hasBackDate(payment_date:any){
    const today = new Date();
    today.setHours(5, 30, 0, 0);
    payment_date = new Date(payment_date);
    if(this.backDate == 1 || today.toString() == payment_date){
      return true;
    }
    return false;
  }

  edit(refund:any){
    this.editModal.emit(refund)
  }
}
