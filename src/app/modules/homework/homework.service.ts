import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Injectable({
  providedIn: 'root'
})
export class HomeworkService {

  private API_URL = enviroment.apiUrl;
  private NEW_API_URL = enviroment.newApiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;


  constructor(
    private httpRequest: HttpClient
  ) { }

  //Get branch id
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  // Section list
  getSectionList(sections:any)
  {
    return this.httpRequest.post(this.API_URL+'api/section/list',sections);
  }
  
  // Class list
  getClass(payload:any,id:number){
    let url = this.API_URL+'api/class-list/'+ this.getBranch() ;
    if(payload?.user_id){
      url+="?user_id="+payload?.user_id;
    }
    if(payload?.section_id){
      url+="&section_id="+payload?.section_id;
    }
    return this.httpRequest.get(url);
  }

  getClassV2(payload:any,id:number){
    let url = this.NEW_API_URL+'v2/api/class-list/'+ this.getBranch() ;
    if(payload?.user_id){
      url+="?user_id="+payload?.user_id;
    }
    // if(payload?.section_id){
    //   url+="&section_id="+payload?.section_id;
    // }
    return this.httpRequest.post(url, {section_id: payload?.section_id});
  }
  
  getClassList(section?:any){
    const data = {
      section : section,
    }
    return this.httpRequest.post(this.API_URL+'api/student/get-classes',data);
  }
  getClassByMultipleSection(payload: any){
    return this.httpRequest.post(this.API_URL+'api/notice/get-class-list',payload)
  }
  // Batch List
  getBatchesList(params:any){
    Object.assign(params,{branchId:this.getBranch()});
    return this.httpRequest.post(this.API_URL+'api/get-batches-by-classes',params);
  }
  getStudentListByBatch(params:any){
    return this.httpRequest.post(this.API_URL+'api/get-students-by-batch',params)
  }
  // Subject List
  getSubjectList(params:any){
    return this.httpRequest.post(this.API_URL+'api/notes/subject',params)
  }
  getFacultyList(){
    return this.httpRequest.get(this.API_URL+'api/get-faculty-list/'+this.getBranch());
  }
  getHomeWork(params:any){
    return this.httpRequest.post(this.API_URL+'api/notes/list',params)
  }
  deleteHomeWork(data:any){
    return this.httpRequest.delete(this.API_URL+'api/notes/deletenotes/'+data)
  }

