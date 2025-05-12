import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { enviroment } from '../../../environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  branch_id: any = window.localStorage.getItem('branch');
  user_id :any   = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  private API_URL = enviroment.apiUrl;
  
  constructor(private httpRequest: HttpClient) { }
  
  getCategoryList(param: any) {
    return this.httpRequest.post(this.API_URL+"api/expense/expense-category",param);
  }

  getPaymentModes(){
    return this.httpRequest.get(this.API_URL+"api/expense/predefine-constant");
  }

  getVendorsList(param: any){
    return this.httpRequest.post(this.API_URL+"api/expense/expense-vendor",param);
  }

  getExpenseList(param: any){
    return this.httpRequest.post(this.API_URL+"api/expense/get-expense",param);
  }

  getExpenseById(id: any){
    return this.httpRequest.get(this.API_URL+"api/expense/view-expense/"+id);
  }

  getExpenseReport(param: any){
    return this.httpRequest.post(this.API_URL+"api/expense/get-expense/pdf",param,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  saveExpenseData(id:any, param: any){
    if(id){
      return this.httpRequest.post(this.API_URL+"api/expense/update-expense/"+id, param);
    }else{
      return this.httpRequest.post(this.API_URL+"api/expense/create-expense", param);
    }
  }
  deleteExpense(id: any){
    return this.httpRequest.delete(this.API_URL+"api/expense/delete-expense/"+id);
  }

  createUpdateCategory( id:number , name:any ){
    if(id){
      return this.httpRequest.post(this.API_URL + `api/expense/update-expense-category/${id}`, { name : name } );
    }
    else{
      return this.httpRequest.post(this.API_URL + 'api/expense/create-expense-category', { name : name } );
    }
  }

  deleteExpenseCategory(id:number){
    return this.httpRequest.delete(this.API_URL + `api/expense/delete-expense-category/${id}`);
  }

  createUpdateVendor( id:number , name:any ){
    if(id){
      return this.httpRequest.post(this.API_URL + `api/expense/update-expense-vendor/${id}`, { name : name } );
    }
    else{
      return this.httpRequest.post(this.API_URL + 'api/expense/create-expense-vendor', { name : name } );
    }
  }

  deleteExpenseVendor(id:number){
    return this.httpRequest.delete(this.API_URL + `api/expense/delete-expense-vendor/${id}`);
  }
  currentSchool(){
    return this.httpRequest.get(this.API_URL+`api/get-branch-list?academic_year_id=${this.currentYear_id}&branch_id=${this.branch_id}`);
  }
}
