import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-scool-perfomance',
  templateUrl: './scool-perfomance.component.html',
  styleUrls: ['./scool-perfomance.component.scss']
})
export class ScoolPerfomanceComponent implements OnInit {

  branch_id: any = window.localStorage.getItem('branch');
  currentYear_id: any = Number(('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]);

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  classlist : any = []
  batchList : any = []

  constructor(
    public dashboardService : DashboardService
  ) { }

  ngOnInit(): void {
  }

  getClasslist(){
    const payload = {}
    this.dashboardService.getClasslist(payload).subscribe((res: any) => {
      this.classlist = res?.data
     } )
  }
  getBatchList(){
    const payload = {}
    this.dashboardService.getBatcheList(payload).subscribe((res: any) => {
      this.batchList = res?.data
     } )
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }


}
