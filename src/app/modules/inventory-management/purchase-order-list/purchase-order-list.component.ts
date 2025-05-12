import { Component, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { InventoryService } from '../inventory.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { CommonService } from 'src/app/core/services/common.service';
import { DateFormatService } from 'src/app/service/date-format.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
import { requisitionStatus } from 'src/app/common-config/static-value';
@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html',
  styleUrls: ['./purchase-order-list.component.scss']
})
export class PurchaseOrderListComponent {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  
  isOpenByClick: boolean = true

  tbody:any;
  login_id:any=4;
  p: number = 1;
  closeResult: any = "";
  requisition_modal_data: any;
  reasonForRejection: any = '';

  constructor(private inventorySerivce: InventoryService,
     private modalService: NgbModal,
     public CommonService: CommonService,
    public dateFormateService: DateFormatService,
    private toastr:Toastr, 
     private formBuilder: FormBuilder,
  ) {
  }
  URLConstants = URLConstants;
  attachment:any = null

  filter:any = false;
  filterCount: any = 0;
  filterForm: FormGroup | any;

  vendorList:any = [];
  paymentModes:any = [];
  paymentStatus:any = requisitionStatus;
  UserList:any = [];

  ngOnInit(): void {
    this.initForm();
    this.getUserList();
    this.getVendorTypeList();
    this.getPaymentTypeList(); 
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
      { data: 'purchase_order_no' },
      { data: 'payment_status' },
      { data: 'total_amount' },
      { data: 'purchase_order_date' },
      { data: 'delivery_date' },
      { data: 'vendor_id', name:'vendor.vendor_name' },
      { data: 'purchase_by_name' },
      { data: 'action', orderable: false, searchable: false }
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {...dataTablesParameters, ...this.filterForm.value}
    this.inventorySerivce.getPurchaseOrderList(dataTablesParameters).subscribe((resp: any) => {
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
      this.inventorySerivce.deletePurchaseOrder(id).subscribe((res: any) => {
        if(res.status){
          this.toastr.showSuccess(res.message);
        }else{
          this.toastr.showError(res.message);
        }
        this.reloadData();
      });
    }
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
      this.inventorySerivce.deletePurchaseOrderAttachment(attachment_id).subscribe((resp:any) => {
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

  open2(content: any, id: any) {
    this.inventorySerivce.getPOFullDetail(id).subscribe((res: any) => {
      this.requisition_modal_data = res.data;
      // this.modalService.open(MyModalComponent,  { windowClass : "myCustomModalClass"});
      this.modalService.open(content, { centered: true, size: 'lg', windowClass: "myCustomModalClass", ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        let data = { id: id, status: 2, reject_reason: this.reasonForRejection }
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        
      });
    });
  }

  getUserList(){
    this.inventorySerivce.getUserList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.UserList = res.data.map((item:any)=>{
          return {id:item.id,name:item.full_name};      
        });
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
   }

   getVendorTypeList(){  
    this.inventorySerivce.getVendorTypeList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.vendorList = res.data.map((el:any) => {
          return {...el, name: el.vendor_name}
        });      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }
  
    getPaymentTypeList(){
      this.inventorySerivce.getPaymentTypeList().subscribe((res:any) => {
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.paymentModes = res.data;      
        }    
      },(err:any)=>{
        this.toastr.showError(err.error.message);
      });
    }

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.filterForm.value).forEach((item:any)=>{
      if((this.filterForm.value[item] != '' && this.filterForm.value[item] != null) || item == 'status'){
        this.filterCount++;
      }
    })
    if(this.filterForm.value?.delivery_date && this.filterForm.value?.delivery_date?.startDate == null){
      this.filterCount--;
    }
  }
  
  clearAll(){
    this.filterForm.reset();
    this.countFilters()
    this.reloadData();
  }

  initForm() {
    this.filterForm = this.formBuilder.group({
      vendor_id: [],
      payment_option: [],
      payment_status: [],
      purchase_by: [],
      delivery_date: [],
    });
    this.countFilters()
  }


}
