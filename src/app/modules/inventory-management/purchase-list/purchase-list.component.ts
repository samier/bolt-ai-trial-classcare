import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { InventoryService } from '../inventory.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.scss']
})
export class PurchaseListComponent {
  
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  
  isOpenByClick: boolean = true

  tbody:any;
  login_id:any=4;
  p: number = 1;
  record_id:any;
item_name:any="";
  constructor(private inventorySerivce:InventoryService,private route:ActivatedRoute){
    this.record_id=this.route.snapshot.paramMap.get('id');
  }
  URLConstants=URLConstants;
  
  ngOnInit(): void {
    this.getInventoryItemDetail();
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
        { data: 'inventory_item'}, 
        { data: 'vendor_name' }, 
        { data: 'purchase_order' }, 
        { data: 'purchase_date' }, 
        { data: 'quantity' }, 
        { data: 'measurment_type' },
        { data: 'total_amount' }, 
        { data: 'tax_amount' }, 
        { data: 'invoice_number' }, 
        { data: 'invoice_date' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }
  getInventoryItemDetail(){
    this.inventorySerivce.getInventoryItemDetail(this.record_id).subscribe((res:any) => {      
      this.item_name = res.data.item_name;      
      console.log(res);
    });     
  }
  loadData(dataTablesParameters?: any, callback?:any ){
    if(this.record_id != undefined && this.record_id != 0){
      Object.assign(dataTablesParameters,{record_id:this.record_id})
    }    
    this.inventorySerivce.getPurchaseList(dataTablesParameters).subscribe((resp:any) => {
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
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.inventorySerivce.deletePurechaseOrder(id).subscribe((res:any) => {      
        console.log(res); 
        this.reloadData();
      });             
    }
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
