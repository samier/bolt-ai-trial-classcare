import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavService } from 'src/app/shared/services/nav.service';
import { SidebarRightService } from 'src/app/shared/services/sidebar-right.service';
import { StudentLeavingCertificateService } from '../../student-leaving-certificate/student-leaving-certificate.service';
import { SwitcherService } from 'src/app/shared/services/switcher.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LeaveManagmentService } from '../../leave-management/leave-managment.service';
import { SharedUserService } from 'src/app/shared/componets/header/shared-user.service';
import { Subscription } from 'rxjs';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss']
})
export class UserHeaderComponent implements OnInit, AfterViewInit {
  layoutSubscription: Subscription;
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
  public is_admin   = window.localStorage?.getItem("role")?.includes('ROLE_ADMIN');
  private photoSubscription!: Subscription;
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
    public CommonService: CommonService
  ) {
    this.layoutSubscription = sidebarRightservice.changeEmitted.subscribe(
      (direction) => {
        const dir = direction.direction;
      }
    );
    this.photoSubscription = this.CommonService.photoUpdated$.subscribe((updated) => {
      if (updated) {
        this.getUserDetails();
      }
    });
    this.getUserDetails()

    this.studentDetails?.map((row) => {
      const key = row.split('%3D')[0];
      const value = row.split('%3D')[1];
      Object.assign(this.studentDetail, { [key]: value });
    });
    this.httpRequest
      .get(this.API_URL + 'api/get-institute-modules')
      .subscribe((res: any) => {
        this.institute_modules = res.data;
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
  getUserDetails(){
    if (!this.is_student) {
      this.httpRequest
        .post(this.API_URL + 'api/me', {})
        .subscribe((res: any) => {
          this.user = res;
          this.SharedUserService.user = res;
          localStorage.setItem('user_id', res.id)
        });
    }
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
    const urlSegments = this.router.parseUrl(this.router.url).root.children['primary'].segments;
    this.roles = window.localStorage.getItem('role');
    this.roles = this.roles.split(',')
    this.branch_id = urlSegments[0].path;
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

    // this.getAcadamicList(
    //   {
    //     current_branch_id : [branch]
    //   }
    // )
  }
  ngOnDestroy() {
    this.photoSubscription.unsubscribe();
  }



  // getAcadamicList(param: any) {
  //   this.SharedUserService.getAcadamicYearList(param).subscribe((res: any) => {
  //     if (res.status) {
  //       this.yearList = res.data
  //     }
  //   });
  // }

  // yearChanged(){
  //   var expirationDate = new Date();
  //   expirationDate.setMonth(expirationDate.getMonth() + 1);
  //   document.cookie = `academic_year_id=${this.currentYear_id}; expires=0; path=/`;

  //   const currentYear:any = ('; '+document.cookie)?.split(`; academic_year_id= `)?.pop()?.split(';')[0];
  //   location.reload();
  // }

  // updateSwitcher(value:any){
  //   this.httpRequest.post(this.API_URL+'api/switcher-menu/update', value).subscribe();
  // }

  toggleSwitcher() {
    this.SwitcherService.emitChange(true);
  }

  // toggleSidebarNotification() {
  //   this.sidebarRightservice.emitSidebarNotifyChange(true);
  // }
  // toggleSidebarOpen() {
  //   if ((this.navServices.collapseSidebar = true)) {
  //     let mainBody: any = document.querySelector('.main-body');
  //     mainBody.classList.add('sidenav-toggled');
  //     mainBody.classList.add('sidebar-gone');
  //     mainBody.classList.add('sidebar-mini');
  //   }
  // }
  // toggleSidebarClose() {
  //   if ((this.navServices.collapseSidebar = true)) {
  //     let removeMainBody: any = document.querySelector('.main-body');
  //     removeMainBody.classList.remove('sidenav-toggled');
  //   }
  // }

  // search() {
  //   let navabarForm: any = document.querySelector('.navbar-form ');
  //   navabarForm.classList.toggle('d-none');
  // }

  // close() {
  //   let navbarD: any = document.querySelector('.navbar-form ');
  //   navbarD.classList.add('d-none');
  // }

  ngAfterViewInit() {
    const chat: any = document.querySelector('.chat-scroll');
    // if (chat) {
    //   let ps1 = new PerfectScrollbar(chat, {
    //     wheelPropagation: false,
    //     wheelSpeed: 2,
    //     suppressScrollX: true,
    //   });
    // }

    // const notification: any = document.querySelector('.Notification-scroll');
    // if (notification) {
    //   let ps2 = new PerfectScrollbar(notification, {
    //     wheelPropagation: false,
    //     wheelSpeed: 2,
    //     suppressScrollX: true,
    //   });
    // }
  }

  SearchActive = 'Notactive';
  // searchClass(item: any) {
  //   // this.SearchActive=="nonactive"? "active":"nonactive"
  //   console.log(item);
  //   if (item == 'active') {
  //     this.SearchActive = 'active';
  //   }
  //   if (item == 'Notactive') {
  //     this.SearchActive = 'Notactive';
  //   }
  // }

  // getStudent(key: string) {
  //   return this.studentDetail[key] ?? '-';
  // }

  // getInstituteModule(module_name: string) {
  //   return this.institute_modules.includes(module_name);
  // }

  // stringDecode(string: string) {
  //   return string.replace(/\+/gi, ' ');
  // }

  getProfile()
  {
    let role  = window.localStorage.getItem('role');
    let image = this.user?.profile;
    if (role == 'STUDENT') {
        image = this.profile_image;
    }
    return image;
  }

  // decodeURL(text: any) {
  //   return decodeURI(text);
  // }
  setsymfonyUrl(url: string) {
    return this.symfonyHost + url;
  }
  setUserUrl(url: string) {
    return '/'+ url;
  }

  getBranchList(){
    this.httpRequest.get(this.API_URL + 'api/get-branch-list/'+localStorage.getItem('user_id')).subscribe((res: any) => {
      this.branchList = res.data;
    });
  }

  handleBranchChange(id:any){
    this.router.navigate([this.setUrl(this.URLConstants.DASHBOARD)]);
  }

  // toggleTheme() {
  //   let theme;
  //   let body = document.querySelector('body');
  //   if (body?.classList.contains('dark-theme')) {
  //     theme = 'light';
  //   } else {
  //     theme = 'dark';
  //   }
  //   if (theme == 'light') {
  //     sessionStorage.setItem('light_menu', 'true');
  //     sessionStorage.removeItem('color_menu');
  //     sessionStorage.removeItem('dark_menu');
  //     sessionStorage.removeItem('gradient_menu');

  //     sessionStorage.setItem('light_header', 'true');
  //     sessionStorage.removeItem('color_header');
  //     sessionStorage.removeItem('dark_header');
  //     sessionStorage.removeItem('gradient_header');

  //     body?.classList.add('light-theme');
  //     sessionStorage.setItem('light_theme', 'true');
  //     // remove
  //     sessionStorage.removeItem('dark_theme');
  //     body?.classList.remove('dark-theme');
  //     body?.classList.remove('transparent-theme');
  //     body?.classList.remove('bg-img1');
  //     body?.classList.remove('bg-img2');
  //     body?.classList.remove('bg-img3');
  //     body?.classList.remove('bg-img4');
  //     body?.classList.remove('light-header');
  //     body?.classList.remove('color-header');
  //     body?.classList.remove('gradient-header');
  //     body?.classList.remove('dark-header');
  //     body?.classList.remove('light-menu');
  //     body?.classList.remove('color-menu');
  //     body?.classList.remove('dark-menu');
  //     body?.classList.remove('gradient-menu');
  //     let lightMenu: any = document.querySelector('#myonoffswitch3');
  //     lightMenu.checked = true;
  //     let lightHeader: any = document.querySelector('#myonoffswitch6');
  //     lightHeader.checked = true;
  //     let light: any = document.querySelector('#myonoffswitch1');
  //     light.checked = true;
  //     this.updateSwitcher({light_theme: true, dark_theme: false, light_menu: true, color_menu: false, dark_menu: false, gradient_menu: false, light_header: true, color_header: false, dark_header: false, gradient_header: false})
  //   } else if (theme == 'dark') {
  //     sessionStorage.setItem('dark_menu', 'true');
  //     sessionStorage.removeItem('light_menu');
  //     sessionStorage.removeItem('color_menu');
  //     sessionStorage.removeItem('gradient_menu');

  //     sessionStorage.setItem('dark_header', 'true');
  //     sessionStorage.removeItem('color_header');
  //     sessionStorage.removeItem('light_header');
  //     sessionStorage.removeItem('gradient_header');

  //     body?.classList.add('dark-theme');

  //     // sessionStorage.setItem('dark_theme', 'true');
  //     // remove
  //     sessionStorage.removeItem('light_theme');
  //     sessionStorage.removeItem('valexTransparentTheme');
  //     body?.classList.remove('light-theme');
  //     body?.classList.remove('transparent-theme');
  //     body?.classList.remove('bg-img1');
  //     body?.classList.remove('bg-img2');
  //     body?.classList.remove('bg-img3');
  //     body?.classList.remove('bg-img4');
  //     body?.classList.remove('light-header');
  //     body?.classList.remove('color-header');
  //     body?.classList.remove('gradient-header');
  //     body?.classList.remove('dark-header');
  //     body?.classList.remove('light-menu');
  //     body?.classList.remove('color-menu');
  //     body?.classList.remove('dark-menu');
  //     body?.classList.remove('gradient-menu');
  //     let darkMenu: any = document.querySelector('#myonoffswitch5');
  //     darkMenu.checked = true;
  //     let darkHeader: any = document.querySelector('#myonoffswitch8');
  //     darkHeader.checked = true;
  //     let dark: any = document.querySelector('#myonoffswitch2');
  //     dark.checked = true;
  //     this.updateSwitcher({light_theme: false, dark_theme: true, light_menu: false, color_menu: false, dark_menu: true, gradient_menu: false, light_header: false, color_header: false, dark_header: true, gradient_header: false})
  //   }
  // }

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

setUrl(url:string,id:any=null) {
  if(id){
    return '/' + id + '/' + url;
  }
  return url;
}

userList(){
  this.router.navigate([this.setUrl(URLConstants.ADMIN_USER_LIST)]);
}

clear() {
  localStorage.clear();
  sessionStorage.clear();
}

}
