import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class IncomeExpenseService {

  private API_URL = enviroment.apiUrl;
  URLConstants = URLConstants;

  constructor(
    private httpRequest: HttpClient
  ) { }

  getBranch() {
    return window.localStorage.getItem("branch");
  }

  getBranchList() {
    return this.httpRequest.get(this.API_URL + "api/branch-list");
  }

  getTrustList() {
    return this.httpRequest.get(this.API_URL + "api/fees-category/get-trust-list");
  }

  getUserList() {
    return this.httpRequest.post(this.API_URL + "api/user-list/" + this.getBranch(), []);
  }

  getPaymentModes(params: any = null) {
    return this.httpRequest.post(this.API_URL + 'api/fees/get-payment-modes', params);
  }

  getAcademicYear(){
    return this.httpRequest.get(this.API_URL + 'api/get-academic-year/'+this.getBranch());
  }

  // bank account
  createOrUpdateAccount(payload: any, id:any){
    if(id != null){
      return this.httpRequest.post(this.API_URL+"api/bank-account/update/"+id, payload);
    }else{
      return this.httpRequest.post(this.API_URL+"api/bank-account/store", payload);
    }
  }

  getBankAccountList(payload: any){
    return this.httpRequest.post(this.API_URL+"api/bank-account/index", payload);
  }

  getBankAccountDetails(id: any){
    return this.httpRequest.post(this.API_URL+"api/bank-account/get/"+id, []);
  }

  deleteBankAccountDetails(id: any){
    return this.httpRequest.post(this.API_URL+"api/bank-account/delete/"+id, []);
  }

  getAccountTypeList(){
    return this.httpRequest.post(this.API_URL+"api/endpoint", []);
  }


  //Tax Module
  taxIndex(params){
    return this.httpRequest.post(this.API_URL + "api/tax/index", params);
  }

  getTaxList() {
    return this.httpRequest.post(this.API_URL + "api/tax/list", []);
  }

  createOrUpdateTax(payload: any){
    if(payload.id){
      return this.httpRequest.post(this.API_URL+"api/tax/update/"+payload.id, payload);
    }else{
      return this.httpRequest.post(this.API_URL+"api/tax/store", payload);
    }
  }
  
  deleteTax(id: any){
    return this.httpRequest.post(this.API_URL+"api/tax/delete/"+id,[]);
  }

  //Head Module
  indexHead(params: any) {
    return this.httpRequest.post(this.API_URL + "api/head/index", params);
  }

  getHeadList(type: any) {
    return this.httpRequest.post(this.API_URL + "api/head/list/" + type, []);
  }

  createOrUpdateHead(payload: any){
    if(payload.id){
      return this.httpRequest.post(this.API_URL+"api/head/update/"+payload.id, payload);
    }else{
      return this.httpRequest.post(this.API_URL+"api/head/store", payload);
    }
  }

  deleteHead(id: any){
    return this.httpRequest.post(this.API_URL+"api/head/delete/"+id,[]);
  }

  getVendorList(){
    return this.httpRequest.post(this.API_URL + 'api/head/vendor-list', []);
  }

  //income module
  incomeIndex(params: any) {
    return this.httpRequest.post(this.API_URL + "api/income/index", params);
  }

  getIncome(income_id: any) {
    return this.httpRequest.post(this.API_URL + "api/income/get/" + income_id, []);
  }

  saveIncome(payload: any, record_id: any) {
    let url = this.API_URL + 'api/income/store';
    if (record_id != 0 && record_id != null) {
      url = this.API_URL + 'api/income/update/' + record_id;
    }
    return this.httpRequest.post(url, payload);
  }

  deleteIncome(income_id: any) {
    return this.httpRequest.post(this.API_URL + "api/income/delete/" + income_id, []);
  }

  copyIncome(income_id: any) {
    return this.httpRequest.post(this.API_URL + "api/income/copy/" + income_id, []);
  }

  deleteIncomeAttachment(income_id: any) {
    return this.httpRequest.post(this.API_URL + "api/income/delete-attachment/" + income_id, []);
  }
  
  // ledger Module
  
  getLedgerList(payload: any){
    return this.httpRequest.post(this.API_URL+"api/ledger/index", payload);
  }
  
  createOrUpdateLedger(payload: any){
    if(payload.id){
      return this.httpRequest.post(this.API_URL+"api/ledger/update/"+payload.id, payload);
    }else{
      return this.httpRequest.post(this.API_URL+"api/ledger/store", payload);
    }
  }

  deleteLedger(id: any){
    return this.httpRequest.post(this.API_URL+"api/ledger/delete/"+id,[]);
  }

  ledgerList(){
    return this.httpRequest.post(this.API_URL+"api/ledger/list",[]);
  }


  //expense module
  expenseIndex(params: any) {
    return this.httpRequest.post(this.API_URL + "api/expense/index", params);
  }

  getExpense(income_id: any) {
    return this.httpRequest.post(this.API_URL + "api/expense/get/" + income_id, []);
  }

  saveExpense(payload: any, record_id: any) {
    let url = this.API_URL + 'api/expense/store';
    if (record_id != 0 && record_id != null) {
      url = this.API_URL + 'api/expense/update/' + record_id;
    }
    return this.httpRequest.post(url, payload);
  }

  deleteExpense(expense_id: any) {
    return this.httpRequest.post(this.API_URL + "api/expense/delete/" + expense_id, []);
  }

  copyExpense(expense_id: any) {
    return this.httpRequest.post(this.API_URL + "api/expense/copy/" + expense_id, []);
  }

  deleteExpenseAttachment(expense_id: any) {
    return this.httpRequest.post(this.API_URL + "api/expense/delete-attachment/" + expense_id, []);
  }

  // reports
  getProfitLossReport(data:any){
    return this.httpRequest.post(this.API_URL + "api/report/get-profit-loss", data);
  }

  getProfitLossReportDownload(data:any, type:any){
    return this.httpRequest.post(this.API_URL + "api/report/get-profit-loss/"+type, data, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

}
