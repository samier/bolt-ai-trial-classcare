import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private API_URL = enviroment.apiUrl;
  constructor(private httpRequest: HttpClient) { }
  getBranchId(){
      return window.localStorage.getItem("branch");
  }

  getBranchList(){
    return this.httpRequest.get(this.API_URL+'api/get-branch-list');    

  }


  //User Management
  addUser(payload:any){
    return this.httpRequest.post(this.API_URL+'api/add-user',payload);    
  }  
  updateUser(id:any,payload:any){
    return this.httpRequest.post(this.API_URL+'api/update-user/'+id,payload);    
  }  
  getRoleList(branch_id?:any){
    let data = {
      branch : branch_id ?? this.getBranchId(),
    }
    return this.httpRequest.post(this.API_URL+'api/role/role-list-dropdown',data);   
  }

  getRoleListForAdmin(branch_id?:any){
    return this.httpRequest.post(this.API_URL+'api/role/admin-role-list-dropdown', []);   
  }

  getUserList(payload:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/user/user-list',payload);   
  }

  getAdminUserList(payload:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/user/admin-user-list',payload);   
  }

  getUserDetail(id:any, branch?:any){
    let data = {
      branch: branch,
    }
    return this.httpRequest.post(this.API_URL+'api/user/'+id,data);   
  }
  
  deleteUser(id:any){
    return this.httpRequest.post(this.API_URL+'api/delete-user/'+id, []);    
  }
  getUserListDropdown(payload:any){
    return this.httpRequest.post(this.API_URL+'api/user/user-list-dropdown',payload);   
  }
  setLeaveApprover(payload:any){
    return this.httpRequest.post(this.API_URL+'api/role/set-leave-approver',payload);   
  }
  getLeaveApprover(payload:any){
    return this.httpRequest.post(this.API_URL+'api/role/get-leave-approver',payload);   
  }  


  //AssignSubject
  getClassList(branch_id:any){ 
    return this.httpRequest.get(this.API_URL+'api/lesson/classlist-for-assign-subject/'+branch_id);
  }  

  getSubjectAndBatchListByClassId(id:any){
    return this.httpRequest.get(this.API_URL+'api/lesson/subject-and-batch-list-by-class-id/'+id);
  } 

  getAssignSubjectList(payload:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/assign-subject-list',payload);   
  }

  assignSubjectStore(payload:any){
    return this.httpRequest.post(this.API_URL+'api/assign-subject-store',payload);   
  }
  deleteAssignSubjectRecord(id:any){
    return this.httpRequest.post(this.API_URL+'api/assign-subject-destroy/'+id, []);    
  }  

  deleteSelectedAssignSubjectRecord(param:any){
    return this.httpRequest.post(this.API_URL+'api/assign-subject-destroy-selected', param);    
  }  

  getUserName(id:any){
    return this.httpRequest.get(this.API_URL+'api/get-user-name/'+id);
  }

  ///Student group subjects
  getGroupOfSubject(id:any){
    return this.httpRequest.get(this.API_URL+'api/get-subject-group-list/'+id);    
  }

  getGroupOfSubjectByGroupId(param:any){
    return this.httpRequest.post(this.API_URL+'api/get-subject-group-list-by-group-id/',param);    
  }
  storeAssignSubjectToStudent(payload:any){
    return this.httpRequest.post(this.API_URL+'api/assign-student-subject/store',payload);    
  }  

  getRouteList(){
    return this.httpRequest.post(this.API_URL+'api/route-list',{});    
  }  
  
  getStopList(param:any){
    return this.httpRequest.post(this.API_URL+'api/stop-list-by-route-id',param);    
  }  

  deleteImage(id:any){
    return this.httpRequest.delete(this.API_URL+'api/user-document/'+id);    
  }
  
  getBatchList(){
    return this.httpRequest.get(this.API_URL+'api/batch/get-batch-list/'+this.getBranchId());   
  }  

  getUserBatches(data:any){
    return this.httpRequest.post(this.API_URL+'api/filter/assign-subject-batches', data);
  }

  getSectionListDropdown(branch_id?:any){ 
    // let branch_id=this.getBranchId();
    return this.httpRequest.get(this.API_URL+'api/student-leaving-certificate/section-list-by-branch/'+branch_id);    
  }    
  getSectionList(){
    return this.httpRequest.post(this.API_URL+'api/admin/export/section-list',{});  
  }

  getFacultyList(param:any){
    return this.httpRequest.post(this.API_URL+'api/admin/export/faculty-list',{param:param});  
  }

  getFieldList(){
    return this.httpRequest.post(this.API_URL+'api/admin/export/field-list',{});  
  }

  getShowList(param:any){
    return this.httpRequest.post(this.API_URL+'api/admin/export/show-list',param);  
  }

  generateFacultyData(payload:any){
    return this.httpRequest.post(this.API_URL+'api/admin/export/faculty-data',payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });    
  }

  uploadUserDocument(data:any){
    return this.httpRequest.post(this.API_URL+'api/faculty-details/document/upload',data);  
  }

  UserDocumentList(data:any){
    return this.httpRequest.post(this.API_URL+'api/faculty-details/document/list',data);  
  }

  UserDocumentDelete(id:any){
    return this.httpRequest.post(this.API_URL+'api/faculty-details/document/delete/'+id, {});  
  }

  UserDocumentDownload(id:any){
    return this.httpRequest.post(this.API_URL+'api/faculty-details/document/download/'+id, {});  
  }
  
  getFacultyAttendanceReport(param:any, type:any){
    return this.httpRequest.post(this.API_URL+'api/staff/attandance/report/'+type ,param);  
  }

  downloadFacultyAttendanceReport(param:any, type:any){
    return this.httpRequest.post(this.API_URL+'api/staff/attandance/report/'+type ,param, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });  
  }

  getSubjectList(data:any){
    return this.httpRequest.post(this.API_URL+'api/subject-list', data);   
  }

  getClassesList(section?:any, academic?:any, branch?:any){
    const data = {
      section : section?.map((x:any) => x.id)??[],
      academic_year_id : academic?.map((x:any) => x.id)??[],
      branch: branch,
    }
    return this.httpRequest.post(this.API_URL+'api/filter/get-all-classes',data);
  }

  getBatchesByClass(classes:any, branch:any){
    const data = {
      classes : classes?.map((x:any) => x.id)??[],
      branchId : branch
    }
    return this.httpRequest.post(this.API_URL+'api/filter/get-all-batches', data);
  }

  getAcademicYar(params:any){
    return this.httpRequest.post(this.API_URL+'api/filter/get-all-academic-year', params);
  }

  getSections(data:any){
    return this.httpRequest.post(this.API_URL+'api/filter/get-all-section-list', data);
  }
  getAttendanceList(param:any){
    return this.httpRequest.post(this.API_URL+'api/staff/attandance/list',param);  
  }
  saveAttendance(param:any){
    return this.httpRequest.post(this.API_URL+'api/staff/attandance/save',param)
  }

  getExcel(payload){
    return this.httpRequest.post(`${this.API_URL}api/machine-attendance/get-users-students`,payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getbatchListonEmployee(payload){
    return this.httpRequest.post(`${this.API_URL}api/assign-batch-list`,payload);
  }

  deleteAssignBatchRecord(payload){
    return this.httpRequest.post(`${this.API_URL}api/remove-assign-batch`,payload);
  }
  

  getAreaList(data?:any){
    return this.httpRequest.post(this.API_URL+'api/area/list',data);
  }

  createUpdateArea( id:number , name:any ){
    if(id){
      return this.httpRequest.post(this.API_URL + `api/area/update/${id}`, { name : name } );
    }
    else{
      return this.httpRequest.post(this.API_URL + 'api/area/store', { name : name } );
    }
  }

  deleteArea(id:number){
    return this.httpRequest.post(this.API_URL + `api/area/delete/${id}`,{});
  }

  getAttendanceMachineReport(payload: any) {
    return this.httpRequest.post(this.API_URL+"api/get-user-in-out-report", payload)
  }

  getInOutLogsByUser(payload: any){
    return this.httpRequest.post(this.API_URL+"api/get-user-in-out-report/detail/"+payload.id, payload)
  }

  getPdfExcelMachineReport(payload: any){
    return this.httpRequest.post(this.API_URL+"api/get-user-in-out-report/"+payload.format, payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    })
  }
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}