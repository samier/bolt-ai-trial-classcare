import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { DatePipe } from '@angular/common';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import * as moment from 'moment';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'app-student-requisition-form',
  templateUrl: './student-requisition-form.component.html',
  styleUrls: ['./student-requisition-form.component.scss']
})
export class StudentRequisitionFormComponent {

  submitted:any=false;
  public valid = true;
  public roleList:any;
  itemTypeList:any;
  itemList:any=[];
  vendorTypeList:any;
  measurementTypeList:any;
  storeTypeList:any;
  item_code:any;
  item_name:any;
  record_id:any=0;
  userList:any;
  requisition_date:any;
  required_by:any;
  is_disabled = false;
  public is_admin   = window.localStorage?.getItem("role")?.includes('ROLE_ADMIN');
  display_status_change = "none";
  status:any;
  requisition_type:any=2;
  selectedItem:any;
  requisition_by_type:any;
  x = Math.floor((Math.random() * 1000) + 1);
  //todayDate=this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  reject_reason:any="";
  todayDate:any;
  
  constructor(
    private inventorySerivce: InventoryService,private date:DatePipe, private router:Router,private route:ActivatedRoute,private fb:FormBuilder, private toastr: Toastr
  ) {
    this.record_id=this.route.snapshot.paramMap.get('id');
    this.todayDate=this.date.transform(new Date(),"yyyy-MM-dd");
    this.requisitionForm = new FormGroup({
      requisition_by: new FormControl(''),
      //requisition_by_type:new FormControl(''),
      store_id: new FormControl(''),
      remark: new FormControl(''),
      priority: new FormControl(''),
      required_by:new FormControl('',[Validators.required,Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)]),
      requisition_date:new FormControl('',[Validators.required,Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)]),
      record_id:new FormControl(''),
      status:new FormControl(''),
      quantities: this.fb.array([]),
    });
  }

  requisitionForm: FormGroup;
  ngOnInit() {    
    this.getStoreList.then(()=>{
      this.getItemList();
      this.getStudentList(); 
      this.getMeasurementTypeList(); 
      //this.getInventoryList();
    }).then(()=>{
      if(this.record_id != null && this.record_id !='' && this.record_id !=0){
        this.inventorySerivce.getRequisitionDetailForStudent(this.record_id).subscribe((res:any) => {
          if(res.status==false){
            this.toastr.showError(res.message);
          }else{
            console.log(res);
            if(this.is_admin){
              this.display_status_change="block";
              this.requisitionForm.controls['status'].setValue(res.data.status);   
            }else{
              if(res.data.status==1){
                this.is_disabled=true;
              }
            }

            // this.requisition_by_type=res.data.requisition_type;
            // this.requisition_type=res.data.requisition_type;
            // //If its faculty
            // if(res.data.requisition_type==1){
            //   this.getUserList(res.data.requisition_by);
            // }      
            //If its Sttudent
            
            this.getStudentList(res.data.requisition_by);
            // //If its Location
            // if(res.data.requisition_type==3){
            //   this.getLocationList(res.data.requisition_by);
            // }
         
            this.requisitionForm.controls['store_id'].setValue(res.data.store_id);   
            this.requisitionForm.controls['remark'].setValue(res.data.remark);              
            this.requisitionForm.controls['priority'].setValue(res.data.priority);              
            this.requisitionForm.controls['required_by'].setValue(res.data.required_by);              
            this.requisitionForm.controls['requisition_date'].setValue(res.data.requisition_date);              
            this.requisitionForm.controls['record_id'].setValue(res.data.id);      
            
            if(res.data.status==2){
              this.reject_reason = res.data.reject_reason;
            }
            let s = res.data.requisition_item.length;
            for(let i=0;i<s;i++){
              let h = this.fb.group({  
               inventory_item_type_id: res.data.requisition_item[i].inventory_item_type_id,          
               inventory_item_id: res.data.requisition_item[i].inventory_item_id,          
               quantity: new FormControl(res.data.requisition_item[i].quantity,[Validators.required,Validators.pattern(/^[0-9\.]*$/)]),          
               measurement_type_id: res.data.requisition_item[i].measurement_type_id,          
              });            
              this.quantities().push(h); 
              this.setItemTypeChange(res.data.requisition_item[i].inventory_item_type_id,res.data.requisition_item[i].inventory_item_id,i);
            }

          }        
        },(err:any)=>{
          this.toastr.showError(err.error.message);
        });        
      } 
      else{
        this.addQuantity();
      }
    });  
  }

  get fieldsAsFormArray(): any {
    return this.requisitionForm.get('quantities') as FormArray;
  }

  quantities() : FormArray {  
    return this.requisitionForm.get("quantities") as FormArray  
  }  
     
  newQuantity(): FormGroup {  
    return this.fb.group({  
      inventory_item_type_id: new FormControl('',[Validators.required]),  
      inventory_item_id: new FormControl('',[Validators.required]),  
      quantity:new FormControl('',[Validators.required,Validators.pattern(/^[0-9\.]*$/)]),
      measurement_type_id:new FormControl('',[Validators.required]),    
    })  
  }  
     
  addQuantity() {  
    this.quantities().push(this.newQuantity());  
  }      

  getQuantity(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.quantity;
  }  

  getMeasurmentType(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.measurement_type_id;
  }  
  removeQuantity(i:number) {  
    this.quantities().removeAt(i);  
  }  


  URLConstants = URLConstants;

  getStoreList = new Promise<string>((resolve,reject)=>{
    this.inventorySerivce.getStudentStoreTypeList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
        reject('rejected');
      }else{
        this.storeTypeList = res.data;      
        resolve('correct');
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
      reject('rejected');
    });
  });

  
  getItemList(){
    this.inventorySerivce.getItemTypeListForStudent().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.itemTypeList = res.data;      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });        
  }

  // getInventoryList(){
  //   this.inventorySerivce.getInventoryList().subscribe((res:any) => {
  //     if(res.status==false){
  //       this.toastr.showError(res.message);
  //     }else{
  //       this.itemList = res.data;      
  //     }    
  //   },(err:any)=>{
  //     this.toastr.showError(err.error.message);
  //   });        
  // }

  getMeasurementTypeList(){
    this.inventorySerivce.getMeasurementTypeList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.measurementTypeList = res.data;      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }

  onSubmit() {
      this.submitted=true;
      this.valid=true;          
      const payload = this.requisitionForm.value;
      Object.assign(payload,{requisition_type:this.requisition_type})
      if(this.valid){ //add role
       this.addRequisition(payload);
      }      
      return 0;           
  }    

  addRequisition(payload:any)
  {
    let record_id = this.requisitionForm.controls['record_id'].value; 
    this.inventorySerivce.addRequisitionForStudent(payload,record_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.router.navigate([URLConstants.STUDENT_REQUISITION_LIST]);
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }  
 
  change(event:any){  
    if(this.item_name.length > 2){
      this.item_code=this.item_name.substr(0,3)+"-"+this.x;
    }
  }

  requiredBy(event:any){  
    let required_by = new Date(event.target.value);
    let requisition_date = new Date(this.requisition_date);
    if(requisition_date != undefined){
      if(requisition_date > required_by){
        alert("Required By date cannot be less then requisition date");
        event.target.value = "";
      }
    }
  }
  
  requisitionDate(event:any){
    let requisition_date = new Date(event.target.value);
    let required_by = new Date(this.required_by);
    if(required_by != undefined){
      if(requisition_date > required_by){
        alert("Required By date cannot be less then requisition date");
        event.target.value = "";
      }
    }
  }

  requisition_by_type_change(event:any){
    console.log(event.target.id);
    if(event.target.id=='type_student'){
      this.getStudentList();
      this.requisition_type=2;
    }
    if(event.target.id=='type_faculty'){
      this.getUserList();
      this.requisition_type=1;
    } 
    if(event.target.id=='type_location'){
      this.getLocationList();
      this.requisition_type=3;
    }    
  }

  getUserList(id:any=null){
    this.inventorySerivce.getUserList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.userList = res.data;      
        if(id !=null){          
          this.requisitionForm.controls['requisition_by'].setValue(id);      
        }
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  getStudentList(id:any=null){
    this.inventorySerivce.getStudentListForStudent().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.userList = res.data;    
        if(id !=null){          
          this.requisitionForm.controls['requisition_by'].setValue(id);      
        }  
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }  

  getLocationList(id:any=null){
    this.inventorySerivce.getLocationList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.userList = res.data;  
        if(id !=null){          
          this.requisitionForm.controls['requisition_by'].setValue(id);      
        }    
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }    

  itemTypeChange(event:any,i:any){    
    this.inventorySerivce.fetchItemListForStudent(event.target.value).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.itemList[i] = res.data;      
        this.fieldsAsFormArray.controls?.[i]?.controls?.inventory_item_id.reset(); 
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });     
  }

  setItemTypeChange(item_type_id:any,id:any,i:any){    
    this.inventorySerivce.fetchItemListForStudent(item_type_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.itemList[i] = res.data;      
        this.fieldsAsFormArray.controls?.[i]?.controls?.inventory_item_id.setValue(id); 
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });     
  }

  changeFn(selectedItem:any){
    console.log(selectedItem);
  }

  itemChange(event:any,j:any){    
    let id = event.target.value;
    let selected_products = this.itemList[j];
    for( var i = 0, len = selected_products.length; i < len; i++ ) {
        if( selected_products[i].id == id) {
            this.getMeasurmentType(j).setValue(selected_products[i]["measurement_type_id"]);
            break;
        }
    }
  }
  //   this.inventorySerivce.fetchItemListForStudent(event.target.value).subscribe((res:any) => {
  //     if(res.status==false){
  //       this.toastr.showError(res.message);
  //     }else{
  //       this.itemList[i] = res.data;      
  //       this.fieldsAsFormArray.controls?.[i]?.controls?.inventory_item_id.reset(); 
  //     }    
  //   },(err:any)=>{
  //     this.toastr.showError(err.error.message);
  //   });     
  // }  
}
