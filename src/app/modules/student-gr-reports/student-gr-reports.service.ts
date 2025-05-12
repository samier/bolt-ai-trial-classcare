import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { callAPIConstants } from 'src/app/shared/constants/callAPI-constants';


@Injectable({
  providedIn: 'root'
})
export class StudentGrReportsService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }

  getBranch(){
    return window.localStorage.getItem("branch");
  }

  // classes
  getClassesList(){
    return this.httpRequest.get(this.API_URL+'api/lesson/class-list/'+this.getBranch());
  }

  // batches
  getBatchesList(params:any){
    Object.assign(params,{branchId:this.getBranch()});
    return this.httpRequest.post(this.API_URL+'api/get-batches-by-classes',params);
  }

  //Get all students list by class and batch
  /*generateStudentGrReport(paraSave:any){
    Object.assign(paraSave,{branchId:this.getBranch()});
    return this.httpRequest.post(this.API_URL+'api/student/get-student-list-by-batch-id',paraSave);
  }*/

  getStudentTableAllFieldList(){
    return this.httpRequest.get(this.API_URL+'api/student/get-student-table-all-field-list');
  }

  //Get all students list by class and batch
  generateStudentGrReport(params:object){
    return this.httpRequest.post(this.API_URL+'api/student/get-student-list-by-batch-id/'+this.getBranch(), params);
  }

  downloadStudentReport(params:object, format:string){
    return this.httpRequest.post(this.API_URL+'api/student/get-student-list-by-batch-id/'+this.getBranch()+'/'+format,  params);
  }
  getGenderFullName(gender:any) {
    if (gender == 'm') {
      return "Male";
    } else if (gender == 'f') {
      return "Female";
    } else if (gender == 'o') {
      return "Other";
    } else {
      return "-"
    }
  }

  getStudentStatus(status:any) {
    if (status == 1) {
      return "Active";
    } else if (status == 0) {
      return "InActive";
    } else {
      return "-"
    }
  }

  getRightToEducation(rightToEducation:any) {
    if (rightToEducation == 1) {
      return "Yes";
    } else if (rightToEducation == 0) {
      return "No";
    } else {
      return "-"
    }
  }

  getOldNew(old_new:any) {
    if (old_new == 1) {
      return "New";
    } else if (old_new == 0) {
      return "Old";
    } else {
      return "-"
    }
  }

  getSendSmsNumber(send_sms_number:any) {
    if (send_sms_number == 1) {
      return "Father Number";
    } else if (send_sms_number == 2) {
      return "Mother Number";
    } else {
      return "-"
    }
  }

  getParentWhatsappNo(parentWhatsappNo:any) {
    if (parentWhatsappNo == 1) {
      return "Father Number";
    } else if (parentWhatsappNo == 2) {
      return "Mother Number";
    } else {
      return "-"
    }
  }

  getSameAddress(sameAddress:any) {
    if (sameAddress == 1) {
      return "Yes";
    } else if (sameAddress == 0) {
      return "No";
    } else {
      return "-"
    }
  }


}
