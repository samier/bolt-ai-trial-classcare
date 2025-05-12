import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private API_URL = enviroment.apiUrl;
  constructor(private http: HttpClient) { }

}
