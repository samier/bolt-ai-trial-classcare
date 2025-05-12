import { Component, Input, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-counter-card',
  templateUrl: './counter-card.component.html',
  styleUrls: ['./counter-card.component.scss']
})
export class CounterCardComponent implements OnInit {

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants

  @Input() visible: number = 0
  @Input() countData: any;

  constructor(
    private dashboardService: DashboardService,
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  setsymfonyUrl(url:string) {
    return enviroment.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }

}
