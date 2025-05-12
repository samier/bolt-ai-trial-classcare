import { Component, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { PayrollService } from '../payroll.service';
import { PayslipList } from './payslip-list';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Toastr } from 'src/app/core/services/toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
@Component({
  selector: 'app-payslip-list',
  templateUrl: './payslip-list.component.html',
  styleUrls: ['./payslip-list.component.scss']
})
export class PayslipListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody:any;
  reasonForRejection='';
  global_check_box=false;
  closeResult: string = '';
  paysliplist: PayslipList[] = [];
  msg: string = '';
  userDropdownSettings: IDropdownSettings = {};

  dropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'full_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  monthDropdownSettings: IDropdownSettings = {};
  payrollDropdownSettings: IDropdownSettings = {};

  isOpenByClick: boolean = true
  
  user_list:any;
  payroll_list:any;
  selectedUsers:any;
  selectedMonths:any;
  selectedStatus:any
  selectedPayrolls:any;
 month_list =[
  {id:1,name:"January"},
  {id:2,name:"February"},
  {id:3,name:"March"},
  {id:4,name:"April"},
  {id:5,name:"May"},
  {id:6,name:"June"},
  {id:7,name:"July"},
  {id:8,name:"August"},
  {id:9,name:"September"},
  {id:10,name:"October"},
  {id:11,name:"November"},
  {id:12,name:"December"}
 ];
 status_list=[
  {id:'',name:"All"},
  {id:0,name:"Pending"},
  {id:1,name:"Approved"},
  {id:2,name:"Rejected"},
 ];
  clss: string = '';
  constructor(
    private payrollSerivce:PayrollService,
    private modalService: NgbModal, private toaster:Toastr
    ){
  }

  
  open(content:any,id:any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      console.log(result);
      console.log(id);                       
      let data = {id:id,status:2,reject_reason:this.reasonForRejection}
      this.payrollSerivce.payslipReject(data,id).subscribe((res:any) => {      
        console.log(res); 
        this.reloadData();
      });         
      console.log('saved');
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      console.log('canceled');
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  } 

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  URLConstants=URLConstants;
    ngOnInit(): void {
      this.getUserList();
      this.getPayrollList();
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: true,
        searching: false,
        // scrollX: true,
        scrollCollapse: true,
        ajax: (dataTablesParameters: any, callback) => {
          this.loadData(dataTablesParameters,callback)
        },
        columns: [
          { data: 'checkbox',orderable: false, },
          { data: 'id' },
          { data: 'user' }, 
          { data: 'payslip_date' }, 
          { data: 'payrollGroup' },
          { data: 'payslipApproval' },
          { data: 'reject_reason' },
          { data: 'action',orderable:false,searchable:false },
        ]
      };  
      $("#mymodal").css('z-index','0');

      // this.userDropdownSettings = {
      //   singleSelection: false,
      //   idField: 'id',
      //   textField: 'full_name',
      //   selectAllText: 'Select All',
      //   unSelectAllText: 'UnSelect All',
      //   itemsShowLimit: 3,
      //   allowSearchFilter: true
      // };

      this.monthDropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: true
      };
      
      this.payrollDropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: true
      };      
  }

  loadData(dataTablesParameters?: any, callback?:any ){

    let object = {};
    if(this.selectedMonths != undefined && this.selectedMonths != null){
      Object.assign(dataTablesParameters,{selectedMonths:JSON.stringify(this.selectedMonths)})
    }

    if(this.selectedPayrolls != undefined && this.selectedPayrolls != null){
      Object.assign(dataTablesParameters,{selectedPayrolls:JSON.stringify(this.selectedPayrolls)})
    }

    if(this.selectedStatus != undefined && this.selectedStatus != null){
      Object.assign(dataTablesParameters,{selectedStatus:this.selectedStatus})
    }

    if(this.selectedUsers != undefined && this.selectedUsers != null){
      Object.assign(dataTablesParameters,{selectedUsers:JSON.stringify(this.selectedUsers)})
    }
    this.payrollSerivce.getPayslipList(dataTablesParameters).subscribe((resp:any) => {
      let len = resp.data.length;      
      let array:any = []
      for(let i=0;i<len;i++){
        array[i]={
          id: resp.data[i].id,
          user: resp.data[i].user,
          payslip_date: resp.data[i].payslip_date,
          payrollGroup: resp.data[i].payrollGroup,
          payslipApproval: resp.data[i].payslipApproval,
          reject_reason: this.reasonForRejection,
          checked: this.global_check_box,
        };
      }
      this.paysliplist=array;
      this.tbody = resp.data;   

      console.log(this.tbody);         
      console.log(this.paysliplist);         
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
    setTimeout(() => {
      this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.columns.adjust();
      });
    }, 10);
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

  isAllCheckBoxChecked(event,i:any)
  {
    console.log(event);
    if(!event.target.checked){
      this.paysliplist[i].checked = false;      
    }else{
      this.paysliplist[i].checked = true;
    }
    console.log(this.paysliplist[i].checked);
		this.global_check_box =  this.paysliplist.every(p =>{ return p.checked; });
    console.log(this.global_check_box);
    return this.paysliplist[i].checked;
	}

  approveAllpayslip()
  {
    const selectedPayslip = this.paysliplist.filter(payslip => payslip.checked);
		console.log (selectedPayslip);
		
		if(selectedPayslip && selectedPayslip.length > 0) 
    {      
      this.payrollSerivce.approveAllPayslip(selectedPayslip).subscribe((res:any) => {
        console.log(res);
        this.reloadData();
        });
		}
  }

  deleteAllPayslip()
  {
    const selectedPayslip = this.paysliplist.filter(payslip => payslip.checked);
		console.log (selectedPayslip);
		if(selectedPayslip && selectedPayslip.length > 0) 
    {   let c = confirm("are you sure you want delete all ?");
        if(c)
        {
          this.payrollSerivce.deleteAllPayslip(selectedPayslip).subscribe((res:any) => {
            console.log(res);
            this.reloadData();
            });
        }
		}
  }

  
  openModal(content:any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      const selectedPayslip = this.paysliplist.filter(payslip => payslip.checked);
      let data = {selectedPayslip:selectedPayslip,reject_reason:this.reasonForRejection}
      console.log(data);
      this.payrollSerivce.rejectAllpayslip(data).subscribe((res:any) => {      
        console.log(res);
        this.reloadData();
      });         
      console.log('saved');
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      console.log('canceled');
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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

  onUserSelect(event){
    console.log(this.selectedUsers);
    this.reloadData();
  }

  onMonthSelect(){
    console.log(this.selectedMonths);
    this.reloadData();
  }

  onPayrollSelect(){
    console.log(this.selectedPayrolls);
    this.reloadData();
  }
  
  statusChange(){
    console.log(this.selectedStatus);
    this.reloadData();
  }

  getUserList()
  {
    this.payrollSerivce.getDropdownUserList().subscribe((res:any) => {  
      if(res.status==false){
        this.toaster.showError(res.message);
      }else{
        this.user_list=res.data;
      }         
    }); 
    
  }
  getPayrollList()
  {
    this.payrollSerivce.getDropdownPayrollList().subscribe((res:any) => {  
      if(res.status==false){
        this.toaster.showError(res.message);
      }else{
        this.payroll_list=res.data;
      }         
    }); 
    
  }


}
