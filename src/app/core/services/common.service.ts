import { Injectable } from '@angular/core';
// import { NavService } from 'src/app/shared/services/nav.service';
import { HttpClient } from '@angular/common/http';
import { enviroment } from 'src/environments/environment.staging';
import { NavigationEnd, Router } from '@angular/router';
import { size } from 'lodash';
import * as moment from 'moment';

import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  public is_admin   = window.localStorage?.getItem("role")?.includes('ROLE_ADMIN');
  public user   = window.localStorage?.getItem("user_id")?.includes('ROLE_ADMIN');
  public role:any = window.localStorage?.getItem("role")?.includes("ROLE_ADMIN");
  private API_URL = enviroment.apiUrl;
  private previousUrl: string | undefined;
  private currentUrl: string | undefined;
  routeData

  private photoUpdatedSubject = new BehaviorSubject<boolean>(false);
  photoUpdated$ = this.photoUpdatedSubject.asObservable();

  private refreshYearDropdown = new Subject<void>();
  refreshYearDropdown$ = this.refreshYearDropdown.asObservable();

  constructor(
    private httpRequest: HttpClient,
    private router: Router
  ) { 
    this.currentUrl = this.router.url;
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {        
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      };
    });
  }

  fileIcons:any = {
    "pdf" : './assets/img/files/file.png',
    "png" : './assets/img/files/image.png',
    "jpg" : './assets/img/files/image.png',
    "jpeg" : './assets/img/files/image.png',
    "gif" : './assets/img/files/image.png',
    "webp" : './assets/img/files/image.png',
  };

  notifyPhotoUpdated() {
    this.photoUpdatedSubject.next(true);
  }

  // All common services should be defined here

  async fetchPermissions(): Promise<any>{
    if(this.role != "STUDENT"){
      const response_data:any = await this.httpRequest.post(this.API_URL+'api/modules/role-wise-modules-permission-list',[]).toPromise();
      window.localStorage.setItem("permissions",JSON.stringify(response_data.data));
      return response_data;
    }else{
      console.log("common -"+this.role);
    }
  }

  hasPermission(module_name:any,action:any = null){
    if(!this.user){
      // this.user = JSON.parse(localStorage.getItem('user')??"");
    }
    // console.log(this.role);
    if(this.role){
        return true;
    }
    var permissions:any = localStorage.getItem("permissions");
    permissions = JSON.parse(permissions);
    if(action){
      var result = permissions?.filter((item:any)=>item?.module?.key == module_name)?.[0]?.[action] == 1;
      return result;
    }
    var result = permissions?.filter((item:any)=>item?.module?.key == module_name)?.[0]?.['has_access'] == 1;
    return result;
  }

  isModuleActive(routeData) {
    if(routeData.hasOwnProperty('parentModule')) {
      const parentModule = routeData.parentModule;
      if(this.previousUrl != '/' && size(this.previousUrl) > 1) {
        var splitUrl = this.previousUrl?.split('/');
        return splitUrl?.includes(parentModule);
      }
      return false
    }
    return false
  }
  downloadFile(res: any,file: any, format:any) {
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if(format == 'pdf') {
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
    } else {
      let a = document.createElement('a');
      a.download = fileName;
      a.href =  pdfSrc
      a.click();
    }
  }
  
  hasModule(key:any){
    if(!this.user){
      // this.user = JSON.parse(localStorage.getItem('user')??"");
    }
    // console.log(this.role);
    if(this.role){
        return true;
    }
    var permissions:any = localStorage.getItem("permissions");
    permissions = JSON.parse(permissions);
    var module = permissions?.filter((item:any)=>item?.module?.key == key)?.[0];
    if(module?.['has_access'] == 1 || module?.['has_create'] == 1 || module?.['has_delete'] == 1 || module?.['has_download'] == 1 || module?.['has_edit'] == 1 || module?.['has_import'] == 1 || module?.['has_update'] == 1 ){
      return true;
    }else
    {
      return false;
    }
  }



  paymentModeValidator(formData:any,payment_mode:any)
  {
    const CASH = 1;
    const CHEQUE = 2;
    const POS = 3;
    const NEFT = 4;
    const UPI = 5;
    const OTHER = 6;

    var errors:any = [];
    for(const [field,value] of formData.entries())
    {
      // cheque validation
      if(field == 'cheque[cheque_no]' && value == '' && payment_mode == CHEQUE){
        errors.cheque_no = 'Please enter cheque number';
      }
      else if(field == 'cheque[cheque_no]' && value?.length != 6 && payment_mode == CHEQUE){
        errors.cheque_no = 'Please enter 6 digit cheque number';
      }
      if(field == 'cheque[bank_name]' && value == '' && payment_mode == CHEQUE){
        errors.bank_name = 'Please enter bank name';
      }

      // pos validation
      if(field == 'card[rrn_no]' && value == '' && payment_mode == POS){
        errors.rrn_no = 'Please enter RRN number';
      }
      if(field == 'card[bank_name]' && value == '' && payment_mode == POS){
        errors.bank_name = 'Please enter bank name';
      }
      if(field == 'card[card_type]' && value == '' && payment_mode == POS){
        errors.card_type = 'Please select type';
      }

      // others validation
      if(field == 'other_payment[transaction_or_ref_no]' && value == '' && payment_mode == OTHER){
        errors.transaction_or_ref_no = 'Please enter Transaction / Ref number';
      }
      if(field == 'other_payment[bank_name]' && value == '' && payment_mode == OTHER){
        errors.bank_name = 'Please enter bank name';
      }
      if(field == 'other_payment[payment_type]' && value == '' && payment_mode == OTHER){
        errors.payment_type = 'Please enter payment type';
      }
    }

    return errors;
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  changeDateFormat(dateString: any, format:any = 'yyyy-MM-DD') {
    try {
        const parsedDate = moment(dateString);
        return parsedDate.format(format);
    } catch (error) {
        return 'Invalid Date';
    }
  }

  getMonthsFromQuarter(all_quarters:any, selected_quarter:any){
    return selected_quarter.reduce((acc, qtr) => {
      const month = all_quarters.find(item => item.id === qtr.id);
      return acc.concat(month.months);
    }, []);
  }


  flipObject(obj: { [key: string]: string | number }): { [key: string]: string } {
    return Object.keys(obj).reduce((acc, key) => {
      acc[obj[key]] = key;
      return acc;
    }, {} as { [key: string]: string });
  }

  decodeString(string:any) {
    const txt = document.createElement('textarea');
    txt.innerHTML = string;
    return txt.value;
  }

  setUserUrl(url: string) {
    return '/'+ url;
  }

  triggerYearDropdownRefresh() {
    this.refreshYearDropdown.next();
  }

  // FUNCTION USE TO CORRECT THE WHOLE ARRAY OBJECT URL OR SINGLE OBJECT URL
  validateAndFixUrls(attachment: any, objectKey: string): any {
    // CHECK ATTACHMENT IS ARRAY OF OBJECT
    if (Array.isArray(attachment)) {
      return attachment.map((item) => ({
        ...item,
        [objectKey]: this.fixUrl(item[objectKey]),
      }));
    }
    // CHECK ATTACHMENT IS SINGLE ARRAY 
    else if (attachment && typeof attachment === 'object') {

      return {
        ...attachment,
        [objectKey]: this.fixUrl(attachment[objectKey]),
      };
    }
    return attachment;
  }

  fixUrl(url: string): string {
    if (url && typeof url === 'string') {
      // CORRECT THE URL WITH REPLACING &amp; with & in the URL
      return url.replace(/&amp;/g, '&');
    }
    return url;
  }

  setsymfonyUrl(url:string) {
    return enviroment.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }
  

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader?.readAsDataURL(file);

      reader.onload = () => {
        const base64String = reader?.result?.toString().split(',')[1];
        if (base64String) {
          resolve(base64String);
        } else {
          reject(new Error('Failed to convert file to base64.'));
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  }

  getID(data: any){
    if (data == null || data?.length == 0) {
      return []
    }
    return data.map((item:any) => item.id)
  }
  
  getFileType(url: string): string {
    if (!url) return 'unknown';
  
    const extension :any= url.split('.').pop()?.toLowerCase();
  
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return 'excel';
    } else {
      return 'other';
    }
  }

  editorConfig(){
     let editorConfig: AngularEditorConfig = {
          editable: true,
          spellcheck: true,
          height: 'auto',
          minHeight: '0',
          maxHeight: 'auto',
          width: 'auto',
          minWidth: '0',
          translate: 'yes',
          enableToolbar: true,
          showToolbar: true,
          placeholder: 'Enter text here...',
          defaultParagraphSeparator: '',
          defaultFontName: '',
          defaultFontSize: '',
          toolbarHiddenButtons: [
            // [
            //   'undo',
            //   'redo',
            //   'bold',
            //   'italic',
            //   'underline',
            //   'strikeThrough',
            //   'subscript',
            //   'superscript',
            //   'justifyLeft',
            //   'justifyCenter',
            //   'justifyRight',
            //   'justifyFull',
            //   'indent',
            //   'outdent',
            //   'insertUnorderedList',
            //   'insertOrderedList',
            //   'heading',
            //   'fontName'
            // ],
            [
              // 'fontSize',
              // 'textColor',
              // 'backgroundColor',
              // 'customClasses',
              'link',
              'unlink',
              'insertImage',
              'insertVideo',
              'insertHorizontalRule',
              'removeFormat',
              // 'toggleEditorMode',
            ],
          ],
          fonts: [
            {class: 'arial', name: 'Arial'},
            {class: 'times-new-roman', name: 'Times New Roman'},
            {class: 'calibri', name: 'Calibri'},
            {class: 'comic-sans-ms', name: 'Comic Sans MS'}
          ],
          customClasses: [
          {
            name: 'quote',
            class: 'quote',
          },
          {
            name: 'redText',
            class: 'redText'
          },
          {
            name: 'titleText',
            class: 'titleText',
            tag: 'h1',
          },
        ],
        uploadUrl: 'v1/image',
    };

    return editorConfig;
  }

  countFilters(formValue: any): number {
    let filterCount = 0;
    if (!formValue) return filterCount;
  
    Object.keys(formValue).forEach((key) => {
      if (key === 'date') {
        if (formValue[key]?.startDate && formValue[key]?.endDate) {
          filterCount++;
        }
      } else if (formValue[key] && (Array.isArray(formValue[key]) ? formValue[key].length > 0 : true)) {
        filterCount++;
      }
    });
  
    return filterCount;
  }
  
}
