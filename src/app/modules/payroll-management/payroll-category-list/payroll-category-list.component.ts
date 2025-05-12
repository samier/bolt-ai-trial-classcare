import { Component,ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { PayrollService } from '../payroll.service';
import { Toastr } from 'src/app/core/services/toastr';
import { TransportService } from '../../transport-management/transport.service';

@Component({
  selector: 'app-payroll-category-list',
  templateUrl: './payroll-category-list.component.html',
  styleUrls: ['./payroll-category-list.component.scss']
})
export class PayrollCategoryListComponent {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  constructor(
    private transportService: TransportService, private PayrollService:PayrollService, private toaster:Toastr
  ) {}

  URLConstants = URLConstants;
  payroll_category_list: any = [];

  
  isOpenByClick: boolean = true

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX:true,
      scrollCollapse:true,
      ajax: (dataTablesParameters: any, callback) => {
        this.getlist(dataTablesParameters,callback)
      },
     columns: [
        { data: 'id' }, 
        { data: 'name' }, 
        { data: 'code' }, 
        { data: 'payroll_type' }, 
        { data: 'formula' }, 
        { data: 'status' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  getlist(dataTablesParameters?: any, callback?:any ){
    this.PayrollService.getPayrollCategoryList(dataTablesParameters).subscribe((resp:any) => {
      this.payroll_category_list = resp.data;
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

  remove(id:any): void{
    if(confirm('are you sure you want to delete this document type ?')){
      this.PayrollService.deletePayrollCategory(id).subscribe((res:any) => {  
        if(res.status==false){
          this.toaster.showError(res.message);
        }else{
          this.reloadData();
        }         
      }); 
    }
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  textWithNewLine(item:any){
    return item.split(",").join("<br><hr>");
  }
}
