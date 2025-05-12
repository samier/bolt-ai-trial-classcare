import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';
import { HttpClient } from '@angular/common/http';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Injectable({
  providedIn: 'root'
})
export class LessonPlanningService {

  private API_URL = enviroment.apiUrl;
  public branch_id = window.localStorage?.getItem("branch");
  constructor(private httpRequest: HttpClient) { }
  
  addLesson(paylod:any){
    return this.httpRequest.post(this.API_URL+'api/lesson-planning',paylod);    
  }
  deleteLesson(id:any){
    return this.httpRequest.post(this.API_URL+'api/lesson-planning/delete/'+id,id);
  }

  getClassListForAdmin(param:any){
    return this.httpRequest.post(this.API_URL+'api/lesson/class-list',param);
  }

  getClassList(branch_id:any){
    return this.httpRequest.get(this.API_URL+'api/lesson/class-list/'+branch_id);
  }  

  getAllFaculty(){
    return this.httpRequest.get(this.API_URL+'api/get-faculty-list/'+this.branch_id);
  }  

  getSubjectAndBatchListByClassId(param:any={},id:any){
    return this.httpRequest.post(this.API_URL+'api/lesson/subject-and-batch-list-by-class-id-user-id/'+id,param);
  }  

  getLessonListById(sender_id:any){
    return this.httpRequest.get(this.API_URL+'api/student-leave/list/'+sender_id);
  }  

  getLessonList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/lesson-planning-list-by-branch-id',params);     
    //return this.httpRequest.get(this.API_URL+'api/lesson-planning-list-by-branch-id/'+this.branch_id);
  }    

  paginatedRecords(url:any){
    return this.httpRequest.get(url);
  }  

  getLessonDetail(id:any){
   return this.httpRequest.post(this.API_URL+'api/lesson-planning/'+id,id);
 }    
  updateLesson(paylod:any,id:number){
      return this.httpRequest.put(this.API_URL+'api/lesson-planning/update/'+id,paylod);
    } 

  getLessonListByCreatorId(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/lesson/get-lesson-list-by-creator-id',params);     

    //return this.httpRequest.post(this.API_URL+'api/lesson/get-lesson-list-by-creator-id',{'creator_id':id,'branch_id':this.branch_id});
  }

  getSectionList(sections:any)
  {
    return this.httpRequest.post(this.API_URL+'api/section/list',sections);
  }

  getFacultyBySection(sections?:any)
  {
    const data = {
      section : sections,      
    }    
    return this.httpRequest.post(this.API_URL+'api/lesson/get-faculty-list',data);
  }

  getClassesList(){
    return this.httpRequest.get(this.API_URL+'api/lesson/class-list/'+this.branch_id);
  }

  getClassBySection(section?:any)
  {
    const data = {
      sections : section,
      branchId : this.branch_id,
    }
    return this.httpRequest.post(this.API_URL+'api/class/list', data);
  }

  getBatchesList(params:any){
    Object.assign(params,{branchId:this.branch_id});
    return this.httpRequest.post(this.API_URL+'api/get-batches-by-classes',params);
  }

  getSubjectAndBatchList(id:any){
    return this.httpRequest.get(this.API_URL+'api/lesson/subject-and-batch-list-by-class-id/'+id);
  } 

  getSection(branch_id:any){
    return this.httpRequest.get(this.API_URL+'api/lesson/section-list/'+branch_id);
  } 

  getClassListBySection(section?:any)
  {
    const data = {
      section : section,
      branchId : this.branch_id,
    }
    return this.httpRequest.post(this.API_URL+'api/lesson/class-list-by-section/',data);
  }
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}