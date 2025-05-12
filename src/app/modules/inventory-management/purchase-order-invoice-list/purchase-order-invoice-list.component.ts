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
  selector: 'app-purchase-order-invoice-list',
  templateUrl: './purchase-order-invoice-list.component.html',
  styleUrls: ['./purchase-order-invoice-list.component.scss']
})
export class PurchaseOrderInvoiceListComponent {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody: any;
  login_id: any = 4;
  p: number = 1;
  closeResult: any = "";
  invoice_data: any;
  reasonForRejection: any = '';
  constructor(private inventorySerivce: InventoryService,
    private modalService: NgbModal,
    public CommonService: CommonService,
    public dateFormateService: DateFormatService,
    private toastr: Toastr,
    private formBuilder: FormBuilder,
  ) {
  }
  URLConstants = URLConstants;
  attachment: any = null

  filter: any = false;
  filterCount: any = 0;
  filterForm: FormGroup | any;

  purchaseOrderList:any = [];
  vendorList: any = [];
  paymentStatus: any = [{id: 1, name:'Paid'}];


  ngOnInit(): void {
    this.initForm();
    this.getPurchaseOrderList();
    this.getVendorTypeList();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
        { data: 'purchase_order_no', name:'purchase_order.purchase_order_no' },
        { data: 'vendor_name', name: 'purchase_order.vendor.vendor_name' },
        { data: 'invoice_date' },
        { data: 'invoice_no' },
        { data: 'sub_total' },
        { data: 'discount_total' },
        { data: 'cgst_amount' },
        { data: 'sgst_amount' },
        { data: 'igst_amount' },
        { data: 'other_charges' },
        { data: 'total_amount' },
        { data: 'payment_status' },
        { data: 'action', orderable: false, searchable: false }
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {...dataTablesParameters, ...this.filterForm.value}
    this.inventorySerivce.getInvoiceOrderList(dataTablesParameters).subscribe((resp: any) => {
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

  getPurchaseOrderList(){
    let data = {
      listing: true
    }
    this.inventorySerivce.getPurchaseOrderDropdownList(data).subscribe((resp:any) => {
      if(resp.status==false){
        this.toastr.showError(resp.message);
      }else{
       this.purchaseOrderList = resp.data
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

  delete(id: number) {
    let c = confirm("Are you sure, You want to delete it ?");
    if (c) {
      this.inventorySerivce.deleteInvoice(id).subscribe((res: any) => {
        if(res.status){
          this.toastr.showSuccess(res.message);
        }else{
          this.toastr.showError(res.message);
        }
        this.reloadData();
      });
    }
  }
  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
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
      let d = new Date();
      let time = d.getTime();
      this.downloadFile(res, 'purchase_order_' + time + '.pdf');
    });
  }

  openAttachment(content: any, row: any) {
    this.attachment = {
      id: row.id,
      attachment_url: row.attachment_url,
      attachment_name: row.attachment
    }
    this.modalService.open(content, {
      size: 'lg',
      centered: true
    }).result.then((result) => {
    }, (reason: any) => {
    });
  }

  deleteAttachment(attachment_id: any) {
    let confirm = window.confirm('Are you sure you want to delete this attachment');
    if (confirm) {
      this.inventorySerivce.deleteAttachment(attachment_id).subscribe((resp: any) => {
        if (resp.status) {
          this.toastr.showSuccess(resp.message)
          this.attachment = {
            id: resp.id,
            attachment_url: null,
            attachment_name: null
          }
          this.reloadData();
        } else {
          this.toastr.showError(resp.message)
        }
      })
    }
  }

  getFileType(url: string): string {
    return this.CommonService.getFileType(url)
  }


  open2(content: any, id: any) {
    this.inventorySerivce.getInvoiceDetail(id).subscribe((res: any) => {
      this.invoice_data = res.data;
      // this.modalService.open(MyModalComponent,  { windowClass : "myCustomModalClass"});
      this.modalService.open(content, { centered: true, size: 'lg', windowClass: "myCustomModalClass", ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        let data = { id: id, status: 2, reject_reason: this.reasonForRejection }
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
      });
    });
  }

  countFilters() {
    this.filterCount = 0;
    Object.keys(this.filterForm.value).forEach((item: any) => {
      if ((this.filterForm.value[item] != '' && this.filterForm.value[item] != null) || item == 'status') {
        this.filterCount++;
      }
    })
    if (this.filterForm.value?.invoice_date && this.filterForm.value?.invoice_date?.startDate == null) {
      this.filterCount--;
    }
  }

  clearAll() {
    this.filterForm.reset();
    this.countFilters()
    this.getPurchaseOrderList();
    this.reloadData();
  }

  initForm() {
    this.filterForm = this.formBuilder.group({
      purchase_order_id: [],
      vendor_id: [],
      invoice_date: [],
      payment_status: [],
    });
    this.countFilters()
  }

}
