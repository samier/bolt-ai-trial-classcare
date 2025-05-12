import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { fromEvent } from 'rxjs';
import { Menu, NavService } from '../../services/nav.service';
import { checkHoriMenu, parentNavActive, switcherArrowFn } from './sidemenu';
import { StudentLeavingCertificateService } from 'src/app/modules/student-leaving-certificate/student-leaving-certificate.service';
import { enviroment } from 'src/environments/environment.staging';
import { HttpClient } from '@angular/common/http';
import { URLConstants } from '../../constants/routerLink-constants';
import { CommonService } from 'src/app/core/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuickSearchModalComponent } from './quick-search-modal/quick-search-modal.component';
import { KeyboardShortcutService } from 'src/app/service/keyboard-shortcut.service';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss']
})

export class SidemenuComponent implements OnInit {
  public menuItems!: any[];
  public url: any;
  public windowSubscribe$!: any;
  public branch_detail: any;
  URLConstants = URLConstants;
  symfonyHost = enviroment.symfonyHost;
  private API_URL = enviroment.apiUrl;

  public branchList:any = [];
  constructor(
    private router: Router,
    private navServices: NavService,
    public elRef: ElementRef,
    private breakpointObserver: BreakpointObserver,
    public studentLeavingCertificateService: StudentLeavingCertificateService,
    private httpRequest: HttpClient,
    public CommonService: CommonService,
    private _modalService : NgbModal,
    private shortCutService: KeyboardShortcutService
  ) {
  }
  // To set Active on Load
  checkNavActiveOnLoad() {
    this.navServices.fetchModules().then(data => {
      this.navServices.setModules(data.data);
      if(window.localStorage.getItem("branch")){
        this.studentLeavingCertificateService.getBranchDetail().subscribe((res:any) => {  
          this.branch_detail = res.data;
        });
      }
      const menuItems = this.navServices.getMenuItems();
      this.menuItems = menuItems;
      checkHoriMenu();
      this.router.events.subscribe((event: any) => {
        if (event instanceof NavigationStart) {
          let path = location.pathname.split('/');
          let eventUrl = event.url.split('/');
          if (path[path.length - 2] !== eventUrl[eventUrl.length - 2]) {
            // this.closeNavActive(); // [Was fire to close the nav but it was not working so i have commentted it to close the DD]
            let sidelink = document.querySelectorAll('.nav-link.active');
            let sidemenuUl = document.querySelector('.nav-item.active');
            let sidemenuul = document.querySelectorAll('.nav-sub-link.sub-with-sub');
            let subSidemenuUl = document.querySelector('.nav-item.active');
            let subSidemenu = document.querySelectorAll('.nav-sub-link.sub-with-sub');
            sidemenuUl?.classList.remove('active');
            subSidemenuUl?.classList.remove('active');
            sidelink.forEach((e) => e.classList.remove('active'));
            sidemenuul.forEach((e) => e.classList.remove('active'));
            subSidemenu.forEach((e) => e.classList.remove('active'));
          }
        }else if (event instanceof NavigationEnd) {
          menuItems.filter((items: any) => {
            if (items.path === event.url) {
              this.setNavActive(items);
            }
            if (!items.children) {
              return false;
            }
            items.children.filter((subItems: any) => {
              if (subItems.path === event.url) {
                this.setNavActive(subItems);
              }
              if (!subItems.children) {
                return false;
              }
              subItems.children.filter((subSubItems: any) => {
                if (subSubItems.path === event.url) {
                  this.setNavActive(subSubItems);
                }
                if (!subSubItems.children) {
                  return false;
                }
                subSubItems?.children.filter((subSubItems1: any) => {
                  if (subSubItems1.path === event.url) {
                    this.setNavActive(subSubItems1);
                  }
                  if (!subSubItems1.children) {
                    return false;
                  }
                  return;
                });
                return;
              });
              return;
            });
            return;
          });
          setTimeout(() => {
            if (
              document.querySelector('body')?.classList.contains('horizontal-hover') && window.innerWidth > 992
            ) {
              this.closeNavActive();
              setTimeout(() => {
                parentNavActive();
              }, 0);
            } else {
              parentNavActive();
            }
          }, 200);
        } else
        {
          this.closeNavActive();
        }
      });
    })
    .catch(error => {
      console.error('An error occurred:', error);
    });
  }

  checkCurrentActive() {
    const menuItems = this.navServices.getMenuItems();
      this.menuItems = menuItems;
      let currentUrl = this.router.url;
      menuItems.filter((items: any) => {
        if (items.path === currentUrl) {
          this.setNavActive(items);
        }
        if (!items.children) {
          return false;
        }
        items.children.filter((subItems: any) => {
          if (subItems.path === currentUrl) {
            this.setNavActive(subItems);
          }
          if (!subItems.children) {
            return false;
          }
          subItems.children.filter((subSubItems: any) => {
            if (subSubItems.path === currentUrl) {
              this.setNavActive(subSubItems);
            }
          });
          return;
        });
        return;
      });
  }
  //Active Nav State
  setNavActive(item: any) {
    this.menuItems.filter((menuItem) => {
      if (menuItem !== item) {
        menuItem.active = false;
        this.navServices.collapseSidebar = false;
      }
      if (menuItem.children && menuItem.children.includes(item)) {
        menuItem.active = false; // [Was set to true If item has childern but now i have set it to false to close the DD]
      }
      if (menuItem.children) {
        menuItem.children.filter((submenuItems) => {
          if (submenuItems.children && submenuItems.children.includes(item)) {
            menuItem.active = true;
            submenuItems.active = true;
          }
          if (submenuItems.children) {
            submenuItems.children.forEach((subsubmenuItems) => {
              if (
                subsubmenuItems.children &&
                subsubmenuItems.children.includes(item)
              ) {
                menuItem.active = true;
                submenuItems.active = true;
                subsubmenuItems.active = true;
              }
            });
          }
        });
      }
    });
    this.closeNavActive();
  }

