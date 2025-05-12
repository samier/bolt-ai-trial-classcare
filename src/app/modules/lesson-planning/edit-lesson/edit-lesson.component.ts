import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { LessonPlanningService } from '../lesson-planning.service';
import { CommonService } from 'src/app/core/services/common.service';
import moment from 'moment';

@Component({
  selector: 'app-edit-lesson',
  templateUrl: './edit-lesson.component.html',
  styleUrls: ['./edit-lesson.component.scss']
})
export class EditLessonComponent {

  submitted:any=false;
  public invaineFrom:any=false;
  public branch_id = window.localStorage?.getItem("branch");

  public valid = true;
  private lesson_id:any=0;
  read_only:any;
  leavecreateform: FormGroup;
  tomorrowDate:any = moment().add(1,'days').format('yyyy-MM-DD');

  constructor(
    private lessonPlanningSerivce:LessonPlanningService ,private route: ActivatedRoute,private router:Router, private datePipe: DatePipe,private fb:FormBuilder, private toastr: Toastr, public CommonService: CommonService
  ) {

    this.lesson_id = this.route.snapshot.paramMap.get('id');
      console.log(this.lesson_id);

    let currentDateTime =this.datePipe.transform((new Date), 'yyyy-mm-dd')  
    this.leavecreateform = new FormGroup({
      date: new FormControl('',[Validators.required]),
      section: new FormControl(''),
      class_id: new FormControl('',[Validators.required]),      
      batch_id: new FormControl('',[Validators.required]),
      subject_id: new FormControl('',[Validators.required]),
      topic: new FormControl('',[Validators.required]),
      description: new FormControl('',[Validators.required]),
    });
  }
  ida:any;
  idb:any;
  idc:any;
  ngOnInit() { 

    this.lessonPlanningSerivce.getSection(this.branch_id).subscribe((res: any) => {                         
      this.sections = this.sections.concat(res.data);      
  });
    
    this.lessonPlanningSerivce.getLessonDetail(this.lesson_id).subscribe((res:any) => {
      console.log(res);  
      let dt = res.data.date.split('-');
      let date = dt[2]+'-'+dt[1]+'-'+dt[0];    
      this.leavecreateform.get('date')?.setValue(date);
      this.leavecreateform.get('section')?.setValue(res.data.section_id);
      this.leavecreateform.get('class_id')?.setValue(res.data.class_id);
      this.leavecreateform.get('batch_id')?.setValue(res.data.batch_id);
      this.leavecreateform.get('subject_id')?.setValue(res.data.subject_id);
      this.leavecreateform.get('topic')?.setValue(res.data.topic);
      this.leavecreateform.get('description')?.setValue(res.data.description);    

      let c= new Date();
      if(new Date(date)< c ){
        this.read_only=true;
        this.leavecreateform.get('section')?.disable();
        this.leavecreateform.get('class_id')?.disable();
        this.leavecreateform.get('batch_id')?.disable();
        this.leavecreateform.get('subject_id')?.disable();;
      }

      this.ida = res.data.class_id;
      this.idb =res.data.batch_id;
      this.idc =res.data.subject_id;  
      this.getClassList();
      this.getSubjectAndBatchListByClassId2(res.data.class_id,res.data.batch_id,res.data.subject_id)
    });   
  }
  // ngAfterViewChecked(){
  //   this.selectedClass = this.ida;
  //   this.selectedBatch =this.idb;
  //   this.selectedSubject =this.idc;
  // }
  URLConstants = URLConstants;
  
  sections = [{ id: '', name: 'All' }];

  Batches = [];
  selectedBatch:any ='';

  Subjects = [];
  selectedSubject:any = '';

  ClassNames = [];
  selectedClass:any = '';

  public login_id=4;
  public selected_id='';
  public id=4;

    changeFn(val:any){
      this.selected_id =val;
      this.getSubjectAndBatchListByClassIdTwo(val);
    }

    onSubmit() {
      this.submitted=true;
      this.valid=true;
      let start_date=this.leavecreateform.value.date;

      // current date validation
      let c= new Date();
      if(new Date(start_date)< c )
      {          
        this.invaineFrom=true;    this.valid=false;    
      }else{
        this.invaineFrom=false;
      }        
          
      console.log(this.leavecreateform.value);
      const payload = {
        "created_by":this.login_id,
        "date": this.datePipe.transform(this.leavecreateform.value.date, 'dd-MM-yyyy'),
        "section_id":this.leavecreateform.value.section,
        "class_id": this.leavecreateform.value.class_id,
        "batch_id": this.leavecreateform.value.batch_id,
        "subject_id": this.leavecreateform.value.subject_id,
        "topic": this.leavecreateform.value.topic,
        "description": this.leavecreateform.value.description	
      } 
      console.log(payload);
    
      if(this.valid){        
        this.updateLesson(payload);
      }
      return 0;
    }
   async getClassList(){      
      this.lessonPlanningSerivce.getClassList(this.branch_id).subscribe(async (res:any) => {
        console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.ClassNames = res.data;
          if(!this.selectedClass)
          this.selectedClass = res.data[0].id;
          // this.getSubjectAndBatchListByClassId(res.data[0].id);
          // this.selectedBatch =this.idb;
          // this.selectedSubject =this.idc;
        }    
      });         
    }
      
   getSubjectAndBatchListByClassId(id:any){
      let param = {user_id:0};
      this.lessonPlanningSerivce.getSubjectAndBatchListByClassId(param,id).subscribe((res:any) => {
        console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.Batches = res.data.batch;
          this.Subjects = res.data.subject;
        }    
      });               
    }

    getSubjectAndBatchListByClassIdTwo(id:any){
      let param = {user_id:0};
      this.lessonPlanningSerivce.getSubjectAndBatchListByClassId(param,id).subscribe((res:any) => {
        console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.Batches = res.data.batch;
          this.Subjects = res.data.subject;
          this.selectedBatch =res.data.batch[0].id;
          this.selectedSubject =res.data.subject[0].id;
        }    
      });               
    }

    getSubjectAndBatchListByClassId2(id:any,batch:any,subject:any){
      let param = {user_id:0};
      this.lessonPlanningSerivce.getSubjectAndBatchListByClassId(param,id).subscribe((res:any) => {
        console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.Batches = res.data.batch;
          this.Subjects = res.data.subject;
          this.selectedBatch =batch;
          this.selectedSubject =subject;
        }    
      });               
    }

    updateLesson(payload:any)
    {
      this.lessonPlanningSerivce.updateLesson(payload,this.lesson_id).subscribe((res:any) => {
        console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        }
        else{
          this.router.navigate([this.setUrl(URLConstants.FACULTY_LESSON_LIST)]);
        }    
      });    
    }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  sectionChange()
    {    
      this.lessonPlanningSerivce.getClassListBySection(this.leavecreateform.value.section).subscribe((res: any) => {
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
