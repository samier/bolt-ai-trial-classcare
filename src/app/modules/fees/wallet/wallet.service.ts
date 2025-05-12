import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private API_URL = enviroment.apiUrl;
  constructor(private httpRequest: HttpClient) { }
  public branch_id = window.localStorage?.getItem("branch");

  getBranchId() {
    return window.localStorage.getItem("branch");
  }

  getWalletList(params: any) {
    return this.httpRequest.post<DataTablesResponse>(this.API_URL + 'api/wallet-datatable', params);
  }

  downloadWallet(params: any, format:any) {
    return this.httpRequest.post<DataTablesResponse>(this.API_URL + 'api/wallet-datatable/'+format, params, {
      observe: 'response',
     responseType: 'blob' as 'json'
   });
  }
  getAllStudent() {
    return this.httpRequest.get(this.API_URL + 'api/get-student-list/' + this.branch_id);
  }
  saveWallet(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/wallet', data);
  }

  updateWallet(data: any,id: any) {
    return this.httpRequest.put(this.API_URL + 'api/wallet/'+id, data);
  }
  
  deleteWallet(id: any) {
    return this.httpRequest.delete(this.API_URL + 'api/wallet/' + id);
  }
  getSectionList(sections: any) {
    return this.httpRequest.post(this.API_URL + 'api/section/list', sections);
  }

  getClasses(section?: any) {
    const data = {
      section: section,
    }
    return this.httpRequest.post(this.API_URL + 'api/fees/get-classes', data);
  }

  getBatchesList(params: any) {
    Object.assign(params, { branchId: this.getBranchId() });
    return this.httpRequest.post(this.API_URL + 'api/get-batches-by-classes', params);
  }
  getStudentListByBatchId(batch_id: any) {
    return this.httpRequest.post(this.API_URL + 'api/student-discount/student-list', { batch_id: batch_id });
  }

  getStudentList(batch_id: any){
    return this.httpRequest.post(this.API_URL + 'api/wallet/student-list', { batch_id: batch_id });
  }

  getWalletHistory(params: any) {
    return this.httpRequest.post<DataTablesResponse>(this.API_URL + 'api/wallet-history-datatable', params);
  }

  walletReceipt(params:any){
    return this.httpRequest.post(this.API_URL+'api/wallet-receipt',params,{
       observe: 'response',
       responseType: 'blob' as 'json'
    });
  }

  cancelWalletReceipt(params:any){
    return this.httpRequest.post(this.API_URL+'api/cancel-wallet-receipt',params);
  }
  
  sectionList(params?:any)
  {
    return this.httpRequest.post(this.API_URL + 'api/wallet/section-list', params);
  }
  getPaymentModes(){
    return this.httpRequest.get(this.API_URL+'api/wallet/fees/get-payment-modes');
  }
  userList(data:any){
    return this.httpRequest.post(this.API_URL+'api/wallet/fees/get-collector', data);
  }
  getWalletHistoryDayWiseReport(data:any){
    return this.httpRequest.post(this.API_URL+'api/wallet/get-history-day-wise-report', data);
  }
  getWalletHistoryDayWiseReportPdf(data:any)
  {
    return this.httpRequest.post(this.API_URL+'api/wallet/get-history-day-wise-report/pdf', data,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  walletPDF(params:any,format:string){
    return this.httpRequest.post(this.API_URL+'api/wallet-history-datatable/'+format,params,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}
