import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { McqManagementService } from '../mcq-management.service';
import { TransportService } from '../../transport-management/transport.service';
import { enviroment } from '../../../../environments/environment.staging';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import * as moment from 'moment';
import 'moment-timezone';
import { ReportService } from "../../report/report.service";
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';


@Component({
  selector: 'app-exam-form',
  templateUrl: './exam-form.component.html',
  styleUrls: ['./exam-form.component.scss']
})
export class ExamFormComponent {
  subject: any;
  constructor(
      private fb: FormBuilder, 
      private activatedRouteService: ActivatedRoute,
      private router: Router,
      private toastr: Toastr,
      private mcqService: McqManagementService,
      private transportService: TransportService,
      private ReportService: ReportService,
      public formValidationService: FormValidationService,

  ) {}

  URLConstants = URLConstants;
  saveBtn:string = 'Save';
  page:string = 'Add';
  id:any = null;
  exam: any = [];
  chapters: any = [];
  classes: any = [];
  subjects: any = [];
  questionsList: any = [];
  batches: any = [];
  selectedBatches: any = [];
  selectedClass: any = null;
  selectedSubject: any = null;
  selectedChapter: any = [];
  startTime: any = null;
  endTime: any = null;
  selectedQuestions:any = [];
  classListDP : any[] =[];
  subjectListDP : any[] = [];
  chapterDP : any[] = [];
  batchDP : any[] = [];
  form :FormGroup = new FormGroup({});
  totalMarks:any = 0;
  totalQuestion:any = 0;
  batchDropdownSettings: IDropdownSettings = {};
  chapterDropdownSettings: IDropdownSettings = {};
  selectedDateRange: any = { 
    start: moment().subtract(1, 'days').set({hour: 10, minute: 0, second:0}), 
    end: moment().set({hour: 12, minute: 0, second:0}) 
  };
  diffInMinutes: any = 0;
  today = new Date().toISOString().split('T')[0];
  
  ngOnInit(): void {
    this.classList();
    this.initForm()
    // this.transportService.getClassesList().subscribe((res:any) => {  
    //   this.classes = res.data;
    // });
    // this.batchDropdownSettings = {
    //   singleSelection: false,
    //   idField: 'id',
    //   textField: 'name',
    //   selectAllText: 'Select All',
    //   unSelectAllText: 'UnSelect All',
    //   itemsShowLimit: 3,
    //   allowSearchFilter: true
    // };
    // this.chapterDropdownSettings = {
    //   singleSelection: false,
    //   idField: 'id',
    //   textField: 'chapter_name',
    //   selectAllText: 'Select All',
    //   unSelectAllText: 'UnSelect All',
    //   itemsShowLimit: 3,
    //   allowSearchFilter: true
    // };
    this.id = this.activatedRouteService.snapshot.params['id'];
    
    if(this.id){
      this.saveBtn = 'Update';
      this.page = 'Edit';
      this.mcqService.getExamDetail(this.id).subscribe(async (res) => {  
        this.exam = res;
          await this.classList();
          await this.getBatchList();
          await this.getSubjectList();
          await this.getChapterList();
          await this.getQuestions()

          this.patchExamForm(); 
        // this.changeClass(this.exam.data.subject.class.id);
        // this.changeSubject(this.exam.data.subject.id);
        // this.selectedBatches = this.exam.data.batches;
        this.selectedQuestions = this.exam.data.questions.map((row:any,index:any)=>{
          this.selectQuestion(row.id,row.marks);
          return row.id;
        });
        // this.selectedClass = this.exam.data.subject.class.id;
        // this.selectedSubject = this.exam.data.subject.id;
        // this.selectedChapter = this.exam.data.chapters;
        // this.startTime = this.exam.data.start_time;
        // this.endTime = this.exam.data.end_time;
        // this.selectedDateRange = { 
        //   startDate: moment(this.startTime, "YYYY-MM-DD HH:mm:ss"),
        //   endDate: moment(this.endTime, "YYYY-MM-DD HH:mm:ss")
        // };

        // this.form.patchValue({
        //   hasNegativeMarks:this.exam.data.negative_mark ? '1' : '0',
        //   resultType : this.exam.data.result_type.toString(),
        //   totalMarks : this.exam.data.total_mark,
        //   examName : this.exam.data.exam_name,
        //   description : this.exam.data.description,
        //   questionType : this.exam.data.question_type,
        //   random : this.exam.data.total_question,
        //   totalQuestion : this.exam.data.total_question,
        //   passingMarks : this.exam.data.passing_mark,
        //   negativeMarks : this.exam.data.negative_mark,
        //   resultDate : this.exam.data.result_date,
        //   examDuration : this.exam.data.exam_duration,
        //   examDate: this.selectedDateRange,
        //   classes: this.exam.data.subject.class.id,
        //   subject: this.exam.data.subject.id,   

        //   // subject: {
        //   //   id: this.exam.data.subject.id,
        //   //   name: this.exam.data.subject.name // or whatever your label key is
        //   // },     
        //   batches: this.exam.data.batches.map((b: any) => b.name), // should be array of IDs
        //   chapters: this.exam.data.chapters.map((c: any) => c.chapter_name)
          
        // })        
        // // this.form.controls.class?.disable();
        // // this.form.controls.subject?.disable();
      
      })
      
    }
  }

