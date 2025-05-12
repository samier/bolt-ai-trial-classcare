import { Component, ViewChild, OnInit} from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../inventory.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-item-vendor',
  templateUrl: './add-item-vendor.component.html',
  styleUrls: ['./add-item-vendor.component.scss']
})
export class AddItemVendorComponent {
  URLConstants = URLConstants;

  is_disabled = true;
  is_approved = false;
  reasonForRejection='';
  closeResult: string = '';
  tbody:any;
  storeForm:any;
  itemTypeList:any;
  vendor_id:any;
  vendorName="";
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  constructor(private inventorySerivce:InventoryService,private toastr: Toastr,private route: ActivatedRoute){
    this.vendor_id = this.route.snapshot.paramMap.get('id');
    this.storeForm = new FormGroup({
      item_name: new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z0-9\- ]*$/)]),
      inventory_item_type_id: new FormControl('',[Validators.required]),
      discription: new FormControl('',[Validators.required]),
      record_id: new FormControl('')
    });    
  }

  ngOnInit() {    
    this.setVendorName();
    this.getItemList();    
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'Id' }, 
        { data: 'item_name' }, 
        { data: 'category_type' }, 
        { data: 'description' }, 
        { data: 'action',orderable:false,searchable:false },
      ]
    };     
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

  loadData(dataTablesParameters?: any, callback?:any ){
    Object.assign(dataTablesParameters,{vendor_id:this.vendor_id})
    this.inventorySerivce.VendorItemList(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;   
      console.log(this.tbody);         
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

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  onSubmit(){
    this.addVendorItem(this.storeForm.value);                    
  }  

  addVendorItem(payload:any){
    let record_id:any = this.storeForm.controls['record_id'].value;
    if(this.vendor_id != null){
      Object.assign(payload,{vendor_id:this.vendor_id});
      this.inventorySerivce.addVendorItem(payload,record_id).subscribe((res:any) => {
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.storeForm.reset();
          this.reloadData();
          this.toastr.showSuccess(res.message);        
        }    
      },(err:any)=>{
        this.toastr.showError(err.error.message);
      });        
    }
  }

  show(id:any){
    this.inventorySerivce.getVendorItemDetail(id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.storeForm.controls['item_name'].setValue(res.data.item_name);      
        this.storeForm.controls['inventory_item_type_id'].setValue(res.data.inventory_item_type_id);   
        this.storeForm.controls['discription'].setValue(res.data.discription);  
        this.storeForm.controls['record_id'].setValue(res.data.id);  
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  delete(id:any){
    let confirmation = confirm("are you sure ? you want delete it ?");
    if(confirmation){
      this.inventorySerivce.deleteVendorItem(id).subscribe((res:any) => {
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.toastr.showSuccess(res.message);          
          this.reloadData();
        } 
      },(err:any)=>{
        this.toastr.showError(err.error.message);
      });    
    }    
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
  setVendorName(){    
    this.inventorySerivce.getVendorDetail(this.vendor_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        console.log(res);
        this.vendorName = res.data.name;             
      }        
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }
}
