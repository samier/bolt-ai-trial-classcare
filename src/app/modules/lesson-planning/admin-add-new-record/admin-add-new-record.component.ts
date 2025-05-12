import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { LessonPlanningService } from '../lesson-planning.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Toastr } from 'src/app/core/services/toastr';
import moment from 'moment';

@Component({
  selector: 'app-admin-add-new-record',
  templateUrl: './admin-add-new-record.component.html',
  styleUrls: ['./admin-add-new-record.component.scss']
})
export class AdminAddNewRecordComponent {

  submitted:any=false;
  public invaineFrom:any=false;
  public branch_id = window.localStorage?.getItem("branch");
  public valid = true;
  constructor(
    private lessonPlanningSerivce:LessonPlanningService ,private router:Router, private datePipe: DatePipe,private fb:FormBuilder, private toastr: Toastr
  ) {
    let currentDateTime =this.datePipe.transform((new Date), 'yyyy-mm-dd')
   
    this.leavecreateform = new FormGroup({
      user_type: new FormControl(''),
      date: new FormControl('',[Validators.required]),
      class_id: new FormControl('',[Validators.required]),   
      section: new FormControl(''),
      faculty:new FormControl('',[Validators.required]), 
      batch_id: new FormControl('',[Validators.required]),
      subject_id: new FormControl('',[Validators.required]),
      topic: new FormControl('',[Validators.required]),
      description: new FormControl('',[Validators.required]),
    });
  }
  leavecreateform: FormGroup;
  ngOnInit() { 
    this.lessonPlanningSerivce.getSectionList(this.sections).subscribe((res: any) => {                         
      this.sections = this.sections.concat(res.data);      
  });

    this.getClassList();
    this.getAllFaculty();
  }
  URLConstants = URLConstants;
  
  sections = [{ id: '', name: 'All' }];  

  Faculties = [];
  selectedFaculty=''
  Batches = [];
  selectedBatch:any ='';

  Subjects = [];
  selectedSubject:any = '';

  ClassNames = [];
  selectedClass:any = '';

  public login_id=4;
  public selected_id='';
  public id=4;
  tomorrowDate:any = moment().add(1,'days').format('yyyy-MM-DD');

    changeFn(val:any){
      this.selected_id =val;
      this.getSubjectAndBatchListByClassId(val);
      this.selectedSubject='';
      this.selectedBatch='';
    }

    changeFaculty(){     
       this.selectedClass = '';
       this.selectedBatch = '';
       this.selectedSubject = '';
       console.log(111);
       
      this.getClassList();
      this.selectedClass = '';
      this.selectedBatch = '';
      this.selectedSubject = '';
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
        "section_id":this.leavecreateform.value.section,
        "created_by":this.leavecreateform.value.faculty,
        "date": this.datePipe.transform(this.leavecreateform.value.date, 'dd-MM-yyyy'),
        "class_id": this.leavecreateform.value.class_id,
        "batch_id": this.leavecreateform.value.batch_id,
        "subject_id": this.leavecreateform.value.subject_id,
        "topic": this.leavecreateform.value.topic,
        "description": this.leavecreateform.value.description	
      } 
      console.log(payload);
    
      if(this.valid){        
        this.addLesson(payload);
      }
      return 0;
    }

    sectionChange()
    { 
        this.lessonPlanningSerivce.getFacultyBySection(this.leavecreateform.value.section).subscribe((res: any) => {
          this.Faculties=res;      
          this.selectedFaculty = '';
          this.selectedClass = '';
          this.selectedBatch = '';
          this.selectedSubject = '';
      });
    }


    getAllFaculty(){
      this.lessonPlanningSerivce.getAllFaculty().subscribe((res:any) => {
       //this.student=res.data;   
       this.Faculties=res.data;   
       this.selectedFaculty = res.data[0].id;
       this.selected_id== res.data[0].id;
       this.getClassList();
      }); 
    } 

    getClassList(){      
      let param = {user_id:this.leavecreateform.value.faculty};
      this.lessonPlanningSerivce.getClassListForAdmin(param).subscribe((res:any) => {
        console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.ClassNames = res.data;
          //this.selectedClass = res.data[0].id;
          if(res.data.length > 0){
            this.getSubjectAndBatchListByClassId(res.data[0].id);
          }
        }    
      });         
    }

    getSubjectAndBatchListByClassId(id:any){
      let param = {user_id:this.leavecreateform.value.faculty};
      this.lessonPlanningSerivce.getSubjectAndBatchListByClassId(param,id).subscribe((res:any) => {
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

    addLesson(payload:any)
    {
      this.lessonPlanningSerivce.addLesson(payload).subscribe((res:any) => {
        console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        }
        else{
          this.router.navigate([this.setUrl(URLConstants.LESSON_LIST)]);
        }    
      });    
    }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
