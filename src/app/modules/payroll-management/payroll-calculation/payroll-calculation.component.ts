import { Component, ViewChild, OnInit } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { PayrollService } from '../payroll.service';
import { PayslipList } from '../payslip-list/payslip-list';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
@Component({
  selector: 'app-payroll-calculation',
  templateUrl: './payroll-calculation.component.html',
  styleUrls: ['./payroll-calculation.component.scss'],
})
export class PayrollCalculationComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody:any=[];
  reasonForRejection='';
  global_check_box=false;
  closeResult: string = '';
  paysliplist: PayslipList[] = [];
  msg: string = '';
  clss: string = '';
  selected_role:any;
  selected_payroll_group_id:any;
  role_list:any;
  showDatatable:any = false;
  field_list:any;
  edit_fields:any=[];
  date:any = null;
  month_year:any;
  constructor(
    private payrollSerivce:PayrollService,
    private modalService: NgbModal, private toaster:Toastr,private route:ActivatedRoute, private router:Router
    ){
      this.date = this.route.snapshot.paramMap.get('date');
      this.month_year = moment(this.date,'YYYY-MM-DD').format('MMMM YYYY');
      this.getRoleList;
     }

  

  URLConstants=URLConstants;
    ngOnInit(): void {

      this.getRoleList.then(()=>{
        this.getFieldList();
      }).then(()=>{        
       
      });      
  }

  
  getRoleList = new Promise<string>((resolve,reject)=>{
    this.payrollSerivce.getRoleList().subscribe((res:any) => {
      if(res.status==false){    
        reject('rejected');
      }else{
        this.role_list = res.data;  
        this.selected_role=res.data[0].id;
        this.selected_payroll_group_id=res.data[0].payroll_group_id;
        resolve('correct');    
      }    
    },(err:any)=>{
      //this.toastr.showError(err.error.message);
      reject('rejected');
    }); 

  });
  getFieldList(){
    if(this.selected_payroll_group_id != null && this.selected_payroll_group_id!= undefined){  
      this.payrollSerivce.getFieldList(this.selected_payroll_group_id).subscribe((res:any) => {
      this.field_list = res.data;
      let field_list1 = res.data;
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
        columns:[{data:'checkbox',orderable: false },{data:"id"},...field_list1]                
      };              
      this.showDatatable=true;
      }); 
    }
  }
  loadData(dataTablesParameters?: any, callback?:any ){
    
    if(this.date != null){
      Object.assign(dataTablesParameters,{date:this.date});
    }
    Object.assign(dataTablesParameters,{role_id:this.selected_role});

    this.payrollSerivce.getUseListWithCalculation(dataTablesParameters).subscribe((resp:any) => {
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

      // to fill ng model variable
      let h=0;   
      for(let i of this.tbody){
        this.edit_fields[h]=[];
        h++;
      }
      h=0;
      for(let i of this.tbody){
        //console.log(i);
        this.edit_fields[h]["id"]=i.id;   
        this.edit_fields[h]['checked'] = this.global_check_box;            
        for(let j of this.field_list){
          //console.log(j['data']);
          let val = i[j['data']];
          this.edit_fields[h][j['data']]=val;          
        }
        h++;
      }
      // end ng model variable 

      //console.log(this.tbody);         
      //console.log(this.paysliplist);         
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
		this.edit_fields.forEach(x => x.checked = event.target.checked)
	}

  isAllCheckBoxChecked(event,i:any)
  {
    console.log(event);
    if(!event.target.checked){
      this.edit_fields[i].checked = false;      
    }else{
      this.edit_fields[i].checked = true;
    }
    console.log(this.edit_fields[i].checked);
		this.global_check_box =  this.edit_fields.every(p =>{ return p.checked; });
    console.log(this.global_check_box);
    return this.edit_fields[i].checked;		
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

  updateTable(event){
    let role_id = event.id;
    let pg_id = this.role_list.filter((value) =>{
      if(value.id == role_id){
        return value;
      }
    });

    if(pg_id[0].payroll_group_id != undefined){
      this.showDatatable=false;
      this.selected_payroll_group_id=pg_id[0].payroll_group_id;
      this.getFieldList();
    }else{
      this.tbody=[];
    }

    //console.log(pg_id[0].payroll_group_id);
  }

  runPayroll(){

    const selectedPayslip = this.edit_fields.filter(payslip => payslip.checked);
		console.log (selectedPayslip);
		
		if(selectedPayslip && selectedPayslip.length > 0) 
    { 
          console.log(selectedPayslip);
          let newlist = selectedPayslip;

          newlist = newlist.map((x:any) => {
            const obj:any = {}
            for (const key of this.field_list) {
              obj['id'] = x['id'],
              obj[key['data']] = x[key['data']];
            }
            return JSON.stringify(obj);
          });  
          let payload = {data:JSON.stringify(newlist),role_id:this.selected_role,payroll_group_id:this.selected_payroll_group_id,date:this.date};
        this.payrollSerivce.generatePayslipBulk(payload).subscribe((res:any) => {
          if(res.status == true){
            this.router.navigate([this.setUrl(URLConstants.PAYSLIP_LIST)]);
          }
        });  
    }else{
      alert("Please select at least one user");
    }  
  }


  recalculate(j:any,name:any){ 
    let net_pay:any=0;
    for(let i=0;i<this.field_list.length;i++){
      let field_name = this.field_list[i]["data"];
      let except_array = ["Id","User Name","Net Pay"];
      if(!except_array.includes(field_name)){
        if(field_name.includes('+'))
        net_pay = parseFloat(net_pay) + parseFloat(this.edit_fields[j][field_name]);
        else
        net_pay = parseFloat(net_pay) - parseFloat(this.edit_fields[j][field_name]);
      }
    }
    this.edit_fields[j]["Net Pay"]=net_pay;
  }
}
