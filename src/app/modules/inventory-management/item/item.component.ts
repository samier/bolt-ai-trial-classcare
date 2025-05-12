import { Component, ViewChild, OnInit} from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { HraService } from 'src/app/modules/hra/hra.service';
import { DataTableDirective } from 'angular-datatables';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../inventory.service';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent {
  URLConstants = URLConstants;

  tbody:any;
  itemForm:any;

  isSaving:boolean = false;
  
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  isOpenByClick: boolean = true
  constructor(
    private inventorySerivce:InventoryService,
    private toastr: Toastr,
    private _modalService: NgbModal,
  ){
    this.itemForm = new FormGroup({
    name: new FormControl('',[Validators.required]),
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
        { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
        { data: 'name' }, 
        { data: 'action',orderable:false,searchable:false },
      ]
    };     
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    this.inventorySerivce.ItemTypeList(dataTablesParameters).subscribe((resp:any) => {
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
    this.addItemType(this.itemForm.value);                    
  }  

  addItemType(payload:any){
    this.isSaving = true;
    let record_id:any = this.itemForm.controls['record_id'].value;
    this.inventorySerivce.addItemType(payload,record_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.itemForm.reset();
        this.reloadData();
        this.toastr.showSuccess(res.message);        
      }    
      this.isSaving = false;
      this.closeModel()
    },(err:any)=>{
      this.closeModel()
      this.isSaving = false;
      this.toastr.showError(err.error.message);
    });    
  }

  show(id:any){
    this.inventorySerivce.getDetail(id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.itemForm.controls['name'].setValue(res.data.name);      
        this.itemForm.controls['item_code'].setValue(res.data.item_code);   
        this.itemForm.controls['record_id'].setValue(res.data.id);              
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  delete(id:any){
    let confirmation = confirm("are you sure ? you want delete it ?");
    if(confirmation){
      this.inventorySerivce.delete(id).subscribe((res:any) => {
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

  openModel (modalName, item:any) {
      if(item){
        this.itemForm.controls['name'].setValue(item.name);
        this.itemForm.controls['record_id'].setValue(item.id);
      }
    this._modalService.open(modalName,{
      backdrop: true,
    });
  }

  closeModel() {
    this._modalService.dismissAll();
    this.itemForm.reset();
  }

}
