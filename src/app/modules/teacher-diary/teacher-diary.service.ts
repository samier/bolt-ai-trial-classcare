import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class TeacherDiaryService {

  private API_URL = enviroment.apiUrl;
  public branch_id = window.localStorage?.getItem("branch");

  constructor(private httpRequest:HttpClient) { }

  addRecord(paylod:any){
    return this.httpRequest.post(this.API_URL+'api/teacher-diary',paylod);    
  }
  deleteRecord(id:any){
    return this.httpRequest.post(this.API_URL+'api/teacher-diary/delete/'+id, []);
  } 
  getRecordList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/teacher-diary-by-branch-id',params);     
    //return this.httpRequest.get(this.API_URL+'api/teacher-diary-by-branch-id/'+this.branch_id);
  }    

  paginatedRecords(url:any){
    return this.httpRequest.get(url);
  }  
  
  getAllFaculty(){
    return this.httpRequest.get(this.API_URL+'api/get-faculty-list/'+this.branch_id);
  }

  getRecordDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/teacher-diary/show/'+id,id);
  } 

  updateRecord(paylod:any,id:number){
    // return this.httpRequest.patch(this.API_URL+'api/teacher-diary/'+id,paylod);
    return this.httpRequest.put(this.API_URL+'api/teacher-diary/update/'+id,paylod);
  } 

  getClassList(branch_id:any){
    return this.httpRequest.get(this.API_URL+'api/lesson/class-list/'+branch_id);
  }  

  getClassListForAdmin(param:any){
    return this.httpRequest.post(this.API_URL+'api/lesson/class-list',param);
  }
    
  // getSubjectAndBatchListByClassId(id:any){
  //   return this.httpRequest.get(this.API_URL+'api/lesson/subject-and-batch-list-by-class-id/'+id);
  // }

  getSubjectAndBatchListByClassId(param:any={},id:any){
    return this.httpRequest.post(this.API_URL+'api/lesson/subject-and-batch-list-by-class-id-user-id/'+id,param);
  }  

  getLessonRecord(search_criteria:any){
    return this.httpRequest.post(this.API_URL+'api/lesson/get-lesson-record-by-criteria',search_criteria);
  }

  getSectionList(sections:any)
  {
    return this.httpRequest.post(this.API_URL+'api/section/list',sections);
  }

  getFacultyBySection(sections:any)
  {
    const data = {
      section : sections,      
    }    
    return this.httpRequest.post(this.API_URL+'api/lesson/get-faculty-list',data);
  }

  getClassBySection(sections:any)
  {
    const data = {
      sections : [sections],
      branchId : this.branch_id,
    }
    return this.httpRequest.post(this.API_URL+'api/class/list', data);
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
