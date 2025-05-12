import { Component,ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportSmsService } from '../../transport-sms/transport-sms.service';
import { OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { UserService } from '../user.service';

import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-export-faculty',
  templateUrl: './export-faculty.component.html',
  styleUrls: ['./export-faculty.component.scss']
})
export class ExportFacultyComponent {


  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  defaultList=true;
  dropdownList:any  = [];
  // [
  //   {"id":"first_name","name":"First Name"},
  //   {"id":"last_name","name":"Last Name"},
  //   {"id":"gender","name":"Gender"},
  //   {"id":"birth_date","name":"Birth Date"},
  //   {"id":"email","name":"Email"},
  //   {"id":"organization_name","name":"Organization Name"},
  //   {"id":"branches_name","name":"Branches Name"},
  //   {"id":"phone_number","name":"Phone Number"},
  //   {"id":"whatsapp_number","name":"WhatsApp Number"},
  //   {"id":"joining_date","name":"Joining Date"},
  //   {"id":"designation","name":"Designation"},
  //   {"id":"qualification","name":"Qualification"},
  // ];
  dropdownListSection:any = [];
  dropdownListFaculty:any = [];

  selectedSections:any = [];
  selectedFaculty:any = [];
  selectedItems:any = [];
  dropdownListFrontEnd:any =[];
  columnList=[
    {data:"first_name"},
    {data:"last_name"},
    {data:"gender"},
    {data:"birth_date"},
    {data:"email"},
    {data:"organization_name"},
    {data:"branches_name"},
    {data:"phone_number"},
    {data:"whatsapp_number"},
    {data:"joining_date"},
    {data:"designation"},
    {data:"qualification"},
    {data:"permanent_address"},
    {data:"current_address"},
    {data:"user_role"},
    {data:"transport_mode"},
    {data:"pickup_route"},
    {data:"batch_name"},
];
  dropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  submitted:any=false;
  public valid = true;
  public exam_types:any;
  examTimeTableform: FormGroup;
  tbody:any;
  constructor(
    private smsService: TransportSmsService,private userService: UserService ,private router:Router,private fb:FormBuilder, private toastr: Toastr
  ) {    

    this.examTimeTableform = new FormGroup({
      sections: new FormControl('',[Validators.required]),
      faculty: new FormControl('',[Validators.required]),
      fields: new FormControl('',[Validators.required]),
    });
  }


