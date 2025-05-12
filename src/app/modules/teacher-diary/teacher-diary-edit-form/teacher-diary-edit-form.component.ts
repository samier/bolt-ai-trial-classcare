import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TeacherDiaryService } from '../teacher-diary.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-teacher-diary-edit-form',
  templateUrl: './teacher-diary-edit-form.component.html',
  styleUrls: ['./teacher-diary-edit-form.component.scss']
})
export class TeacherDiaryEditFormComponent {

  submitted:any=false;
  public invaineFrom:any=false;
  public branch_id = window.localStorage?.getItem("branch");
  public invaineTo:any=false;
  public dates:any=false;
  public valid = true;
  public record_id:any=null;
  constructor(
    private teacherDiarySerivce: TeacherDiaryService,private route:ActivatedRoute,private router:Router, private datePipe: DatePipe,private fb:FormBuilder, private toastr: Toastr, public CommonService: CommonService
  ) {
    this.record_id = this.route.snapshot.paramMap.get('id');
    
    console.log(this.record_id);
    this.leavecreateform = new FormGroup({
      date: new FormControl('',[Validators.required]),
      section: new FormControl(''),
      class_id: new FormControl('',[Validators.required]),      
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

    this.teacherDiarySerivce.getSection(this.branch_id).subscribe((res: any) => {                         
      this.sections = this.sections.concat(res.data);      
  }); 
    this.teacherDiarySerivce.getRecordDetail(this.record_id).subscribe((res:any) => {
      console.log(res);  
      let dt = res.data.date  
      
      this.leavecreateform.get('date')?.setValue(dt);
      this.leavecreateform.get('topic2')?.setValue(res.data.topic);
      this.leavecreateform.get('detail')?.setValue(res.data.description);  

      this.leavecreateform.get('topic')?.setValue(res.data.lesson.topic);
      this.leavecreateform.get('description')?.setValue(res.data.lesson.description);  

      this.lesson_planning_id = res.data.lesson.id;
      this.leavecreateform.get('section')?.setValue(res.data.lesson.section_id);

      this.getClassList();
      this.selectedClass=res.data.lesson.class_id;  
      this.getSubjectAndBatchListByClassId(this.selectedClass);
      this.selectedSubject=res.data.lesson.subject_id;  
      this.selectedBatch=res.data.lesson.batch_id;  

    });     
  }
  URLConstants = URLConstants;

  public deleted_id=1;
  public login_id=4;
  public selected_id=4;
  public selected_subject_id = 0;
  public selected_batch_id   = 0;
  public lesson_planning_id  = 0;
  public id = 4;


    changeFn(val:any){
      this.selected_id =val;
      this.getSubjectAndBatchListByClassId(val);      
      this.selectedBatch   = '';    
      this.selectedSubject = '';
      this.leavecreateform.get('topic')?.setValue('');
      this.leavecreateform.get('description')?.setValue('');      
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
        "user_id":this.login_id,
        "date": date,
        "lesson_planning_id":this.lesson_planning_id,
        "topic": this.leavecreateform.value.topic2,
        "description": this.leavecreateform.value.detail	
      } 
      console.log(payload);
    
      if(this.valid){
        //Student Leave Add
        this.editRecord(payload);
      //  this.leaveManagementSerivce.addStudentLeave(this.leavecreateform.value).then((res:any)=>{
      //  }).catch((err:any)=>{
      //  })
      }
      
      return 0;
            
      // this.leaveManagmentService.getLeavesList(payload).then((res)=>{
      // }).catch((err)=>{
      // })
    }
  

    editRecord(payload:any)
    {
      this.teacherDiarySerivce.updateRecord(payload,this.record_id).subscribe((res:any) => {
        console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.router.navigate([this.setUrl(URLConstants.TEACHER_DIARY_LIST)]);
        }    
      });    
    }    


    getLessonRecord(){
      let date = this.datePipe.transform(this.leavecreateform.value.date,"dd-MM-YYYY");
      let s ={
      "date":date,
      "created_by":this.login_id,
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
          this.lesson_planning_id = res.data.id
          this.leavecreateform?.get('topic')?.setValue(res.data.topic);
          this.leavecreateform?.get('description')?.setValue(res.data.description);
        }   
      }); 
    }


    getClassList(){      
      this.teacherDiarySerivce.getClassList(this.branch_id).subscribe((res:any) => {
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
      let param = {user_id:0};
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

  sectionChange()
    {    
      this.teacherDiarySerivce.getClassListBySection(this.leavecreateform.value.section).subscribe((res: any) => {
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.ClassNames=res;
        }    
          this.selectedClass = '';          
          this.selectedBatch = '';
          this.selectedSubject = '';          
      });
    }
}
