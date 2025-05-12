import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject, TemplateRef, ChangeDetectorRef } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { Subscription } from 'rxjs';
import { NavService } from '../../services/nav.service';
import { SidebarRightService } from '../../services/sidebar-right.service';
import { SwitcherService } from '../../services/switcher.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { RouterModule, Routes, Router, ActivatedRoute } from '@angular/router';
import { enviroment } from '../../../../environments/environment.staging';
import { HttpClient } from '@angular/common/http';
import { LeaveManagmentService } from 'src/app/modules/leave-management/leave-managment.service';
import { StudentLeavingCertificateService } from 'src/app/modules/student-leaving-certificate/student-leaving-certificate.service';
import { SharedUserService } from './shared-user.service';
import { ChatService } from 'src/app/modules/chat/chat.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalSearchComponent } from '../global-search/global-search.component';
import { DateFormatService } from 'src/app/service/date-format.service';
import { CommonService } from 'src/app/core/services/common.service';
import { KeyboardShortcutService } from 'src/app/service/keyboard-shortcut.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, AfterViewInit {
  layoutSubscription: Subscription | undefined;
  public isCollapsed = true;
  public is_student = window.localStorage?.getItem('role')?.includes('STUDENT');
  public branch_id;
  yearselected:any
  yearList:any =[]
  searching = false;
  focusOnList = true;
  searchBar = '';
  timer:any = 0;
  student:any = [];
  URLConstants = URLConstants;
  symfonyHost = enviroment.symfonyHost;
  private API_URL = enviroment.apiUrl;
  public studentDetails = ('; ' + document.cookie)
    ?.split(`; studentDetails=`)
    ?.pop()
    ?.split(';')[0]
    .split('%7C');
  public studentDetail: any = {};
  public institute_modules: any = [];
  public branch_detail: any;
  public profile_image: any = null;
  public user: any = null;
  public acedemicYear = ('; '+document.cookie)?.split(`; acedemicYear=`)?.pop()?.split(';')[0].split('%2C');
  public branchAcedemicYear:any = {};
  public branchName:any = {};
  public attendanceType:any = {};
  public el:any = [];
  public notification:any = [];
  public sMSRemain: any = ('; '+document.cookie)?.split(`; SMSRemain=`)?.pop()?.split(';')[0];
  branchList:any = [];
  currentYear_id:any = Number(('; '+document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]);
  isSubscriptionRole = localStorage?.getItem('role')?.includes('ROLE_ADMIN') || localStorage?.getItem('role')?.includes('ROLE_BRANCH_ADMIN')
  public is_admin   = window.localStorage?.getItem("role")?.includes('ROLE_ADMIN');
  dateFormate = 'DD-MM-YYYY'

  private modalService = inject(NgbModal);
  yearRefreshObserver: any;

  constructor(
    private sidebarRightservice: SidebarRightService,
    public navServices: NavService,
    public studentLeavingCertificateService: StudentLeavingCertificateService,
    public SwitcherService: SwitcherService,
    public router: Router,
    public ActivatedRoute: ActivatedRoute,
    private httpRequest: HttpClient,
    private leaveManagementSerivce: LeaveManagmentService,
    public SharedUserService: SharedUserService,
    private _router : Router,
    private _dateFormateService : DateFormatService,
    private changeDetectorRef: ChangeDetectorRef,
    public CommonService: CommonService,
    private shortCutService: KeyboardShortcutService
  ) {
    this.initConstructor()
    // this.layoutSubscription = sidebarRightservice.changeEmitted.subscribe(
    //   (direction) => {
    //     const dir = direction.direction;
    //   }
    // );

    // if (!this.is_student) {
    //   this.getPrmission();
    //   this.httpRequest
    //     .post(this.API_URL + 'api/me', {})
    //     .subscribe((res: any) => {
    //       this.user = res;
    //       this.SharedUserService.user = res;
    //       if(res?.dateFormat)
    //       {
    //         this.dateFormate = res.dateFormat
    //         this._dateFormateService.setFormat(res.dateFormat);
    //       }
    //       if(res?.institute) {
    //         this.SharedUserService.subscriptionDetails.next(res?.institute)
    //       }
    //       localStorage.setItem('user_id', res.id)
    //     });
    // }

    // this.studentDetails?.map((row) => {
    //   const key = row.split('%3D')[0];
    //   const value = row.split('%3D')[1];
    //   Object.assign(this.studentDetail, { [key]: value });
    // });
    // this.httpRequest
    //   .get(this.API_URL + 'api/get-institute-modules')
    //   .subscribe((res: any) => {
    //     this.institute_modules = res.data;
    //   });
    // let role = window.localStorage.getItem('role');
    // if (role == 'STUDENT') {
    //   this.leaveManagementSerivce
    //     .getStudentProfileDetail(this.studentDetail['studentid'] ?? 0)
    //     .subscribe((resp: any) => {
    //       if(resp.status == false){
    //         // location.replace(this.setsymfonyUrl('dashboard'));
    //         this.router.navigate([this.setUrl(URLConstants.DASHBOARD)]);
    //       }
    //       this.user = resp
    //       this.profile_image = resp.image;
    //     });
    // }
    // this.acedemicYear?.map(row=>{
    //   const branch = Number(row.split('%3A')[0]);
    //   const year = row.split('%3A')[1];
    //   const name = row.split('%3A')[2];
    //   const atType = row.split('%3A')[3];
    //   Object.assign(this.branchAcedemicYear, {[branch] : year});
    //   Object.assign(this.branchName, {[branch] : name});
    //   Object.assign(this.attendanceType, {[branch] : atType});
    // });
  }
  async initConstructor() {
    this.layoutSubscription = this.sidebarRightservice.changeEmitted.subscribe(
      (direction) => {
        const dir = direction.direction;
      }
    );
    await this.instituteSet()

    if (!this.is_student) {
      await this.getPrmission();
      this.httpRequest
        .post(this.API_URL + 'api/me', {})
        .subscribe((res: any) => {
          this.user = res;
          this.SharedUserService.user = res;
          if(res?.dateFormat) {
            this.dateFormate = res.dateFormat
            this._dateFormateService.setFormat(res.dateFormat);
          }
          if(res?.institute) {
            this.SharedUserService.subscriptionDetails.next(res?.institute)
          }
          localStorage.setItem('user_id', res.id)
          localStorage.setItem('me', JSON.stringify(res))
        });
    }

    this.studentDetails?.map((row) => {
      const key = row.split('%3D')[0];
      const value = row.split('%3D')[1];
      Object.assign(this.studentDetail, { [key]: value });
    });
    
    let role = window.localStorage.getItem('role');
    if (role == 'STUDENT') {
      this.leaveManagementSerivce
        .getStudentProfileDetail(this.studentDetail['studentid'] ?? 0)
        .subscribe((resp: any) => {
          if(resp.status == false){
            // location.replace(this.setsymfonyUrl('dashboard'));
            this.router.navigate([this.setUrl(URLConstants.DASHBOARD)]);
          }
          this.user = resp
          this.profile_image = resp.image;
        });
    }
    this.acedemicYear?.map(row=>{
      const branch = Number(row.split('%3A')[0]);
      const year = row.split('%3A')[1];
      const name = row.split('%3A')[2];
      const atType = row.split('%3A')[3];
      Object.assign(this.branchAcedemicYear, {[branch] : year});
      Object.assign(this.branchName, {[branch] : name});
      Object.assign(this.attendanceType, {[branch] : atType});
    });
  }

  currentYear(){
    const branch = window.localStorage.getItem("branch");
    if(branch != null){
      return this.branchAcedemicYear[branch];
    }
    return '2022-2023'
  }

  roles:any = [];

  ngOnInit(): void {
    // const urlSegments = this.router.parseUrl(this.router.url).root.children['primary'].segments;
    this.roles = window.localStorage.getItem('role');
    this.roles = this.roles.split(',')
    // this.branch_id = urlSegments[0].path;
    this.getBranchList();
    // let navbarForm:any = document.querySelector('.navbar-form')
    // navbarForm.addEventListener('click',(event:any)=>{
    //   event.preventDefault();
    //   return;
    // }, {passive: false})

    let branch = window.localStorage.getItem('branch');
    if (branch) {
      this.studentLeavingCertificateService
        .getBranchDetail()
        .subscribe((res: any) => {
          this.branch_detail = res.data;
        });
    }

    this.getAcadamicList(
      {
        current_branch_id : [branch]
      }
    )

    const academic_year_id =  JSON.stringify(this.currentYear_id)
    sessionStorage.setItem('academic_year_id',academic_year_id);

    this.yearRefreshObserver = this.CommonService.refreshYearDropdown$.subscribe(() => {
      this.getAcadamicList(
        {
          current_branch_id : [branch]
        }
      )
    });

    this.captureKeyboardEvent();
  }

  ngOnDestroy(){
    this.yearRefreshObserver.unsubscribe();
    this.shortCutService.unsubscribeAll();
  }


  getAcadamicList(param: any) {
    this.SharedUserService.getAcadamicYearList(param).subscribe((res: any) => {
      if (res.status) {
        this.yearList = res.data
        const isYearChnage = this.yearList.find((ele)=> ele.id == this.currentYear_id);
        if (!isYearChnage) {
          this.currentYear_id = this.yearList.find((ele)=> ele.current == 1).id
          document.cookie = `academic_year_id=${this.currentYear_id}; expires=0; path=/`;
          const academic_year_id = JSON.stringify(this.currentYear_id);
          sessionStorage.setItem('academic_year_id', academic_year_id);
          localStorage.setItem('acedemicYear',JSON.stringify(this.yearList.find((ele)=> ele.current == 1)));
        }else{
          localStorage.setItem('acedemicYear',JSON.stringify(isYearChnage));
        }
      }
    });
  }

  yearChanged(){
    if (this.currentYear_id) {
      var expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 1);
      document.cookie = `academic_year_id=${this.currentYear_id}; expires=0; path=/`;
      const currentYear:any = ('; '+document.cookie)?.split(`; academic_year_id= `)?.pop()?.split(';')[0];
      const academic_year_id = JSON.stringify(this.currentYear_id);
      sessionStorage.setItem('academic_year_id', academic_year_id);
      localStorage.setItem('acedemicYear',JSON.stringify(this.yearList.find((ele)=> ele.id == this.currentYear_id)));    
      location.reload();
    }
  }

  updateSwitcher(value:any){
    this.httpRequest.post(this.API_URL+'api/switcher-menu/update', value).subscribe();
  }

  toggleSwitcher() {
    this.SwitcherService.emitChange(true);
  }

  toggleSidebarNotification() {
    this.sidebarRightservice.emitSidebarNotifyChange(true);
  }
  toggleSidebarOpen() {
    if ((this.navServices.collapseSidebar = true)) {
      let mainBody: any = document.querySelector('.main-body');
      mainBody.classList.add('sidenav-toggled');
      mainBody.classList.add('sidebar-gone');
      mainBody.classList.add('sidebar-mini');
    }
  }
  toggleSidebarClose() {
    if ((this.navServices.collapseSidebar = true)) {
      let removeMainBody: any = document.querySelector('.main-body');
      removeMainBody.classList.remove('sidenav-toggled');
    }
  }

  search() {
    let navabarForm: any = document.querySelector('.navbar-form ');
    navabarForm.classList.toggle('d-none');
  }
  close() {
    let navbarD: any = document.querySelector('.navbar-form ');
    navbarD.classList.add('d-none');
  }

  ngAfterViewInit() {
    const chat: any = document.querySelector('.chat-scroll');
    if (chat) {
      let ps1 = new PerfectScrollbar(chat, {
        wheelPropagation: false,
        wheelSpeed: 2,
        suppressScrollX: true,
      });
    }

    const notification: any = document.querySelector('.Notification-scroll');
    if (notification) {
      let ps2 = new PerfectScrollbar(notification, {
        wheelPropagation: false,
        wheelSpeed: 2,
        suppressScrollX: true,
      });
    }
  }

  SearchActive = 'Notactive';
  searchClass(item: any) {
    // this.SearchActive=="nonactive"? "active":"nonactive"
    console.log(item);
    if (item == 'active') {
      this.SearchActive = 'active';
    }
    if (item == 'Notactive') {
      this.SearchActive = 'Notactive';
    }
  }

  getStudent(key: string) {
    return this.studentDetail[key] ?? '-';
  }

  getInstituteModule(module_name: string) {
    return this.institute_modules.includes(module_name);
  }

  stringDecode(string: string) {
    return string.replace(/\+/gi, ' ');
  }

  getProfile()
  {
    let role  = window.localStorage.getItem('role');
    let image = this.user?.profile;
    if (role == 'STUDENT') {
        image = this.profile_image;
    }
    return image;
  }
  decodeURL(text: any) {
    return decodeURI(text);
  }
  setsymfonyUrl(url: string) {
    return this.symfonyHost + url;
  }

  getBranchList(){
    const is_admin = window.localStorage?.getItem('role')?.includes('ROLE_ADMIN');

    if(is_admin){
      this.httpRequest.get(this.API_URL + 'api/get-branch-list').subscribe((res: any) => {
        this.branchList = res.data;
      });
    }else{
      this.httpRequest.get(this.API_URL + 'api/get-branch-list/'+localStorage.getItem('user_id')).subscribe((res: any) => {
        this.branchList = res.data;
      });
    }
  }

  handleBranchChange(event:any){
    window.location.href = this.symfonyHost+'app/'+event+'/dashboard'
    // window.location.href = `http://localhost:4200/app/${event}/dashboard`  // This one is for local testing 
    localStorage.setItem('branch',event);
    // document.cookie = `current_branch_id=${event}; expires=0; path=/`;
    // const url = `/${event}/dashboard`;
    // this._router.navigate([url])
    // window.location.reload();
  }

  toggleTheme() {
    let theme;
    let body = document.querySelector('body');
    if (body?.classList.contains('dark-theme')) {
      theme = 'light';
    } else {
      theme = 'dark';
    }
    if (theme == 'light') {
      sessionStorage.setItem('light_menu', 'true');
      sessionStorage.removeItem('color_menu');
      sessionStorage.removeItem('dark_menu');
      sessionStorage.removeItem('gradient_menu');

      sessionStorage.setItem('light_header', 'true');
      sessionStorage.removeItem('color_header');
      sessionStorage.removeItem('dark_header');
      sessionStorage.removeItem('gradient_header');

      body?.classList.add('light-theme');
      sessionStorage.setItem('light_theme', 'true');
      // remove
      sessionStorage.removeItem('dark_theme');
      body?.classList.remove('dark-theme');
      body?.classList.remove('transparent-theme');
      body?.classList.remove('bg-img1');
      body?.classList.remove('bg-img2');
      body?.classList.remove('bg-img3');
      body?.classList.remove('bg-img4');
      body?.classList.remove('light-header');
      body?.classList.remove('color-header');
      body?.classList.remove('gradient-header');
      body?.classList.remove('dark-header');
      body?.classList.remove('light-menu');
      body?.classList.remove('color-menu');
      body?.classList.remove('dark-menu');
      body?.classList.remove('gradient-menu');
      let lightMenu: any = document.querySelector('#myonoffswitch3');
      lightMenu.checked = true;
      let lightHeader: any = document.querySelector('#myonoffswitch6');
      lightHeader.checked = true;
      let light: any = document.querySelector('#myonoffswitch1');
      light.checked = true;
      this.updateSwitcher({light_theme: true, dark_theme: false, light_menu: true, color_menu: false, dark_menu: false, gradient_menu: false, light_header: true, color_header: false, dark_header: false, gradient_header: false})
    } else if (theme == 'dark') {
      sessionStorage.setItem('dark_menu', 'true');
      sessionStorage.removeItem('light_menu');
      sessionStorage.removeItem('color_menu');
      sessionStorage.removeItem('gradient_menu');

      sessionStorage.setItem('dark_header', 'true');
      sessionStorage.removeItem('color_header');
      sessionStorage.removeItem('light_header');
      sessionStorage.removeItem('gradient_header');

      body?.classList.add('dark-theme');

      // sessionStorage.setItem('dark_theme', 'true');
      // remove
      sessionStorage.removeItem('light_theme');
      sessionStorage.removeItem('valexTransparentTheme');
      body?.classList.remove('light-theme');
      body?.classList.remove('transparent-theme');
      body?.classList.remove('bg-img1');
      body?.classList.remove('bg-img2');
      body?.classList.remove('bg-img3');
      body?.classList.remove('bg-img4');
      body?.classList.remove('light-header');
      body?.classList.remove('color-header');
      body?.classList.remove('gradient-header');
      body?.classList.remove('dark-header');
      body?.classList.remove('light-menu');
      body?.classList.remove('color-menu');
      body?.classList.remove('dark-menu');
      body?.classList.remove('gradient-menu');
      let darkMenu: any = document.querySelector('#myonoffswitch5');
      darkMenu.checked = true;
      let darkHeader: any = document.querySelector('#myonoffswitch8');
      darkHeader.checked = true;
      let dark: any = document.querySelector('#myonoffswitch2');
      dark.checked = true;
      this.updateSwitcher({light_theme: false, dark_theme: true, light_menu: false, color_menu: false, dark_menu: true, gradient_menu: false, light_header: false, color_header: false, dark_header: true, gradient_header: false})
    }
  }
  redirectToWebBuilder(){
    this.httpRequest
    .post(this.API_URL + 'api/email', {})
    .subscribe((res: any) => {
			window.location.href = res
    });
  }

  onSearch = () => {
    clearTimeout(this.timer);
    this.timer = setTimeout(async() => {
        this.searchStudent();
    }, 500);
};

