import { Component, ViewChild, OnInit} from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../inventory.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent {
  URLConstants = URLConstants;

  tbody:any;
  storeForm:any;

  is_saving:boolean = false;
  
  isOpenByClick: boolean = true

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  constructor(private inventorySerivce:InventoryService,private toastr: Toastr){
    this.storeForm = new FormGroup({
      name: new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z0-9\- ]*$/)]),
     store_type: new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z0-9\- ]*$/)]),
     record_id:new FormControl('')
    });    
  }

  ngOnInit() {    

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'Id' }, 
        { data: 'name' }, 
        { data: 'store_type' }, 
        { data: 'action',orderable:false,searchable:false },
      ]
    };     
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    this.inventorySerivce.StoreList(dataTablesParameters).subscribe((resp:any) => {
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

  onSubmit(){
    this.is_saving = true;
    this.addItemType(this.storeForm.value);                    
  }  

  addItemType(payload:any){
    let record_id:any = this.storeForm.controls['record_id'].value;
    this.inventorySerivce.addStore(payload,record_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
        this.storeForm.reset()
      }else{
        this.storeForm.reset();
        this.reloadData();
        this.toastr.showSuccess(res.message);        
      }    
      this.is_saving = false;
    },(err:any)=>{
      this.toastr.showError(err.error.message);
      this.is_saving = false;
    });    
  }

  show(id:any){
    this.inventorySerivce.getStoreDetail(id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        console.log(res);
        this.storeForm.controls['name'].setValue(res.data.name);      
        this.storeForm.controls['store_type'].setValue(res.data.store_type);   
        this.storeForm.controls['record_id'].setValue(res.data.id);              
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  delete(id:any){
    let confirmation = confirm("are you sure ? you want delete it ?");
    if(confirmation){
      this.inventorySerivce.deleteStore(id).subscribe((res:any) => {
        if(res.status==false){
          this.toastr.showError(res.message);
        } else{
          this.toastr.showSuccess(res.message);
        }
        this.reloadData();
      },(err:any)=>{
        this.toastr.showError(err.error.message);
      });    
    }    
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
