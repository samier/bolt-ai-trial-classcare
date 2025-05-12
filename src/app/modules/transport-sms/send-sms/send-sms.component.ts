import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportSmsService } from '../transport-sms.service';
import { OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-send-sms',
  templateUrl: './send-sms.component.html',
  styleUrls: ['./send-sms.component.scss']
})


export class SendSmsComponent {
  dropdownList:any  = [];
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

  dropdownListStudent:any  = [];
  selectedStudents:any = [];
  selectedRoute:any = '';
  selectedNumbers:any = '';
  customeNumbers:any = '';
  message:any = '';
  sendTo:any=1;
  submitted:any=false;
  public valid = true;
  public routes:any;
  unamePattern = "^[a-zA-Z0-9_ \n\r,.\/-]{0,200}$"; 
  templateList = [] 
  isTemplate : number = 0            
  constructor(
    private smsService: TransportSmsService,
    private router:Router,
    private fb:FormBuilder, 
    private toastr: Toastr,
    public CommonService: CommonService,
  ) {    

    this.sendsmsform = new FormGroup({
      route_name: new FormControl(null,[Validators.required]),
      stop_name: new FormControl('',[Validators.required]),
      // whatsup_numbers: new FormControl('',[Validators.required]),
      customeNumbers:new FormControl('',[Validators.pattern('^[0-9,]*$')]),
      studentList:new FormControl('',[Validators.required]),
      message:new FormControl('',[Validators.pattern(/^.{0,1000}$/)]),
      // radioBtn:new FormControl('1',[Validators.required]),
      is_father_message : new FormControl(false),
      is_mother_message : new FormControl(false),
      is_student_message : new FormControl(false),
      template:new FormControl(null),
    });
  }

  sendsmsform: FormGroup;
  ngOnInit() {
    this.smsService.getRouteList().subscribe((res:any) => {
      // console.log(res);
      this.routes = res.data;
      if(res.status==false){
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 

    this.dropdownList = [];
    this.selectedItems = [];
    this.selectedStudents = [];

    this.notificationCheck()
  }

  onItemSelect(item: any) {
    //console.log(this.selectedItems);
    this.getStudentList(this.selectedItems);
  }
  onSelectAll(items: any) {    
    this.getStudentList(items);
  }

  onItemSelectStudent(item: any) {
    //console.log(item);
    this.getStudentNumbers(this.selectedStudents);
  }

  onItemDeSelect(item:any){     
    this.getStudentList(this.selectedItems);
    this.getStudentNumbers(this.selectedStudents);
  }
  
  onSelectAllStudent(items: any) {
    this.getStudentNumbers(items);
  }
  
  onItemDeSelectStudent(item:any){    
    this.getStudentNumbers(this.selectedStudents);
  }

  onItemDeSelectAll(item:any){
    this.selectedStudents=[];
    this.sendsmsform.get('studentList')?.setValue([]);
    this.dropdownListStudent=[];
    this.getStudentList([]);
    this.getStudentNumbers([]);
  }

  onItemDeSelectStudentAll(item:any){
      this.getStudentNumbers([]);
  }

  fun(event){
    if(event.id){
      this.dropdownList = [];
      this.selectedItems = [];
      this.selectedStudents = [];
      this.getStopList(event.id);
    }
  } 

  fun2(id:any){
    if(id == 1){      
      //student
      this.sendTo=1;
    }else if(id == 2){
      // parent
      this.sendTo=2;
    }else if(id==3){
      //both
      this.sendTo=3;
    }
    if(this.selectedStudents != '')
    this.getStudentNumbers(this.selectedStudents);
    else
    alert("Please select student list first");
  }

  getStopList(id:any){
    this.smsService.getStopList({route_id:id}).subscribe((res:any) => {
      //console.log(res);
      this.dropdownList = res.data;
      if(res.status==false){
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  

  getStudentList(param:any){   
    this.smsService.getStudentList(param).subscribe((res:any) => {
      console.log(res);
      this.dropdownListStudent = res.data;
      if(res.status==false){
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  getStudentNumbers(param:any){
    Object.assign(param,{sendTo:this.sendTo});
    this.smsService.getStudentNumbers(param).subscribe((res:any) => {
      console.log(res);
      this.selectedNumbers = res.data.numbers;
      if(res.status==false){
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  URLConstants = URLConstants;

  onSubmit() {
    // console.log("test");
  
      this.submitted=true;
      this.valid=true;      
      console.log(this.sendsmsform.value);    
      const payload = this.sendsmsform.value;
      if(this.valid){ //add role
        this.addRecord(payload);
      }      
      return 0;           
  }    

  addRecord(payload:any)
  {
    this.smsService.addRecord(payload).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        const message = res.message?.success?.pop();
        if(message){
          this.toastr.showSuccess(message);
        }
        this.sendsmsform.reset();
        //this.router.navigate([this.setUrl(URLConstants.ROLE_LIST)]);
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }  
 
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  changeTemplate (event) {
    this.sendsmsform.controls['message'].patchValue(event.value)
  }

  notificationCheck() {
    this.smsService.notification().subscribe((res:any)=> {
      if (res.status) {
        this.isTemplate = res.data.transport_message
        if (this.isTemplate) {
          const payload = {
            type : 'transport'
          }
          this.smsService.getSMSTemplate(payload).subscribe((res:any)=> {
            this.templateList = res.data.map(ele => {
              return {
                id: ele.template_id,
                name:ele.type.replace(/_/g, ' '),
                value: ele.template
              }
            })
          })
        }
      }
    })
  }
}
