import { Component, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SwitcherService } from 'src/app/shared/services/switcher.service';
import { SharedUserService } from '../../componets/header/shared-user.service';

@Component({
  selector: 'app-full-layout',
  templateUrl: './full-layout.component.html',
  styleUrls: ['./full-layout.component.scss']
})

export class FullLayoutComponent implements OnInit {

  isDashboard : boolean = false
  checkTimeInterval: any;
  subscriptionData : any
  @ViewChild('subscriptionModelBtn', { static: true }) subscriptionModelBtn!: ElementRef<HTMLButtonElement>;
  isSubscriptionRole = localStorage?.getItem('role')?.includes('ROLE_ADMIN') || localStorage?.getItem('role')?.includes('ROLE_BRANCH_ADMIN')


  constructor(public SwitcherService : SwitcherService,
    private router : Router,
    private _modalService: NgbModal,
    public _sharedUserService: SharedUserService,
  ) {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('dashboard')) {
          this.isDashboard = true
        } else {
          this.isDashboard = false
        }
      }
  });
   }
  // app-notification-sidebar
  
  ngOnInit(): void {
    this._sharedUserService.subscriptionDetails$.subscribe((res)=> {
      if(res && res?.message && this.isSubscriptionRole) {
        this.subscriptionData = res
        this.checkTimeInterval = setInterval(() => this.checkTimeAndOpenModal(), 60000); // 60000 ms = 1 minute
      }
    });

    this._sharedUserService.isLoginCheck$.subscribe((res)=>{
      if(res) {
        this._sharedUserService.getSubscriptionDetails().subscribe((resp:any)=>{
          this.subscriptionData = resp.institute
          if(this.subscriptionData && this.subscriptionData?.message && this.isSubscriptionRole) {
           this.modalOpenOnTime()
          }
        })
      }
    });

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

  closeModel() {
    this._modalService.dismissAll();
  }

  openModal(modalName) {
    this._modalService.open(modalName);
  }

  modalOpenOnTime() {
    this.subscriptionModelBtn.nativeElement.click();
  }

  checkTimeAndOpenModal(): void {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    // Check if it's 10:00 AM (10:00)
    if (currentHour === 10 && currentMinute === 0) {
      this.modalOpenOnTime ()
    }
  }

}
