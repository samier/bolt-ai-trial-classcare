import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { enviroment } from '../../../environments/environment.staging';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class WhatsappHistoryService {

  private API_URL = enviroment.apiUrl;
  
  constructor(private httpRequest: HttpClient) { }

  //Get branch id
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  getWhatsAppMsgCountList() {
    return this.httpRequest.get(this.API_URL+'api/whatsapp-history/get-count-list/'+this.getBranch());
  }

  getWhatsAppList(param:any){
    return this.httpRequest.post(this.API_URL+'api/whatsapp-history-list',param);
  }

  paginatedRecords(url:any,param:any){
    return this.httpRequest.post(url,param);
  }

  getSmsHistory(payload: any){
    return this.httpRequest.post(this.API_URL+'api/sms-history-list', payload)
  }

  getSmsCount(){
    return this.httpRequest.get(this.API_URL+'api/sms-history/get-count-list/'+this.getBranch());
  }

  getRemainingFeeList(payload: any){
    return this.httpRequest.post(this.API_URL+'api/fees/remaining-fees-list/'+this.getBranch(), payload);
  }

  sendRemainingFeeNotification(payload: any, type: any){
    if(type == 'sms'){
      return this.httpRequest.post(this.API_URL+'api/fees/fee-remaining-sms',payload);
    }else{
      return this.httpRequest.post(this.API_URL+'api/fees/get-remaining-fees-notification', payload);
    }
  }

  getNotificationHistory(payload: any){
    return this.httpRequest.post(this.API_URL+'api/notifications-by-module', payload);
  }

  getModuleName(){
    return this.httpRequest.post(this.API_URL+'api/get-notifications-module', {});
  }
}