  onDateSelect(event:any){
    this.startTime = moment(event.startDate?.toDate()).tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm');
    this.endTime = moment(event.endDate?.toDate()).tz('Asia/Calcutta').format('YYYY-MM-DD HH:mm');
    const date1 = moment(this.startTime, 'YYYY-MM-DD HH:mm');
    const date2 = moment(this.endTime, 'YYYY-MM-DD HH:mm');
    this.diffInMinutes = date2.diff(date1, 'minutes');
  }

  getQuestions(){
    // console.log('Chapters value:', this.form.value.chapters);

    // var chapters = '';
    // this.form.value.chapters?.map((row:any,index:any)=>{
    //   chapters += '&chapter[]='+row.id;
    // })
    // const params = {
    //     "subjectId": this.form.value.subject,
    //     "chapter": this.form.value.chapters,
    //     "isEdit": this.id ? 1 : 0,
    // }
    const subjectId = this.form.value.subject;
    // console.log(subjectId,">>");
    
    const isEdit = this.id ? 1 : 0;

// Build the chapter[] query string manually
let chapterQuery = '';
if (this.form.value.chapters && this.form.value.chapters.length > 0) {
  this.form.value.chapters.forEach((row: any) => {
    chapterQuery += `&chapter[]=${row.id}`;
  });
}

// Build the full params object to pass
    const params = {
      subjectId: subjectId,
      isEdit: isEdit,
      chapter: chapterQuery
    };

    

// Call your API method
  //  this.getQuestions(params);

    this.mcqService.getQuestions(params).subscribe((res:any) => {
      if(!res.error){
        this.questionsList = res;
        // this.totalMarks = 0;
        // this.totalQuestion = 0;
        // const selected = this.selectedQuestions;
        // this.selectedQuestions = [];
        // this.questionsList.map((row:any,index:any)=>{
        //   if(selected.indexOf(row.questionId) >= 0){
        //     this.selectQuestion(row.questionId,row.marks);
        //   }
        // });
      }else{
        this.questionsList = [];
      }
    });
  }

  selectQuestion(queId:any,marks:any){
    var index = this.selectedQuestions.indexOf(queId);
    if (index < 0) {
        this.selectedQuestions.push(queId);
        this.totalMarks = parseFloat(this.totalMarks) + parseFloat(marks);
        this.totalQuestion = this.totalQuestion + 1;
    } else {
        this.selectedQuestions.splice(index, 1);
        this.totalMarks = parseFloat(this.totalMarks) - parseFloat(marks);
        this.totalQuestion = this.totalQuestion - 1;
    }
  }
 
