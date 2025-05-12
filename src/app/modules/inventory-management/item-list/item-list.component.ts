import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { InventoryService } from '../inventory.service';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateFormatService } from 'src/app/service/date-format.service';
@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent {
  
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody:any;

  filter:any = false;
  filterCount: any = 0;
  filterForm: FormGroup | any;
  
  isOpenByClick: boolean = true


  itemTypeList:any = []
  measurementTypeList:any = []
  storeTypeList:any = []
  attachment:any = {}

  fileIcons = this.CommonService.fileIcons;

  constructor(
    private inventorySerivce:InventoryService, 
    private toastr:Toastr,  
    public CommonService: CommonService, 
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    public dateFormateService: DateFormatService,
){
  }
  URLConstants=URLConstants;
  
  ngOnInit(): void {
    this.initForm()
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
        { data: 'item_name' }, 
        { data: 'item_type', name:'inventory_item_type.name' }, 
        { data: 'unit_purchase_price' }, 
        { data: 'unit_sale_price' }, 
        { data: 'measurement_type', name:'measurment_type.name' }, 
        { data: 'item_expire_date' }, 
        { data: 'item_stock' }, 
        { data: 'minimum_stock' },
        { data: 'reorder_qty' }, 
        { data: 'store', name:'inventory_store.name' }, 
        // { data: 'purchase list' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };
    this.getItemList()
    this.getMeasurementTypeList()
    this.getStoreList() 
  }

  loadData(dataTablesParameters?: any, callback?:any ){ 
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.filterForm.value,
    }
    this.inventorySerivce.getItemList(dataTablesParameters).subscribe((resp:any) => {
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
      }, 10);
    });
  }


  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }  

  getItemList(){
    this.inventorySerivce.getItemTypeList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.itemTypeList = res.data;      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });        
  }

  getMeasurementTypeList(){
    this.inventorySerivce.getMeasurementTypeList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.measurementTypeList = res.data;      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }

  getStoreList(){
    this.inventorySerivce.getStoreTypeList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.storeTypeList = res.data;      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }

  delete(id:number){
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.inventorySerivce.deleteItem(id).subscribe((res:any) => {      
        if(res.status == false){
          this.toastr.showError(res.message);
        }else{
          this.toastr.showSuccess(res.message);          
        }
        this.reloadData();
      });             
    }
  }

  getFileType(url: string): string {
    return this.CommonService.getFileType(url)
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
      this.inventorySerivce.deleteItemAttachment(attachment_id).subscribe((resp:any) => {
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

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.filterForm.value).forEach((item:any)=>{
      if((this.filterForm.value[item] != '' && this.filterForm.value[item] != null) || item == 'status'){
        this.filterCount++;
      }
    })
    if(this.filterForm.value?.item_expire_date && this.filterForm.value?.item_expire_date?.startDate == null){
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
      inventory_item_type_id: [],
      measurement_type_id: [],
      item_expire_date: [],
      inventory_store_id: [],
    });
    this.countFilters()
  }
}
