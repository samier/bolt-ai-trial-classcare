import { Component, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { InventoryService } from '../inventory.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';
import { DateFormatService } from 'src/app/service/date-format.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-internal-issue-list',
  templateUrl: './internal-issue-list.component.html',
  styleUrls: ['./internal-issue-list.component.scss']
})

export class InternalIssueListComponent {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  
  isOpenByClick: boolean = true

  tbody:any;
  login_id:any=4;
  p: number = 1;
  closeResult: any = "";
  issue_item: any;
  reasonForRejection: any = '';
  storeTypeList: any;
  itemTypeList: any;
  itemList: any;
  userList: any;
  store_type: any = "";
  item_type: any = "";
  item: any = "";
  issued_to_employee: any = "";
  issued_to_student: any = "";
  approved_by: any = "";
  from_date: any;
  to_date: any;
  studentList: any;

  filter: any = false;
  filterCount: any = 0;
  filterForm: FormGroup | any;

  paymentTypeList:any = [];
  issuedByUserList:any = [];
  attachment:any = null

  constructor(private inventorySerivce: InventoryService,
    private modalService: NgbModal,
    private toastr: Toastr,
    public CommonService: CommonService,
    public dateFormateService: DateFormatService,
    private formBuilder: FormBuilder,
  ) {
  }
  URLConstants = URLConstants;




  ngOnInit(): void {
    this.initForm()
    this.getPaymentTypeList()
    this.getUserList()
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX:true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
        { data: 'item_issue_for' },
        { data: 'name' },
        { data: 'issue_no' },
        { data: 'issue_type' },
        { data: 'item_issue_date' },
        { data: 'sub_total' },
        { data: 'discount_amount' },
        { data: 'total' },
        { data: 'payment_required' },
        { data: 'payment_status' },
        { data: 'payment_mode_id', name: 'payment_mode.mode' },
        { data: 'issued_by_user' },
        { data: 'action', orderable: false, searchable: false }
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {...dataTablesParameters, ...this.filterForm.value};
    this.inventorySerivce.getInternalIssueList(dataTablesParameters).subscribe((resp: any) => {
      this.tbody = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });

      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 100);
    });
  }


  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  delete(id: number) {
    let c = confirm("Are you sure, You want to delete it ?");
    if (c) {
      this.inventorySerivce.deleteInternalIssue(id).subscribe((res: any) => {
        if(res.status){
          this.toastr.showSuccess(res.message);
        }else{
          this.toastr.showError(res.message);
        }
        this.reloadData();
      });
    }
  }

  getPaymentTypeList(){
    this.inventorySerivce.getPaymentTypeList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.paymentTypeList = res.data;      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }

  getUserList(){
    this.inventorySerivce.getUserList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.issuedByUserList = res.data.map((item:any)=>{
          return {id:item.id,name:item.full_name};      
        });
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
   }

   downloadFile(res: any, file: any) {
    let fileName = file;
    let blob: Blob = res.body as Blob;
    let a = document.createElement('a');
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob)
    a.click();
  }

  downloadPurchaseOrder(id: any) {
    this.inventorySerivce.downloadPurchaseOrder(id).subscribe((res: any) => {
      let fileName = "purchase_order";
      let blob: Blob = res.body as Blob;
      let pdfSrc = window.URL.createObjectURL(blob)

      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      setTimeout(() => {
        iframe.contentWindow?.print();
      }, 200);

    });
  }

   openAttachment(content:any, row:any){
    this.attachment = {
      id: row.id,
      attachment_url: row.attachment_url,
      attachment_name : row.attachment
    }
    this.modalService.open(content,{
      size: 'lg',
      centered: true
    }).result.then((result) => {
    },(reason:any) => {
    });
  }

   deleteAttachment(attachment_id:any){
    let confirm = window.confirm('Are you sure you want to delete this attachment');
    if(confirm){
      this.inventorySerivce.deleteInternalIssueAttachment(attachment_id).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
          this.attachment = {
            id: resp.id,
            attachment_url: null,
            attachment_name : null
          }
          this.reloadData();
        }else{
          this.toastr.showError(resp.message)
        }
      })
    }
  }

  getFileType(url: string): string {
    return this.CommonService.getFileType(url)
  }

  clear() {
    this.item_type = "";
    this.item = "";
    this.store_type = "";
    this.issued_to_employee = "";
    this.issued_to_student = "";
    this.approved_by = "";
    this.from_date = "";
    this.to_date = "";
    this.reloadData();
  }


  open2(content: any, id: any) {
    this.inventorySerivce.getInternalIssueDetail(id).subscribe((res: any) => {
      this.issue_item = res.data;
      // this.modalService.open(MyModalComponent,  { windowClass : "myCustomModalClass"});
      this.modalService.open(content, { size: 'lg', windowClass: "myCustomModalClass", ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        let data = { id: id, status: 2, reject_reason: this.reasonForRejection }
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
      });
    });
  }

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.filterForm.value).forEach((item:any)=>{
      if((this.filterForm.value[item] != '' && this.filterForm.value[item] != null) || item == 'status'){
        this.filterCount++;
      }
    })
    if(this.filterForm.value?.item_issue_date && this.filterForm.value?.item_issue_date?.startDate == null){
      this.filterCount--;
    }
  }
  
  clearAll(){
    this.filterForm.reset();
    this.filterForm.controls['item_issue_for'].setValue("")
    this.filterForm.controls['issue_type'].setValue("")
    this.filterForm.controls['payment_required'].setValue("")
    this.filterForm.controls['payment_status'].setValue("")
    this.countFilters()
    this.reloadData();
  }

  initForm() {
    this.filterForm = this.formBuilder.group({
      item_issue_for : [""],
      issued_by: [],
      issue_type : [""],
      item_issue_date : [],
      payment_required : [""],
      payment_status: [""],
      payment_mode_id: [],
    });
    this.countFilters()
  }
}
