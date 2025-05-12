import { Component, ViewChild,OnInit } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { PayrollService } from '../payroll.service';
//import { PayslipList } from './payslip-list';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-staff-payslip',
  templateUrl: './staff-payslip.component.html',
  styleUrls: ['./staff-payslip.component.scss']
})
export class StaffPayslipComponent implements OnInit {


  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  
  isOpenByClick: boolean = true

  tbody:any;
  reasonForRejection='';
  global_check_box=false;
  closeResult: string = '';
  //paysliplist: PayslipList[] = [];
  msg: string = '';
  clss: string = '';
  constructor(
    private payrollSerivce:PayrollService,
    private modalService: NgbModal, private toaster:Toastr,
    public CommonService: CommonService
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
        // scrollX: true,
        scrollCollapse: true,
        ajax: (dataTablesParameters: any, callback) => {
          this.loadData(dataTablesParameters,callback)
        },
        columns: [          
          { data: 'id' },
          { data: 'user' }, 
          { data: 'payslip_date' }, 
          { data: 'payrollGroup' },
          { data: 'payslipApproval' },
          { data: 'reject_reason' },
          { data: 'action',orderable:false,searchable:false },
        ]
      };        
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    this.payrollSerivce.getPayslipListForStaff(dataTablesParameters).subscribe((resp:any) => {
      let len = resp.data.length;      
      let array:any = []
      // for(let i=0;i<len;i++){
      //   array[i]={
      //     id: resp.data[i].id,
      //     user: resp.data[i].user,
      //     payslip_date: resp.data[i].payslip_date,
      //     payrollGroup: resp.data[i].payrollGroup,
      //     payslipApproval: resp.data[i].payslipApproval,
      //     reject_reason: this.reasonForRejection,
      //     checked: this.global_check_box,
      //   };
      // }
     // this.paysliplist=array;
      this.tbody = resp.data;   

      console.log(this.tbody);         
     // console.log(this.paysliplist);         
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

  viewPayslip(id:any){
    this.payrollSerivce.viewPayslipForStaff(id).subscribe((res:any) => {
      let blob:Blob = res.body as Blob;
      let pdfSrc = window.URL.createObjectURL(blob)      
        let iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = pdfSrc;
        document.body.appendChild(iframe);
        setTimeout(() => {
          iframe.contentWindow?.print();
        },200);                
    },(err:any)=>{
      //this.toastr.showError(err.error.message);
    });
  }

  delete(id:any){
    if(confirm('are you sure you want to delete this document type ?')){
      this.payrollSerivce.deletePayslip(id).subscribe((res:any) => {  
        if(res.status==false){
          this.toaster.showError(res.message);
        }else{
          this.reloadData();
        }         
      }); 
    }
  }  
}
