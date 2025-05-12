import { Component } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentExamService } from '../student-exam.service';
import * as moment from 'moment';

@Component({
  selector: 'app-exam-detail',
  templateUrl: './exam-detail.component.html',
  styleUrls: ['./exam-detail.component.scss']
})
export class ExamDetailComponent {

  URLConstants = URLConstants;
  exam_detail:any = [];
  student_result:any = [];
  id:any = null;
  resultDate:any = null;
  start_button = true;

  constructor(
      private activatedRouteService: ActivatedRoute,
      private studentExamService: StudentExamService,
  ) {}

  ngOnInit(): void {
    this.id = this.activatedRouteService.snapshot.params['id'];
    if(this.id){
      this.studentExamService.getExamDetail(this.id).subscribe((res:any) => {  
        this.exam_detail = res.data.exam;  
        this.student_result = res.data.student_result;
        const startTime = new Date(this.exam_detail.start_time).toISOString();
        const endTime = new Date(this.exam_detail.end_time).toISOString();
        const now = new Date().toISOString();
        if(startTime > now || endTime < now){
          this.start_button = false;
        }
        const result_date = res.data.student_result?.exam?.result_date; 
        this.resultDate = result_date ? (moment() < moment(result_date, 'YYYY-MM-DD') ? moment(result_date, 'YYYY-MM-DD').format('DD-MM-YYYY') : null ) : null; 
      });
    }
  }

}
