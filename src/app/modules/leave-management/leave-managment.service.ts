import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';
import { HttpClient } from '@angular/common/http';
import { HttpParams, HttpHeaders } from '@angular/common/http';
import { callAPIConstants } from 'src/app/shared/constants/callAPI-constants';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeaveManagmentService {

  private API_URL = enviroment.apiUrl;
  protected data:any;
  public branch_id  = window.localStorage?.getItem("branch");
  public is_admin   = window.localStorage?.getItem("role")?.includes('ROLE_ADMIN');
  constructor(private httpRequest: HttpClient) { }
  private student = new BehaviorSubject<any>(null);


//ForAdmin All List
getAdminFacultyList(params:any){
  // if(this.is_admin){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/admin-leave/list',params);
    //return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/document_type-list',params);
    //return this.httpRequest.get(this.API_URL+'api/admin-leave/list/'+branch);
  // }
  //  return this.httpRequest.post(this.API_URL+'api/faculty-leave/list',params);
}
getStudentProfileDetail(id:any){
  return this.httpRequest.post(this.API_URL+'api/get-student-detail',{'id':id});
}
updateAdminLeave(paradata:any) {
  return this.httpRequest.post(this.API_URL+'api/admin-leave/approve-or-reject-leave',paradata);
}
getAllStudent(){
  return this.httpRequest.get(this.API_URL+'api/get-student-list/'+this.branch_id);
}
getAllStudentByClassTeacher(){
  return this.httpRequest.get(this.API_URL+'api/get-student-list-by-class-teacher');
}
getAllFaculty(){
  return this.httpRequest.get(this.API_URL+'api/get-faculty-list/'+this.branch_id);
}
getLeaveDetail(id:any){
   //edit-leave/{id}
  return this.httpRequest.post(this.API_URL+'api/edit-leave/'+id, []);
}

addStudentLeaveByAdmin(paraAddLeave:any) {
  return this.httpRequest.post(this.API_URL+'api/admin/student-leave/store',paraAddLeave);
}

updateStudentLeaveByAdmin(paraUpdateLeave:any,id:number){
  return this.httpRequest.post(this.API_URL+'api/admin/student-leave/update/'+id,paraUpdateLeave);
}

deleteStudentLeaveByAdmin(id:number){
  return this.httpRequest.post(this.API_URL+'api/admin/student-leave/delete/'+id, []);
}

//Student Leave
getStudentLeaveDetail(id:any){
 return this.httpRequest.get(this.API_URL+'api/student-leave/edit-leave/'+id);
}

getStudentList(params:any){
  return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/student-leave/list',params);
}

// getStudentListForAdmin(sender_id:any){
//   this.data = {'sender_id':sender_id,'type':2,'branch':this.branch_id};
//   return this.httpRequest.post(this.API_URL+'api/admin-leave/list-by-id',this.data);
getStudentListForAdmin(params:any){
  return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/admin-leave/list-by-id',params);
}

paginatedRecords(url:any){
  return this.httpRequest.get(url);
}
addStudentLeave(paraAddLeave:any) {
  return this.httpRequest.post(this.API_URL+'api/student-leave/store',paraAddLeave);
}

updateStudentLeave(paraUpdateLeave:any,id:number){
  return this.httpRequest.post(this.API_URL+'api/student-leave/update/'+id,paraUpdateLeave);
}

deleteStudentLeave(id:number){
  return this.httpRequest.delete(this.API_URL+'api/student-leave/delete/'+id);
}

//Faculty Leave
getFacultyList(params:any){
  return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/faculty-leave/list',params);
}

updateStudentLeaveByFaculty(paraUpdateLeave:any,id:number){
  return this.httpRequest.post(this.API_URL+'api/faculty/student-leave/update/'+id,paraUpdateLeave);
}

addFacultyLeave(paraAddLeave:any) {
  return this.httpRequest.post(this.API_URL+'api/faculty-leave/store',paraAddLeave);
}

updateFacultyLeave(paraUpdateLeave:any,id:number) {
  return this.httpRequest.post(this.API_URL+'api/faculty-leave/update/'+id,paraUpdateLeave);
}

getLeaveListByApproverId(params:any){
  return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/get-leave-list-by-approver-id',params);
}

deleteFacultyLeave(id:number) {
  return this.httpRequest.post(this.API_URL+'api/faculty-leave/delete/'+id, []);
}

//For Admin Leave
getLeaveList(){
  return this.httpRequest.get(this.API_URL+'api/admin-leave/list');
}
  getLeaveTypeList(type:any){
    let data = {
      type : type
    }
    return this.httpRequest.post(this.API_URL+'api/admin/get-leave-type-list',data);
  }
  getLeaveTypeListForStudent(){
    return this.httpRequest.post(this.API_URL+'api/student/get-leave-type-list',{});
  }
  download(id:any) {
    return this.httpRequest.post(this.API_URL+'api/leave/pdf/'+id, this.branch_id,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });    
  }
  
  getUserListById(data:any){
    return this.httpRequest.post(this.API_URL+'api/faculty-details/leaveList',data);
  }

  setStudent(data: any): void {
    this.student.next(data);
  }

  getMyLeaveList (payload) {
    return this.httpRequest.post<DataTablesResponse>(`${this.API_URL}api/faculty-leave/list`,payload);
  }

  getAllEmployee(){
    return this.httpRequest.post(this.API_URL+'api/get-employees-list-for-leave',[]);
  }

}



class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}
