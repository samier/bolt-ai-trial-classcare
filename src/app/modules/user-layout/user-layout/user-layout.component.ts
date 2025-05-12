import { Component, HostListener, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/core/services/loader-service';
import { SwitcherService } from 'src/app/shared/services/switcher.service';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.scss']
})
export class UserLayoutComponent implements OnInit {

  constructor(public SwitcherService : SwitcherService,private loaderService: LoaderService) { }
  // app-notification-sidebar
  
  ngOnInit(): void {
    this.loaderService.setLoading(false);
  }
  

  ngOnDestroy(){
    location.reload()
  }
  
  mainSidebarOpen: any;
  hoverEffect($event:any) {
    this.mainSidebarOpen = $event.type == 'mouseover' ? 'sidenav-toggled-open' : '';
  }

  clickOnBody(){
    this.SwitcherService.emitChange(false);
    
  }

  scrolled: boolean = false;


  @HostListener('window:resize', [])
  onWindowScroll() {
    this.scrolled = window.matchMedia("(max-width: 991px)").matches;
  }

}
