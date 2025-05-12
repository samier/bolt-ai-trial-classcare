import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { InventoryService } from '../inventory.service';
import { CommonService } from 'src/app/core/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.scss']
})
export class VendorListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody:any;
  vendorDetils:any = null

  
  isOpenByClick: boolean = true


  constructor(
    private inventorySerivce:InventoryService,  
    public CommonService: CommonService,
      private modalService: NgbModal,
      private toastr: Toastr,
  ){
  }
  URLConstants=URLConstants;
  
  ngOnInit(): void {
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
        { data: 'vendor_name'}, 
        { data: 'vendor_office_no' }, 
        { data: 'vendor_office_email' }, 
        { data: 'contact_person_name' }, 
        { data: 'contact_person_no' }, 
        { data: 'contact_person_whatsapp_no' }, 
        { data: 'contact_person_email' }, 
        { data: 'address' }, 
        { data: 'state', name: 'state_name.name' }, 
        { data: 'city', name: 'city_name.name' }, 
        { data: 'pincode' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    this.inventorySerivce.vendorList(dataTablesParameters).subscribe((resp:any) => {
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

  delete(id:number){
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.inventorySerivce.deleteVendor(id).subscribe((res:any) => {   
        if(res.status){
          this.toastr.showSuccess(res.message);
        }   else{
          this.toastr.showError(res.message);
        }
        this.reloadData();
      });             
    }
  }
 
  openModal(content:any, row:any){
    this.inventorySerivce.getVendorDetail(row.id).subscribe((res:any) => {
      this.vendorDetils = res.data;
      this.modalService.open(content,{
        size: 'lg',
        centered: true
      }).result.then((result) => {
      },(reason:any) => {
      });
    });    
  }
}
