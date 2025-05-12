import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HttpClient } from '@angular/common/http';
import { apiVersions } from 'src/app/common-config/static-value';
import { apiUrlConstants } from 'src/app/shared/constants/apiUrl-constants';

@Injectable({
  providedIn: 'root'
})
export class InquiryService {

  branch_id: any = window.localStorage.getItem('branch');
  user_id: any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  private API_URL = enviroment.apiUrl;
  private NEW_API_URL = enviroment.newApiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  constructor(
    private httpRequest:HttpClient
  ) { }
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  inquiryList(payload:any){
    return this.httpRequest.post(this.API_URL+'api/inquiry/list',payload)
  }

  multiDelete(payload:any){
    return this.httpRequest.post(this.API_URL+'api/inquiry/delete-multiple-inquiry',payload)
  }
  deleteInquiry(id:any){
    return this.httpRequest.delete(this.API_URL+'api/inquiry/delete/'+id)
  }

  sendSMS(params:any){
    return this.httpRequest.post(this.API_URL+'api/inquiry/send-message',params)
  }

  getPdfAndExcel(payload,format) {
    return this.httpRequest.post(`${this.API_URL}api/student/student-detail/${format}`,  payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  exportExcel(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/inquiry/export-inquiry-details`,  payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  statusChange(payload:any,id:any){
    return this.httpRequest.post(this.API_URL+`api/inquiry/update-inquiry-status/${id}`,payload)
  }

  saveandUpdate(payload,id:any=null){
    if(id){
      return this.httpRequest.post(this.API_URL+'api/inquiry/update/'+id,payload)
    }else{
      return this.httpRequest.post(this.API_URL+'api/inquiry/store',payload)
    }
  }
  viewInquiry(id:any){
    return this.httpRequest.post(`${this.API_URL}api/inquiry/view/${id}`,{})
  }
  getOldSchoolName(){
    return this.httpRequest.post(this.API_URL + 'api/old-school/index',{});
  }

  getEmployeeList(payload){
    return this.httpRequest.post( this.API_URL+"api/get-employees-list-for-web",payload);
  }

  // PDF || EXECL Download 
  downloadFile(res: any,file: any, format:any) {
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if(format == 'pdf') {
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
    } else {
      let a = document.createElement('a');
      a.download = fileName;
      a.href =  pdfSrc
      a.click();
    }
  }

  // Adacamic List
  getAcadamicYearList(param: any) { //api/filter/get-users-academic-years  api/global-search/get-academic-year
    return this.httpRequest.post(this.API_URL + 'api/filter/get-users-academic-years', param);
  }

  getCustomDetail(){
    return this.httpRequest.get(this.API_URL + 'api/old-school/category-type-and-admission-year');
  }

  // Section List
  getSectionList(sections:any){
    return this.httpRequest.post(this.API_URL+'api/section/list',sections);
  }

  // Class list
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
  getClassList(payload:any){
    return this.httpRequest.post(this.API_URL+'api/student/get-classes',payload)
  }

  importInquiry(payload:any){
    return this.httpRequest.post(this.API_URL+'api/inquiry/import',payload)
  }

  getFieldData () {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/field-visible/${this.branch_id}`,[])
  }

  updateFieldData (payload) {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/update-field-visible/${this.branch_id}`,payload)
  }

  visibilityUpdate (payload) {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/inquiry-permission`,payload)
  }

  exportStatusLog(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/inquiry/export-inquiry-status-log`,  payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }
  
  followUpList(payload:any)
  {
    return this.httpRequest.post(this.API_URL+'api/inquiry/follow-up/list',payload)
  }

  getClasses(data?:any){
    return this.httpRequest.post(this.API_URL+'api/notice/get-class-list',data);
  }

  deleteInquiryFollowUp(id:any)
  {
    return this.httpRequest.delete(this.API_URL+'api/inquiry/follow-up/delete/'+id);
  }

  addUpdateFollowUp(payLoad:any,followUpId:any)
  {
    if(followUpId){
      return this.httpRequest.post(this.API_URL+'api/inquiry/follow-up/update/'+followUpId,payLoad)
    }
    else{
      return this.httpRequest.post(this.API_URL+'api/inquiry/follow-up/store',payLoad)
    }
  }

  viewFollowUp(id:any)
  {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/follow-up/view/${id}`,{})
  }

  exportData(payLoad:any)
  {
    return this.httpRequest.post(this.API_URL+'api/inquiry/follow-up/export-followup-inquiry',payLoad,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });    
  }

  exportSampleExcel() {
    return this.httpRequest.post(this.API_URL+'api/inquiry/inquiry-sample-file',[],{
      observe: 'response',
      responseType: 'blob' as 'json'
    });   
  }

  getFormList() {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/get/dynamic/form-list`,[])
  }

  getInquiryFeesSetting() {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/fees-setting`,[]);
  } 

  getInqiryFeesOnClass (payload) {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/get/inquery-form-fees`,payload);
  }

  inquiryFeesCollect (id,payload) {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/fees-status-update/${id}`,payload);
  }

  downloadFeesRecipt(payload) {
    return this.httpRequest.post(this.API_URL+'api/inquiry/fees/get/receipt',payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });   
  }
  systemSetting (payload:any) {
    return this.httpRequest.post(`${this.API_URL}api/get-system-setting`,payload);
  }

  checkMobileNumber(payload:any){
    return this.httpRequest.post(this.API_URL+'api/inquiry/check/phonenumber',payload);
  }

  // ? API FOR CRUD
  getListReason(){
    return this.httpRequest.post(`${this.API_URL}api/inquiry/reject-reason`,{})
  }
  addEditReason(payload:any,id:any){
    if(id){
      return this.httpRequest.post(`${this.API_URL}api/inquiry/reject-reason/update/${id}`,payload)
    }
    return this.httpRequest.post(`${this.API_URL}api/inquiry/reject-reason/store`,payload)
  }
  deleteReason(id:any){
    return this.httpRequest.post(`${this.API_URL}api/inquiry/reject-reason/destroy/${id}`,{})
  }

  getAllEmployee(){
    return this.httpRequest.post(`${this.API_URL}api/inquiry/get-responsible-users`,{})
  }

  downloadReport(payload:any,format:any){
    return this.httpRequest.post(this.API_URL+'api/inquiry/report/'+format,payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });   
  }

  getPDFDownloadFields() {
    return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v1}${apiUrlConstants.INQUIRY_PDF_DOWNLOAD_FIELDS}`,[]);
  }

}
