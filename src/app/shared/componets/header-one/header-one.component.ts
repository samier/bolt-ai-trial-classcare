import { Component, OnInit } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { Subscription } from 'rxjs';
import { NavService } from '../../services/nav.service';
import { SidebarRightService } from '../../services/sidebar-right.service';
import { SwitcherService } from '../../services/switcher.service';

@Component({
  selector: 'app-header-one',
  templateUrl: './header-one.component.html',
  styleUrls: ['./header-one.component.scss']
})
export class HeaderOneComponent implements OnInit {

  layoutSubscription: Subscription;
  public isCollapsed = true;

  constructor(
    private sidebarRightservice: SidebarRightService,
    public navServices: NavService,
    public SwitcherService: SwitcherService,
  ) {
    this.layoutSubscription = sidebarRightservice.changeEmitted.subscribe(
      direction => {
        const dir = direction.direction;

      }
    )
  }

  ngOnInit(): void {
    let navbarForm:any = document.querySelector('.navbar-form')
    navbarForm.addEventListener('click',(event:any)=>{
      event.preventDefault();
      return;
    }, {passive: false})
  }

  toggleSwitcher() {
    this.SwitcherService.emitChange(true);
  }

  toggleSidebarNotification() {
    this.sidebarRightservice.emitSidebarNotifyChange(true);
  }
  toggleSidebarOpen(){
    if ((this.navServices.collapseSidebar = true)) {
      let mainBody:any = document.querySelector('.main-body')
      mainBody.classList.add('sidenav-toggled');
    }
  }
  toggleSidebarClose(){
    if ((this.navServices.collapseSidebar = true)) {
      let removeMainBody:any = document.querySelector('.main-body')
      removeMainBody.classList.remove('sidenav-toggled');
    }
  }

  search(){
    let navabarForm:any = document.querySelector('.navbar-form ')
    navabarForm.classList.toggle('d-none')
  }
  close(){
    let navbarD:any = document.querySelector('.navbar-form ')
    navbarD.classList.add('d-none')
  }

  ngAfterViewInit(){
    
    const chat:any = document.querySelector('.chat-scroll');
    let ps1 = new PerfectScrollbar(chat,{
      wheelPropagation: false,
      wheelSpeed :2,
      suppressScrollX:true
    });

    const notification:any  = document.querySelector('.Notification-scroll');
    let ps2 = new PerfectScrollbar(notification,{
      wheelPropagation: false,
      wheelSpeed :2,
      suppressScrollX:true
    });
  }

  SearchActive = "Notactive" 
  searchClass(item:any){
    // this.SearchActive=="nonactive"? "active":"nonactive"
    console.log(item);
    if (item=="active") {
      this.SearchActive = "active"
    }
    if (item=="Notactive") {
      this.SearchActive = "Notactive"
    }
  }


}
