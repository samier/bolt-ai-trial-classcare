import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { PayrollService } from '../payroll.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-payroll-group-list',
  templateUrl: './payroll-group-list.component.html',
  styleUrls: ['./payroll-group-list.component.scss']
})
export class PayrollGroupListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  
  isOpenByClick: boolean = true

  tbody:any;
  constructor(private payrollSerivce:PayrollService,private tosater:Toastr){
  }
  URLConstants=URLConstants;
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollCollapse:true,
      // scrollX:true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'id' }, 
        { data: 'name' }, 
        { data: 'payment_frequency' }, 
        { data: 'payslip_generation_date' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };     
  }


  loadData(dataTablesParameters?: any, callback?:any ){
    this.payrollSerivce.getPayrollGroupList(dataTablesParameters).subscribe((resp:any) => {
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

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  delete(id:number){
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.payrollSerivce.deletePayrollGroup(id).subscribe((res:any) => {      
        if(res.status == true){
          this.tosater.showSuccess("record deleted Successfully");
        }
        this.reloadData();
      });             
    }
  }
}
