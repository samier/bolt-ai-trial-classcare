import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Toastr } from '../core/services/toastr';
import { enviroment } from '../../environments/environment.staging';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BulkDiscountGuard implements CanActivate {

  constructor(
    private httpRequest: HttpClient,
    private toastr: Toastr,
  ) { }
  
  async canActivate(): Promise<boolean> {
    
    const bulk_discount:any = await this.httpRequest.get(enviroment.apiUrl+'api/fees/get-bulk-discount-permission').toPromise();

    if(bulk_discount?.data){
        return true;
    }

    this.toastr.showError('Access denied')
    window.location.href = enviroment.symfonyHost+'admin';  

    return false;
  }
}