  initForm() {
   this.form = this.fb.group({
    hasNegativeMarks: ['0',[Validators.required]],
    resultType: ['0',[Validators.required]],
    totalMarks: [''],
    examName: ['',[Validators.required]],
    description: ['',[Validators.required]],
    subject: [null,[Validators.required]],
    batches: [null,[Validators.required]],
    chapters: [null,[Validators.required]],
    examDate: [''],
    examDuration: [''],
    random: [''],
    questionType: ['',[Validators.required]],
    totalQuestion: [''],
    passingMarks: [''],
    negativeMarks: ['',[Validators.min(0),Validators.max(100)]],
    resultDate: [''],
    classes: [null,[Validators.required]],
  });

  this.form.valueChanges.subscribe((ele)=>{
    this.form.controls['chapters'].markAsPristine();
    this.form.controls['chapters'].markAsUntouched();
  })
}

  // changeClass(class_id:any){
  //   this.selectedSubject = null;
  //   this.selectedChapter = null;
  //   this.selectedBatches = null;
  //   this.subjects = this.chapters = this.batches = [];
  //   this.mcqService.getSubjectList(class_id).subscribe((res:any) => {  
  //     this.subjects = res.data.subject;
  //     this.batches = res.data.batch;
  //   });
  // }

  changeSubject(subject_id:any){
    this.selectedChapter = null;
    this.chapters = [];
    this.mcqService.getChaptersHasQuestion(subject_id).subscribe((res:any) => {  
      this.chapters = res.data;
    });
  }
  
  submit(): void{
    // console.log(this.form.controls);
    // if(this.form.value.examDuration == '0'){
    //   this.toastr.showError('please select valid exam date & time');
    //   return;
    // }else if(this.startTime < this.today){
    //   this.toastr.showError('please select future exam date & time');
    //   return;
    // }
    // if(this.form.value.questionType == 'random' && this.form.value.random == null){
    //   this.toastr.showError('please enter no of random question.');
    //    return;
    //  }
    //  if(this.form.value.questionType == 'manual' && document.querySelector('input[name="question[]"]:checked') == null){
    //    this.toastr.showError('please select questoins.');
    //     return;
    //   }
    // if(this.form.value.questionType == 'manual' && this.form.value.passingMarks == ''){
    //   this.toastr.showError('please enter passing marks.');
    //   return;
    // }else if(this.form.value.questionType == 'manual' && (this.form.value.passingMarks??0) > (this.form.value.totalMarks??0)){
    //   this.toastr.showError('invalid passing marks');
    //   return
    // }
    // if(this.form.value.hasNegativeMarks == '1' && this.form.value.negativeMarks == ''){
    //   this.toastr.showError('please enter negative marks.');
    //   return;
    // }
    // if(this.form.value.resultType == '1' && this.form.value.resultDate == ''){
    //   this.toastr.showError('please select result date.');
    //   return;
    // }else if(this.form.value.resultType == '1' && (this.form.value.resultDate??'') < this.today){
    //   this.toastr.showError('please enter future result date.');
    //   return;
    // }
    
    this.formValidationService.getFormTouchedAndValidation(this.form)
    if (this.form.invalid) {
      return; 
    }
    const form = document.getElementById('exam-form') as HTMLFormElement;
    const formData:FormData = new FormData(form);
    this.form.value.batches?.map((row:any,index:any)=>{
      formData.append("batchs[]",row.id);
    })
    this.selectedQuestions?.map((row:any,index:any)=>{
      formData.append("selectedQuestions[]",row);
    })
    this.form.value.chapters?.map((row:any,index:any)=>{
      formData.append('chapters[]',row.id);
    })
    formData.append('subject',this.form.value.subject);
    formData.append('resultDate', this.form.value.resultDate || '');
    const academicYearId = sessionStorage.getItem('academic_year_id');
    if (academicYearId) {
    formData.append('academicYear', academicYearId);
    }
    // formData.append('startTime',this.form.value.startTime)
    // formData.append('endTime',this.form.value.endTime)
    this.mcqService.saveExam(formData,this.id).subscribe((res:any) => {  
      if(res.errorList){
        this.toastr.showError(res.errorList[0]);
      }else if(res.error){
        this.toastr.showError(res.error);
      }else{
        this.toastr.showSuccess(res.success);
        this.router.navigate([this.setUrl(URLConstants.EXAM_LIST)]);  
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  getSubjectList(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.form.get('chapters')?.setValue(null);
      this.subjectListDP = [];
      if (this.id) {
        this.form.patchValue({ classes: this.exam?.data?.subject?.class?.id });
      }
      this.mcqService.getSubjectList(this.form.value.classes).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.subjectListDP = res?.data?.subject?.map((ele: any) => ({
              name: ele.name,
              id: ele.id
            }));
            // Patch subject if exam data exists
            if (this.exam?.data?.subject_id) {
              this.form.patchValue({ subject: this.exam?.data?.subject_id });
            }
              if (this.id) {
              this.getChapterList();
            }
            resolve();
          } 
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }
  

  getChapterList(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.form.patchValue({ chapters: [] });
      this.chapterDP = [];
  
      this.mcqService.getChapters(this.form.value.subject).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.chapterDP = res.data.map((ele: any) => ({
              id: ele.id,
              name: ele.chapter_name
            }));
              if (this.exam?.data?.chapters) {
              this.form.patchValue({
                chapters: this.exam.data.chapters.map((c: any) => ({
                  id: c.id,
                  name: c.chapter_name
                }))
              });
            }
            resolve();
          }
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }
  


  classList(){
    this.batchDP=[]
      // this.questionFilterForm.get('batch').setValue(null);
    this.form.get('batches')?.setValue([]);
    this.form.get('subject')?.setValue(null);
    this.form.get('chapters')?.setValue([]);
    this.subjectListDP=[]
    this.chapterDP=[]
    this.mcqService.getClass({}).subscribe((res:any)=>{
      this.classListDP = res.data      
      if(this.id){
        this.getBatchList();
        this.getSubjectList();
      }
    })
  }
  
  getBatchList(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.form.get('subject')?.setValue(null);
      this.form.get('chapters')?.setValue([]);
  
      let payload: number | number[] = 0;
      this.subjectListDP = [];
      this.chapterDP = [];
  
      if (!this.form.value.classes) {
        payload = this.classes.map(ele => ele.id);
      } else {
        payload = this.form.value.classes;
      }
  
      this.ReportService.getBatchesByClass(payload).subscribe({
        next: (res: any) => {
          this.batchDP = res?.data || [];
          resolve();
        },
        error: (err) => {
          reject(err); 
        }
      });
    });
  }

