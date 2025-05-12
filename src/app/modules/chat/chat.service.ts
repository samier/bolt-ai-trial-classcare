import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from 'src/environments/environment.staging';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js'; // Import Pusher library

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private API_URL = enviroment.apiUrl;
  public echo: Echo;
  public branch_id = window.localStorage?.getItem('branch');

  constructor(private httpRequest: HttpClient) {
    Pusher.logToConsole = false; 
    this.echo = new Echo({
      broadcaster: enviroment.broadcaster,
      key: enviroment.key,
      wsHost: enviroment.wsHost,
      wsPort: enviroment.wsPort,
      cluster: false,
      forceTLS: enviroment.forceTLS,
      disableStats: enviroment.disableStats,
      authEndpoint: enviroment.authEndpoint,
      encrypted: true,
      auth: {
        headers: {
          Authorization: enviroment.token,
        },
      },
      // client: Pusher,
    });
  }

  getEcho() {
    return this.echo;
  }

  getUserRoll() {
    return window.localStorage.getItem('role');
  }

  getUserList(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/chat/get-user-list', data);
  }

  sendMessage(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/chat/send', data);
  }

  getMessage(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/chat/get', data);
  }

  updateStatus(data:any){
    return this.httpRequest.post(this.API_URL + 'api/chat/update-status', data);
  }

  getFilters(data:any){
    return this.httpRequest.post(this.API_URL + 'api/chat/filters', data);
  }

  getChats(data:any){
    return this.httpRequest.post(this.API_URL + 'api/chats', data);
  }

  deleteChat(data:any){
    return this.httpRequest.post(this.API_URL + 'api/chat/delete', data);
  }

  deleteSingleChat(data:any){
    return this.httpRequest.post(this.API_URL + 'api/chat/single-delete', data);
  }
}
