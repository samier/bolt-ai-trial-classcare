import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';
import { HttpClient } from '@angular/common/http';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Injectable({
  providedIn: 'root'
})
export class UserDailyPlanningService {
  private API_URL = enviroment.apiUrl;
  URLConstants = URLConstants;
  
  
  constructor(
    private httpRequest: HttpClient
  ) { }
  
  getChapterList(payload: any){
    return this.httpRequest.post(this.API_URL+"api/chapter/get-on-subject", payload);
  }

  createUpdateChapter(payload: any){
    if(payload.id){
      return this.httpRequest.post(this.API_URL+"api/chapter/update/"+payload.id, payload);
    }else{
      return this.httpRequest.post(this.API_URL+"api/chapter/store", payload);
    }
  }

  deleteChapter(id: any){
    return this.httpRequest.post(this.API_URL+"api/chapter/delete/"+id, [])
  }

  getLessonPlanList(payload: any){
    return this.httpRequest.post(this.API_URL+"api/daily-plan", payload);
  }

  getLessonPlan(id: any){
    return this.httpRequest.post(this.API_URL+"api/daily-plan/show/"+id, []);
  }

  createUpdateLessonPlan(payload: any){
    if(payload.id){
      return this.httpRequest.post(this.API_URL+"api/daily-plan/update/"+payload.id, payload);
    }
    else{
      return this.httpRequest.post(this.API_URL+"api/daily-plan/store", payload);
    }
  }

  updateLessonPlanStatus(payload: any){
    return this.httpRequest.post(this.API_URL+"api/daily-plan/status-update/"+payload.id, payload);
  }

  deleteLessonPlan(id: any){
    return this.httpRequest.post(this.API_URL+"api/daily-plan/delete/"+id, []);
  }

  createUpdateLecture(payload: any){
    if(payload.id){
      return this.httpRequest.post(this.API_URL+"api/lecture/update/"+payload.id, payload);
    }
    else{
      return this.httpRequest.post(this.API_URL+"api/daily-lecture/store", payload);
    }
  }

  getLecturesList(payload: any){
    return this.httpRequest.post(this.API_URL+"api/daily-lecture", payload);
  }

  getLectureById(id: any){
    return this.httpRequest.post(this.API_URL+"api/daily-lecture/show/"+id, []);
  }

  saveCompletedLecture(payload: any){
    return this.httpRequest.post(this.API_URL+"api/daily-lecture/save-remark/"+payload.id, payload)
  }

  deleteLecture(id: any){
    return this.httpRequest.post(this.API_URL+"api/daily-lecture/delete/"+id, []);
  }

  getFacultyList(payload: any){
    return this.httpRequest.post(this.API_URL+"api/daily-plan/get-faculty-list/batch-wise", payload);
  }
}
