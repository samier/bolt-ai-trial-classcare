import { Component, ViewChild, OnInit} from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { HraService } from 'src/app/modules/hra/hra.service';
import { DataTableDirective } from 'angular-datatables';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FeesService } from '../fees.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-refund-type',
  templateUrl: './refund-type.component.html',
  styleUrls: ['./refund-type.component.scss']
})
export class RefundTypeComponent implements OnInit{
  URLConstants = URLConstants;

  is_disabled = true;
  is_approved = false;
  reasonForRejection='';
  closeResult: string = '';
  tbody:any;
  feesRefundForm:any;

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  constructor(private feeSerivce:FeesService,private toastr: Toastr){
    this.feesRefundForm = new FormGroup({
      name: new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z0-9\- ]*$/)]),
      refund_value: new FormControl('',[Validators.required]),
      refund_in: new FormControl('1'),
      approval_required: new FormControl(''),
      approval_authority: new FormControl(''),
    });    
  }
  dropdownList:any = [];
  selectedItems:any = [];
  dropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  Authority: any = [
    {id:1,name:"Authority 1"},
    {id:2,name:"Authority 2"},
    {id:3,name:"Authority 3"},
  ];
  ngOnInit() {
    this.getAuthorityList();
    this.dropdownList = [
      { item_id: 1, item_text: 'Mumbai' },
      { item_id: 2, item_text: 'Bangaluru' },
      { item_id: 3, item_text: 'Pune' },
      { item_id: 4, item_text: 'Navsari' },
      { item_id: 5, item_text: 'New Delhi' }
    ];
    this.selectedItems = [
    ];
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'full_name' }, 
        { data: 'full_name' }, 
        { data: 'full_name' }, 
        { data: 'email' }, 
        { data: 'roles' },  
        { data: 'action',orderable:false,searchable:false },
      ]
    };     
  }

  isApproved()
  {
    console.log(this.is_approved);
    if(this.is_approved){
      this.is_disabled=true;
    }
    else{
      this.is_disabled=false;
    }
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    // this.hraSerivce.getUserList(dataTablesParameters).subscribe((resp:any) => {
    //   this.tbody = resp.data;   
    //   console.log(this.tbody);         
    //   callback({
    //     recordsTotal: resp.recordsTotal,
    //     recordsFiltered: resp.recordsFiltered,
    //     data: []
    //   });
    // });
  }  

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  onSubmit(){
    this.addRefundType(this.feesRefundForm.value);                    
  }  

  addRefundType(payload:any){
    this.feeSerivce.addRefundType(payload).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.feesRefundForm.reset();
        this.reloadData();
        this.toastr.showSuccess(res.message);        
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }
  getAuthorityList(){
    this.feeSerivce.getAuthorityList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.dropdownList = res.data;
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    

  }

}
