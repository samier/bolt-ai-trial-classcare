import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { enviroment } from '../../../environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class FeesImportService {
  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }

  feesImportList(params:any)
  {
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/fees-import-list',params);
  }

  feesImportDetail(params:any,id:number)
  {
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/view-Details/'+id,params);
  }
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}
