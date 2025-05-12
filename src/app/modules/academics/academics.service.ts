import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AcademicService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }

  getBranch(){
    return window.localStorage.getItem("branch");
  }

  getStudentFeesDetail(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/get-student-fees',data);
  }

  updateStudentFeesDetail(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/update-student-fees',data);
  }

  discountReasonUpdateOrCreate(data:any,id:any){
    if(id){
      return this.httpRequest.post(this.API_URL+'api/fees/discount_reason/'+id+'?_method=put',data);
    }
    return this.httpRequest.post(this.API_URL+'api/fees/discount_reason',data);
  }

  deleteDiscountReason(id: any, params: any) {
    let httpParams = new HttpParams();
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        httpParams = httpParams.append(key, params[key]);
      }
    }

    return this.httpRequest.delete(`${this.API_URL}api/fees/discount_reason/${id}`, { params: httpParams });
  }

  discountReasonList(){
    return this.httpRequest.get(this.API_URL+'api/fees/discount_reason');
  }

  getAttachments(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/student-category-fees/attachments',data);
  }

  deleteAttachement(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/student-category-fees/delete-attachment',data);
  }
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}
