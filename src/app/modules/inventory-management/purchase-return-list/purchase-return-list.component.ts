import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { InventoryService } from '../inventory.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { DateFormatService } from 'src/app/service/date-format.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-purchase-return-list',
  templateUrl: './purchase-return-list.component.html',
  styleUrls: ['./purchase-return-list.component.scss']
})
export class PurchaseReturnListComponent {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  
  isOpenByClick: boolean = true

  tbody:any;
  login_id:any=4;
  p: number = 1;
  closeResult:any="";
  return_purchase_data:any;
  reasonForRejection:any='';
  URLConstants=URLConstants;

  filter: any = false;
  filterCount: any = 0;
  filterForm: FormGroup | any;
  attachment:any = null

  purchaseOrderList:any = [];
  vendorList: any = [];
  userList:any = [];
  invoiceList:any = [];

  
  constructor(private inventorySerivce:InventoryService,
    private modalService: NgbModal,
    public CommonService: CommonService,
    private toastr: Toastr,
    public dateFormateService: DateFormatService,
    private formBuilder: FormBuilder,
  ){
  }
  
  
  ngOnInit(): void {
    this.initForm();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX:true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },      
     columns: [
        { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
        { data: 'purchase_order', name:'purchase_order.purchase_order_no'}, 
        { data: 'vendor_name', name: 'vendor.vendor_name'}, 
        { data: 'invoice_no', name:'invoice.invoice_no' }, 
        { data: 'return_date' }, 
        { data: 'return_by' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };
    this.getPurchaseOrderList();
    this.getVendorTypeList();
    this.getUserList();
    this.getInvoiceListByPo(null)
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    dataTablesParameters = {...dataTablesParameters, ...this.filterForm.value}
    this.inventorySerivce.getPurchaseReturnList(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;            
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }


  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }  

  delete(id:number){
    let c = confirm("Are you sure, You want to delete it ?");
    if(c){
      this.inventorySerivce.deletePurchaseReturn(id).subscribe((res:any) => {      
        if(res.status){
          this.toastr.showSuccess(res.message);
        }else{
          this.toastr.showError(res.message);
        }
        this.reloadData();
      });             
    }
  }

  handlePurchaseOrder(){
    this.filterForm.controls['invoice_id'].setValue(null)
    this.getInvoiceListByPo(this.filterForm.value.purchase_order_id);
    this.filterCount()
  }

  getPurchaseOrderList(){
    this.inventorySerivce.getPurchaseOrderDropdownList().subscribe((resp:any) => {
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

  getInvoiceListByPo(id:any){
    let data = {
      purchase_order_id: id
    }
    this.inventorySerivce.getInvoiceListByPo(data).subscribe((resp:any)=>{
      if(resp.status){
          this.invoiceList = resp.data.invoice_list
      }
    })
  }

  getUserList(){
    this.inventorySerivce.getUserList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.userList = res.data.map((item:any)=>{
          return {id:item.id,name:item.full_name};      
        });
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
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
      this.inventorySerivce.deletePurchaseReturnAttachment(attachment_id).subscribe((resp: any) => {
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

  open2(content:any,id:any) {
    this.inventorySerivce.getPurchaseReturnDetail(id).subscribe((res:any) => {      
      this.return_purchase_data=res.data;
      // this.modalService.open(MyModalComponent,  { windowClass : "myCustomModalClass"});
      this.modalService.open(content, { centered: true, size: 'lg', windowClass: "myCustomModalClass", ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        let data = {id:id,status:2,reject_reason:this.reasonForRejection}        
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        
      });                        
    });            
  }

  getFileType(url: string): string {
    return this.CommonService.getFileType(url)
  }

  countFilters() {
    this.filterCount = 0;
    Object.keys(this.filterForm.value).forEach((item: any) => {
      if ((this.filterForm.value[item] != '' && this.filterForm.value[item] != null) || item == 'status') {
        this.filterCount++;
      }
    })
    if (this.filterForm.value?.return_date && this.filterForm.value?.return_date?.startDate == null) {
      this.filterCount--;
    }
  }

  clearAll() {
    this.filterForm.reset();
    this.countFilters()
    this.getInvoiceListByPo(null)
    this.reloadData();
  }

  initForm() {
    this.filterForm = this.formBuilder.group({
      purchase_order_id: [],
      vendor_id: [],
      invoice_id: [],
      return_date: [],
      return_by: [],
    });
    this.countFilters()
  }
}