  ngOnInit() {
    this.dropdownList = [];
    this.selectedItems = [];
    //this.selectedStudents = [];

    this.userService.getSectionList().subscribe((res:any) => {      
      this.dropdownListSection = res.data;
      if(res.status==false){
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 


    this.userService.getFieldList().subscribe((res:any) => {      
      this.dropdownList = res.data.dropdownList;      
      this.dropdownListFrontEnd = res.data.dropdownList;
      this.columnList   = res.data.columnList;      
      if(res.status==false){
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });   
  

    // this.dtOptions = {
    //   pagingType: 'full_numbers',
    //   pageLength: 10,
    //   serverSide: true,
    //   processing: true,
    //   searching: true,
      // scrollX: true,
    //   scrollCollapse: false,
    //   ajax: (dataTablesParameters: any, callback) => {
    //     this.loadData(dataTablesParameters,callback)
    //   },
    //  columns: this.columnList,
    // };     

    let object = {faculty:this.selectedFaculty};

    this.userService.getShowList(object).subscribe((resp:any) => {
      this.tbody = resp.data;       
    });

  }


  loadData(dataTablesParameters?: any, callback?:any ){

    Object.assign(dataTablesParameters,{faculty:this.selectedFaculty});

    this.userService.getShowList(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;   
      console.log(this.tbody);         
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
      // setTimeout(() => {
      //   this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      //     dtInstance.columns.adjust();
      //   });
      // }, 10);      
    });
  }  

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  } 


  onSectionSelect(item: any) {
  this.getFacultyList(this.selectedSections);
  this.selectedFaculty=[];
  }
  onSectionDeSelect(item:any){     
    this.getFacultyList(this.selectedSections);
  this.selectedFaculty=[];
  }
  onSectionDeSelectAll(item:any){
    this.getFacultyList([]);
    this.selectedFaculty=[];
  }
  onSectionSelectAll(items: any) {    
    this.getFacultyList(items);
    this.selectedSections=items;
    this.selectedFaculty=[];
  }

  onFacultySelect(item: any) {
    //console.log(this.selectedItems);
    //this.getStudentList(this.selectedItems);
  }
  onFacultyDeSelect(item:any){     
    // this.getStudentList(this.selectedItems);
    // this.getStudentNumbers(this.selectedStudents);
  }
  onFacultyDeSelectAll(item:any){
    // this.selectedStudents=[];
    // this.examTimeTableform.get('studentList')?.setValue([]);
    // this.dropdownListStudent=[];
    // this.getStudentList([]);
    // this.getStudentNumbers([]);
  }
  onFacultySelectAll(items: any) {    
    //this.getStudentList(items);
  }

  onSelectAll(items: any) {    
    //this.getStudentList(items);
  }

  fun(event:any){
    // this.dropdownList = [];
    // this.selectedItems = [];
    // this.selectedStudents = [];
    // console.log(event);
    // this.getClassList(this.selectedExam);
  } 



  getFacultyList(param:any){   
    this.userService.getFacultyList(param).subscribe((res:any) => {
      console.log(res);
      this.dropdownListFaculty = res.data;
      if(res.status==false){
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  getClassList(name:any){
    this.userService.getClassList({exam_type:name}).subscribe((res:any) => {
      console.log(res);
      this.dropdownList = res.data;
      if(res.status==false){
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  URLConstants = URLConstants;

  onSubmit(type:any=null) {    
      this.submitted=true;
      this.valid=true;        
      if(this.selectedItems.length == 0){
        //this.toastr.showError("Please select at least one field to generate report.");
      } 
      const payload = {
        type:type,
        field:this.selectedItems,
        faculty:this.selectedFaculty
      };     
      if(this.valid){ //add role
        if(type=='pdf'){
          if(this.selectedItems.length > 8){
            this.toastr.showError("Please select 8 fields or less for PDF report.");
          }else{
            this.generatePDF(payload);
          }
        }
        else if(type == 'excel'){
        this.generateExcel(payload);
        }else{          
          let newlist:any = [];
          this.dropdownListFrontEnd = [];
          this.selectedItems.forEach((element:any,value:any) => {
              newlist.push({data:element.name});
          });
          this.columnList=newlist;
          this.defaultList=false;
          this.dropdownListFrontEnd=this.selectedItems;
          this.showList();          
        }
      }      
      return 0;           
  }    

  showList(){
    let object = {faculty:this.selectedFaculty};
    this.userService.getShowList(object).subscribe((resp:any) => {
      this.tbody = resp.data;       
    });
  }

  generatePDF(payload:any)
  {
    this.userService.generateFacultyData(payload).subscribe((res:any) => {               
          let fileName = "faculty-list.pdf";
          let blob:Blob = res.body as Blob;
          let pdfSrc = window.URL.createObjectURL(blob)
          //console.log(pdfSrc);                    
          let iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = pdfSrc;
          document.body.appendChild(iframe);
          iframe.contentWindow?.focus();
          setTimeout(() => {
            iframe.contentWindow?.print();
          }, 800);                    
    },(err:any)=>{
      console.log(err);
      this.toastr.showError(err);
    });    
  }  

  generateExcel(payload:any){

    this.userService.generateFacultyData(payload).subscribe((res:any) => {   
          
      let fileName = "Faculty-Data.xlsx";
      let blob:Blob = res.body as Blob;
      let pdfSrc = window.URL.createObjectURL(blob)
      console.log(pdfSrc);
        let a = document.createElement('a');
        a.download = fileName;        
        a.href =  pdfSrc

        a.click();    

    },(err:any)=>{
      console.log(err);
      this.toastr.showError(err);
    }); 

  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

}
