import { Component, OnDestroy, OnInit } from '@angular/core';
import { SwitcherService } from '../../services/switcher.service';

@Component({
  selector: 'app-switcher-one-layouts',
  templateUrl: './switcher-one-layouts.component.html',
  styleUrls: ['./switcher-one-layouts.component.scss']
})
export class SwitcherOneLayoutsComponent implements OnInit {

  constructor(public SwitcherService : SwitcherService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(){
    location.reload()
  }

  mainSidebarOpen: any;
  hoverEffect($event:any) {
    this.mainSidebarOpen = $event.type == 'mouseover' ? 'sidenav-toggled-open' : '';
  }

  clickOnBody(){
    let mainBody:any =document.querySelector('.main-body')
    mainBody.classList.remove('sidenav-toggled')
    let removeMainBody:any = document.querySelector('.sidebar')
    removeMainBody.classList.remove('sidebar-open')
    this.SwitcherService.emitChange(false);
  }
}
