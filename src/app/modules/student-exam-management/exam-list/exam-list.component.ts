import { Component,ViewChild } from '@angular/core';
import { StudentExamService } from '../student-exam.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import * as moment from 'moment';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-exam-list',
  templateUrl: './exam-list.component.html',
  styleUrls: ['./exam-list.component.scss']
})
export class ExamListComponent {

  exam_list:any = [];
  today = new Date();
  URLConstants = URLConstants;
  for:string = "exam";
  results: any = [];
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  constructor(private studentExamService: StudentExamService, private _dateFormatService : DateFormatService){}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.getlist(dataTablesParameters,callback)
      },
     columns: [
        { data: 'exam_name' }, 
        { data: 'start_time' }, 
        { data: 'subject' }, 
        { data: 'total_marks' }, 
        { data: 'final_marks' }, 
        { data: 'attempt_question' }, 
        { data: 'correct_answer' },
        { data: 'result' }
      ]
    };
    this.studentExamService.getTodaysExam().subscribe((res:any) => {  
      this.exam_list = res.data;
    });
    setInterval(()=> {
      this.today = new Date();
    }, 1000);
  }

  getlist(dataTablesParameters?: any, callback?:any ){
    this.studentExamService.getResultList(dataTablesParameters).subscribe((resp:any) => {
      this.results = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }

  format_date(datetime:string){
    return new Date(datetime);
  }

  date(datetime:string){
    return moment(datetime, 'YYYY-MM-DD').format(this._dateFormatService.getFormat());
  }

  get_for(t_for:any){
    this.for = t_for;
  }

}
