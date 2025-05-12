import { Component, ViewChild, OnInit,HostListener } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { PayrollService } from '../payroll.service';
import { PayslipList } from './payslip-list';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';

@Component({
  selector: 'app-attendace-list',
  templateUrl: './attendace-list.component.html',
  styleUrls: ['./attendace-list.component.scss']
})
@HostListener("input", ["$event"])

export class AttendaceListComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody:any;
  reasonForRejection='';
  global_check_box=false;
  closeResult: string = '';
  paysliplist: PayslipList[] = [];
  msg: string = '';
  clss: string = '';
  date:any = null;
  edit_fields:any = [];
  days_in_month=0;
  month:any = "";
  constructor(
    private payrollSerivce:PayrollService,
    private modalService: NgbModal, private toaster:Toastr,private route:ActivatedRoute
    ){
      this.date = this.route.snapshot.paramMap.get('date');      
      this.days_in_month = moment(this.date, "YYYY-MM-DD").daysInMonth(); 
      this.month = moment(this.date, "YYYY-MM-DD").format('MMMM'); 
  }

  
  // open(content:any,id:any) {
  //   this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
  //     console.log(result);
  //     console.log(id);                       
  //     let data = {id:id,status:2,reject_reason:this.reasonForRejection}
  //     this.payrollSerivce.payslipReject(data,id).subscribe((res:any) => {      
  //       console.log(res); 
  //       this.reloadData();
  //     });         
  //     console.log('saved');
  //     this.closeResult = `Closed with: ${result}`;
  //   }, (reason) => {
  //     console.log('canceled');
  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //   });
  // } 

  // private getDismissReason(reason: any): string {
  //   if (reason === ModalDismissReasons.ESC) {
  //     return 'by pressing ESC';
  //   } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
  //     return 'by clicking on a backdrop';
  //   } else {
  //     return  `with: ${reason}`;
  //   }
  // }

  URLConstants=URLConstants;
    ngOnInit(): void {      
      this.edit_fields[0]=[];
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: true,
        searching: false,
        scrollX: true,
        scrollCollapse: true,
        ajax: (dataTablesParameters: any, callback) => {
          this.loadData(dataTablesParameters,callback)
        },
        columns: [
          // { data: 'checkbox',orderable: false, },
          { data: 'id' },
          { data: 'user_name'}, 
          { data: 'role' }, 
          { data: 'month_days' },
          { data: 'total_paid_leave'},
          { data: 'total_unpaid_leave' },
          { data: 'current_month_paid' },
          { data: 'current_month_unpaid' },
          // { data: 'action',orderable:false,searchable:false },
        ]
      };  
      
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    
    if(this.date != null){
      Object.assign(dataTablesParameters,{date:this.date});
    }

    this.payrollSerivce.getAttendanceList(dataTablesParameters).subscribe((resp:any) => {
      let len = resp.data.length;      
      let array:any = []
      for(let i=0;i<len;i++){
        array[i]={
          id: resp.data[i].id,
          user: resp.data[i].full_name,
          payslip_date: 0 ,
          payrollGroup: 0,
          payslipApproval: 0,
          reject_reason: '',
          checked: this.global_check_box,
        };
      }
      this.paysliplist=array;
      this.tbody = resp.data;   
      let h=0;   
      for(let i of this.tbody){
        this.edit_fields[h]=[]; 
        this.edit_fields[h]['id']=i.id;
        this.edit_fields[h]['total_working_days']=i.total_leave;
        this.edit_fields[h]['total_paid_leave']=i.total_paid_leave;
        this.edit_fields[h]['total_unpaid_leave']=i.total_unpaid_leave;
        this.edit_fields[h]['current_month_paid']=i.current_month_paid;
        this.edit_fields[h]['current_month_unpaid']=i.current_month_unpaid;
        h++;
      }
      console.log(this.tbody);         
      console.log(this.paysliplist);         
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }  

  approve(id:number,status:number){    
    let data = {id:id,status:status}    
    this.payrollSerivce.payslipApprove(data,id).subscribe((res:any) => {
      console.log(res);
      this.reloadData();
    }); 
  }

  checkAllCheckBox(event: any) 
  {   
    this.global_check_box = event.target.checked;
		this.paysliplist.forEach(x => x.checked = event.target.checked)
	}

  isAllCheckBoxChecked()
  {
		return this.paysliplist.every(p => p.checked);
	}

  approveAllpayslip()
  {
    const selectedPayslip = this.paysliplist.filter(payslip => payslip.checked);
		console.log (selectedPayslip);
		
		if(selectedPayslip && selectedPayslip.length > 0) 
    {      
      // this.payrollSerivce.approveAllPayslip(selectedPayslip).subscribe((res:any) => {
      //   console.log(res);
      //   this.reloadData();
      //   });
		}
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
    this.payrollSerivce.viewPayslip(id).subscribe((res:any) => {
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

  update(){
    console.log(this.edit_fields);
    let newlist = this.edit_fields;
    newlist = newlist.map((x:any) => {
      const obj:any = {}    
        obj['id']                   = x['id'];             
        obj['total_working_days']   = x['total_working_days'];             
        obj['total_paid_leave']     = x['total_paid_leave'];             
        obj['total_unpaid_leave']   = x['total_unpaid_leave'];             
        obj['current_month_paid']   = x['current_month_paid'];             
        obj['current_month_unpaid'] = x['current_month_unpaid'];             
      return JSON.stringify(obj);
    });  
    let payload = {data:JSON.stringify(newlist),date:this.date};
  this.payrollSerivce.updateMonthlyPayrollAttendance(payload).subscribe((res:any) => {
    if(res.status == true){
      this.toaster.showSuccess(res.message);
    }
  });  
  }

  checkWorkingDays(event:any,i)
  {
    let val = parseInt(event.target.value);
    if(val > this.days_in_month){
      this.edit_fields[i]["total_working_days"]=this.days_in_month;
    }
  }

  checkTotalDays(event:any,i,name)
  {
    let val = parseInt(event.target.value);
    if(val > 365){
      this.edit_fields[i][name]=365;
    }
  }

  checkCurrentMonth(event:any,i,name)
  {
    if(parseInt(this.edit_fields[i]["current_month_paid"]) + parseInt(this.edit_fields[i]["current_month_unpaid"]) > this.days_in_month){
      let subtract = parseInt(this.edit_fields[i]["current_month_paid"]) + parseInt(this.edit_fields[i]["current_month_unpaid"]) - this.days_in_month;
      this.edit_fields[i][name]=this.edit_fields[i][name]-subtract;
    }

    let original_year_paid = this.tbody[i]['total_paid_leave'];
    let original_year_unpaid = this.tbody[i]['total_unpaid_leave'];
    let original_current_month_paid = this.tbody[i]['current_month_paid'];
    let original_current_month_unpaid = this.tbody[i]['current_month_unpaid'];

    if(name == "current_month_paid")
    {
      let days = 0;
      if(original_current_month_paid > this.edit_fields[i]["current_month_paid"]){
        days = original_current_month_paid - this.edit_fields[i]["current_month_paid"];
        original_year_paid= original_year_paid-days;
        this.edit_fields[i]["total_paid_leave"]=original_year_paid;
      }
      else
      {
        days = this.edit_fields[i]["current_month_paid"] - original_current_month_paid;
        original_year_paid= original_year_paid + days;
        this.edit_fields[i]["total_paid_leave"] = original_year_paid;        
      }
    }
    else
    {
      let days = 0;
      if(original_current_month_unpaid > this.edit_fields[i]["current_month_unpaid"]){
        days = original_current_month_unpaid - this.edit_fields[i]["current_month_unpaid"];
        original_year_unpaid = original_year_unpaid - days;
        this.edit_fields[i]["total_unpaid_leave"]=original_year_unpaid;
      }
      else
      {
        days = this.edit_fields[i]["current_month_unpaid"] - original_current_month_unpaid;
        original_year_unpaid= original_year_unpaid + days;
        this.edit_fields[i]["total_unpaid_leave"] = original_year_unpaid;        
      }
    }

  }
}
