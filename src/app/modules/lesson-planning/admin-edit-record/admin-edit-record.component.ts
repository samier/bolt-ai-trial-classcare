import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { LessonPlanningService } from '../lesson-planning.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';
import moment from 'moment';

@Component({
  selector: 'app-admin-edit-record',
  templateUrl: './admin-edit-record.component.html',
  styleUrls: ['./admin-edit-record.component.scss']
})
export class AdminEditRecordComponent {

  submitted:any=false;
  public invaineFrom:any=false;
  public branch_id = window.localStorage?.getItem("branch");
  public valid = true;
  public id:any;
  public read_only:any;
  tomorrowDate:any = moment().add(1,'days').format('yyyy-MM-DD');
  constructor(
    private lessonPlanningSerivce:LessonPlanningService ,private route: ActivatedRoute,private router:Router, private datePipe: DatePipe,private fb:FormBuilder, private toastr: Toastr, public CommonService: CommonService
  ) {
    let currentDateTime =this.datePipe.transform((new Date), 'yyyy-mm-dd')
    this.id = this.route.snapshot.paramMap.get('id');
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
  public ida:any;
  public idb:any;
  public idc:any;
  ngOnInit() { 
    this.lessonPlanningSerivce.getSectionList(this.sections).subscribe((res: any) => {                         
      this.sections = this.sections.concat(res.data);      
  });

    this.getClassList();
    this.getAllFaculty();

    this.lessonPlanningSerivce.getLessonDetail(this.id).subscribe((res:any) => {
      let dt = res.data.date.split('-');
      let date = dt[2]+'-'+dt[1]+'-'+dt[0];    
      this.leavecreateform.get('date')?.setValue(date);
      this.leavecreateform.get('class_id')?.setValue(res.data.class_id);
      this.leavecreateform.get('section')?.setValue(res.data.section_id);
      this.leavecreateform.get('faculty')?.setValue(res.data.created_by);      
      this.leavecreateform.get('batch_id')?.setValue(res.data.batch_id);
      this.leavecreateform.get('subject_id')?.setValue(res.data.subject_id);
      this.leavecreateform.get('topic')?.setValue(res.data.topic);
      this.leavecreateform.get('description')?.setValue(res.data.description);  
      
      let c= new Date();
      if(new Date(date)< c ){
        this.read_only=true;
        this.leavecreateform.get('faculty')?.disable();
        this.leavecreateform.get('section')?.disable();
        this.leavecreateform.get('class_id')?.disable();
        this.leavecreateform.get('batch_id')?.disable();
        this.leavecreateform.get('subject_id')?.disable();;
      }

      this.ida =res.data.class_id;
      this.idb =res.data.batch_id;
      this.idc =res.data.subject_id;  
      this.getClassList();
      this.getSubjectAndBatchListByClassId2(res.data.class_id,res.data.batch_id,res.data.subject_id)      
     }); 
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
 

    changeFn(val:any){
      this.selected_id =val;      
      this.getSubjectAndBatchListByClassId(val);
      // this.selectedSubject='';
      // this.selectedBatch='';
    }
    changeFaculty(){      
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
        "created_by":this.selectedFaculty,
        "date": this.datePipe.transform(this.leavecreateform.value.date, 'dd-MM-yyyy'),
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
      }); 
    } 

    getClassList(){      
      let param = {user_id:this.selectedFaculty};
      this.lessonPlanningSerivce.getClassListForAdmin(param).subscribe((res:any) => {
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

    updateLesson(payload:any)
    {
      this.lessonPlanningSerivce.updateLesson(payload,this.id).subscribe((res:any) => {
        console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        }
        else{
          this.router.navigate([this.setUrl(URLConstants.LESSON_LIST)]);
        }    
      });    
    }
    
    getSubjectAndBatchListByClassId2(id:any,batch:any,subject:any){
      let param = {user_id:this.selectedFaculty};
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

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
