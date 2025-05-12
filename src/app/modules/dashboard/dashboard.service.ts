import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;
  
  constructor(
    private httpRequest: HttpClient,
  ) { }
  
  // PROXY LIST API
  fetProxyTimeTableList(params:any){
    return this.httpRequest.post(this.API_URL+'api/proxy-timetable/list',params)
  }

  
  // HOMEWORK LIST API
  getHomeWork(params:any){
    return this.httpRequest.post(this.API_URL+'api/notes/list',params)
  }

  // STUDENT BIRTHDATE LIST API
  getStudentBirthdate(params :any){
    return this.httpRequest.post(this.API_URL+'api/student/student-birthday-list',params)
  }

  // EMPLOYEES BIRTHDATE LIST API
  geEmployeeBirthdate(params :any){
    return this.httpRequest.post(this.API_URL+'api/faculty/faculty-birthday-list',params)
  }

  // COUNT 
  getCount(){
    return this.httpRequest.post(this.API_URL+'api/dashboard/statistics',{})
  }

  // Collection
  getCollection(payload:any){
    return this.httpRequest.post(this.API_URL+'api/dashboard/get-earning-expense-count',payload )
  }

  // Attendance by Batch Wise
  getAttendance(payload:any){
    return this.httpRequest.post(this.API_URL+'api/dashboard/get-batch-wise-attendance',payload)
  }

  // GET EXAM LIST
  geExamList(params :any){
    return this.httpRequest.post(this.API_URL+'api/exams/list',params)
  }
  getUnpaidFee(params:any){
    return this.httpRequest.post(this.API_URL+'api/dashboard/get-pending-fees-list',params)
  }

  // GET STAFF LEAVE LIST
  getStaffLeave(params : any){
    return this.httpRequest.post(this.API_URL+'api/admin-leave/list',params)
  }

  // GET TODAY's PRESENT STAFF LIST
  todayPresentStaff(params:any){
    return this.httpRequest.post(this.API_URL+'api/dashboard/get-todays-present-staff',params)
  }

  // GET ABSENT STUDENT 
  getAbsentStudent(params:any){
    return this.httpRequest.post(this.API_URL+'api/dashboard/get-todays-absent-student-list',params)
  }

  getInquiry(params:any){
    return this.httpRequest.post(this.API_URL+'api/inquiry/list',params)
  }
  
  // Todays date
  getCurrentDate() {
    const today = new Date();
    
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    
    return `${day}-${month}-${year}`;
  }

  // Custom Date
  getStartAndEndDate(days) {
    const today = new Date();

    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const startDate = `${day}-${month}-${year}`;

    const endDateObj = new Date(today);
    endDateObj.setDate(today.getDate() + days);
    const endDay = String(endDateObj.getDate()).padStart(2, '0');
    const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0');
    const endYear = endDateObj.getFullYear();
    const endDate = `${endDay}-${endMonth}-${endYear}`;

    return {
      startDate: startDate,
      endDate: endDate
    };
  }
  // Bydefault Date Selected for Dropdown
  getDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate
  }

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
  getClasslist(payload:any){
    let url = this.API_URL+'api/class-list/'+ this.getBranch() ;
    if(payload?.user_id){
      url+="?user_id="+payload?.user_id;
    }
    if(payload?.section_id){
      url+="&section_id="+payload?.section_id;
    }
    return this.httpRequest.get(url);
  }
  getClass(section?:any){
    const data = {
      section : section,
    }
    return this.httpRequest.post(this.API_URL+'api/student/get-classes',data);
  }

  // Batch List
  getBatcheList(params:any){
    Object.assign(params,{branchId:this.getBranch()});
    return this.httpRequest.post(this.API_URL+'api/get-batches-by-classes',params);
  }

  // Subject List
  getSubjectList(params:any){
    return this.httpRequest.post(this.API_URL+'api/notes/subject',params)
  }
  getFacultyList(){
    return this.httpRequest.get(this.API_URL+'api/get-faculty-list/'+this.getBranch());
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
  // setsymfonyUrl(url:string) {
  //   return this.symfonyHost+url;
  // }
  setsymfonyUrl(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }

  getTimeTable(payload: any){
    return this.httpRequest.post(this.API_URL+'api/timetable/dashboard-timetable',payload);
  }

}
