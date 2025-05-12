import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class HraService {

  private API_URL = enviroment.apiUrl;
  constructor(private httpRequest: HttpClient) { }
  getBranchId(){
      return window.localStorage.getItem("branch");
  }
 //leave type functions
  getLeaveTypeList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/leave-type/leave-type-list',params);   
  }
  
  addLeaveTypeRecord(payload:any){
    return this.httpRequest.post(this.API_URL+'api/leave-type/store',payload);    
  }

  getLeaveTypeRecord(id:any){
    return this.httpRequest.post(this.API_URL+'api/leave-type/'+id, []);    
  }

  updateLeaveTypeRecord(id:any,payload:any){
    return this.httpRequest.put(this.API_URL+'api/leave-type/'+id,payload);    
  }

  deleteLeaveTypeRecord(id:any){
    return this.httpRequest.post(this.API_URL+'api/leave-type/delete/'+id, []);    
  }

  // role functions 
  getRecordList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/role/role-list',params);   
  }

  addRecord(payload:any){
    return this.httpRequest.post(this.API_URL+'api/role/store',payload);    
  }

  getRecord(id:any){
    return this.httpRequest.post(this.API_URL+'api/role/'+id, []);    
  }

  updateRecord(id:any,payload:any){
    return this.httpRequest.put(this.API_URL+'api/role/'+id,payload);    
  }

  deleteRecord(id:any){
    return this.httpRequest.post(this.API_URL+'api/role/'+id+'/delete', []);    
  }

  // Leave Type 
  // Get Leave List from database
  getRoleHasLeaveType(id:any){
    return this.httpRequest.get(this.API_URL+'api/assign-role-leave/'+id);    
  }
    
  getLeaveTypeList2(){    
    return this.httpRequest.post(this.API_URL+'api/get-leave-type-list',{});    
  }

  storeRoleLeaveType(role:any,payload:any){
    return this.httpRequest.post(this.API_URL+'api/store-role-leave-relation/'+role,payload);    
  }

  /// Menu List
  getMenuList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/menu/menu-list',params);   
  }

  //User Management
  getUserListDropdown(payload:any){
    return this.httpRequest.post(this.API_URL+'api/user/user-list-dropdown',payload);   
  }
  getRoleList(payload?:any){
    return this.httpRequest.post(this.API_URL+'api/role/role-list-dropdown',payload);   
  }
  getUserList(payload:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/user/user-list',payload);   
  }
  setLeaveApprover(payload:any){
    return this.httpRequest.post(this.API_URL+'api/role/set-leave-approver',payload);   
  }
  getLeaveApprover(payload:any){
    return this.httpRequest.post(this.API_URL+'api/role/get-leave-approver',payload);   
  }  


  //AssignSubject
  getClassList(branch_id:any){
    return this.httpRequest.get(this.API_URL+'api/lesson/class-list/'+branch_id);
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
    return this.httpRequest.delete(this.API_URL+'api/assign-subject-destroy/'+id);    
  }  

  getUserName(id:any){
    return this.httpRequest.get(this.API_URL+'api/get-user-name/'+id);
  }

  // role wise access of module

  getRolewiseModules(payload:any){
    return this.httpRequest.post(this.API_URL+'api/modules/role-access-list',payload);
  }

  saveRolewisePermission(payload:any){
    return this.httpRequest.post(this.API_URL+'api/modules/save-role-access-permission',payload);
  }

  syncModule(data:any){
    return this.httpRequest.post(this.API_URL+'api/modules/seed-module',data);
  }

  userRoleAccessList(data:any){
    return this.httpRequest.post(this.API_URL+'api/modules/user-role-access-list',data);
  }

  userRoleAccessStore(data:any){
    return this.httpRequest.post(this.API_URL+'api/modules/user-role-access-store',data);
  }

  userRoleAccessReset(data:any){
    return this.httpRequest.post(this.API_URL+'api/modules/user-role-access-reset',data);
  }
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}