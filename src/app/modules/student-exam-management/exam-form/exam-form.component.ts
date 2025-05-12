import { Component } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentExamService } from '../student-exam.service';
import { FormBuilder, FormControl, FormGroup  } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-exam-form',
  templateUrl: './exam-form.component.html',
  styleUrls: ['./exam-form.component.scss']
})
export class ExamFormComponent {

  URLConstants = URLConstants;
  exam_detail:any = [];
  id:any = null;
  currentQuestion:number = 0;
  question:any = [];
  endTime:any = null;
  exam_selection_id:any = null;

  constructor(
      private activatedRouteService: ActivatedRoute,
      private studentExamService: StudentExamService,
      private fb: FormBuilder,
      private router: Router,
  ) {}

  ngOnInit(): void {
    this.id = this.activatedRouteService.snapshot.params['id'];
    if(this.id){
      this.studentExamService.getExamDetail(this.id).subscribe((res:any) => {  
        this.exam_detail = res.data.exam;  
        this.exam_selection_id = res.data.examSelection;  
        if(!res.data.student_result){
          const startTime = new Date(this.exam_detail.start_time).toISOString();
          if(startTime > new Date().toISOString()){
            this.router.navigate([URLConstants.STUDENT_EXAM_DETAIL,this.id]);  
          }
          this.moveToIndex(0);
          const Time = localStorage.getItem('endTime');
          if (Time) {
            this.endTime = new Date(Time).toISOString();
          } else {
            this.endTime = new Date(this.exam_detail.end_time).toISOString();
            localStorage.setItem('endTime', this.endTime);
          }
          if(this.endTime < new Date().toISOString()){
            localStorage.removeItem('endTime');
            this.router.navigate([URLConstants.STUDENT_EXAM_DETAIL,this.id]);  
          }
          this.saveQuestion();
        }else{
          this.router.navigate([URLConstants.STUDENT_EXAM_DETAIL,this.id]);  
        }
      });
    }
 }

 timeout(time:any){
  if('00:00:01' == time){
    this.saveResult();
    // this.router.navigate([URLConstants.STUDENT_EXAM_DETAIL,this.id]);  
  }else{
    return time;
  }
 }

  ngOnDestroy() {
    localStorage.removeItem('endTime');
  }

  form = this.fb.group({
    optradio:['']
  });

  saveResult(){
    this.saveQuestion();
    setTimeout(()=>{
      this.studentExamService.saveResult(this.exam_selection_id).subscribe((res:any) => {  
        console.log(res);
      });
      this.router.navigate([URLConstants.STUDENT_EXAM_DETAIL,this.id]);
    },1000);
  }

  prevQuestion(index:number){
    if (index <= this.exam_detail.questions?.length - 1 && index > -1) {
      this.saveQuestion();
      this.moveToIndex(index);
    }
  }
  
  nextQuestion(index:number){
    if (index <= this.exam_detail.questions?.length - 1 && index > -1) {
      this.saveQuestion();
      this.moveToIndex(index);
    }
  }

  reset(){
    this.question.answer = undefined;
    this.saveQuestion();
  }

  saveQuestion(){
    const params = {questionId: this.question.id, answer: this.question.answer}
    this.studentExamService.saveExam(params,this.id).subscribe((res:any) => {  
      this.exam_selection_id = res.data;
    });
  }

  moveToIndex(index:number) {
      this.currentQuestion = index;
      this.exam_detail.questions[index].visited = true;
      this.question = this.exam_detail.questions[index];
  };
}
