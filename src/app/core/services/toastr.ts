import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { extractErrorMessagesFromErrorResponse } from '../../shared/utilities/extractErrorMessagesFromErrorResponse';

@Injectable({
  providedIn: 'root'
})

export class Toastr {

    constructor(
      private toastr: ToastrService
    ) { }

    /**
     * @ngdoc method
     * @name showSuccess
     * @description
     * show success message
     * @param key
     */
    showSuccess(message:any){
        this.toastr.success(message ,'SUCCESS');
    }

    /**
     * @ngdoc method
     * @name showError
     * @description
     * show error message
     * @param message
     * @param title
     */
    showError(message:any){
        this.toastr.error(message, 'FAILED')
    }

    /**
     * @ngdoc method
     * @name showWarning
     * @description
     * show warning message
     * @param message
     * @param title
     */
    showWarning(message:any, title:any){
        this.toastr.warning(message, title)
    }

    /**
     * @ngdoc method
     * @name showInfo
     * @description
     * show info message
     * @param message
     * @param title
     */
    showInfo(message:any, title:any){
        this.toastr.info(message, title)
    }

    /**
     * @ngdoc method
     * @name showServerSuccess
     * @description
     * show server success message
     * @param key
     * @param title
     */
    showServerSuccess(message:any, title?: any){
        this.toastr.success(message, title || 'Success')
    }

    /**
     * @ngdoc method
     * @name showServerError
     * @description
     * show server error message
     * @param {*} message
     */
    showServerError(message:any){
        var serverMessage = extractErrorMessagesFromErrorResponse(message);
        this.toastr.error((serverMessage).toString(), 'Error')
    }
}