  // Toggle menu
  toggleNavActive(item: any) {
    if (!item.active) {
      this.menuItems.forEach((a: any) => {
        if (this.menuItems.includes(item)) {
          a.active = false;
        }
        if (!a.children) {
          return false;
        }
        a.children.forEach((b: any) => {
          if (a.children.includes(item)) {
            b.active = false;
          }
          if (!b.children) {
            return false;
          }
          b.children.forEach((c: any) => {
            if (b.children.includes(item)) {
              c.active = false;
            }
            if (!c.children) {
              return false;
            }
            return;
          });
          return;
        });
        return;
      });
    }
    item.active = !item.active;
  }

  // Close Nav menu
  closeNavActive() {
    if(this.menuItems != undefined)
    this.menuItems.forEach((a: any) => {
      if (this.menuItems) {
        a.active = false;
      }
      if (!a.children) {
        return false;
      }
      a.children.forEach((b: any) => {
        if (a.children) {
          b.active = false;
        }
      });
      return;
    });
  }

  ngOnInit(): void {
    this.getBranchList();
    // this.CommonService.fetchPermissions();
    this.navServices.getBulkDiscountPermission();  
    this.navServices.systemSetting('student_otp_sms_settings');  
    this.checkNavActiveOnLoad();
    
    switcherArrowFn();

    fromEvent(window, 'resize').subscribe(() => {
      if (window.innerWidth >= 992) {
        document.querySelector('body.horizontal')?.classList.remove('sidenav-toggled');}
      if (document.querySelector('body')?.classList.contains('horizontal-hover') && window.innerWidth > 992) {
        let li = document.querySelectorAll('.side-menu li');
        li.forEach((e, i) => {
          e.classList.remove('is-expanded');
        });
        let ul = document.querySelectorAll('.side-menu ul');
        li.forEach((e, i) => {
          e.classList.remove('open');
        });
      }
    });

    // detect screen size changes
    this.breakpointObserver.observe(['(max-width: 991px)']).subscribe((result: BreakpointState) => {
        if (result.matches) {
          // small screen
          this.checkCurrentActive();
        } else {
          // large screen
          document.querySelector('body.horizontal')?.classList.remove('sidenav-toggled');
          if (document.querySelector('.horizontal:not(.horizontal-hover)')) {
            this.closeNavActive();
            setTimeout(() => {
              parentNavActive();
            }, 100);
          }
        }
      });

    let vertical: any = document.querySelectorAll('#myonoffswitch01');
    let horizontal: any = document.querySelectorAll('#myonoffswitch02');
    let horizontalHover: any = document.querySelectorAll('#myonoffswitch03');
    fromEvent(vertical, 'click').subscribe(() => {
      this.checkCurrentActive();
    });
    fromEvent(horizontal, 'click').subscribe(() => {
      this.closeNavActive();
    });
    fromEvent(horizontalHover, 'click').subscribe(() => {
      this.closeNavActive();
    });

    const WindowResize = fromEvent(window, 'resize');
    // subscribing the Observable
    this.windowSubscribe$ = WindowResize.subscribe(() => {
      checkHoriMenu();
    });

    let maincontent: any = document.querySelectorAll('.main-content');
    fromEvent(maincontent, 'click').subscribe(() => {
      if (document.querySelector('body')?.classList.contains('horizontal')) {
        this.closeNavActive();
        
        setTimeout(()=>{parentNavActive()}, 100)
      }
    });

    this.captureKeyboardEvent();
  }

  getBranchList(){
    this.httpRequest.get(this.API_URL + 'api/get-branch-list/'+localStorage.getItem('user_id')).subscribe((res: any) => {
      this.branchList = res.data;
    });
  }

  handleBranchChange(event:any){
    // window.location.href = this.symfonyHost+event+'/dashboard'
    window.location.href = this.symfonyHost+'app/'+event+'/dashboard'
    localStorage.setItem('branch',event);
  }

  scrolled: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 64;
  }

  ngOnDestroy() {
    // unsubscribing the Observable
    this.windowSubscribe$.unsubscribe();
    this.shortCutService.unsubscribeAll();
  }

  setsymfonyUrl(url:string) {
    return enviroment.symfonyHost+url;
  }

  navigateWithParams(url:any, params:string){
    this.router.navigate([url],{ queryParams: { isDefaultTemplate:params}})
  }
  
  getChildrens(childrens:any){
    return childrens?.filter((item:any)=>{
      return item.show;
    })
  }

  clear() {
    localStorage.clear();
    sessionStorage.clear();
  }

  openQuickSearchModal(){
    const modalRef = this._modalService.open(QuickSearchModalComponent,{
      centered: true,
      // backdrop: 'static',
      windowClass: 'duplicate-modal-section quick-search',
      backdropClass: 'duplicate-modal-backdrop'
    });
  }

  captureKeyboardEvent(){
    this.shortCutService.onShortcut('alt+q', () => {
      const isQuickModal = document.querySelector('.quick-search');
      if (isQuickModal) {
        this._modalService.dismissAll();
      } else {
        this._modalService.dismissAll();
        setTimeout(() => {
          if (!this._modalService.hasOpenModals()) {
            this.openQuickSearchModal();
          }
        }, 10);
      }
    });
  }
}
