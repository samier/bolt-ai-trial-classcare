import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { callAPIConstants } from 'src/app/shared/constants/callAPI-constants';

@Injectable({
  providedIn: 'root'
})
export class McqManagementService {

  private API_URL = enviroment.apiUrl;
  private SYMFONY_API_URL = enviroment.symfonyHost;
  
  constructor(private httpRequest: HttpClient) { }

  getBranch(){
    return window.localStorage.getItem("branch");
  }

  // chapter
  getChapterList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/chapter-datatable',params);
  }

  getChapterDetail(id:number){
    return this.httpRequest.get(this.API_URL+'api/chapter/'+id);
  }

  saveChapter(paraSave:any,id:number){
    Object.assign(paraSave,{branchId:this.getBranch()});
    if(id == null){
      return this.httpRequest.post(`${this.API_URL}api/add-chapter`,paraSave);
    }else{
      return this.httpRequest.post(`${this.API_URL}api/add-chapter`,paraSave);
    }
  }

  deleteChapter(id:number){
    return this.httpRequest.post(`${this.API_URL}api/delete-chapter/${id}`, {});
  }

  getSubjectList(class_id:any){
    return this.httpRequest.get(this.API_URL+'api/lesson/subject-and-batch-list-by-class-id/'+class_id);
  }

  getChapters(subject_id:any){
    return this.httpRequest.get(this.API_URL+'api/chapters-by-subject/'+subject_id);
  }

  getChaptersHasQuestion(subject_id:number){
    return this.httpRequest.post(`${this.API_URL}api/chapters-has-question-by-subject/${subject_id}`,{});
  }

  // Question
  getQuestionList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/question-datatable',params);
  }

  getQuestionDetail(id:number){
    return this.httpRequest.get(this.API_URL+'api/question/'+id);
  }

  saveQuestion(paraSave:any,id:number){
    if(id == null){
      return this.httpRequest.post(this.SYMFONY_API_URL+'mcq/api/'+this.getBranch()+'/addQuestion',paraSave);
    }else{
      return this.httpRequest.post(this.SYMFONY_API_URL+'mcq/api/'+this.getBranch()+'/addQuestion/'+id,paraSave);
    }
  }

  deleteQuestion(id:number){
    return this.httpRequest.delete(this.SYMFONY_API_URL+'mcq/api/'+this.getBranch()+'/deleteQuestion/'+id);
  }

  // Result
  getResultList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/result-datatable',params);
  }

  getBatchResultList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/batch-result-datatable',params);
  }
  
  // Exam
  getExamList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/exam-datatable',params);
  }

  getExamDetail(id:number){
    return this.httpRequest.post(`${this.API_URL}api/exam/show/${id}`, {});
  }

  saveExam(paraSave:any,id:number){
    if(id == null){
      return this.httpRequest.post(this.SYMFONY_API_URL+'mcq/api/'+this.getBranch()+'/addExam',paraSave);
    }else{
      return this.httpRequest.post(this.SYMFONY_API_URL+'mcq/api/'+this.getBranch()+'/addExam/'+id,paraSave);
    }
  }

  deleteExam(id:number){
    return this.httpRequest.post(`${this.API_URL}api/exam-delete/${id}`, {});
  }

  getBatchs(id:number){
    return this.httpRequest.get(this.SYMFONY_API_URL+'mcq/api/'+this.getBranch()+'/getBatchs/'+id);
  }

  getQuestions(params:any){
    return this.httpRequest.get(this.SYMFONY_API_URL+'mcq/api/'+this.getBranch()+'/getQuestions?subjectId='+params.subjectId+'&isEdit='+params.isEdit+params.chapter);
  }
  
  getClass(payload:any){
    const user_id = window.localStorage.getItem('user_id');
  
    let url = this.API_URL+'api/class-list/'+ this.getBranch() ;
    if(user_id){
      url+="?user_id="+user_id;
    }
    if(payload?.section){
      url+="&section_id="+payload?.section;
    }
    return this.httpRequest.get(url);
  }
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}