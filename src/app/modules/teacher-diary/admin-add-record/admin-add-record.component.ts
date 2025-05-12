import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TeacherDiaryService } from '../teacher-diary.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-admin-add-record',
  templateUrl: './admin-add-record.component.html',
  styleUrls: ['./admin-add-record.component.scss']
})
export class AdminAddRecordComponent {

  submitted:any=false;
  public invaineFrom:any=false;
  public invaineTo:any=false;
  public dates:any=false;
  public valid = true;
  constructor(
    private teacherDiarySerivce: TeacherDiaryService,private router:Router, private datePipe: DatePipe,private fb:FormBuilder, private toastr: Toastr
  ) {
    this.leavecreateform = new FormGroup({
      date: new FormControl('',[Validators.required]),
      class_id: new FormControl('',[Validators.required]),
      section: new FormControl(''),      
      faculty: new FormControl('',[Validators.required]),      
      batch_id: new FormControl('',[Validators.required]),
      subject_id: new FormControl('',[Validators.required]),      
      topic: new FormControl('',[Validators.required]),
      topic2: new FormControl('',[Validators.required]),
      description: new FormControl('',[Validators.required]),
      detail: new FormControl('',[Validators.required]),
    });
  }
  sections = [{ id: '', name: 'All' }];

  Batches = [];
  selectedBatch:any ='';

  Subjects = [];
  selectedSubject:any = '';

  ClassNames = [];
  selectedClass:any = '';

  leavecreateform: FormGroup;
  ngOnInit() {
    this.teacherDiarySerivce.getSectionList(this.sections).subscribe((res: any) => {                         
      this.sections = this.sections.concat(res.data);      
  }); 
    this.getClassList();
    this.getAllFaculty();
  }
  URLConstants = URLConstants;

  public deleted_id=1;
  public login_id=4;
  public selected_id=4;
  public selected_subject_id = 0;
  public selected_batch_id   = 0;
  public lesson_planning_id = 0;
  public id=4;
  public Faculties = [];
  selectedFaculty='';

  changeFn(val:any){
    this.selected_id =val;
    this.getSubjectAndBatchListByClassId(val);
    this.selectedSubject='';
    this.selectedBatch='';
  }
  changeFaculty(){      
    this.getClassList();
    this.selectedClass = '';
    this.selectedBatch = '';
    this.selectedSubject = '';
  }
  changeFn2(val:any){
    this.selected_subject_id = val;
    this.selected_batch_id = this.leavecreateform.value.batch_id;
    this.getLessonRecord();
  }
  
  onSubmit() {
      this.submitted=true;
      this.valid=true;
      let date=this.leavecreateform.value.date;
      //let end_date=this.leavecreateform.value.end_date;

      // let c= new Date();
      // if(new Date(date)< c )
      // {          
      //   this.invaineFrom=true;    this.valid=false;    
      // }else{
      //   this.invaineFrom=false;
      // }
     
          
      console.log(this.leavecreateform.value);
      //console.log(this.Faculty);
      const payload = {
        "user_id":this.selectedFaculty,
        "date": date,
        "topic": this.leavecreateform.value.topic2,
        "description": this.leavecreateform.value.detail,
        "lesson_planning_id":this.lesson_planning_id,	
      } 
      console.log(payload);
    
      if(this.valid){
        //Student Leave Add
        this.addRecord(payload);
      // this.leaveManagementSerivce.addStudentLeave(this.leavecreateform.value).then((res:any)=>{
      //  }).catch((err:any)=>{
      //  })
      }
      
      return 0;
           
      // this.leaveManagmentService.getLeavesList(payload).then((res)=>{
      // }).catch((err)=>{
      // })
  }

  sectionChange()
    { 
        this.teacherDiarySerivce.getFacultyBySection(this.leavecreateform.value.section).subscribe((res: any) => {
          this.Faculties=res;
          this.selectedFaculty = '';
          this.selectedClass = '';
          this.selectedBatch = '';
          this.selectedSubject = '';
      });
    }

    
  getAllFaculty(){
    this.teacherDiarySerivce.getAllFaculty().subscribe((res:any) => {
     //this.student=res.data;   
     this.Faculties=res.data;   
     this.selectedFaculty = res.data[0].id;
     this.selected_id== res.data[0].id;
     this.getClassList();
    }); 
  } 
getLessonRecord(){
    let date = this.datePipe.transform(this.leavecreateform.value.date,"dd-MM-YYYY");
    let s ={
    "date":date,
    "created_by":this.selectedFaculty,
    "batch_id":this.selected_batch_id,
    "subject_id":this.selected_subject_id,
    "class_id":this.selected_id, 
    "section_id":this.leavecreateform.value.section_id,   
    };
    console.log(s);
    this.teacherDiarySerivce.getLessonRecord(s).subscribe((res:any) => {
      console.log(res);   
      if(res.status==false){
        this.leavecreateform?.get('topic')?.setValue('');
        this.leavecreateform?.get('description')?.setValue('');
        this.toastr.showError(res.message);
      }else{
        this.toastr.showSuccess("Record Found");        
        this.lesson_planning_id = res.data.id;
        this.leavecreateform?.get('topic')?.setValue(res.data.topic);
        this.leavecreateform?.get('description')?.setValue(res.data.description);
      }   
    }); 
  }

  addRecord(payload:any)
  {
    this.teacherDiarySerivce.addRecord(payload).subscribe((res:any) => {      
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.router.navigate([this.setUrl(URLConstants.ADMIN_DIARY_LIST)]);
      }    
    });    
  }

  getClassList(){      
    let param = {user_id:this.leavecreateform.value.faculty};
    this.teacherDiarySerivce.getClassListForAdmin(param).subscribe((res:any) => {
      console.log(res);
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.ClassNames = res.data;
        //this.selectedClass = res.data[0].id;
        this.getSubjectAndBatchListByClassId(res.data[0].id);
      }    
    });         
  }

  getSubjectAndBatchListByClassId(id:any){
    let param = {user_id:this.selectedFaculty};
    this.teacherDiarySerivce.getSubjectAndBatchListByClassId(param,id).subscribe((res:any) => {
      console.log(res);
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.Batches = res.data.batch;
        this.Subjects = res.data.subject;
        //this.selectedBatch =res.data.batch[0].id;
        //this.selectedSubject =res.data.subject[0].id;
      }    
    });               
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
