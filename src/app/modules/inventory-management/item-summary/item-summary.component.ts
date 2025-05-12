import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { InventoryService } from '../inventory.service';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-item-summary',
  templateUrl: './item-summary.component.html',
  styleUrls: ['./item-summary.component.scss']
})
export class ItemSummaryComponent {
  
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody:any;
  login_id:any=4;
  p: number = 1;

  filter:any = false;
  filterCount: any = 0;
  filterForm: FormGroup | any;

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
){
  }
  URLConstants=URLConstants;
  
  ngOnInit(): void {
    this.initForm()
    this.getItemList()
    this.getMeasurementTypeList()
    this.getStoreList()
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX:true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
      { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false }, 
        { data: 'item_name' }, 
        { data: 'item_type', name:'inventory_item_type.name' }, 
        { data: 'warehouse', name:'inventory_store.name' }, 
        { data: 'item_stock' }, 
        { data: 'purchase_quantity' }, 
        { data: 'return_quantity' }, 
        { data: 'issue_quantity' }, 
        { data: 'return_issue_quantity' }, 
        { data: 'discard_quantity' }, 
        { data: 'total_quantity' }, 
        { data: 'minimum_stock' }, 
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.filterForm.value,
    }
    this.inventorySerivce.getItemSummaryList(dataTablesParameters).subscribe((resp:any) => {
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

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.filterForm.value).forEach((item:any)=>{
      if((this.filterForm.value[item] != '' && this.filterForm.value[item] != null) || item == 'status'){
        this.filterCount++;
      }
    })
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
      inventory_store_id: [],
    });
    this.countFilters()
  }
}
