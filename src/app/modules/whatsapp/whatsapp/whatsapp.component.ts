import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { enviroment } from 'src/environments/environment.staging';
import { WhatsappService } from '../whatsapp.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-whatsapp',
  templateUrl: './whatsapp.component.html',
  styleUrls: ['./whatsapp.component.scss']
})


export class WhatsappComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  redirectUrl = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;
  gentrateTokenSuccessMessage: string | null = null;
  gentrateTokenErrorMessage: string | null = null;
  wabaDetails : any
  isLoading : boolean = false

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _route: ActivatedRoute,
    private _whatsappService : WhatsappService,
    private _toaster : Toastr
  ) {
    // this.redirectUrl = `${enviroment.domainName}whatsapp`
  }
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    // this._route.queryParams.subscribe(params => {
    //   const authCode = params['code'];  // Extract the authorization code
    //   const state = params['state'];    // You can also verify the state parameter if needed

    //   if (authCode) {
    //     console.log('authCode: ', authCode);
    //     const payload = {
    //       "client_id": enviroment.whatsappClientId,
    //       "client_secret": enviroment.whatsappClientSecret,
    //       "redirect_uri": `${enviroment.domainName}whatsapp`,
    //       // "redirect_uri": 'https://newtest.classcare.in/app/1/whatsapp/callback',
    //       "code": authCode
    //     }
    //     this._whatsappService.getTokenFromFacebook(payload).pipe(takeUntil(this.$destroy)).subscribe((res)=>{
    //       console.log('res: ', res);
    //     },(error)=>{
    //       console.log('error: ', error);
    //     })
    //   }
    // });

    window.addEventListener('message', (event) => {
      if (
        event.origin !== 'https://www.facebook.com' &&
        event.origin !== 'https://web.facebook.com'
      )
        return;

      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          this.wabaDetails = data
          console.log('Message event:', data); // Remove after testing
          // Your code to handle the message event
        }
      } catch (error) {
        console.log('Message event:', event.data); // Remove after testing
        // Your fallback code
      }
    });
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  goToWhatsappSignUp() {
    // const signupUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${enviroment.whatsappClientId}&redirect_uri=${this.redirectUrl}&state=YOUR_STATE_PARAM&scope=whatsapp_business_messaging,whatsapp_business_management`;
    // window.location.href = signupUrl;
    // window.open(signupUrl,'_blank')
  }


   // Trigger the WhatsApp signup process
   launchWhatsAppSignup() {
    this.resetMessages();
    this.generateTokenResetMessages();
    this._whatsappService.launchWhatsAppSignup((response) => {
      if (response.authResponse) {
        const code = response.authResponse.code;
        this.generateToken(code);
        console.log('Response:', code);
        this.successMessage = `Success! Received code: ${code}`;
        // Your code to handle the response
      } else {
        console.log('Response:', response); 
        this.errorMessage = `Login failed: ${response?.error?.message || 'Unknown error'}`;
        // Your fallback code
      }
    });
  }

  closeMessage(type: 'success' | 'error') {
    if (type === 'success') {
      this.successMessage = null;
    } else {
      this.errorMessage = null;
    }
  }

  generateTokenCloseMessage(type: 'success' | 'error') {
    if (type === 'success') {
      this.gentrateTokenSuccessMessage = null;
    } else {
      this.gentrateTokenErrorMessage = null;
    }
  }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  private resetMessages() {
    this.successMessage = null;
    this.errorMessage = null;
  }

  private generateTokenResetMessages() {
    this.gentrateTokenSuccessMessage = null;
    this.gentrateTokenErrorMessage = null;
  }

  generateToken(code) {
    const payload = {
      client_id: enviroment.fabAppId,
      code: code,
      waba_details : this.wabaDetails,
      client_secret: enviroment.whatsappClientSecret,
      // "redirect_uri": `${enviroment.domainName}whatsapp`,
      // "redirect_uri": 'https://newtest.classcare.in/app/1/whatsapp/callback',
    }
    this.isLoading = true
    this._whatsappService.getTokenFromFacebook(payload).pipe(takeUntil(this.$destroy)).subscribe((res : any) => {
      this.isLoading = false
      console.log('res: ', res);
      if(res.status){
        this.gentrateTokenSuccessMessage = res.message
      } else {
        this.gentrateTokenErrorMessage = res.message
      }
    }, (error) => {
      this.isLoading = false
      console.log('error: ', error);
      this.gentrateTokenErrorMessage = error?.error?.message ?? error?.message
    })
  }
	
  //#endregion Private methods
}