searchStudent(input? : null){
  this.SharedUserService.searchStudent({input: this.searchBar != '' ? this.searchBar : input}).subscribe((resp:any) => {
      this.student = resp.data;
  })

}
setsymfonyUrlForStudent(url:string,id:any) {
  return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url+'/'+id;
}

onYearChange(event: any) {
  if (event === null) {
    this.currentYear_id = Number(('; '+document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]) || null; // Set a default value or handle the null case
  }
}

setUrl(url:string) {
  return url;
}

userList(){
  this.router.navigate([this.setUrl(URLConstants.ADMIN_USER_LIST)]);
}

  clear() {
    localStorage.clear();
    sessionStorage.clear();
  }

  openXl() {
    const modalRef = this.modalService.open(GlobalSearchComponent, {
      windowClass: 'global-search'
    });
    modalRef.componentInstance.branchList = this.branchList;
    modalRef.componentInstance.academicYearList = this.yearList?.map(ylist => ({ ...ylist, branchName: this.branch_detail?.branchName }));
  }

  async instituteSet(){
    const response: any = await this.httpRequest.get(enviroment.apiUrl + 'api/get-institute-modules').toPromise();
    this.institute_modules = response.data;
    window.localStorage.setItem('institute',JSON.stringify(response.data));
  }

  async getPrmission() {
    const role_wise_permission: any = await this.httpRequest.post(enviroment.apiUrl + 'api/modules/role-wise-modules-permission-list', []).toPromise();
    window.localStorage.setItem("permissions", JSON.stringify(role_wise_permission?.data));
  }

  // dateFormatChange(event) {
  //   this._dateFormateService.setFormat(event);
  // }

  captureKeyboardEvent(){
    this.shortCutService.onShortcut('alt+g', () => {
      const isGlobalModal = document.querySelector('.global-search')
      if (isGlobalModal) {
        this.modalService.dismissAll();
      } else {
        this.modalService.dismissAll();
        setTimeout(() => {
          if (!this.modalService.hasOpenModals()) {
            this.openXl();
          }
        }, 10);
      }
    });
  }

}
