import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root',
})
export class EchoService {
  private echo: Echo;

  constructor() {
    this.echo = new Echo({
        broadcaster: enviroment.broadcaster,
        key: enviroment.key,
        wsHost: enviroment.wsHost,
        wsPort: enviroment.wsPort,
        forceTLS: enviroment.forceTLS,
        disableStats: enviroment.disableStats,
        authEndpoint : enviroment.authEndpoint,
        auth:{
            headers: {
                Authorization: enviroment.token, 
            }
        },
    });
  }

  getEcho() {
    return this.echo;
  }
}