import { Component, OnInit } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Component({
  selector: 'app-subscription-access-denied',
  templateUrl: './subscription-access-denied.component.html',
  styleUrls: ['./subscription-access-denied.component.scss']
})
export class SubscriptionAccessDeniedComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.setsymfonyUrlLogout('logout')
    // this.clear()
  }

  setsymfonyUrlLogout (url) {
   window.location.href = enviroment.symfonyHost + url
  }

  clear() {
    localStorage.clear();
    sessionStorage.clear();
  }

}
