import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) {
    this.loadFbSdk();
  }

  getTokenFromFacebook (payload) {
    return this.httpRequest.post(`${this.API_URL}api/whatsapp/token/generate`, payload);
  }

   // Load Facebook SDK
   private loadFbSdk() {
    // (window as any).fbAsyncInit = () => {
    //   (window as any).FB.init({
    //     appId: enviroment.whatsappClientId, // Replace with your app ID
    //     autoLogAppEvents: true,
    //     xfbml: true,
    //     version: 'v21.0', // Replace with the Graph API version (e.g., 'v17.0')
    //   });
    // };

    // // Dynamically load the Facebook SDK script
    // const script = document.createElement('script');
    // script.src = 'https://connect.facebook.net/en_US/sdk.js';
    // script.async = true;
    // script.defer = true;
    // document.body.appendChild(script);

    if (!(window as any).FB) {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.initializeFbSdk();
      };
      document.body.appendChild(script);
    } else {
      this.initializeFbSdk();
    }
    
  }

  private initializeFbSdk() {
    (window as any).FB.init({
      appId: enviroment.fabAppId,
      autoLogAppEvents: true,
      xfbml: true,
      version: enviroment.fabVersion, // Use a valid Graph API version
    });
    console.log('FB SDK initialized');
  }

  // Method to launch WhatsApp signup
  launchWhatsAppSignup(callback: (response: any) => void) {
    (window as any).FB.login(
      callback,
      {
        config_id: enviroment.fabConfigId, // Replace with your configuration ID
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: '',
          sessionInfoVersion: '3',
        },
      }
    );
  }
}
