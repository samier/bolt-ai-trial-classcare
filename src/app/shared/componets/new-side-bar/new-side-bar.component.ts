import { Component, OnDestroy, OnInit } from '@angular/core';
import { filter, Subject } from 'rxjs';
import { SideNavService } from '../../services/side-nav.service';
import { NavigationEnd, Router } from '@angular/router';
import { NavService } from '../../services/nav.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-new-side-bar',
  templateUrl: './new-side-bar.component.html',
  styleUrls: ['./new-side-bar.component.scss']
})
export class NewSideBarComponent implements OnInit {
  //#region Public | Private Variables

  isCollapes : boolean = true
  prevCollapes : boolean = false
  openedByHover: boolean = false;

  toggleSubmenu(menuItem: any) {
    menuItem.active = !menuItem.active
  }

  $destroy: Subject<void> = new Subject<void>();
  menuItems: any;
  moduleName: any;
  sideMenu: any;
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    private sideNavService: SideNavService,
    private router: Router,
    private navService: NavService,
    private sanitizer: DomSanitizer
  ) {
    this.sideNavService.fetchModules().then(data => {
      this.sideNavService.setModules(data.data)
    });
  }
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.sideNavService.getBulkDiscountPermission(); 
    this.menuItems = this.navService.getMenuItems();
    setTimeout(() => this.handleRouteChange(this.router.url))
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.handleRouteChange(event.url)
    });
    this.sideNavService.systemSetting('student_otp_sms_settings'); 
    
    this.sideNavService.selectedCategories$.subscribe(categories => {
      this.moduleName = categories;
      let target = document.querySelector('.page');
      if(this.moduleName?.length > 0 && sessionStorage?.getItem('hor_verti_menu')){
        target?.classList?.add('vertical-menu-close'); 
      }else{
        target?.classList?.remove('vertical-menu-close');
        target?.classList?.remove('vertical-menu-open');
        this.isCollapes = true
      }
    });
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  prepareSideMenu(currentPath?: any){
    this.sideMenu = this.sideNavService.getSideMenuItems(this.moduleName);
    const previousState = this.sideMenu?.children?.reduce((acc, menu) => {
      acc[menu.title] = menu.children?.some(child => {
        const fixedPath = child.path.replace(/\/+/g, "/");
        return fixedPath == currentPath ? true : false
      }
    );
    return acc;
    }, {} as Record<string, boolean>);

    this.sideMenu.children?.forEach(menu => {
        if (menu.children) {
          menu.active = previousState?.[menu.title] || false;
        }
    });
  }
  
  //#endregion Public methods
  
  handleHover(enter: boolean) {
    if (enter && this.isCollapes) {
      this.openedByHover = true;
      this.isCollapes = false; // Open menu
    } 
    else if (!enter && this.openedByHover) {
      this.isCollapes = true;  // Collapse only if it was opened by hover
      this.openedByHover = false;
    }
  }

  handleOpenClose(event: Event) {
    event.stopPropagation(); // Prevent parent event from triggering
    this.isCollapes = !this.isCollapes; // Toggle menu
    let target = document.querySelector('.page');
    if(this.isCollapes){
      target?.classList?.remove('vertical-menu-open'); 
      target?.classList?.add('vertical-menu-close'); 
    }else{
      target?.classList?.remove('vertical-menu-close'); 
      target?.classList?.add('vertical-menu-open');
    }
    this.openedByHover = false; // Reset hover state
  }

  sanitizeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg) ?? '';
  }

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  private extractRelatedModule(path: string) {
    let relatedTo: string[] = [];
    
    for (let mainItem of this.menuItems) {
      for (let subItem of mainItem.children || []) {
        for (let linkItem of subItem.children || []) {
          let fixedPath = linkItem.path.replace(/\/+/g, "/");
          if (fixedPath == path && linkItem.relatedTo) {
            // relatedTo = [...new Set([...relatedTo, ...linkItem.relatedTo])]; // Merge and remove duplicates
            relatedTo = linkItem.relatedTo
          }
        }
      }
    }

    this.sideNavService.setSelectedCategories(relatedTo);
  }

  handleRouteChange(url: any){
    const pathParts = url.split('?')[0].split('/').slice();
    if (pathParts.length > 0 &&  (/^[A-Z0-9]*\d[A-Z0-9]*$/i.test(pathParts.at(-1)!) || /^\d{4}-\d{1,2}-\d{1,2}$/.test(pathParts.at(-1)!)) && !pathParts.find(item => item == 'system'||  item == 'notification' )) {
      pathParts.pop(); 
    }
    const modifiedCurrentPath = pathParts.join('/')
    this.extractRelatedModule(modifiedCurrentPath);
    this.prepareSideMenu(modifiedCurrentPath);
  }

  //#endregion Private methods
}