  addUpteHomeWork(payLoad:any,id:any){
    if(id){
      return this.httpRequest.post(this.API_URL+'api/notes/updatenotes/'+id,payLoad)
    }
    else{
      return this.httpRequest.post(this.API_URL+'api/notes/addnotes',payLoad)
    }
  }
    showHomeWork(id:number){
    return this.httpRequest.post(this.API_URL+'api/notes/show/'+id,{})
  }
  updateStatus(payLoad:any){
    return this.httpRequest.post(this.API_URL+'api/approve-assignment',payLoad)
  }
  /**
   * 
   * @param type 1.add, 2.view, 3.edit, 4.list 
   * @param attendanceType homework assignment classwork
   * @returns url
   */
  setUrl(type : number,attendanceType:string) {

    switch (attendanceType) {
      case "homework":
        if (type === 1) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.ADD_HOMEWORK;
        } else if (type === 2) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.VIEW_HOMEWORK;
        } else if(type=== 3) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.EDIT_HOMEWORK;
        } else{
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.HOMEWORK_LIST;
        }
      case "assignment":
        if (type === 1) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.ADD_ASSIGNMENT;
        } else if (type === 2) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.VIEW_ASSIGNMENT;
        } else if(type === 3 ){
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.EDIT_ASSIGNMENT;
        } else{
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.ASSIGNMENT_LIST;
        }
      case "classwork":
        if (type === 1) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.ADD_CLASSWORK;
        } else if (type === 2) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.VIEW_CLASSWORK;
        } else if(type === 3 ){
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.EDIT_CLASSWORK;
        } else{
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.CLASSWORK_LIST;
        }

        case "syllabus":
        if (type === 1) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.ADD_SYLLABUS;
        } else if (type === 2) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.VIEW_SYLLABUS;
        } else if(type=== 3) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.EDIT_SYLLABUS;
        } else{
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.SYLLABUS_LIST;
        }
      case "notes":
        if (type === 1) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.ADD_NOTES;
        } else if (type === 2) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.VIEW_NOTES;
        } else if(type === 3 ){
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.EDIT_NOTES;
        } else{
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.NOTES_LIST;
        }
      case "videolink":
        if (type === 1) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.ADD_VIDEO;
        } else if (type === 2) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.VIEW_VIDEO;
        } else if(type === 3 ){
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.EDIT_VIDEO;
        } else{
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.VIDEO_LIST;
        }

      case "notice":
        if (type === 1) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.ADD_NOTICE;
        } else if (type === 2) {
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.VIEW_NOTICE;
        } else if(type === 3 ){
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.EDIT_NOTICE;
        } 
        // else if(type === 4 ){
        //   return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.NOTICE_HISTORY;
        // } 
        else{
          return '/' + window.localStorage.getItem("branch") + '/' + URLConstants.NOTICE_LIST;
        }

        default :
        return
    }
  }

  // NOTICE APIS

  // List
  getNoticeList(payload:object){
    return this.httpRequest.post(this.API_URL+'api/notice/list',payload)
  }

  // Show
  viewNotice(id:number,payload:object){
    return this.httpRequest.post(this.API_URL+'api/notice/show/'+id,payload)
  }

  // Add
  addNotice(payload:object){
    return this.httpRequest.post(this.API_URL+'api/notice/create',payload)
  }

  // Update
  updateNotice(id:number, payload:object ){
    return this.httpRequest.post(this.API_URL+'api/notice/update/'+id , payload)
  }
  
  // Delete 
  deleteNotice(id:number){
    return this.httpRequest.delete(this.API_URL+'api/notice/delete/'+id)
  }

  // Notice History
  getNoticeHistory(payload:object){
    return this.httpRequest.post(this.API_URL+'api/notice/history',payload)
  }

  // Student
  getStudentList(payload:any){
    return this.httpRequest.post(this.API_URL+'api/notice/get-student-list',payload)
  }

  // Roll List
  getRoleList(branch_id?:any){
    let data = {
      branch : this.getBranch() ,
    }
    return this.httpRequest.post(this.API_URL+'api/role/role-list-dropdown',data);   
  }

  // Roll -> User
  getUserList(payload:any){

    let url = this.API_URL+'api/get-employees-list-for-app';
    // this.getBranch()

    if(payload?.role_id){
      url+="?role_id="+payload?.role_id ; 
    }

    return this.httpRequest.get(url);   
  }

  addUpdateNotice(payload:any,id:number){
    if(id){
      return this.httpRequest.post(this.API_URL+"api/notice/update/"+id,payload)
    }
    else{
      return this.httpRequest.post(this.API_URL+"api/notice/create",payload)
    }
  }
  showNotice(id:any){
    return this.httpRequest.post(this.API_URL+"api/notice/show/"+id,{})
  }
  getBatchList(payload:any){
    let url = this.API_URL+'api/batch-list' ; // https://newtest.classcare.in/v1/api/batch-list

    if(payload?.user_id){
      url+="?user_id="+payload?.user_id;
    }
    if(payload?.branch_id){
      url+="&branch_id="+payload?.branch_id;
    }
    if(payload?.class_id){
      url+="&class_id="+payload?.class_id;
    }
    return this.httpRequest.get(url);
  }
  getBatchOnClass(payload:any){
    return this.httpRequest.post( this.API_URL+"api/get-batches-by-classes",payload);
  }
  getStudent(payload){
    return this.httpRequest.post( this.API_URL+"api/get-students-by-batch",payload);
  }
  view(payload : any){
    return this.httpRequest.post( this.API_URL+"api/notes/add-notes-view",payload);
  }
  getTemplate(payload:any){
    return this.httpRequest.post( this.API_URL+"api/get-sms-templates",payload);
  }
  // getNoticeById(id:number){
  //   return this.httpRequest.post(this.API_URL+"api/notice/get-notice-by-id/"+id
  // }

  getEmployeeList(payload){
    return this.httpRequest.post( this.API_URL+"api/get-employees-list-for-web",payload);
  }
  getStudentAnEmployees(payload:any,id:any){
    return this.httpRequest.post( `${this.API_URL}api/notice/get-user-student/${id}`,payload);
  }

  typeWiseNoticeHistory(payload){
    return this.httpRequest.post( `${this.API_URL}api/notice/type-wise-history`,payload);
  }
}