  patchExamForm(){

    this.startTime = this.exam.data.start_time;
    this.endTime = this.exam.data.end_time;
    this.selectedDateRange = { 
      startDate: moment(this.exam.data.start_time, "YYYY-MM-DD HH:mm:ss"),
      endDate: moment(this.exam.data.end_time, "YYYY-MM-DD HH:mm:ss")
    };
  
    this.form.patchValue({
      hasNegativeMarks: this.exam.data.negative_mark ? '1' : '0',
      resultType: this.exam.data.result_type.toString(),
      totalMarks: this.exam.data.total_mark,
      examName: this.exam.data.exam_name,
      description: this.exam.data.description,
      questionType: this.exam.data.question_type,
      random: this.exam.data.total_question,
      totalQuestion: this.exam.data.total_question,
      passingMarks: this.exam.data.passing_mark,
      negativeMarks: this.exam.data.negative_mark,
      resultDate: this.exam.data.result_date,
      examDuration: this.exam.data.exam_duration,
      examDate: this.selectedDateRange,
      classes: this.exam.data.subject.class.id,
      subject: this.exam.data.subject.id,
      batches: this.exam.data.batches.map((b: any) => ({
        id: b.id,
        name: b.name
      })),
      chapters: this.exam.data.chapters.map((c: any) => ({
        id: c.id,
        name: c.chapter_name
      }))
    });
  }

  isSubmitDisabled() {
    return this.form.invalid || 
           (this.form.value.questionType === 'manual' &&  (!this.selectedQuestions.length || !this.form.value.passingMarks || this.form.value.passingMarks > this.form.value.totalMarks)) || 
           (this.form.value.questionType === 'random' && (!this.form.value.random || this.form.value.random <= 0));
  }
  
  
}
