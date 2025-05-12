import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SystemSettingService {

  branch_id: any = window.localStorage.getItem('branch');
  user_id: any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  
  constructor(private httpRequest: HttpClient) { }

  //Get branch id
  getBranch(){
    return window.localStorage.getItem("branch");
  }


  // BRANCH 
  fetchBranchList(){
    return this.httpRequest.get(this.API_URL+'api/branch-list');
    // return this.httpRequest.get(this.API_URL+'api/get-branch-list')
  }

  // ACADEMIC YEAR
  fetchAcademicList(payload:any){
    return this.httpRequest.post(this.API_URL+'api/filter/get-academic-year', payload);
  }

  // SECTION
  fetchSection( payload : any){
    return this.httpRequest.post(this.API_URL+'api/filter/get-section-list',payload);
    // return this.httpRequest.post(this.API_URL+'api/section/list',sections);
  }

  // CLASS
  fetchClass(payload:any){
    return this.httpRequest.post(this.API_URL+'api/filter/get-classes', payload);
    // let url = this.API_URL+'api/class-list/'+ this.getBranch() ;

    // if(payload?.user_id){
    //   url+="?user_id="+payload?.user_id;
    // }
    // if(payload?.section){
    //   url+="&section_id="+payload?.section;
    // }
    // return this.httpRequest.get(url);
    
  }

  // BATCH
  fetchBatch(payload:any){
    return this.httpRequest.post(this.API_URL+'api/filter/get-batches',payload);
  }

  // SHOW BTN API
  getDetails(payload:any){
    return this.httpRequest.post(this.API_URL+'api/student/otp-logs',payload);
  }

  getMainMenuData () {
    return this.httpRequest.post(`${this.API_URL}api/system-setting/system-setting-data`,[]);
  }
  
  getMenuFieldData (payload) {
    return this.httpRequest.post(`${this.API_URL}api/system-setting/view-system-setting`,payload);
  }
  
  saveSetting(payload) {
    return this.httpRequest.post(`${this.API_URL}api/system-setting/update-system-setting`,payload);
  }
  
  getStudentField() {
    return this.httpRequest.post(`${this.API_URL}api/student/field_setting`, []);
  }
  
  updateStudentField(payload) {
    return this.httpRequest.post(`${this.API_URL}api/student/update-field-visible`, payload);
  }

  getNotificationMainMenuData () {
    return this.httpRequest.post(`${this.API_URL}api/notification/notification-setting-data`,[]);
  }

  getNotificationMenuFieldData (payload) {
    return this.httpRequest.post(`${this.API_URL}api/notification/view-notification-setting`,payload);
  }

  saveNotificationSetting(payload) {
    return this.httpRequest.post(`${this.API_URL}api/notification/update-notification-setting`,payload);
  }

}