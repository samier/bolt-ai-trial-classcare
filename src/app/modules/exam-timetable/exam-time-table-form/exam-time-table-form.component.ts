import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportSmsService } from '../../transport-sms/transport-sms.service';
import { OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ExamTypeService } from '../../exam-type/exam-type.service';
import { ExamTimetableService } from '../exam-timetable.service';
import { TransportService } from '../../transport-management/transport.service';


@Component({
  selector: 'app-exam-time-table-form',
  templateUrl: './exam-time-table-form.component.html',
  styleUrls: ['./exam-time-table-form.component.scss']
})
export class ExamTimeTableFormComponent {
  dropdownList:any  = [];
  selectedItems:any = [];
  dropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  dropdownListStudent:any  = [];
  selectedStudents:any = [];
  selectedExam:any = '';
  selectedNumbers:any = '';
  customeNumbers:any = '';
  message:any = '';
  sendTo:any=1;
  submitted:any=false;
  public valid = true;
  public exam_types:any;
  sectionList = []
  constructor(
    private smsService: TransportSmsService,private examTimeTable: ExamTimetableService ,private router:Router,private fb:FormBuilder, private toastr: Toastr,
    private _transportService:TransportService
  ) {    

    this.examTimeTableform = new FormGroup({
      exam_type: new FormControl('',[Validators.required]),
      class_name: new FormControl('',[Validators.required]),
      section_id: new FormControl(null,[Validators.required]),
    });
  }

  examTimeTableform: FormGroup;
  ngOnInit() {
    this.examTimeTable.getExamTypeList().subscribe((res:any) => {
      this.exam_types = res.data;
      if(res.status==false){
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 

    this.dropdownList = [];
    this.selectedItems = [];
    this.selectedStudents = [];
    this.getSectionList();
  }

  onItemSelect(item: any) {
    //console.log(this.selectedItems);
    //this.getStudentList(this.selectedItems);
  }
  onSelectAll(items: any) {    
    //this.getStudentList(items);
  }

  onItemSelectStudent(item: any) {
    //console.log(item);
    //this.getStudentNumbers(this.selectedStudents);
  }

  onItemDeSelect(item:any){     
    // this.getStudentList(this.selectedItems);
    // this.getStudentNumbers(this.selectedStudents);
  }
  
  onSelectAllStudent(items: any) {
    //this.getStudentNumbers(items);
  }
  
  onItemDeSelectStudent(item:any){    
    //this.getStudentNumbers(this.selectedStudents);
  }

  onItemDeSelectAll(item:any){
    // this.selectedStudents=[];
    // this.examTimeTableform.get('studentList')?.setValue([]);
    // this.dropdownListStudent=[];
    // this.getStudentList([]);
    // this.getStudentNumbers([]);
  }

  onItemDeSelectStudentAll(item:any){
      //this.getStudentNumbers([]);
  }

  fun(event=null){
    this.dropdownList = [];
    this.selectedItems = [];
    this.selectedStudents = [];
    if(this.selectedExam && (event || this.examTimeTableform.value.section_id)){
      this.getClassList();
    }
  } 

  getClassList(){
    const payload = {
      exam_type:this.selectedExam,
      section_id : this.examTimeTableform.value.section_id
    }
    this.examTimeTable.getClassList(payload).subscribe((res:any) => {
      this.dropdownList = res.data;
      if(res.status==false){
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  URLConstants = URLConstants;

  onSubmit(type:any) {
    
      this.submitted=true;
      this.valid=true;      
      console.log(this.examTimeTableform.value);    
      const payload = this.examTimeTableform.value;
      if(this.valid){ //add role
        if(type=='pdf')
        this.generateTimeTable(payload);
        else if(type == 'excel'){
        this.generateTimeTableExcel(payload);
        }
      }      
      return 0;           
  }    

  generateTimeTable(payload:any)
  {
    this.examTimeTable.generateTimeTable(payload).subscribe((res:any) => {               
          // let fileName = "examtimetable.pdf";
          // let blob:Blob = res.body as Blob;
          // let a = document.createElement('a');
          // a.download = fileName;
          // a.href =  window.URL.createObjectURL(blob) 
          // a.click();            

          let fileName = "ExamTimeTable.pdf";
          let blob:Blob = res.body as Blob;
          let pdfSrc = window.URL.createObjectURL(blob)
          console.log(pdfSrc);
          
          
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

  generateTimeTableExcel(payload:any){

    this.examTimeTable.generateTimeTableExcel(payload).subscribe((res:any) => {   
          
      let fileName = "Examtimetable.xlsx";
      let blob:Blob = res.body as Blob;
      let pdfSrc = window.URL.createObjectURL(blob)
      console.log("file name");
      console.log(pdfSrc);

      let a = document.createElement('a');
      a.download = fileName;
      a.href =  pdfSrc
      a.click();
        // let a = document.createElement('a');
        // a.download = fileName;        
        // a.href =  pdfSrc
        // a.click();      

    },(err:any)=>{
      console.log(err);
      this.toastr.showError(err);
    }); 

   ;
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  getSectionList() {
    this._transportService.getSectionList("").subscribe((res: any) => {
      if (res.status) {
        this.sectionList = res.data
      }
    })
  }
}
