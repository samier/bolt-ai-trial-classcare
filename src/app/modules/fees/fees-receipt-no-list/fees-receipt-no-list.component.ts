import { Component, ViewChild } from '@angular/core';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FeesService } from '../fees.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-fees-receipt-list',
  templateUrl: './fees-receipt-no-list.component.html',
  styleUrls: ['./fees-receipt-no-list.component.scss']
})
export class FeesReceiptListComponent {
  
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  tbody:any;
  constructor(
    private toastr: Toastr,
    private feesService: FeesService
  ) {
  
  }

  
  isOpenByClick: boolean = true

  URLConstants = URLConstants;

  ngOnInit(): void {    

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
        { data: 'id' },
        { data: 'prefix'},
        { data: 'receipt_no'},
        { data: 'fees_receipt_type' },
        { data: 'fees_setting_type' },
        { data: 'branches', width: '500px' },
        { data: 'sections', width: '300px' },
        { data: 'fees_categories', width: '300px' },        
        { data: 'trust' },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?:any ){    
    dataTablesParameters = {      
      ...dataTablesParameters,     
    };        
    
    this.feesService.getFeesReceiptList(dataTablesParameters).subscribe((resp:any) => {
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

  delete(id:any){
    let confirm = window.confirm('Are you sure you want to delete this receipt setting?')
    if(confirm){
      this.feesService.deleteFeesReceiptNo(id).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.status)
          this.reloadData();
        }
      })
    }
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getFeesSettingType(id:any){
    if(id == 1){
      return 'Default';
    }else if(id == 2){
      return 'Branch Wise';
    }else if(id == 3){
      return 'Section Wise';
    }else{
      return 'Trust Wise';
    }
  }

  getFeesReceiptType(id:any){
    if(id == 1){
      return 'Fees';
    }else if(id == 2){
      return 'Fees Refund';
    }else if(id == 3){
      return 'Wallet';
    }else{
      return 'N/A';
    }
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  formatArray(array:any){
      if(array.length > 0){
        return array.join(' | ');
      }else{
        return null;
      }
  }

}