import { Component, ViewChild, OnInit, EventEmitter, Output} from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { HraService } from 'src/app/modules/hra/hra.service';
import { DataTableDirective } from 'angular-datatables';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FeesService } from '../fees.service';
import { Toastr } from 'src/app/core/services/toastr';
import { Router } from '@angular/router';
@Component({
  selector: 'app-fees-discount',
  templateUrl: './fees-discount.component.html',
  styleUrls: ['./fees-discount.component.scss']
})
export class FeesDiscountComponent implements OnInit{
  URLConstants = URLConstants;

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  is_disabled = true;
  is_approved = false;
  reasonForRejection='';
  closeResult: string = '';
  tbody:any;
  is_invalid:any;
  percentage_selected:any=false;
  feesDiscountForm:any;
  discount_value:any;
  @Output() clicked = new EventEmitter<{id:number}>();

  constructor(private feesSerivce:FeesService,private router:Router,private fb:FormBuilder, private toastr: Toastr){
    this.feesDiscountForm = new FormGroup({
      name: new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z0-9\- ]*$/)]),
      discount_value: new FormControl('',[Validators.required,Validators.pattern(/^[0-9\.]*$/),Validators.max(100000)]),
      discount_in: new FormControl('1'),
      approval_required: new FormControl(''),
      approval_authority: new FormControl(''),
    });
  }

changePage(){
  console.log("before emmiting event");
  this.clicked.emit({id:3});
  console.log("after emmiting event");

}
  dropdownList:any = [];
  selectedItems:any = [];
  id:any = 0;
  dropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  Authority: any = [];
  ngOnInit() {
    this.getAuthorityList();
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
        { data: 'email' }, 
        { data: 'roles' }, 
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
  
  // approve(id:number,status:number){
  //   let data = {id:id,status:status}
  //   this.feesSerivce.updateStudentDiscount(data).subscribe((res:any) => {      
  //     console.log(res); 
  //     this.reloadData();
  //   }); 
  // }

  loadData(dataTablesParameters?: any, callback?:any ){
    this.feesSerivce.getDiscountTypeList(dataTablesParameters).subscribe((resp:any) => {
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

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  onSubmit(){
    this.addDiscountType(this.feesDiscountForm.value);                    
  }    
  
  getAuthorityList(){
    this.feesSerivce.getAuthorityList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.dropdownList = res.data;
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    

  }

  addDiscountType(payload:any)
  {
    this.feesSerivce.addDiscountType(payload,this.id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.feesDiscountForm.reset();
        this.reloadData();
        this.toastr.showSuccess(res.message);        
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }  

  delete(id:number){
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.feesSerivce.deleteDiscountType(id).subscribe((res:any) => {      
         console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        } 
        if(res.status==true){
          this.toastr.showSuccess(res.message);
        } 
        this.reloadData();
      });             
    }
  }
  inDiscount(){
    this.percentage_selected=true;
    this.discountValue();
  }
  isNumber(){
    this.percentage_selected=false;
  }

  discountValue(){
    if(this.percentage_selected==true && this.discount_value > 100){
    this.is_invalid=true;
    }else{
      this.is_invalid=false;
    }
  }

  show(id:any){
    this.feesDiscountForm.reset();
    this.id=id;
    this.feesSerivce.getDiscountTypeDetail(id).subscribe((resp:any) => {
      this.feesDiscountForm.controls['name'].setValue(resp.data.name); 
      this.feesDiscountForm.controls['discount_value'].setValue(resp.data.discount_value);
      this.feesDiscountForm.controls['discount_in'].setValue(resp.data.discount_in.toString());         
      window.scroll(0,0);
    });
  }  

  cancel(){
    this.feesDiscountForm.reset();
    this.id=0;
  }
}
