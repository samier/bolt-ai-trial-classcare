import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HttpClient } from '@angular/common/http';
import { LeaveManagmentService } from 'src/app/modules/leave-management/leave-managment.service';
import { CommonService } from 'src/app/core/services/common.service';
//Menu Bar
export interface Menu {
  headTitle?: string;
  title?: string;
  path?: string;
  icon?: string;
  type?: string;
  badgeClass?: string;
  badgeValue?: string;
  active?: boolean;
  children?: Menu[];
  Menusub?: boolean;
  show?: boolean;
  slug?:string;
  relatedTo?: string[];
}


@Injectable({
  providedIn: 'root'
})
export class NavService implements OnDestroy {

  private unsubscriber: Subject<any> = new Subject();
  public screenWidth: BehaviorSubject<number> = new BehaviorSubject(window.innerWidth);

  public megaMenu: boolean = false;
  public megaMenuCollapse: boolean = window.innerWidth < 1199 ? true : false;
  public collapseSidebar: boolean = window.innerWidth < 991 ? true : false;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;
  private API_URL = enviroment.apiUrl;
  public is_admin   = window.localStorage?.getItem("role")?.includes('ROLE_ADMIN');
  public is_faculty = window.localStorage?.getItem("role")?.includes('ROLE_FACULTY');
  public is_staff   = window.localStorage?.getItem("role")?.includes('ROLE_STAFF');
  public is_branch_admin   = window.localStorage?.getItem("role")?.includes('ROLE_BRANCH_ADMIN');
  public is_back_office   = window.localStorage?.getItem("role")?.includes('ROLE_BACK_OFFICE');
  public is_student = window.localStorage?.getItem("role")?.includes('STUDENT');
  public active='active';
  public acedemicYear = ('; '+document.cookie)?.split(`; acedemicYear=`)?.pop()?.split(';')[0].split('%2C');
  public branchAcedemicYear:any = {};
  public branchName:any = {};
  public attendanceType:any = {};
  public institute_modules:any = [];
  public el:any = [];
  public notification:any = [];
  public studentDetails = ('; '+document.cookie)?.split(`; studentDetails=`)?.pop()?.split(';')[0].split('%7C');
  public isSchool:any = ('; '+document.cookie)?.split(`; ISSCHOOL=`)?.pop()?.split(';')[0];

  public studentDetail:any = {};
  public profile_image:any = null;
  public bulk_discount:any;
  public otp_generate:any;
  public isActivityLog : any = false

  constructor(
    private router: Router,
    private httpRequest: HttpClient,
    private leaveManagementSerivce:LeaveManagmentService,
    private CommonService:CommonService
  ) {
    this.setScreenWidth(window.innerWidth);
    fromEvent(window, 'resize').pipe(
      debounceTime(1000),
      takeUntil(this.unsubscriber)
    ).subscribe((evt: any) => {
      this.setScreenWidth(evt.target.innerWidth);
      if (evt.target.innerwidth < 991) {
        this.collapseSidebar = false;
        this.megaMenu = false;
      }

      if (evt.target.innerWidth < 1199) {
        this.megaMenuCollapse = true;
      }
    });
    if (window.innerWidth < 991) {
      this.router.events.subscribe(event => {
        this.collapseSidebar = false;
        this.megaMenu = false;
      })
    }
    if(this.is_admin){
      this.is_faculty=this.is_staff=this.is_branch_admin=false;
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

    const urlSegments = this.router.parseUrl(this.router.url).root.children['primary'].segments;
    if(Number(urlSegments[0]?.path)){
      this.httpRequest.get(this.API_URL+'api/get-branch-notification/'+urlSegments[0].path).subscribe((res:any) => {
        this.notification = res.data;
      });
    }
    this.studentDetails?.map(row=>{
      const key = row.split('%3D')[0];
      const value = row.split('%3D')[1];
      Object.assign(this.studentDetail, {[key] : value});
    });
    if(this.is_student){
      this.leaveManagementSerivce.getStudentProfileDetail(this.studentDetail['studentid']??0).subscribe((resp:any) => {
        if(resp.status == false){
          // return location.replace(this.setsymfonyUrl('dashboard'));
          this.router.navigate([this.setUrl(URLConstants.DASHBOARD)]);
        }
        this.profile_image = resp.image;
      });
    }
  }

  getStudent(key:string){
    return this.studentDetail[key]??"-";
  }

  stringDecode(string:string){
    return string.replace(/\+/gi, " ");
  }

  getProfile(){
    return this.profile_image;
  }

  decodeURL(text:any){
    return decodeURI(text);
  }

  setModules(modules){
    this.institute_modules = modules;
  }

  async getBulkDiscountPermission(): Promise<any>{
    const bulk_discount:any = await this.httpRequest.get(this.API_URL+'api/fees/get-bulk-discount-permission').toPromise();
    this.bulk_discount = bulk_discount?.data;
    return this.bulk_discount;
  }

  async fetchPermissions(): Promise<any>{
    console.log('nav');
    const response_data:any = await this.httpRequest.post(this.API_URL+'api/modules/role-wise-modules-permission-list',[]).toPromise();
    window.localStorage.setItem("permissions",JSON.stringify(response_data.data));
    return response_data;
  }

  async fetchModules(): Promise<any>{
    const response : any = await this.httpRequest.get(this.API_URL+'api/get-institute-modules').toPromise();
    this.isActivityLog = response.data?.some((module: any) => module == 'Activity Log')
    return response;
  }

  private setScreenWidth(width: number): void {
    this.screenWidth.next(width);
  }
  

  async systemSetting(key_name: any): Promise<any>{
    const response_data:any = await this.httpRequest.get(this.API_URL+'api/assign-otp/system_setting/'+ key_name).toPromise();
    this.otp_generate  = response_data;
    return response_data;
  }

  
  ngOnInit(){
    this.fetchPermissions();
    this.hasPermission('faculty_leave')
  }
  ngOnDestroy() {
    this.unsubscriber.next(true);
    this.unsubscriber.complete();
  }

  currentYear(){
    const branch = window.localStorage.getItem("branch");
    if(branch != null){
      return this.branchAcedemicYear[branch];
    }
    return '2022-2023'
  }

  branch_name(){
    const branch = window.localStorage.getItem("branch");
    if(branch != null){
      return this.branchName[branch].replace(/\+/gi, " ");
    }
    return 'NA'
  }

  getAttendanceType(){
    const branch = window.localStorage.getItem("branch");
    if(branch != null){
      return this.attendanceType[branch];
    }
    return 2;
  }

  getInstituteModule(module_name:string){
    return this.institute_modules?.includes(module_name);
  }

  setsymfonyBranchUrl(url:string) {
    return this.symfonyHost+url;
  }


  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  setsymfonyUrl(url:string) {
    return enviroment.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }

  setsymfonyUrlSt(url:string) {
    return enviroment.symfonyHost+url;
  }

  setUrlSt(url:string) {
    return '/app'+url;
  }

  hasPermission(module_name:any,action:any=null){
    return this.CommonService.hasPermission(module_name,action);  
  }

  hasModule(key:any){
    return this.CommonService.hasModule(key);
  }

  MENUITEMS: Menu[] = [];

  getMenuItems() {
    // console.log('has permission of faculty : ',this.hasPermission('Faculty'));
    if(false){
      return [
        {
          headTitle: 'Menu'
        },
        {
          path: this.setsymfonyUrlSt('student/showProfile'), title: 'Profile', type: 'slink', icon: 'sentiment_satisfied_alt', badgeClass: 'danger', active: false, show: this.getStudent('stuprofile')
        },
        {
          path: this.setsymfonyUrlSt('student/fees'), title: 'Fees', type: 'slink', icon: 'sentiment_satisfied_alt', badgeClass: 'danger', active: false, show: this.getStudent('stuFees')
        },
        {
          path: (this.getStudent('stuMonthlyReport') ? this.setsymfonyUrlSt('student/studentMonthlyReport') : (this.getStudent('stuAttendanceReport') ? this.setsymfonyUrlSt('student/studentAttendencereport') : this.setsymfonyUrlSt('student/studentExamReport')) ) , title: 'Reports', type: 'slink', icon: 'sentiment_satisfied_alt', badgeClass: 'danger', active: false, show: (this.getStudent('stuMonthlyReport') || this.getStudent('stuAttendanceReport') || this.getStudent('stuExamReport'))
        },
        {
          path: this.setsymfonyUrlSt('student/assignment'), title: 'Assignment', type: 'slink', icon: 'sentiment_satisfied_alt', badgeClass: 'danger', active: false, show: true
        },
        {
          path: this.setsymfonyUrlSt('student/studentSchedule'), title: 'Schedules', type: 'slink', icon: 'sentiment_satisfied_alt', badgeClass: 'danger', active: false, show: (this.getStudent('stuSchedule') && this.getStudent('attendanceType') != 2)
        },
        {
          path: this.setsymfonyUrlSt('student/viewEvent'), title: 'Events', type: 'slink', icon: 'sentiment_satisfied_alt', badgeClass: 'danger', active: false, show: true
        },
        {
          path: this.setsymfonyUrlSt('student/documents'), title: 'Documents', type: 'slink', icon: 'sentiment_satisfied_alt', badgeClass: 'danger', active: false, show: true
        },
        {
          path: this.setsymfonyUrlSt('student/studentTransportDetail'), title: 'Transport', type: 'slink', icon: 'sentiment_satisfied_alt', badgeClass: 'danger', active: false, show: this.getInstituteModule('Transport')
        },
        {
          path: this.setsymfonyUrlSt('student/studentMealDetail'), title: 'Meal Menu', type: 'slink', icon: 'sentiment_satisfied_alt', badgeClass: 'danger', active: false, show: this.getInstituteModule('Meal')
        },
        {
          path: this.setUrlSt(URLConstants.STUDENT_LEAVE_LIST), title: 'Leave', type: 'slink', icon: 'sentiment_satisfied_alt', badgeClass: 'danger', active: false, show: this.getInstituteModule('Leave')
        },
        {
          path: this.setUrlSt(URLConstants.STUDENT_EXAM_LIST), title: 'Online Exam', type: 'slink', icon: 'sentiment_satisfied_alt', badgeClass: 'danger', active: false, show: this.getInstituteModule('MCQ')
        },
        {
          path: this.setUrlSt(URLConstants.STUDENT_CHAT), title: 'Chat', type: 'slink', icon: 'sentiment_satisfied_alt', badgeClass: 'danger', active: false, show: true
        },
        {
          path: this.setsymfonyUrlSt('student/changePassword'), title: 'Change Password', type: 'slink', icon: 'sentiment_satisfied_alt', badgeClass: 'danger', active: false, show: true
        },
        {
          path: this.setsymfonyUrlSt('student/studentlogout'), title: 'Log out', type: 'slink', icon: 'sentiment_satisfied_alt', badgeClass: 'danger', active: false, show: true
        },
      ];
    }
    return [
      {
        headTitle: 'Menu'
      },
      // {
      //   path: this.setsymfonyUrl('dashboard'), title: 'Dashboard', type: 'slink', icon: 'layout-grid2', badgeClass: 'danger', active: false, show: true
      // },
      { path: this.setUrl(URLConstants.DASHBOARD), icon: 'layout-grid2', title: 'Dashboard', type: 'link', active: false, show: true },

      // {
      //   title: 'ALUMNI', icon: 'user', type: 'sub', active: false, show: this.getInstituteModule('Alumni') , children: [
      //     { path: this.setUrl(URLConstants.ALUMNI_EVENT_LIST), title: 'Event List', type: 'link', active: false , show: true }
      //   ]
      // },
      // {
      //   path: this.setUrl(URLConstants.CAREER_LIST), title: 'Career', type: 'link', icon: 'layout-grid2', active: false, show: this.getInstituteModule('Career')
      // },
      // student old code
      // {
      //   title: 'Student', icon: 'user', type: 'sub', active: false, show: ((this.getInstituteModule('Student')) && (this.hasPermission('student_student') || this.hasPermission('student_attendance') ||
      //   this.hasPermission('student_exam') || this.hasPermission('student_leaving_certificate') || this.hasPermission('student_exam_report_card') || this.hasPermission('student_student_performance') ||
      //   this.hasPermission('student_student_bulk_edit') || this.hasPermission('student_marks_bulk_edit'))), children: [
      //     { path: this.setsymfonyUrl('students'), title: 'Students', type: 'slink', active: false, show: this.hasPermission('student_student') },
      //     { path: this.setsymfonyUrl('report/viewattendance'), title: 'Attendance', type: 'slink', active: false, show: this.hasPermission('student_attendance') && this.getAttendanceType() == 2 },
      //     { path: this.setsymfonyUrl('exam/viewExam'), title: 'Exam', type: 'slink', active: false, show: this.hasPermission('student_exam')  },
      //     { path: this.setUrl(URLConstants.LEAVING_CERTIFICATE_LIST), title: 'Leaving Certificate', type: 'link', active: false, show: this.getInstituteModule('Leaving Certificate') && this.hasPermission('student_leaving_certificate') },
      //     { path: this.setUrl(URLConstants.EXAM_REPORT_CARD_GENERATE), title: 'Exam Report Card', type: 'link', active: false, show: this.hasPermission('student_exam_report_card')},
      //     { path: this.setUrl(URLConstants.STUDENT_PERFORMANCE), title: 'Student Performance', type: 'link', active: false, show: this.hasPermission('student_student_performance')},
      //     { path: this.setUrl(URLConstants.STUDENT_BULK_EDIT), title: 'Student Bulk Edit', type: 'link', active: false, show: this.hasPermission('student_student_bulk_edit')},
      //     { path: this.setUrl(URLConstants.MARKS_BULK_EDIT), title: 'Marks Bulk Edit', type: 'link', active: false, show: this.hasPermission('student_marks_bulk_edit')}
      //   ]
      // },
      {
        title: 'Student', icon: 'user', type: 'sub', active: false, show: ((this.getInstituteModule('Student')) && (this.hasModule('student_student')) || (this.hasModule('student_student_bulk_edit')) || (this.hasModule('administrator_leave'))
      || (this.hasModule('student_report_student_report')) || (this.hasModule('student_student_performance')) || (this.hasModule('administrator_certificate_generator')) || (this.hasModule('student_attendance')) || (this.hasModule('student_exam'))
      || (this.hasModule('student_marks_bulk_edit')) || this.hasModule('student_exam_report_card') || (this.hasModule('report_generate_marksheet') || this.hasModule('report_create_marksheet') || (this.hasModule('student_report_student_category_report'))
      || (this.hasModule('student_report_student_gender_report')) || (this.hasModule('student_report_student_active_inactive_report')) || (this.hasModule('student_report_student_academic_fees_report')) || this.hasModule('student_leaving_certificate')
      || this.hasModule('report_published_marksheet') || this.hasModule('student_quick_attendance') || this.hasModule('settings_batch') || this.hasModule('settings_exam_type') || this.hasModule('student_blank_exam_sheet') || (this.hasModule('report_fees_reminder')) || this.hasModule('student_student_dashboard') || (this.hasModule('student_student_strength_report'))
      || this.hasModule('student_student_blank_report') || this.hasModule('student_student_rank_list') || this.hasModule('student_student_remark_title') || this.hasModule('student_student_remark')|| this.hasModule('report_student_wallet_minus_report'))),  children: [
          { title: 'Students', type: 'sub', active: false, show: ((this.hasModule('student_student')) || (this.hasModule('student_student_bulk_edit'))  || (this.hasModule('administrator_leave'))
            || this.hasModule('settings_batch') || this.hasModule('student_student_dashboard')), children: [
            // { path: this.setsymfonyUrl('students'), title: 'Student List', type: 'slink', active: false, show: this.hasPermission('student_student') },
            { path: this.setUrl(URLConstants.STUDENT_DASHBOARD), title: 'Dashboard', type: 'link', active: false, show: this.hasPermission('student_student_dashboard'), relatedTo: ['students'] },
            { path: this.setUrl(URLConstants.STUDENT_LIST), title: 'Students List', type: 'link', active: false, show: this.hasPermission('student_student'), relatedTo: ['students'] },
            { path: this.setUrl(URLConstants.STUDENT_ADD), title: 'Add Student', type: 'link', active: false, show: this.hasPermission('student_student','has_create'), relatedTo: ['students']  },
            { path: this.setUrl(URLConstants.IMPORT_STUDENT), title: 'Import Student', type: 'link', active: false, show: this.hasPermission('student_student','has_import'), relatedTo: ['students']  },
            { path: this.setUrl(URLConstants.MANAGE_STUDENT_ROLL_NO), title: 'Manage Student Roll No', type: 'link', active: false, show: this.hasPermission('settings_batch'), relatedTo: ['students']  },
            // { path: this.setUrl(URLConstants.IMPORT_STUDENT), title: 'ID Card Generation', type: 'link', active: false, show: this.hasPermission('student_student') },
            { path: this.setUrl(URLConstants.STUDENT_BULK_EDIT), title: 'Student Bulk edit', type: 'link', active: false, show: this.hasPermission('student_student_bulk_edit'), relatedTo: ['students']  },
            // { path: this.setUrl(URLConstants.LEAVES_LIST), title: 'Student Leaves', type: 'link', active: false, show: this.hasPermission('administrator_leave') },
            { path: this.setUrl(URLConstants.LEAVES_CREATE), title: 'Add student leaves', type: 'link', active: false, show: this.hasPermission('administrator_leave','has_create'), relatedTo: ['students']  },
            // below listed are for side bar just to compare path
            { path: this.setUrl(URLConstants.STUDENT_EDIT), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.LEAVING_CERTIFICATE_EDIT), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.LEAVING_CERTIFICATE_VIEW_DETAIL), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.LEAVING_CERTIFICATE_VIEW), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.ACADEMICS), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.STUDENT_COLLECT_FEES), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.LEAVING_CERTIFICATE_ADD), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.STUDENT_NEW_PROFILE), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.PERFORMANCE_CRITERIA), relatedTo: ['students']},                       
            { path: this.setUrl(URLConstants.PERFORMANCE_CATEGORY), relatedTo: ['students']},                       
            { path: this.setUrl(URLConstants.STUDENT_FEES_REFUND), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.STUDENT_TRANSPORT), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.STUDENT_HOSTEL), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.STUDENT_WALLET_HISTORY), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.ADMIN_STUDENT_EXAM), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.STUDENT_EXAM), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.BANK_DETAILS), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.STUDENT_DOCUMENT), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.ADMIN_STUDENT_TAB), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.REMARK_LIST), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.STUDENT_NOTICE_HISTORY), relatedTo: ['students']},
            { path: this.setUrl(URLConstants.STUDENT_MONTHLY_REPORT_PROFILE), relatedTo: ['students']},            
            { path: this.setUrl(URLConstants.STUDENT_GR_REPORT), relatedTo: ['students']},
          ]},
          { title: 'Student Report', type: 'sub', active: false, show: ((this.hasModule('student_report_student_report')) || (this.hasModule('student_student_performance')) || (this.hasModule('student_report_student_category_report'))
            || (this.hasModule('student_report_student_gender_report')) || (this.hasModule('student_report_student_active_inactive_report')) || (this.hasModule('student_report_student_academic_fees_report'))  || (this.hasModule('report_fees_reminder')) || (this.hasModule('student_student_strength_report'))
            || this.hasModule('student_student_blank_report') || this.hasModule('report_student_wallet_minus_report')), children: [
            // { path: this.setUrl(URLConstants.STUDENT_REPORT), title: 'Bank Report', type: 'link', active: false, show: this.hasPermission('student_student') },
            { path: this.setUrl(URLConstants.STUDENT_GENDER_REPORT), title: 'Student Gender Report', type: 'link', active: false, show: this.hasPermission('student_report_student_gender_report'), relatedTo: ['students']  },
            { path: this.setUrl(URLConstants.STUDENT_ACTIVE_INACTIVE_REPORT), title: 'Student Active/Inactive Report', type: 'link', active: false, show: this.hasPermission('student_report_student_active_inactive_report'), relatedTo: ['students']  },
            { path: this.setUrl(URLConstants.STUDENT_CATEGORY_REPORT), title: 'Student Category Report', type: 'link', active: false, show: this.hasPermission('student_report_student_category_report'), relatedTo: ['students']  },
            { path: this.setUrl(URLConstants.STUDENT_REPORT), title: 'Student Dynamic Field Report', type: 'link', active: false, show: this.hasPermission('student_report_student_report'), relatedTo: ['students']  },
            { path: this.setUrl(URLConstants.STUDENT_REPORT), title: 'Student Call List Report', type: 'link', active: false, show: this.hasPermission('student_report_student_report'), slug:'student-call-report', relatedTo: ['students']  },
            { path: this.setUrl(URLConstants.COURSE_FEES_UPDATE), title: 'Student Academic Fees Report', type: 'link', active: false, show: this.hasPermission('student_report_student_academic_fees_report'), relatedTo: ['students']  },
            { path: this.setUrl(URLConstants.STUDENT_PERFORMANCE), title: 'Student Performance', type: 'link', active: false, show: this.hasPermission('student_student_performance') , relatedTo: ['students'] },
            { path: this.setUrl(URLConstants.FEES_REMINDER), title: 'Fees Reminder', type: 'link', active: false, show: this.hasPermission('report_fees_reminder') , relatedTo: ['students'] },
            { path: this.setUrl(URLConstants.STUDENT_STRENGTH_REPORT), title: 'Student Strength Report', type: 'link', active: false, show: this.hasPermission('student_student_strength_report') ,relatedTo:['students']},
            { path: this.setUrl(URLConstants.STUDENT_BLANK_REPORT), title: 'Student Blank Report', type: 'link', active: false, show: this.hasPermission('student_student_blank_report') ,relatedTo:['students']},
            { path: this.setUrl(URLConstants.STUDENT_WALLET_MINUS_REPORT), title: 'Student Wallet Minus Report', type: 'link', active: false, show: this.hasPermission('report_student_wallet_minus_report') ,relatedTo:['students']},
          ]},
          {  title: 'Documents', type: 'sub', active: false, show: this.hasModule('administrator_certificate_generator') || this.hasModule('student_leaving_certificate'), children: [
            // { path: this.setUrl(URLConstants.STUDENT_REPORT), title: 'Bonafied Certificate', type: 'link', active: false, show: this.hasPermission('student_student') },
            { path: this.setUrl(URLConstants.LEAVING_CERTIFICATE_LIST), title: 'Leaving Certificate', type: 'link', active: false, show: this.getInstituteModule('Leaving Certificate') && this.hasPermission('student_leaving_certificate'), relatedTo: ['students']  },
            { path: this.setUrl(URLConstants.GENERATE_CERTIFICATE), title: 'Certificate Generate', type: 'link', active: false, show: this.hasPermission('administrator_certificate_generator'), relatedTo: ['students']  },
            // { path: this.setUrl(URLConstants.GENERATE_CERTIFICATE), title: 'Trial Certificate', type: 'link', active: false, show: this.hasPermission('administrator_certificate_generator') },
            // { path: this.setUrl(URLConstants.GENERATE_CERTIFICATE), title: 'First Attempt Certificate', type: 'link', active: false, show: this.hasPermission('administrator_certificate_generator') },
          ]},
          {  title: 'Attendance', type: 'sub', active: false, show: this.hasModule('student_attendance') && this.notification.attendance_type == '2' || this.hasModule('student_quick_attendance'), children: [
            { path: this.setUrl(URLConstants.STUDENT_TAKE_ATTENDANCE), title: 'Take Attendance', type: 'link', active: false, show: this.hasPermission('student_attendance','has_access'), relatedTo: ['attendance']  },
            // { path: this.setsymfonyUrl('attendance/takeSingleAttendance'), title: 'Take Attendance', type: 'slink', active: false, show: this.hasPermission('student_attendance','has_create') || this.hasPermission('student_attendance','has_edit') || this.hasPermission('student_attendance','has_update')},
            // { path: this.setsymfonyUrl('attendance/batchAttendanceReport'), title: 'Batch wise Attendance List', type: 'slink', active: false, show: this.hasPermission('student_attendance'), relatedTo: ['students']  },
            { path: this.setUrl(URLConstants.VIEW_ATTENDANCE_LIST), title: 'View Attendance Report', type: 'link', active: false, show: this.hasPermission('student_attendance'), relatedTo: ['attendance'] },
            { path: this.setUrl(URLConstants.BATCHWISE_ATTENDANCE_LIST), title: 'Batch wise Attendance List', type: 'link', active: false, show: this.hasPermission('student_attendance'), relatedTo: ['attendance'] },
            { path: this.setUrl(URLConstants.STUDENT_DAILY_ATTENDANCE_REPORT_GENERATE), title: 'Daily Attendance report', type: 'link', active: false, show: this.hasPermission('student_attendance'), relatedTo: ['attendance']  },
            { path: this.setsymfonyUrl('attendance/todayLeaveAbsentAttendance'), title: 'Student Leave / Absence', type: 'slink', active: false, show: this.hasPermission('student_attendance'), relatedTo:['attendance'] },
            { path: this.setUrl(URLConstants.QUICK_ATTENDANCE), title: 'Quick Attendance', type: 'link', active: false, show: this.hasPermission('student_quick_attendance'), relatedTo: ['attendance']},
            { path: this.setUrl(URLConstants.STUDENT_ATTENDANCE_LIST), title: 'Student Attendance', type: 'link', active: false, show: this.hasPermission('student_quick_attendance'), relatedTo: ['attendance']  },
          ]},
          {  title: 'Exam', type: 'sub', active: false, show: (this.hasModule('student_exam') || this.hasModule('report_create_marksheet') || this.hasModule('report_published_marksheet') || this.hasModule('settings_exam_type') || this.hasModule('student_blank_exam_sheet') || this.hasModule('student_student_rank_list')), children: [
            { path: this.setUrl(URLConstants.EXAM_VIEW_LIST), title: 'Exam List', type: 'link', active: false, show: this.hasPermission('student_exam'),relatedTo:['exam']},
            // { path: this.setsymfonyUrl('exam/viewExam'), title: 'Exam List', type: 'slink', active: false, show: this.hasPermission('student_exam') },
            // { path: this.setsymfonyUrl('exam/create'), title: 'Add Exam', type: 'slink', active: false, show: this.hasPermission('student_exam','has_create') },
            { path: this.setUrl(URLConstants.STUDENT_RANKING), title: 'Student Rank List', type: 'link', active: false, show: this.hasPermission('student_student_rank_list'),relatedTo:['exam']},
            { path: this.setUrl(URLConstants.CREATE_EXAM), title: 'Add Exam', type: 'link', active: false, show: this.hasPermission('student_exam','has_create') ,relatedTo:['exam']},
            { path: this.setUrl(URLConstants.EXAM_TYPE_LIST), title: 'Add Exam Type', type: 'link', active: false, show: this.hasPermission('settings_exam_type', 'has_create'),relatedTo:['exam'] },
            { path: this.setUrl(URLConstants.BLANK_EXAM_SHEET), title: 'Blank Exam Sheet', type: 'link', active: false, show: this.hasPermission('student_blank_exam_sheet'),relatedTo:['exam']},
            { path: this.setsymfonyUrl('report/marksheet-create'), title: 'Create Marksheet', type: 'slink', active: false, show: this.hasPermission('report_create_marksheet') },
            { path: this.setsymfonyUrl('report/published-marksheet'), title: 'Published Marksheet', type: 'slink', active: false, show: this.hasPermission('report_published_marksheet') },
            {
              path: this.setUrl(URLConstants.GENERATE_EXAM_TIMETABLE), title: 'Exam Timetable', type: 'link', active: false, relatedTo:['exam']
            },
            // below listed are for side bar just to compare path
            { path: this.setUrl(URLConstants.CREATE_MARKSHEET), relatedTo: ['marksheet']},
            { path: this.setUrl(URLConstants.MARKSHEET_TEMP_DESIGN), relatedTo: ['marksheet']},
            { path: this.setUrl(URLConstants.ADD_EXAM_TYPE), relatedTo: ['exam']},
            { path: this.setUrl(URLConstants.MARKSHEET_TEMP_LIST), relatedTo: ['marksheet']},
            { path: this.setUrl(URLConstants.ASSIGN_EXAM), relatedTo: ['exam']},            
            { path: this.setUrl(URLConstants.CREATE_COMBINE_MARKSHEET), relatedTo: ['marksheet']},
            { path: this.setUrl(URLConstants.EDIT_COMBINE_MARKSHEET), relatedTo: ['marksheet']},            
            { path: this.setUrl(URLConstants.COMBINE_MARKSHEET_EDIT), relatedTo: ['marksheet']},
            { path: this.setUrl(URLConstants.DOWNLOAD_COMBINE_RESULT), relatedTo: ['marksheet']},
            { path: this.setUrl(URLConstants.COMBINE_RESULT_SETUP), relatedTo: ['marksheet']},            
            { path: this.setUrl(URLConstants.EDIT_EXAM), relatedTo: ['exam']},            
            { path: this.setUrl(URLConstants.EXAM_VIEW), relatedTo: ['exam']},            
            { path: this.setUrl(URLConstants.ENTER_MARKS), relatedTo: ['exam']},            
            { path: this.setUrl(URLConstants.EXAM_IMPORTED_MARKS), relatedTo: ['exam']},            
            { path: this.setUrl(URLConstants.EXAM_IMPORTED_MARKS_LOG), relatedTo: ['exam']},                              
            { path: this.setUrl(URLConstants.MARKSHEET_ACTION), relatedTo: ['marksheet']},
            { path: this.setUrl(URLConstants.EDIT_EXAM_TYPE), relatedTo: ['exam']},
            { path: this.setUrl(URLConstants.STUDENT_ATTENDANCE), relatedTo: ['attendance']},   
            { path: this.setUrl(URLConstants.ADD_SIDHI_GUN), relatedTo: ['marksheet']},              
            // { path: this.setsymfonyUrl('exam/createMultipleExam'), title: 'Add Multiple Exam', type: 'slink', active: false, show: this.hasPermission('student_exam','has_create') },
            // { path: this.setUrl(URLConstants.MARKS_BULK_EDIT), title: 'Marks Bulk Edit', type: 'link', active: false, show: this.hasPermission('student_marks_bulk_edit') },
          ]},
          {  title: 'MarkSheet', type: 'sub', active: false, show: (this.hasModule('student_exam_report_card') || this.hasPermission('student_marksheet_create')), children: [
            { path: this.setUrl(URLConstants.EXAM_REPORT_CARD_GENERATE), title: 'Student Exam Report Card', type: 'link', active: false, show: this.hasPermission('student_exam_report_card'),relatedTo:['marksheet'] },
            { path: this.setUrl(URLConstants.MARKSHEET_LIST), title: 'Marksheet List', type: 'link', active: false, show: this.hasPermission('student_marksheet_create') ,relatedTo:['marksheet']},
            { path: this.setUrl(URLConstants.COMBINE_MARKSHEET_LIST), title: 'Combine Marksheet List', type: 'link', active: false, show: this.hasPermission('student_marksheet_create') ,relatedTo:['marksheet']},
            //below path added for sidebar
            { path: this.setUrl(URLConstants.EXAM_REPORT_CARD_GENERATE_STUDENT),relatedTo:['marksheet']},          
            { path: this.setUrl(URLConstants.EXAM_REPORT_CARD_GENERATE_FACULTY),relatedTo:['marksheet']},
            { path: this.setUrl(URLConstants.Edit_EXAM_REPORT_CARD_GENERATE),relatedTo:['marksheet']}
            // { path: this.setsymfonyUrl('report/generate-marksheet'), title: 'Generate Marksheet', type: 'slink', active: false, show: this.hasPermission('report_generate_marksheet') },
          ]},
          { title: "Remarks", type: 'sub', active: false , show: this.hasModule('student_student_remark_title') || this.hasModule('student_student_remark'), children:[
            { path: this.setUrl(URLConstants.PREDEFINE_REMARKS_LIST), title: 'Student Remark Title', type: 'link', active: false, show: this.hasPermission('student_student_remark_title', 'has_access')},
            { path: this.setUrl(URLConstants.STUDENT_REMARKS_LIST), title: 'Student Remark', type: 'link', active: false, show: this.hasPermission('student_student_remark', 'has_access')},
            // { path: this.setUrl(URLConstants.COMPLAIN_ADD), title: 'Add Complain', type: 'link', active: false, show: this.hasPermission('complain_complain', 'has_create')},
          ] },
        ],
      },
      // {
      //   title: 'Lecture', icon: 'blackboard', type: 'sub', active: false, show: ( (this.getInstituteModule('Lecture')) && (this.hasPermission('lecture_lecture') && this.notification.attendance_type == '1')), children: [
      //     { path: this.setsymfonyUrl('lecture/view'), title: 'Today Schedule', type: 'slink', icon: 'class', badgeClass: 'danger', active: false, show: this.hasPermission('lecture_lecture') },
      //     { path: this.setsymfonyUrl('lecture/list'), title: 'Lecture', type: 'slink', icon: 'blackboard', badgeClass: 'danger', active: false, show: this.hasPermission('lecture_lecture') }
      //   ]
      // },
      {
        title: 'Lecture', icon: 'blackboard', type: 'sub', active: false, show: ( (this.getInstituteModule('Lecture')) && (this.hasModule('lecture_lecture') && this.notification.attendance_type == '1')), children: [
          {  title: 'Lecture', type: 'sub', active: false, show: ( (this.hasModule('lecture_lecture'))), children: [
            { path: this.setsymfonyUrl('lecture/view'), title: 'Today Schedule', type: 'slink', icon: 'class', badgeClass: 'danger', active: false, show: this.hasPermission('lecture_lecture') },
            { path: this.setsymfonyUrl('lecture/list'), title: 'Lecture', type: 'slink', icon: 'blackboard', badgeClass: 'danger', active: false, show: this.hasPermission('lecture_lecture') }
          ]},
        ]
      },
      // {
      //   title: 'User', icon: 'briefcase', type: 'sub', active: false, show: ( (this.getInstituteModule('Faculty')) && (this.hasPermission('faculty_faculty') || this.hasPermission('faculty_lesson_planning') || this.hasPermission('faculty_teachers_diary') || this.hasPermission('faculty_staff_attendance') || this.hasPermission('transport_faculty_transport') || this.hasPermission('faculty_attendance_report'))),  children: [
      //     { path: this.setUrl(URLConstants.USER_LIST), title: ' Employee List', type: 'link', active: false , show: this.hasPermission('faculty_faculty') },
      //     { path: this.setUrl(URLConstants.LESSON_LIST), title: 'Lesson Planning', type: 'link', active: false , show: this.hasPermission('faculty_lesson_planning') && this.getInstituteModule('Lesson Planning') && this.is_admin},
      //     { path: this.setUrl(URLConstants.FACULTY_LESSON_LIST), title: 'Lesson Planning', type: 'link', icon: 'book', badgeClass: 'danger', active: false, show: (this.getInstituteModule('Lesson Planning') && this.hasPermission('faculty_lesson_planning')) && this.is_faculty},
      //     { path: this.setUrl(URLConstants.ADMIN_DIARY_LIST), title: 'Teacher\'s Diary', type: 'link', active: false , show: this.hasPermission('faculty_teachers_diary') && this.getInstituteModule('Teacher\'s Diary')  && this.is_admin },
      //     { path: this.setUrl(URLConstants.TEACHER_DIARY_LIST), title: 'Teacher\'s Diary', type: 'link', icon: 'agenda', badgeClass: 'danger',  active: false, show: (this.getInstituteModule('Teacher\'s Diary')  && this.hasPermission('faculty_teachers_diary'))  && this.is_faculty},
      //     { path: this.setsymfonyUrl('staff_attendance'), title: 'Staff Attendance', type: 'slink', active: false , show: this.hasPermission('faculty_staff_attendance') },
      //     { path: this.setUrl(URLConstants.TRANSPORT), title: 'Transport', type: 'link', icon: 'map-alt', badgeClass: 'danger', active: false, show: (this.getInstituteModule('Transport') && this.hasPermission('transport_faculty_transport') && this.is_faculty) },
      //     { path: this.setUrl(URLConstants.FACULTY_ATTENDANCE_REPORT), title: 'Attendance Report', type: 'link', active: false , show: this.hasPermission('faculty_attendance_report') },

      //   ]
      // },
      {
        title: 'Employee', icon: 'briefcase', type: 'sub', active: false, show: ( (this.getInstituteModule('Faculty')) && (this.hasModule('faculty_faculty') || this.hasModule('faculty_staff_attendance')
        || this.hasModule('transport_faculty_transport') || this.hasModule('faculty_attendance_report') || this.hasModule('faculty_lesson_planning') || this.hasModule('faculty_teachers_diary')
        || this.hasModule('administrator_homework') || this.hasModule('administrator_assignment') || this.hasModule('administrator_classwork') || 
        this.hasModule('administrator_syllabus') || this.hasModule('administrator_notes') || this.hasModule('administrator_videolink') || this.hasModule('administrator_notice') || this.hasModule('faculty_attendance_machine_report') || this.hasModule('faculty_lecture_plan') || this.hasModule('faculty_lesson_plan') )),  children: [
          { title: ' Employee', type: 'sub', active: false , show: (this.hasModule('faculty_faculty') || this.hasModule('faculty_staff_attendance') || this.hasModule('transport_faculty_transport')
            || this.hasModule('faculty_attendance_report') || this.hasModule('faculty_lesson_planning') || this.hasModule('faculty_teachers_diary') || this.hasModule('faculty_attendance_machine_report') || this.hasModule('faculty_lecture_plan') || this.hasModule('faculty_lesson_plan')),children: [
            { path: this.setUrl(URLConstants.USER_LIST), title: 'Employee list', type: 'link', active: false, show: this.hasPermission('faculty_faculty'), relatedTo: ['employees']  },
            // { path: this.setsymfonyUrl('staff_attendance'), title: 'Staff Attendance', type: 'slink', active: false, show: this.hasPermission('faculty_staff_attendance','has_create') || this.hasPermission('faculty_staff_attendance','has_edit') || this.hasPermission('faculty_staff_attendance','has_update')},
            { path: this.setUrl(URLConstants.IMPORT_USERS), title: 'Import Employee', type: 'link', active: false, show: this.hasPermission('faculty_faculty' , 'has_import'), relatedTo: ['employees']  },
            { path: this.setUrl(URLConstants.STAFF_ATTENDANCE), title: 'Staff Attendance', type: 'link', active: false, show: this.hasPermission('faculty_staff_attendance','has_create') || this.hasPermission('faculty_staff_attendance','has_edit') || this.hasPermission('faculty_staff_attendance','has_update'), relatedTo: ['employees'] },
            { path: this.setUrl(URLConstants.TRANSPORT), title: 'Transport', type: 'link', icon: 'map-alt', badgeClass: 'danger', active: false, show: (this.getInstituteModule('Transport') && this.hasPermission('transport_faculty_transport') && !this.is_admin), relatedTo: ['employees'] },
            { path: this.setUrl(URLConstants.FACULTY_ATTENDANCE_REPORT), title: 'Attendance Report', type: 'link', active: false , show: this.hasPermission('faculty_attendance_report'), relatedTo: ['employees'] },
            { path: this.setUrl(URLConstants.STAFF_ATTENDANCE_MACHINE_REPORT), title: 'Attendance Machine Report', type: 'link', active: false , show: this.hasPermission('faculty_attendance_machine_report'), relatedTo: ['employees'] },
            { path: this.setUrl(URLConstants.ADMIN_DIARY_LIST), title: 'Teachers Diary', type: 'link', active: false, show: this.hasPermission('faculty_teachers_diary') && this.getInstituteModule('Teacher\'s Diary') && this.is_admin, relatedTo: ['planning']},
            { path: this.setUrl(URLConstants.TEACHER_DIARY_LIST), title: 'Teachers Diary', type: 'link', active: false, show: this.hasPermission('faculty_teachers_diary') && this.getInstituteModule('Teacher\'s Diary')  && !this.is_admin, relatedTo: ['planning']},
            { path: this.setUrl(URLConstants.LESSON_LIST), title: 'Lesson Planning', type: 'link', active: false, show: this.hasPermission('faculty_lesson_planning') && this.getInstituteModule('Lesson Planning') && this.is_admin, relatedTo: ['planning']},
            { path: this.setUrl(URLConstants.FACULTY_LESSON_LIST), title: 'Lesson Planning', type: 'link', active: false, show: this.hasPermission('faculty_lesson_planning') && this.getInstituteModule('Lesson Planning') && !this.is_admin , relatedTo: ['planning']},
            { path: this.setUrl(URLConstants.LESSON_PLAN_LIST), title: 'Lesson Plan', type: 'link', active: false, show: this.hasPermission('faculty_lesson_plan'), relatedTo: ['planning']},
            { path: this.setUrl(URLConstants.LECTURES_LIST), title: 'Lectures', type: 'link', active: false, show: this.hasPermission('faculty_lecture_plan'), relatedTo: ['planning']},
            // below listed are for side bar just to compare path
            { path: this.setUrl(URLConstants.EXPORT_FACULTY), relatedTo: ['employees']},
            { path: this.setUrl(URLConstants.ADD_USER), relatedTo: ['employees']},
            { path: this.setUrl(URLConstants.EDIT_USER), relatedTo: ['employees']},
            { path: this.setUrl(URLConstants.USER_PROFILE), relatedTo: ['employees']},
            { path: this.setUrl(URLConstants.ASSIGN_SUBJECT_USER), relatedTo: ['employees']},
            { path: this.setUrl(URLConstants.ASSIGN_BATCH), relatedTo: ['employees']},
            { path: this.setUrl(URLConstants.EDIT_LESSON_PLAN), relatedTo: ['planning']},
            { path: this.setUrl(URLConstants.ADD_LESSON_PLAN), relatedTo: ['planning']},
            { path: this.setUrl(URLConstants.ADD_LECTURE), relatedTo: ['planning']},
            { path: this.setUrl(URLConstants.ADD_HOMEWORK), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.EDIT_HOMEWORK), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.VIEW_HOMEWORK), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.ADD_ASSIGNMENT), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.EDIT_ASSIGNMENT), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.VIEW_ASSIGNMENT), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.ADD_CLASSWORK), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.EDIT_CLASSWORK), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.VIEW_CLASSWORK), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.ADD_SYLLABUS), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.EDIT_SYLLABUS), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.VIEW_SYLLABUS), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.ADD_NOTES), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.EDIT_NOTES), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.VIEW_NOTES), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.ADD_VIDEO), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.EDIT_VIDEO), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.VIEW_VIDEO), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.ADD_NOTICE), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.EDIT_NOTICE), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.VIEW_NOTICE), relatedTo: ['assignment']},
            { path: this.setUrl(URLConstants.STAFF_IN_OUT_LOGS), relatedTo: ['employees']},
            { path: this.setUrl(URLConstants.ADMIN_ADD_RECORD), relatedTo: ['planning']},
            { path: this.setUrl(URLConstants.ADD_RECORD), relatedTo: ['planning']},
            { path: this.setUrl(URLConstants.TEACHER_DIARY_EDIT_FORM), relatedTo: ['planning']},
            { path: this.setUrl(URLConstants.ADMIN_CREATE_LESSON), relatedTo: ['planning']},
            { path: this.setUrl(URLConstants.ADMIN_EDIT_FORM), relatedTo: ['planning']},
            { path: this.setUrl(URLConstants.LESSON_EDIT_FORM), relatedTo: ['planning']},
            { path: this.setUrl(URLConstants.SUBJECT_LECTURE), relatedTo: ['timetable']},
            { path: this.setUrl(URLConstants.ADMIN_TEACHER_DIARY_EDIT_FORM), relatedTo: ['planning']}
          ]
          },
          // { title: ' Leave', type: 'sub', active: false , show: this.hasModule('administrator_leave'),children: [
          //   { path: this.setUrl(URLConstants.LEAVES_LIST), title: 'Leave List', type: 'link', active: false , show: this.hasPermission('administrator_leave') },
          //   { path: this.setUrl(URLConstants.LEAVES_CREATE), title: 'Add Leaves', type: 'link', active: false, show: this.hasPermission('administrator_leave','has_create') },
          // ]
          // },
          { title: ' Assignments', type: 'sub', active: false , show: this.hasModule('administrator_homework') || this.hasModule('administrator_assignment') || this.hasModule('administrator_classwork') || 
            this.hasModule('administrator_syllabus') || this.hasModule('administrator_notes') || this.hasModule('administrator_videolink') || this.hasModule('administrator_notice'),children: [
          { path: this.setUrl(URLConstants.HOMEWORK_LIST), title: 'Homework', type: 'link', active: false , show: this.hasPermission('administrator_homework'), relatedTo: ['assignment']},
          { path: this.setUrl(URLConstants.ASSIGNMENT_LIST), title: 'Assignment', type: 'link', active: false , show: this.hasPermission('administrator_assignment'), relatedTo: ['assignment']},
          { path: this.setUrl(URLConstants.CLASSWORK_LIST), title: 'Classwork', type: 'link', active: false , show: this.hasPermission('administrator_classwork'), relatedTo: ['assignment']},

          { path: this.setUrl(URLConstants.SYLLABUS_LIST), title: 'Syllabus', type: 'link', active: false , show: this.hasPermission('administrator_syllabus'), relatedTo: ['assignment']},
          { path: this.setUrl(URLConstants.NOTES_LIST), title: 'Notes', type: 'link', active: false , show: this.hasPermission('administrator_notes'), relatedTo: ['assignment']},
          { path: this.setUrl(URLConstants.VIDEO_LIST), title: 'VideoLink', type: 'link', active: false , show: this.hasPermission('administrator_videolink'), relatedTo: ['assignment']},
          { path: this.setUrl(URLConstants.NOTICE_LIST), title: 'Notice', type: 'link', active: false , show: this.hasPermission('administrator_notice'), relatedTo: ['assignment']},
            // { path: this.setsymfonyUrl('attachment/addAttachment'), title: 'Add Assignment', type: 'slink', active: false, show: this.hasPermission('administrator_assignment','has_create') },
            // { path: this.setsymfonyUrl('attachment/attachmentList'), title: 'Home Work List', type: 'slink', active: false, show: this.hasPermission('administrator_assignment') },
            // { path: this.setsymfonyUrl('attachment/attachmentList'), title: 'Class Work List', type: 'slink', active: false, show: this.hasPermission('administrator_assignment') },
            // { path: this.setsymfonyUrl('attachment/attachmentList'), title: 'Assignment List', type: 'slink', active: false, show: this.hasPermission('administrator_assignment') },
            // { path: this.setsymfonyUrl('attachment/attachmentList'), title: 'Syllabus List', type: 'slink', active: false, show: this.hasPermission('administrator_assignment') },
            // { path: this.setsymfonyUrl('attachment/attachmentList'), title: 'Video List', type: 'slink', active: false, show: this.hasPermission('administrator_assignment') },
            // { path: this.setsymfonyUrl('attachment/attachmentList'), title: 'Notice List', type: 'slink', active: false, show: this.hasPermission('administrator_assignment') },
            // { path: this.setsymfonyUrl('attachment/attachmentList'), title: 'Notes List', type: 'slink', active: false, show: this.hasPermission('administrator_assignment') },
          ]
          },
          // { path: this.setUrl(URLConstants.LESSON_LIST), title: 'Lesson Planning', type: 'link', active: false , show: this.hasPermission('faculty_lesson_planning') && this.getInstituteModule('Lesson Planning') && this.is_admin},
          // { path: this.setUrl(URLConstants.FACULTY_LESSON_LIST), title: 'Lesson Planning', type: 'link', icon: 'book', badgeClass: 'danger', active: false, show: (this.getInstituteModule('Lesson Planning') && this.hasPermission('faculty_lesson_planning')) && this.is_faculty},
          // { path: this.setUrl(URLConstants.ADMIN_DIARY_LIST), title: 'Teacher\'s Diary', type: 'link', active: false , show: this.hasPermission('faculty_teachers_diary') && this.getInstituteModule('Teacher\'s Diary')  && this.is_admin },
          // { path: this.setUrl(URLConstants.TEACHER_DIARY_LIST), title: 'Teacher\'s Diary', type: 'link', icon: 'agenda', badgeClass: 'danger',  active: false, show: (this.getInstituteModule('Teacher\'s Diary')  && this.hasPermission('faculty_teachers_diary'))  && this.is_faculty},
          // { path: this.setsymfonyUrl('staff_attendance'), title: 'Staff Attendance', type: 'slink', active: false , show: this.hasPermission('faculty_staff_attendance') },
          // { path: this.setUrl(URLConstants.TRANSPORT), title: 'Transport', type: 'link', icon: 'map-alt', badgeClass: 'danger', active: false, show: (this.getInstituteModule('Transport') && this.hasPermission('transport_faculty_transport') && this.is_faculty) },
          // { path: this.setUrl(URLConstants.FACULTY_ATTENDANCE_REPORT), title: 'Attendance Report', type: 'link', active: false , show: this.hasPermission('faculty_attendance_report') },

        ]
      },
      {
        title: 'Report', icon: 'stats-up', type: 'sub', active: false, show: ( (this.getInstituteModule('Report')) && (this.hasModule('report_school_marksheet') || this.hasModule('report_all_reports') || this.hasModule('student_report_student_report')
        || this.hasModule('student_student_performance') || this.hasModule('student_attendance') || this.hasModule('student_exam_report_card') || this.hasModule('report_transport_report') 
        || this.hasModule('report_application_login_report') || this.hasModule('report_student_of_the_month') || (this.hasModule('student_report_student_category_report'))|| (this.hasModule('student_report_student_gender_report')) 
        || (this.hasModule('student_report_student_active_inactive_report')) || (this.hasModule('student_report_student_academic_fees_report')) || (this.hasModule('report_blank_attendance_sheet')) || (this.hasModule('fees_report_fees_due_report'))
        || (this.hasModule('finance_expense_report')) || this.hasModule('report_birthday_report') || this.hasModule('fees_report_fees_report_date_wise') || this.hasModule('fees_report_fees_receipt_report') || this.hasModule('fees_report_master_fees_report') || (this.hasModule('report_fees_reminder')) ||(this.hasModule('student_student_strength_report')) || this.hasModule('report_student_monthly_report') || this.hasModule('report_batchwise_monthly_report') || this.hasModule('report_exam_general_report') || this.hasModule('report_student_monthly_yearly_attendance_report')
        || this.hasModule('report_section_wise_fees_report') || this.hasModule('student_student_blank_report') || this.hasModule('report_student_wallet_minus_report'))), children: [
          { title: 'Reports', type: 'sub', active: false , show: (this.hasModule('report_school_marksheet') || this.hasPermission('report_all_reports') || this.hasModule('report_student_of_the_month') || this.hasModule('report_student_monthly_report') || this.hasModule('report_batchwise_monthly_report') || this.hasModule('report_exam_general_report')), children: [
            // { path: this.setsymfonyUrl('report/batch-students'), title: 'View Exam Report Student', type: 'slink', active: false, show: this.hasPermission('report_school_marksheet') },
            { path: this.setsymfonyUrl('report/student-of-the-month'), title: 'Student of the Month', type: 'slink', active: false, show: this.hasPermission('report_student_of_the_month')},
            // { path: this.setsymfonyUrl('report/batch-students'), title: 'School Marksheet', type: 'slink', active: false, show: this.hasPermission('report_school_marksheet') },
            // { path: this.setsymfonyUrl('report/exam'), title: 'All Reports', type: 'slink', active: false, show: this.hasPermission('report_all_reports') },
            { path: this.setUrl(URLConstants.BATCH_REPORT), title: 'Batchwise Monthly Report', type: 'link', active: false, show: this.hasPermission('report_batchwise_monthly_report'),relatedTo:['exam']  },
            { path: this.setUrl(URLConstants.EXAM_GENERAL_REPORT), title: 'Exam General Report', type: 'link', active: false, show: this.hasPermission('report_exam_general_report'),relatedTo:['exam']  },
            { path: this.setUrl(URLConstants.STUDENT_MONTHLY_REPORT), title: 'Student Monthly Report', type: 'link', active: false, show: this.hasPermission('report_student_monthly_report'),relatedTo:['students']  },
          ] },



          { title: 'Fees report', type: 'sub', active: false , show: ( this.hasModule('fees_report_master_fees_report') || (this.hasModule('fees_report_fees_due_report')) || (this.hasModule('report_fees_reminder')) || this.hasModule('fees_report_fees_receipt_report') || this.hasModule('fees_report_fees_report_date_wise') 
            || this.hasModule('fees_report_fees_discount_module') || this.hasModule('report_section_wise_fees_report')), children: [
            // { path: this.setsymfonyUrl('report/student-of-the-month'), title: 'Student of the Month', type: 'slink', active: false, show: this.hasPermission('report_student_of_the_month') },
            // { path: this.setsymfonyUrl('report/exam'), title: 'All Reports', type: 'slink', active: false, show: this.hasPermission('report_all_reports') },
            { path: this.setUrl(URLConstants.MASTER_FEES_REPORT), title: 'Master Fees report', type: 'link', active: false, show: this.hasPermission('fees_report_master_fees_report') ,relatedTo:['fees'] },
            { path: this.setUrl(URLConstants.FEES_DUE_REPORT), title: 'Fees Due Report', type: 'link', active: false, show: this.hasPermission('fees_report_fees_due_report'),relatedTo:['fees']  },
            { path: this.setUrl(URLConstants.FEES_REMINDER), title: 'Fees Reminder', type: 'link', active: false, show: this.hasPermission('report_fees_reminder') ,relatedTo:['fees'] },
            { path: this.setUrl(URLConstants.FEES_RECEIPT_LIST) , title: 'Fees Receipt Report', type: 'link', active: false, show: this.hasPermission('fees_report_fees_receipt_report'),relatedTo:['fees'] },
            { path: this.setUrl(URLConstants.FEES_REPORT_DATEWISE), title: 'Fees Report date wise', type: 'link', active: false, show: this.hasPermission('fees_report_fees_report_date_wise') ,relatedTo:['fees'] },
            { path: this.setUrl(URLConstants.INQUIRY_FEES_REPORT), title: 'Inquiry Fees', type: 'link', active: false, show: this.hasPermission('report_inquiry_fees_report') ,relatedTo:['inquiry'] },
            { path: this.setUrl(URLConstants.SECTION_WISE_FEES_REPORT), title: 'Section Wise Fees Report', type: 'link', active: false, show: this.hasPermission('report_section_wise_fees_report') },
            { path: this.setUrl(URLConstants.FEES_DISCOUNT_REPORT), title: 'Fees Discount Report', type: 'link', active: false, show: this.hasPermission('fees_report_fees_discount_module'),relatedTo:['fees'] },
          ] },



          { title: 'Student all report', type: 'sub', active: false , show: (this.hasModule('student_report_student_report') || this.hasModule('student_student_performance') || this.hasModule('student_attendance') 
            || this.hasModule('student_exam_report_card') || this.hasModule('report_transport_report') || this.hasModule('report_application_login_report') || (this.hasModule('student_report_student_category_report'))
            || (this.hasModule('student_report_student_gender_report')) || (this.hasModule('student_report_student_active_inactive_report')) || (this.hasModule('student_report_student_academic_fees_report')) 
            || (this.hasModule('report_blank_attendance_sheet')) || (this.hasModule('fees_report_fees_due_report')) || (this.hasModule('finance_expense_report')) ||(this.hasModule('student_student_strength_report')) || this.hasModule('report_birthday_report')
            || this.hasModule('fees_report_master_fees_report') || this.hasModule('student_student_blank_report') || this.hasModule('report_student_wallet_minus_report') ), children: [
            { path: this.setUrl(URLConstants.STUDENT_REPORT), title: 'Student Dynamic Field Report', type: 'link', active: false, show: this.hasPermission('student_report_student_report'),relatedTo:['students'] },
            { path: this.setUrl(URLConstants.STUDENT_REPORT), title: 'Student Call List Report', type: 'link', active: false, show: this.hasPermission('student_report_student_report'), slug:'student-call-report' ,relatedTo:['students']},
            { path: this.setUrl(URLConstants.STUDENT_CATEGORY_REPORT), title: 'Student Category Report', type: 'link', active: false, show: this.hasPermission('student_report_student_category_report'),relatedTo:['students'] },
            { path: this.setUrl(URLConstants.STUDENT_GENDER_REPORT), title: 'Student Gender Report', type: 'link', active: false, show: this.hasPermission('student_report_student_gender_report'),relatedTo:['students'] },
            { path: this.setUrl(URLConstants.STUDENT_ACTIVE_INACTIVE_REPORT), title: 'Student Active/Inactive Report', type: 'link', active: false, show: this.hasPermission('student_report_student_active_inactive_report'),relatedTo:['students'] },
            { path: this.setUrl(URLConstants.BIRTHDAY_LIST), title: 'Birthday Report', type: 'link', active: false, show: this.hasPermission('report_birthday_report'),relatedTo:['students'] },
            { path: this.setUrl(URLConstants.STUDENT_PERFORMANCE), title: 'Student Performance', type: 'link', active: false, show: this.hasPermission('student_student_performance'),relatedTo:['students']},
            { path: this.setUrl(URLConstants.EXAM_REPORT_CARD_GENERATE), title: 'Student Exam Report Card', type: 'link', active: false, show: this.hasPermission('student_exam_report_card'),relatedTo:['marksheet'] },
            { path: this.setUrl(URLConstants.Blank_Attendance), title: 'Blank Attendance Sheet', type: 'link', active: false, show: this.hasPermission('report_blank_attendance_sheet'),relatedTo:['attendance'] },
            { path: this.setUrl(URLConstants.STUDENT_ATTENDANCE_MONTHLY_YEARLY), title: 'Student Monthly Yearly Attendance Report', type: 'link', active: false, show: this.hasPermission('report_student_monthly_yearly_attendance_report'),relatedTo:['attendance'] },
            // { path: this.setUrl(URLConstants.FEES_REPORT), title: 'Fees Report', type: 'link', active: false, show: this.hasPermission('fees_report_fees_report') },
            { path: this.setUrl(URLConstants.TRANSPORT_REPORT), title: 'Transport Report', type: 'link', active: false, show: (this.hasPermission('report_transport_report') && this.getInstituteModule('Transport')) ,relatedTo:['students']},
            { path: this.setUrl(URLConstants.APPLICATION_LOGIN_REPORT), title: 'Application Login Report', type: 'link', active: false, show: this.hasPermission('report_application_login_report'),relatedTo:['students'] },
            { path: this.setUrl(URLConstants.COURSE_FEES_UPDATE), title: 'Student Academic Fees Report', type: 'link', active: false, show: this.hasPermission('student_report_student_academic_fees_report') ,relatedTo:['fees']},
            { path: this.setUrl(URLConstants.STUDENT_STRENGTH_REPORT), title: 'Student Strength Report', type: 'link', active: false, show: this.hasPermission('student_student_strength_report') ,relatedTo:['students']},
            { path: this.setUrl(URLConstants.STUDENT_BLANK_REPORT), title: 'Student Blank Report', type: 'link', active: false, show: this.hasPermission('student_student_blank_report') ,relatedTo:['students']},
            { path: this.setUrl(URLConstants.STUDENT_WALLET_MINUS_REPORT), title: 'Student Wallet Minus Report', type: 'link', active: false, show: this.hasPermission('report_student_wallet_minus_report') ,relatedTo:['students']},
           // below listed are for side bar just to compare path  
            { path: this.setUrl(URLConstants.WALLET_DAILY_REPORT), relatedTo: ['hostel']},
            { path: this.setUrl(URLConstants.FEES_IMPORT_DETAIL), relatedTo: ['fees']},
            { path: this.setUrl(URLConstants.ADD_CENTER), relatedTo: ['fees']},
            { path: this.setUrl(URLConstants.EDIT_CENTER), relatedTo: ['fees']},
            { path: this.setUrl(URLConstants.FEES_REFUND_CREATE), relatedTo: ['fees']},
            { path: this.setUrl(URLConstants.FEES_REFUND_EDIT), relatedTo: ['fees']},
            { path: this.setUrl(URLConstants.STUDENT_BULK_DISCOUNT_ADD), relatedTo: ['fees']},
            { path: this.setUrl(URLConstants.CREATE_FEES_RECEIPT_NO), relatedTo: ['fees']},
            { path: this.setUrl(URLConstants.EDIT_FEES_RECEIPT_NO), relatedTo: ['fees']},
            { path: this.setUrl(URLConstants.EDIT_DISCOUNT), relatedTo: ['fees']},
            { path: this.setUrl(URLConstants.STUDENT_DISCOUNT), relatedTo: ['fees']}

          ] },
          // { path: this.setsymfonyUrl('report/batch-students'), title: 'School Marksheet', type: 'slink', active: false, show: this.hasPermission('report_school_marksheet') },
          // { path: this.setsymfonyUrl('report/exam'), title: 'All Reports', type: 'slink', active: false, show: this.hasPermission('report_all_reports') },
          // { path: this.setsymfonyUrl('report/generate-marksheet'), title: 'Generate Marksheet', type: 'slink', active: false , show: this.hasPermission('report_generate_marksheet')},
          // { path: this.setsymfonyUrl('report/marksheet-create'), title: 'Create Marksheet', type: 'slink', active: false, show: this.hasPermission('report_create_marksheet') },
          // { path: this.setsymfonyUrl('report/published-marksheet'), title: 'Published Marksheet', type: 'slink', active: false, show: this.hasPermission('report_create_marksheet') },
          // { path: this.setUrl(URLConstants.STUDENT_REPORT), title: 'Student Report', type: 'link', active: false, show: this.hasPermission('report_student_report') },
          // { path: this.setUrl(URLConstants.FEES_REPORT), title: 'Fees Report', type: 'link', active: false, show: this.hasPermission('report_fees_report') },
          // { path: this.setUrl(URLConstants.TRANSPORT_REPORT), title: 'Transport Report', type: 'link', active: false, show: (this.hasPermission('report_transport_report') && this.getInstituteModule('Transport')) },
          // { path: this.setUrl(URLConstants.APPLICATION_LOGIN_REPORT), title: 'Application Login Report', type: 'link', active: false, show: this.hasPermission('report_application_login_report') },
        ]
      },
      // {
      //   title: 'Finance', icon: 'money', type: 'sub', active: false, show: ( (this.getInstituteModule('Finance')) && (this.hasPermission('finance_fees') || this.hasPermission('finance_expense') || this.hasPermission('finance_assign_optional_fees'))) , children: [
      //     { path: this.setsymfonyUrl('feesView'), title: 'Fees', type: 'slink', active: false , show: this.hasPermission('finance_fees') },
      //     { path: this.setsymfonyUrl('expense/expenseReport'), title: 'Expenses', type: 'slink', active: false, show: this.hasPermission('finance_expense')  },
      //     { path: this.setUrl(URLConstants.ASSIGN_OPTIONAL_FEES), title: 'Assign Optional Fees', type: 'link', active: false , show: this.hasPermission('finance_assign_optional_fees') },
      //   ]
      // },
      // {
      //   title: 'Finance', icon: 'money', type: 'sub', active: false, show: ( (this.getInstituteModule('Finance')) && (this.hasPermission('finance_fees') || this.hasPermission('finance_expense') || this.hasPermission('finance_assign_optional_fees'))) , children: [
      //     { path: this.setsymfonyUrl('feesView'), title: 'Fees', type: 'slink', active: false , show: this.hasPermission('finance_fees') },
      //     { path: this.setsymfonyUrl('expense/expenseReport'), title: 'Expenses', type: 'slink', active: false, show: this.hasPermission('finance_expense')  },
      //     { path: this.setUrl(URLConstants.ASSIGN_OPTIONAL_FEES), title: 'Assign Optional Fees', type: 'link', active: false , show: this.hasPermission('finance_assign_optional_fees') },
      //   ]
      // },
      { title: 'Finance',icon: 'money', type: 'sub', show: ( (this.getInstituteModule('Finance')) && ( this.hasModule('finance_assign_optional_fees'))
        || this.hasModule('finance_expenses') || this.hasModule('finance_collect_fees') || this.hasModule('finance_import_fees') || this.hasModule('finance_imported_fees_list') || this.hasModule('finance_wallets') 
        || this.hasModule('finance_fees_collection_center') || this.hasModule('finance_fees_refund') || this.hasModule('finance_expense_report') || this.hasModule('finance_remaining_fee_sms') || this.hasModule('finance_dashboard') || this.hasModule('finance_auto_fee_reminder') || this.hasModule('finance_auto_fee_reminder')
        || this.hasModule('finance_bank_accounts') || this.hasModule('finance_taxes') || this.hasModule('finance_ac_group') || this.hasModule('finance_ledger_accounts') || this.hasModule('finance_incomes')
        || this.hasModule('finance_profit_loss_report') || this.hasModule('finance_collect_cheque')) , children: [
          { title: 'Fees', type: 'sub', active: false, show: true, children: [
            { path: this.setUrl(URLConstants.FEES_DASHBOARD) , title: 'Dashboard', type: 'link', active: false, show: this.hasPermission('finance_dashboard'), relatedTo:['fees']},
           
          ]},
        { title: 'Take Fees', type: 'sub', active: false, show: ( (this.hasModule('finance_assign_optional_fees')
          || this.hasModule('finance_collect_fees') || this.hasModule('finance_import_fees') || this.hasModule('finance_imported_fees_list') || this.hasModule('finance_wallets') 
          || this.hasModule('finance_fees_collection_center') || this.hasModule('finance_fees_refund') || this.hasModule('finance_collect_cheque'))), children: [
          { path: this.setUrl(URLConstants.COLLECT_FEES) , title: 'Collect Fees', type: 'link', active: false, show: this.hasPermission('finance_collect_fees'),relatedTo:['fees']},
          { path: this.setUrl(URLConstants.COLLECT_CHEQUE) , title: 'Collect Cheques', type: 'link', active: false, show: this.hasPermission('finance_collect_cheque', 'has_create'),relatedTo:['fees']},
          // { path: this.setsymfonyUrl('viewfeesReceiptNo'), title: 'Fees Recipts', type: 'slink', active: false, show: this.hasPermission('finance_fees')},
          // { path: this.setUrl(URLConstants.FEES_REPORT), title: 'Fees Report', type: 'link', active: false, show: this.hasPermission('fees_report_fees_report') },
          // { path: this.setsymfonyUrl('feesView'), title: 'Remaining Fees Report', type: 'slink', active: false, show: this.hasPermission('finance_fees')},
          // { path: this.setsymfonyUrl('feesCollection'), title: 'Fees Collection Report', type: 'slink', active: false, show: this.hasPermission('finance_fees')},
          { path: this.setUrl(URLConstants.ASSIGN_OPTIONAL_FEES), title: 'Assign Optional Fees', type: 'link', active: false, show: this.hasPermission('finance_assign_optional_fees'),relatedTo:['fees']},
          { path: this.setUrl(URLConstants.IMPORT_FEES), title: 'Import Fees', type: 'link', active: false,  show: this.hasPermission('finance_import_fees') ,relatedTo:['fees']},
          { path: this.setUrl(URLConstants.FEES_IMPORT_LIST), title: 'Imported Fees List', type: 'link', active: false,  show: this.hasPermission('finance_imported_fees_list'), relatedTo:['fees']},
          { path: this.setUrl(URLConstants.WALLETS), title: 'Wallets', type: 'link', active: false , show: this.hasPermission('finance_wallets') , relatedTo:['hostel']},
          { path: this.setUrl(URLConstants.FEES_CENTER), title: 'Fees Collection Center', type: 'link', active: false,  show: this.hasPermission('finance_fees_collection_center'), relatedTo:['fees']},
          { path: this.setUrl(URLConstants.FEES_REFUND_LIST), title: 'Fees Refund', type: 'link', active: false,  show: this.hasPermission('finance_fees_refund') ,relatedTo:['fees']},
          { path: this.setUrl(URLConstants.GENERATE_DISCOUNT_RECEIPT), title: 'Bulk Discount', type: 'link', active: false,  show: this.bulk_discount ,relatedTo:['fees']},
          { path: this.setUrl(URLConstants.STUDENT_BULK_DISCOUNT), title: 'Student Bulk Discount', type: 'link', active: false,  show: this.hasPermission('finance_fees') ,relatedTo:['fees']},
          { path: this.setUrl(URLConstants.FEES_RECEIPT_NO), title: 'Fees Setting', type: 'link', active: false , show: this.hasPermission('settings_fees_settings'),relatedTo:['fees']},
          { path: this.setUrl(URLConstants.FEES_CATEGORY_LIST), title: 'Fees Category', type: 'link', active: false , show: this.hasPermission('settings_fees_category'),relatedTo:['fees']},
          { path: this.setUrl(URLConstants.CHEQUE_LIST), relatedTo:['fees']},
        ]},
        { title: 'Expense Old', type: 'sub', active: false, show: ( (this.hasModule('finance_expenses')) || this.hasModule('finance_expense_report')), children: [
          { path: this.setsymfonyUrl('expense/expenseReport'), title: 'Expenses', type: 'slink', active: false, show: this.hasPermission('finance_expenses')  },
          { path: this.setUrl(URLConstants.EXPENSE_REPORT), title: 'Expense Report', type: 'link', active: false,  show: this.hasPermission('finance_expense_report'),relatedTo:['expense'] },
        ]},
        { title: 'Expense', type: 'sub', active: false, show: ( (this.hasModule('finance_expenses')) || this.hasModule('finance_expense_report')|| this.hasModule('finance_bank_accounts') 
          || this.hasModule('finance_taxes') || this.hasModule('finance_ac_group') || this.hasModule('finance_ledger_accounts') || this.hasModule('finance_incomes')
          || this.hasModule('finance_profit_loss_report')), children: [
          { path: this.setUrl(URLConstants.BANK_ACCOUNT_LIST), title: 'Bank Accounts', type: 'link', active: false,  show: this.hasPermission('finance_bank_accounts') ,relatedTo:['expense']},
          { path: this.setUrl(URLConstants.TAX_LIST), title: 'Taxes', type: 'link', active: false,  show: this.hasPermission('finance_taxes') ,relatedTo:['expense']},
          { path: this.setUrl(URLConstants.LEDGER_LIST), title: 'A/C Group', type: 'link', active: false,  show: this.hasPermission('finance_ac_group') ,relatedTo:['expense']},
          { path: this.setUrl(URLConstants.HEAD_LIST), title: 'Ledger Accounts', type: 'link', active: false,  show: this.hasPermission('finance_ledger_accounts') ,relatedTo:['expense']},
          { path: this.setUrl(URLConstants.INCOME_LIST), title: 'Incomes', type: 'link', active: false,  show: this.hasPermission('finance_incomes') ,relatedTo:['expense']},
          { path: this.setUrl(URLConstants.EXPENSE_LIST), title: 'Expenses', type: 'link', active: false,  show: this.hasPermission('finance_expenses') ,relatedTo:['expense']},
          { path: this.setUrl(URLConstants.PROFIT_LOSS), title: 'Profit Loss Report', type: 'link', active: false,  show: this.hasPermission('finance_profit_loss_report') ,relatedTo:['expense']},
          // { path: this.setsymfonyUrl('expense/expenseReport'), title: 'Expenses', type: 'slink', active: false, show: this.hasPermission('finance_expense')  },
          // { path: this.setUrl(URLConstants.EXPENSE_REPORT), title: 'Expense Report', type: 'link', active: false,  show: this.hasPermission('finance_expense_report') },
          { path: this.setUrl(URLConstants.EXPENSE_REPORT), title: 'Expense Report', type: 'link', active: false,  show: this.hasPermission('finance_expense_report') ,relatedTo:['expense']},
          // below listed are for side bar just to compare path 
          { path: this.setUrl(URLConstants.ADD_BANK_ACCOUNT), relatedTo: ['expense']},
          { path: this.setUrl(URLConstants.EDIT_BANK_ACCOUNT), relatedTo: ['expense']},
          { path: this.setUrl(URLConstants.INCOME), relatedTo: ['expense']},
          { path: this.setUrl(URLConstants.EXPENSE), relatedTo: ['expense']}
        ]},
        { title: 'Remaining Fees', type: 'sub', active: false, show: ( (this.hasModule('finance_remaining_fee_sms'))), children: [
          { path: this.setUrl(URLConstants.REMAINING_FEE_SMS), title: 'Remaining Fee SMS', type: 'link', active: false,  show: this.hasPermission('finance_remaining_fee_sms') ,relatedTo:['fees'] },
        ]},
        { title: 'Auto Fee Reminder', type: 'sub', active: false, show: ( this.hasModule('finance_auto_fee_reminder')), children: [
          { path: this.setUrl(URLConstants.AUTO_FEE_REMINDER_SETUP), title: 'Fee Reminder Setup', type: 'link', active: false,  show: this.hasPermission('finance_auto_fee_reminder', 'has_create') },
          { path: this.setUrl(URLConstants.AUTO_FEE_REMINDER_LIST), title: 'Fee Reminder List', type: 'link', active: false,  show: this.hasPermission('finance_auto_fee_reminder', 'has_access') },
        ]}
      ] },
      // {
      //   title: 'Administrator', icon: 'bookmark-alt', type: 'sub', active: false, show: ( (this.getInstituteModule('Administrator')) && (this.hasPermission('administrator_meal') || this.hasPermission('administrator_date_wise_meal')
      //   || this.hasPermission('administrator_leave') || this.hasPermission('administrator_assignment') || this.hasPermission('administrator_meal')
      //   || this.hasPermission('administrator_timetable') || this.hasPermission('administrator_calender') || this.hasPermission('administrator_event_gallary')
      //   || this.hasPermission('administrator_poll_management') || this.hasPermission('administrator_old_school'))) , children: [
      //     { path: this.setUrl(URLConstants.MEALS_LIST), title: 'Meal', type: 'link', active: false, show: (this.getInstituteModule('Meal') && this.hasPermission('administrator_meal') )  },
      //     { path: this.setUrl(URLConstants.DATE_WISE_MEALS_LIST), title: 'Date Wise Meal', type: 'link', active: false , show: (this.getInstituteModule('Meal') && this.hasPermission('administrator_date_wise_meal'))  },
      //     { path: this.setUrl(URLConstants.LEAVES_LIST), title: 'Leave', type: 'link', active: false , show: this.getInstituteModule('Leave') && this.hasPermission('administrator_leave') },
      //     { path: this.setsymfonyUrl('attachment/attachmentList'), title: 'Assignment', type: 'slink', active: false , show: this.hasPermission('administrator_assignment') },
      //     { path: this.setsymfonyUrl('timetable/list'), title: 'Time Table', type: 'slink', active: false , show: this.hasPermission('administrator_timetable') && this.notification.timetable_module == 0 },
      //     { path: this.setUrl(URLConstants.ADD_TIMETABLE), title: 'Time Table', type: 'link', active: false , show: this.hasPermission('administrator_timetable') && this.notification.timetable_module == 1 },
      //     { path: this.setUrl(URLConstants.FACULTY_TIMETABLE), title: 'Faculty Timetable', type: 'link', icon: 'timer', badgeClass: 'danger', active: false, show: (this.is_faculty && this.hasPermission('administrator_faculty_timetable')) },
      //     { path: this.setsymfonyUrl('timetable/calendar'), title: 'Calendar', type: 'slink', active: false , show: this.hasPermission('administrator_calender') },
      //     { path: this.setsymfonyUrl('event/addEvent'), title: 'Events Gallery', type: 'slink', active: false , show: this.hasPermission('administrator_event_gallary') },
      //     { path: this.setUrl(URLConstants.POLL_LIST), title: 'Poll Management', type: 'link', active: false , show: this.getInstituteModule('Poll') && this.hasPermission('administrator_poll_management')},
      //     { path: this.setUrl(URLConstants.SCHOOL_LIST), title: 'Old Schools', type: 'link', active: false , show: this.hasPermission('administrator_old_school') },
      //     { path: this.setUrl(URLConstants.DOCUMENT_MANAGER), title: 'Document Manager', type: 'link', active: false, show: this.getInstituteModule('Document Manager')},
      //     { path: this.setUrl(URLConstants.GENERATE_CERTIFICATE), title: 'Certificate Generator', type: 'link', active: false , show: true },
      //   ]
      // },
      {
        title: 'Administrator', icon: 'bookmark-alt', type: 'sub', active: false, show: ( (this.getInstituteModule('Administrator')) && (this.hasModule('administrator_meal') || this.hasModule('administrator_date_wise_meal')
        || this.hasModule('administrator_timetable') || this.hasModule('administrator_lecture_timing') || this.hasModule('administrator_subject_lecture') || this.hasModule('administrator_subject_faculty') || this.hasModule('administrator_assign_room') || this.hasModule('administrator_proxy_lecture') || this.hasModule('administrator_extra_lecture') || this.hasModule('administrator_calender') || this.hasModule('administrator_event_gallary') || this.hasModule('administrator_poll_management') || this.hasModule('administrator_old_school') || this.hasModule('administrator_holiday') || this.hasModule('administrator_event_type') || this.hasModule('administrator_event')
        || this.hasModule('administrator_faculty_timetable') || this.hasModule('administrator_document_manager') || this.hasModule('concern_concern'))) , children: [
          {title: 'Meal', type: 'sub', active: false, show: (this.getInstituteModule('Meal') && this.hasModule('administrator_meal') || this.hasModule('administrator_date_wise_meal')) , children:[
            { path: this.setUrl(URLConstants.MEALS_LIST), title: 'Meal list', type: 'link', active: false , show: (this.getInstituteModule('Meal') && this.hasPermission('administrator_meal')) ,relatedTo:['meal_management'] },
            { path: this.setUrl(URLConstants.MEALS_CREATE), title: 'Add Meal', type: 'link', active: false , show: (this.getInstituteModule('Meal') && this.hasPermission('administrator_meal','has_create')),relatedTo:['meal_management']   },
            { path: this.setUrl(URLConstants.DATE_WISE_MEALS_LIST), title: 'Datewise meal', type: 'link', active: false , show: (this.getInstituteModule('Meal') && this.hasPermission('administrator_date_wise_meal')) ,relatedTo:['meal_management']  },
            { path: this.setUrl(URLConstants.DATE_WISE_MEALS_CREATE), title: 'Add Datewise meal', type: 'link', active: false , show: (this.getInstituteModule('Meal') && this.hasPermission('administrator_date_wise_meal','has_create')) ,relatedTo:['meal_management']  },
          ] },
          { title: 'Time Table', type: 'sub', active: false , show: this.hasModule('administrator_timetable') , children:[
            { path: this.setUrl(URLConstants.ADD_TIMETABLE), title: 'Create Timetable', type: 'link', active: false , show: (this.hasPermission('administrator_timetable')  && this.notification.timetable_module == 1 ) ,relatedTo:['timetable'] },
            { path: this.setUrl(URLConstants.DOWNLOAD_TIMETABLE), title: 'Download Timetable', type: 'link', active: false , show: (this.hasPermission('administrator_timetable', 'has_download')  && this.notification.timetable_module == 1 ) ,relatedTo:['timetable'] },
            { path: this.setsymfonyUrl('timetable/list'), title: 'Time Table', type: 'slink', active: false , show: this.hasPermission('administrator_timetable') && this.notification.timetable_module == 0 },
            // { path: this.setUrl(URLConstants.TEACHERS_TIMETABLE), title: 'Generate Time Table', type: 'link', active: false , show: (this.getInstituteModule('Meal') && this.hasPermission('administrator_date_wise_meal'))  },
            // { path: this.setUrl(URLConstants.ADD_TIMETABLE), title: 'Generate Auto Time Table', type: 'link', active: false , show: (this.getInstituteModule('Meal') && this.hasPermission('administrator_date_wise_meal'))  },
          ] },
          { title: 'Time Table Settings', type: 'sub', active: false , show: (this.hasModule('administrator_lecture_timing') || this.hasModule('administrator_subject_lecture') || this.hasModule('administrator_subject_faculty') || 
            this.hasModule('administrator_assign_room') || this.hasModule('administrator_proxy_lecture') || this.hasModule('administrator_extra_lecture'))  && this.notification.timetable_module == 1, children:[
            { path: this.setUrl(URLConstants.ADD_LECTURE_TIMINGS), title: 'Add Lecture Timing', type: 'link', active: false ,show: this.hasPermission('administrator_lecture_timing') && this.notification.timetable_module == 1,relatedTo:['timetable']},
            { path: this.setUrl(URLConstants.ASSIGN_LECTURE), title: 'Assign Subject Lecture', type: 'link', active: false ,show: this.hasPermission('administrator_subject_lecture') && this.notification.timetable_module == 1,relatedTo:['timetable']},
            { path: this.setUrl(URLConstants.ASSIGN_SUBJECT), title: 'Assign Subject Faculty', type: 'link', active: false , show: (this.hasPermission('administrator_subject_faculty') && this.hasPermission('faculty_faculty','has_access') && this.notification.timetable_module == 1),relatedTo:['timetable']},
            // { path: this.setUrl(URLConstants.ADD_TIMETABLE), title: 'Generate Auto Time Table', type: 'link', active: false , show: this.hasPermission('administrator_timetable') },
            { path: this.setUrl(URLConstants.ASSIGN_ROOM), title: 'Assign Room', type: 'link', active: false , show: this.hasPermission('administrator_assign_room') && this.notification.timetable_module == 1,relatedTo:['timetable']},
            { path: this.setUrl(URLConstants.PROXY_TEACHERS_TIMETABLE), title: 'Add Proxy Lecture', type: 'link', active: false , show: this.hasPermission('administrator_proxy_lecture') && this.notification.timetable_module == 1 , relatedTo:['timetable']},
            { path: this.setUrl(URLConstants.PROXY_TIMETABLE_LIST), title: 'Proxy Teacher Timetable List', type: 'link', active: false , show: this.hasPermission('administrator_proxy_lecture') && this.notification.timetable_module == 1,relatedTo:['timetable']},
            { path: this.setUrl(URLConstants.ADD_EXTRA_LECTURE), title: 'Add Extra Lecture', type: 'link', active: false , show: this.hasPermission('administrator_extra_lecture') && this.notification.timetable_module == 1,relatedTo:['timetable']},
            { path: this.setUrl(URLConstants.EXTRA_LECTURE_LIST), title: 'Extra Lecture List', type: 'link', active: false , show: this.hasPermission('administrator_extra_lecture') && this.notification.timetable_module == 1,relatedTo:['timetable']},
            // below listed are for side bar just to compare path  
            { path: this.setUrl(URLConstants.MEALS_EDIT), relatedTo: ['meal_management']},
            { path: this.setUrl(URLConstants.DATE_WISE_MEALS_EDIT), relatedTo: ['meal_management']},
            { path: this.setUrl(URLConstants.EDIT_EVENT), relatedTo: ['calendar']},
            { path: this.setUrl(URLConstants.EVENT_LIST), relatedTo: ['calendar']},
            { path: this.setUrl(URLConstants.EVENT_EDIT), relatedTo: ['calendar']},
            { path: this.setUrl(URLConstants.DOCUMENT_EDIT), relatedTo: ['document_management']},
            { path: this.setUrl(URLConstants.DOCUMENT_ADD), relatedTo: ['document_management']},
            // { path: this.setUrl(URLConstants.COMPLAIN_ADD), relatedTo: ['document_management']},
            // { path: this.setUrl(URLConstants.COMPLAIN_EDIT), relatedTo: ['document_management']},
            // { path: this.setUrl(URLConstants.COMPLAIN_VIEW), relatedTo: ['document_management']},
            { path: this.setUrl(URLConstants.ADD_TIME_SLOT), relatedTo: ['timetable']},
            { path: this.setUrl(URLConstants.CREATE_ROOM), relatedTo: ['timetable']},
            // { path: this.setUrl(URLConstants.COMPLAIN_VIEW), relatedTo: ['document_management']},
            { path: this.setUrl(URLConstants.SUBJECT_LECTURE), relatedTo: ['timetable']},
            { path: this.setUrl(URLConstants.TEACHERS_TIMETABLE), relatedTo: ['timetable']},
            // { path: this.setUrl(URLConstants.DATE_WISE_MEALS_CREATE), title: 'Create Lecture', type: 'link', active: false ,show: this.hasPermission('administrator_timetable') },
          ] },
          { title: 'Faculty Time Table', type: 'sub', active: false , show: this.hasModule('administrator_faculty_timetable') && !this.is_admin, children:[
            // { path: this.setUrl(URLConstants.TEACHERS_TIMETABLE), title: 'Faculty Timetable List', type: 'link', active: false , show: this.hasPermission('administrator_timetable') && this.notification.timetable_module == 1 && this.is_admin},
            { path: this.setUrl(URLConstants.FACULTY_TIMETABLE), title: 'Faculty Timetable List', type: 'link', active: false , show: this.hasPermission('administrator_faculty_timetable') && !this.is_admin , relatedTo: ['timetable']},
          ] },
          // { title: 'Proxy Time Table', type: 'sub', active: false , show: (this.hasModule('administrator_timetable')) && this.notification.timetable_module == 1 , children:[
          //   { path: this.setUrl(URLConstants.PROXY_TEACHERS_TIMETABLE), title: 'Assign Proxy Time Table', type: 'link', active: false , show: this.hasPermission('administrator_timetable')},
          //   { path: this.setUrl(URLConstants.PROXY_TIMETABLE_LIST), title: 'View Proxy Time Table', type: 'link', active: false , show: this.hasPermission('administrator_timetable')},
          // ] },
          { title: 'Calendar', type: 'sub', active: false , show: (this.hasModule('administrator_calender') ||  this.hasModule('administrator_holiday') || this.hasModule('administrator_event_type') || this.hasModule('administrator_event') ) , children:[
            // { path: this.setsymfonyUrl('timetable/calendar'), title: 'Calendar List', type: 'slink', active: false , show: this.hasPermission('administrator_calender') },
            // { path: this.setUrl(URLConstants.EVENT_CREATE), title: 'Add Event', type: 'link', active: false , show: this.hasPermission('administrator_calender','has_create') ,relatedTo:['calendar'] },
            // { path: this.setsymfonyUrl('timetable/addtask'), title: 'Add Task', type: 'slink', active: false , show: this.hasPermission('administrator_calender','has_create')  },
            // { path: this.setUrl(URLConstants.CREATE_EVENT), title: 'Add Event Type', type: 'link', active: false , show: this.is_admin,relatedTo:['calendar']},
            { path: this.setUrl(URLConstants.CALENDAR), title: 'Calendar', type: 'link', active: false , show: this.hasModule('administrator_calender') ,relatedTo:['calendar']},
            { path: this.setUrl(URLConstants.EVENT_HOLIDAY_LIST), title: 'Event List', type: 'link', active: false , show: this.hasModule('administrator_event') , slug: 'event' ,relatedTo:['calendar']},
            { path: this.setUrl(URLConstants.EVENT_HOLIDAY_LIST), title: 'Holiday List', type: 'link', active: false , show: this.hasModule('administrator_holiday') , slug: 'holiday' ,relatedTo:['calendar']},
            { path: this.setUrl(URLConstants.ADD_MULTI_EVENT), relatedTo:['calendar']},
          ] },
          { title: 'Event Gallery', type: 'sub', active: false , show: this.hasModule('administrator_event_gallary') , children:[
            // { path: this.setsymfonyUrl('event/addEvent'), title: 'Event Gallery List', type: 'slink', active: false , show: this.hasPermission('administrator_event_gallary') },
            { path: this.setUrl(URLConstants.EVENT_GALLERY_LIST), title: 'Event Gallery', type: 'link', active: false , show: this.hasPermission('administrator_event_gallary'),relatedTo:['event_gallery']},
            { path: this.setUrl(URLConstants.EVENT_GALLERY_DETAIL), relatedTo: ['event_gallery']},
          ] },
          { title: 'Poll Management', type: 'sub', active: false , show: this.getInstituteModule('Poll') && this.hasModule('administrator_poll_management') , children:[
            { path: this.setUrl(URLConstants.POLL_LIST), title: 'Poll Management', type: 'link', active: false , show: this.getInstituteModule('Poll') && this.hasPermission('administrator_poll_management'),relatedTo:['calendar']},
          ] },
          { title: 'Old Schools', type: 'sub', active: false , show: this.hasModule('administrator_old_school') , children:[
            { path: this.setUrl(URLConstants.SCHOOL_LIST), title: 'Old Schools', type: 'link', active: false , show: this.hasPermission('administrator_old_school') ,relatedTo:['settings']},
          ] },
          { title: 'Document Manager', type: 'sub', active: false , show: this.getInstituteModule('Document Manager') && this.hasModule('administrator_document_manager'), children:[
            { path: this.setUrl(URLConstants.DOCUMENT_MANAGER), title: 'Document Manager', type: 'link', active: false, show: this.getInstituteModule('Document Manager') && this.hasModule('administrator_document_manager'),relatedTo:['document_management']},
          ] }, 
          { title: 'Hall Ticket', type: 'sub', active: false , show: this.hasModule('administrator_hall_ticket'), children:[
            { path: this.setUrl(URLConstants.HALL_TICKET), title: 'Hall Ticket', type: 'link', active: false, show: this.hasPermission('administrator_hall_ticket'),relatedTo:['exam']},
          ] },
          { title: 'Template Manager', type: 'sub', active: false , show: this.hasModule('administrator_template_manager') , children:[
            { path: this.setUrl(URLConstants.UPLOAD_DOCUMENT), title: 'Upload Document', type: 'link', active: false, show: this.hasPermission('administrator_template_manager'),relatedTo:['document_management']},
          ] }, 
          { title: "Teacher's Achievement", type: 'sub', active: false , show: this.hasModule('administrator_teacher_achivement'), children:[
            { path: this.setUrl(URLConstants.TEACHER_ACHIVEMENT), title: 'Achievement', type: 'link', active: false, show: this.hasPermission('administrator_teacher_achivement'),relatedTo:['employees']},
          ] },
          { title: "Concern", type: 'sub', active: false , show: this.hasModule('concern_concern'), children:[
            { path: this.setUrl(URLConstants.COMPLAIN_LIST), title: 'Concern List', type: 'link', active: false, show: this.hasPermission('concern_concern', 'has_access')},
          //below path added for sidebar
          { path: this.setUrl(URLConstants.POLL_CREATE),relatedTo:['calendar']}, 
          { path: this.setUrl(URLConstants.POLL_EDIT),relatedTo:['calendar']}, 
          { path: this.setUrl(URLConstants.STUDENT_POLL_LIST),relatedTo:['calendar']}, 
            // { path: this.setUrl(URLConstants.COMPLAIN_ADD), title: 'Add Complain', type: 'link', active: false, show: this.hasPermission('complain_complain', 'has_create')},
          ] },
          { title: "Activity Log", type: 'sub', active: false , show: this.isActivityLog , children:[
            { path: this.setUrl(URLConstants.ACTIVITY_LOG_LIST), title: 'Activity Log List', type: 'link', active: false , show: this.isActivityLog },
          ] },

          // { title: 'Hall Ticket', type: 'sub', active: false , show: true , children:[
          //   { path: this.setUrl(URLConstants.HALL_TICKET), title: 'Hall ticket', type: 'link', active: false, show: true},
          // ] },
          // { path: this.setUrl(URLConstants.DATE_WISE_MEALS_LIST), title: 'Date Wise Meal', type: 'link', active: false , show: (this.getInstituteModule('Meal') && this.hasPermission('administrator_date_wise_meal'))  },
          // { path: this.setUrl(URLConstants.LEAVES_LIST), title: 'Leave', type: 'link', active: false , show: this.getInstituteModule('Leave') && this.hasPermission('administrator_leave') },
          // { path: this.setsymfonyUrl('attachment/attachmentList'), title: 'Assignment', type: 'slink', active: false , show: this.hasPermission('administrator_assignment') },
          // { path: this.setsymfonyUrl('timetable/list'), title: 'Time Table', type: 'slink', active: false , show: this.hasPermission('administrator_timetable') && this.notification.timetable_module == 0 },
          // { path: this.setUrl(URLConstants.ADD_TIMETABLE), title: 'Time Table', type: 'link', active: false , show: this.hasPermission('administrator_timetable') && this.notification.timetable_module == 1 },
          // { path: this.setUrl(URLConstants.FACULTY_TIMETABLE), title: 'Faculty Timetable', type: 'link', icon: 'timer', badgeClass: 'danger', active: false, show: (this.is_faculty && this.hasPermission('administrator_faculty_timetable')) },
          // { path: this.setsymfonyUrl('timetable/calendar'), title: 'Calendar', type: 'slink', active: false , show: this.hasPermission('administrator_calender') },
          // { path: this.setsymfonyUrl('event/addEvent'), title: 'Events Gallery', type: 'slink', active: false , show: this.hasPermission('administrator_event_gallary') },
          // { path: this.setUrl(URLConstants.POLL_LIST), title: 'Poll Management', type: 'link', active: false , show: this.getInstituteModule('Poll') && this.hasPermission('administrator_poll_management')},
          // { path: this.setUrl(URLConstants.SCHOOL_LIST), title: 'Old Schools', type: 'link', active: false , show: this.hasPermission('administrator_old_school') },
          // { path: this.setUrl(URLConstants.DOCUMENT_MANAGER), title: 'Document Manager', type: 'link', active: false, show: this.getInstituteModule('Document Manager')},
          // { path: this.setUrl(URLConstants.GENERATE_CERTIFICATE), title: 'Certificate Generator', type: 'link', active: false , show: true },

          // { path: this.setUrl(URLConstants.HOMEWORK_LIST), title: 'Homework', type: 'link', active: false , show: this.hasPermission('administrator_homework')},
          // { path: this.setUrl(URLConstants.ASSIGNMENT_LIST), title: 'Assignment', type: 'link', active: false , show: this.hasPermission('administrator_assignment')},
          // { path: this.setUrl(URLConstants.CLASSWORK_LIST), title: 'Classwork', type: 'link', active: false , show: this.hasPermission('administrator_classwork')},

          // { path: this.setUrl(URLConstants.SYLLABUS_LIST), title: 'Syllabus', type: 'link', active: false , show: this.hasPermission('administrator_syllabus')},
          // { path: this.setUrl(URLConstants.NOTES_LIST), title: 'Notes', type: 'link', active: false , show: this.hasPermission('administrator_notes')},
          // { path: this.setUrl(URLConstants.VIDEO_LIST), title: 'VideoLink', type: 'link', active: false , show: this.hasPermission('administrator_videolink')},
          // { path: this.setUrl(URLConstants.NOTICE_LIST), title: 'Notice', type: 'link', active: false , show: this.hasPermission('administrator_notice')},


          // { path: this.setsymfonyUrl('timetable/list'), title: 'Time Table', type: 'slink', active: false , show: this.hasPermission('administrator_timetable') && this.notification.timetable_module == 0 },
          // { path: this.setUrl(URLConstants.ADD_TIMETABLE), title: 'Time Table', type: 'link', active: false , show: this.hasPermission('administrator_timetable') && this.notification.timetable_module == 1 },
          // { path: this.setUrl(URLConstants.FACULTY_TIMETABLE), title: 'Faculty Timetable', type: 'link', icon: 'timer', badgeClass: 'danger', active: false, show: (this.is_faculty && this.hasPermission('administrator_faculty_timetable')) },
          // { path: this.setsymfonyUrl('timetable/calendar'), title: 'Calendar', type: 'slink', active: false , show: this.hasPermission('administrator_calender') },
          // { path: this.setsymfonyUrl('event/addEvent'), title: 'Events Gallery', type: 'slink', active: false , show: this.hasPermission('administrator_event_gallary') },
          // { path: this.setUrl(URLConstants.POLL_LIST), title: 'Poll Management', type: 'link', active: false , show: this.getInstituteModule('Poll') && this.hasPermission('administrator_poll_management')},
          // { path: this.setUrl(URLConstants.SCHOOL_LIST), title: 'Old Schools', type: 'link', active: false , show: this.hasPermission('administrator_old_school') },
          // { path: this.setUrl(URLConstants.DOCUMENT_MANAGER), title: 'Document Manager', type: 'link', active: false, show: this.getInstituteModule('Document Manager')},
          // { path: this.setUrl(URLConstants.GENERATE_CERTIFICATE), title: 'Certificate Generator', type: 'link', active: false , show: this.hasPermission('administrator_certificate_generator') },
        ]
      },
      // {
      //   title: 'Payroll', icon: 'wallet', type: 'sub', active: false, show: ( (this.getInstituteModule('Payroll')) && (this.hasPermission('payroll_payroll_management') || this.hasPermission('payroll_payslip_list'))) ,children: [
      //     { path: this.setUrl(URLConstants.PAYROLL), title: 'Payroll Management', type: 'link', active: false, show: this.hasPermission('payroll_payroll_management') && !this.is_faculty},
      //     { path: this.setUrl(URLConstants.STAFF_PAYSLIP), title: 'Payslip List', type: 'link', active: false, show: this.hasPermission('payroll_payslip_list')},
      //     // { path: this.setUrl(URLConstants.FACULTY_LEAVE_LIST), title: 'Faculty Leave List', type: 'link', active: false, show: true },
      //   ]
      // },
       {
        title: 'Payroll', icon: 'wallet', type: 'sub', active: false, show:  ( (this.getInstituteModule('Payroll')) && (this.hasModule('payroll_payroll_management') || this.hasModule('payroll_payslip_list')))  ,children: [
          { title: 'Payroll', type: 'sub', active: false , show: ( (this.hasModule('payroll_payroll_management') || this.hasModule('payroll_payslip_list'))) , children:[
            { path: this.setUrl(URLConstants.STAFF_PAYSLIP), title: 'Payslip List', type: 'link', active: false, show: (this.hasPermission('payroll_payslip_list')),relatedTo:['payroll']},
            { path: this.setUrl(URLConstants.PAYROLL), title: 'Payroll Management', type: 'link', active: false, show: (this.hasPermission('payroll_payroll_management') && !this.is_faculty),relatedTo:['payroll']},
            // below listed are for side bar just to compare path  
            { path: this.setUrl(URLConstants.ADD_SALARY), relatedTo: ['payroll']},
            { path: this.setUrl(URLConstants.ADD_PAYROLL_CATEGORY), relatedTo: ['payroll']},
            { path: this.setUrl(URLConstants.PAYROLL_CATEGORY_LIST), relatedTo: ['payroll']},
            { path: this.setUrl(URLConstants.PAYROLL_GROUP), relatedTo: ['payroll']},
            { path: this.setUrl(URLConstants.ASSIGN_PAYROLL_GROUP), relatedTo: ['payroll']},
            { path: this.setUrl(URLConstants.PAYSLIP_LIST), relatedTo: ['payroll']},
            { path: this.setUrl(URLConstants.ASSIGNED_PAYROLL_GROUP_LIST), relatedTo: ['payroll']},
            { path: this.setUrl(URLConstants.ADD_PAYROLL_GROUP), relatedTo: ['payroll']},
            { path: this.setUrl(URLConstants.GENERATE_PAYSLIP), relatedTo: ['payroll']},
            { path: this.setUrl(URLConstants.ATTENDANCE_LIST), relatedTo: ['payroll']},
            { path: this.setUrl(URLConstants.MONTHWISE_LIST), relatedTo: ['payroll']},
            { path: this.setUrl(URLConstants.PAYROLL_CALCULATION), relatedTo: ['payroll']},
            { path: this.setUrl(URLConstants.MONTHLY_WORKING_DAYS), relatedTo: ['payroll']}
          ] },
          // { path: this.setUrl(URLConstants.FACULTY_LEAVE_LIST), title: 'Faculty Leave List', type: 'link', active: false, show: true },
        ]
      },

      // {
      //   title: 'Inventory', icon: 'shift-left-alt', type: 'sub', active: false, show: (this.is_staff || this.is_branch_admin || this.is_admin) ,children: [
      //     { path: this.setUrl(URLConstants.VENDOR_LIST), title: 'Vendor List', type: 'link', active: false, show: true},
      //     { path: this.setUrl(URLConstants.FACULTY_LEAVE_LIST), title: 'Faculty Leave List', type: 'link', active: false, show: true },
      //   ]
      // },
      // {
      //   path: this.setsymfonyUrl('report/viewattendance'), title: 'Attendance', type: 'slink', icon: 'check-box', badgeClass: 'danger', active: false, show: (this.is_faculty && this.notification.attendance_type == '2')
      // },
      // {
      //   title: 'Lecture', icon: 'blackboard', type: 'sub', active: false, show: ( (this.getInstituteModule('Lecture')) && (this.hasPermission('lecture_lecture') && this.notification.attendance_type == '1')), children: [
      //     { path: this.setsymfonyUrl('lecture/view'), title: 'Today Schedule', type: 'slink', icon: 'class', badgeClass: 'danger', active: false, show: this.hasPermission('lecture_lecture') },
      //     { path: this.setsymfonyUrl('lecture/list'), title: 'Lecture', type: 'slink', icon: 'blackboard', badgeClass: 'danger', active: false, show: this.hasPermission('lecture_lecture') }
      //   ]
      // },
      // {
      //   path: this.setsymfonyUrl('exam/viewExam'), title: 'Exam', type: 'slink', icon: 'clipboard', badgeClass: 'danger', active: false, show: this.is_faculty
      // },
      // {
      //   title: 'Leave', icon: 'timer', type: 'sub', active: false, show: (!this.is_admin && (this.getInstituteModule('Leave')) && (this.hasPermission('leave_approve_leave') || this.hasPermission('leave_faculty_leave'))) ,children: [
      //     { path: this.setUrl(URLConstants.FACULTY_STUDENT_LEAVEL_LIST), title: 'Approve Leave', type: 'link', active: false, show: this.hasPermission('leave_approve_leave') },
      //     { path: this.setUrl(URLConstants.FACULTY_LEAVE_LIST), title: 'Faculty Leave List', type: 'link', active: false, show: this.hasPermission('leave_faculty_leave') },
      //   ]
      // },
      {
        title: 'Leave', icon: 'timer', type: 'sub', active: false, show: true,
        children: [
          {
            title: 'Leave', type: 'sub', active: false, show: true,
            children: [
              { path: this.setUrl(URLConstants.LEAVES_LIST), title: 'Leave List', type: 'link', active: false, show: true,relatedTo:['leave'] },
              // below listed are for side bar just to compare path  
              { path: this.setUrl(URLConstants.ADMIN_LEAVE_EDIT_FORM), relatedTo: ['leave']},
              { path: this.setUrl(URLConstants.FACULTY_EDIT_STUDENT_LEAVE), relatedTo: ['leave']},
              { path: this.setUrl(URLConstants.FACULTY_LEAVE_EDIT_FORM), relatedTo: ['leave']},
              { path: this.setUrl(URLConstants.FACULTY_LEAVE), relatedTo: ['leave']},
              { path: this.setUrl(URLConstants.FACULTY_LEAVE_LIST), relatedTo: ['leave']},
              { path: this.setUrl(URLConstants.FACULTY_LEAVE_CREATE), relatedTo: ['leave']},
              { path: this.setUrl(URLConstants.FACULTY_STUDENT_LEAVEL_LIST), relatedTo: ['leave']},
              { path: this.setUrl(URLConstants.FACULTY_ADD_STUDENT_LEAVE), relatedTo: ['leave']},
              { path: this.setUrl(URLConstants.ADMIN_STUDENT_TAB), relatedTo: ['leave']}
              // { path: this.setUrl(URLConstants.FACULTY_STUDENT_LEAVEL_LIST), title: 'Approve Leave', type: 'link', active: false, show: (this.hasPermission('leave_approve_leave'))},
              // { path: this.setUrl(URLConstants.FACULTY_LEAVE_LIST), title: 'Faculty Leave List', type: 'link', active: false, show: (this.hasPermission('leave_faculty_leave'))},
            ]
          },
        ]
      },

      // {
      //   title: 'Administrator', icon: 'bookmark-alt', type: 'sub', active: false, show: this.is_faculty, children: [
      //     { path: this.setsymfonyUrl('attachment/attachmentList'), title: 'Assignment', type: 'slink', active: false , show: true},
      //     { path: this.setsymfonyUrl('timetable/calendar'), title: 'Calendar', type: 'slink', active: false , show: true},
      //     { path: this.setsymfonyUrl('event/addEvent'), title: 'Events Gallery', type: 'slink', active: false , show: true},
      //   ]
      // },
      // {
      //   title: 'Inventory', icon: 'shift-left-alt', type: 'sub', active: false, show: (this.is_faculty && this.getInstituteModule('Leave')),children: [
      //     { path: this.setUrl(URLConstants.VENDOR_LIST), title: 'Vendor List', type: 'link', active: false, show: true},
      //     { path: this.setUrl(URLConstants.FACULTY_LEAVE_LIST), title: 'Faculty Leave List', type: 'link', active: false, show: true },
      //   ]
      // },
      // {
      //   path: this.setUrl(URLConstants.FACULTY_LESSON_LIST), title: 'Lesson', type: 'link', icon: 'book', badgeClass: 'danger', active: false, show: (this.getInstituteModule('Lesson Planning') && this.hasPermission('lesson_planning'))
      // },
      // {
      //   path: this.setUrl(URLConstants.TEACHER_DIARY_LIST), title: 'Teacher\'s Diary', type: 'link', icon: 'agenda', badgeClass: 'danger',  active: false, show: (this.getInstituteModule('Teacher\'s Diary')  && this.hasPermission('teacher_diary'))
      // },
      // {
      //   title: 'Report', icon: 'stats-up', type: 'sub', active: false, show: ( (this.getInstituteModule('Report')) && (this.hasPermission('report_student_of_the_month') || this.hasPermission('report_school_marksheet') || this.hasPermission('report_all_reports')
      //   || this.hasPermission('report_generate_marksheet') || this.hasPermission('report_create_marksheet') || this.hasPermission('report_published_marksheet') || this.hasPermission('report_student_report') || this.hasPermission('report_fees_report')
      //   || this.hasPermission('report_transport_report') || this.hasPermission('report_application_login_report'))), children: [
      //     { path: this.setsymfonyUrl('report/student-of-the-month'), title: 'Student of the Month', type: 'slink', active: false, show: this.hasPermission('report_student_of_the_month') },
      //     { path: this.setsymfonyUrl('report/batch-students'), title: 'School Marksheet', type: 'slink', active: false, show: this.hasPermission('report_school_marksheet') },
      //     { path: this.setsymfonyUrl('report/exam'), title: 'All Reports', type: 'slink', active: false, show: this.hasPermission('report_all_reports') },
      //     { path: this.setsymfonyUrl('report/generate-marksheet'), title: 'Generate Marksheet', type: 'slink', active: false , show: this.hasPermission('report_generate_marksheet')},
      //     { path: this.setsymfonyUrl('report/marksheet-create'), title: 'Create Marksheet', type: 'slink', active: false, show: this.hasPermission('report_create_marksheet') },
      //     { path: this.setsymfonyUrl('report/published-marksheet'), title: 'Published Marksheet', type: 'slink', active: false, show: this.hasPermission('report_create_marksheet') },
      //     { path: this.setUrl(URLConstants.STUDENT_REPORT), title: 'Student Report', type: 'link', active: false, show: this.hasPermission('report_student_report') },
      //     { path: this.setUrl(URLConstants.FEES_REPORT), title: 'Fees Report', type: 'link', active: false, show: this.hasPermission('report_fees_report') },
      //     { path: this.setUrl(URLConstants.TRANSPORT_REPORT), title: 'Transport Report', type: 'link', active: false, show: (this.hasPermission('report_transport_report') && this.getInstituteModule('Transport')) },
      //     { path: this.setUrl(URLConstants.APPLICATION_LOGIN_REPORT), title: 'Application Login Report', type: 'link', active: false, show: this.hasPermission('report_application_login_report') },
      //   ]
      // },
      {
        // path: this.setsymfonyUrl('sms/send'), title: 'Message', type: 'slink', icon: 'comments', badgeClass: 'danger', active: false, show: (this.getInstituteModule('Message') && this.hasPermission('message_message'))
        path: this.setUrl(URLConstants.MESSAGE), title: 'Message', type: 'link', icon: 'comments', badgeClass: 'danger', active: false, show: (this.getInstituteModule('Message') && this.hasPermission('message_message'))
      },
      // {
      //   title: 'Inquiry', icon: 'headphone-alt', type: 'sub', active: false, show: ( (this.getInstituteModule('Inquiry')) && (this.hasPermission('inquiry_inquiry_list') || this.hasPermission('inquiry_custom_field_list'))), children: [
      //     { path: this.setsymfonyUrl('inquiry/list'), title: 'Inquiry List', type: 'slink', active: false, show: this.hasPermission('inquiry_inquiry_list') },
      //     { path: this.setsymfonyUrl('inquiry/customFieldList'), title: 'Custom Field List', type: 'slink', active: false, show: this.hasPermission('inquiry_custom_field_list') }
      //   ]
      // },
      {
        title: 'Inquiry', icon: 'headphone-alt', type: 'sub', active: false, show: ((this.getInstituteModule('Inquiry')) && (this.hasModule('inquiry_inquiry') || this.hasModule('inquiry_custom_field_list') || this.hasModule('inquiry_form_builder'))), children: [
          {
            title: 'Inquiry', type: 'sub', active: false, show: (this.hasModule('inquiry_inquiry') || this.hasModule('inquiry_custom_field_list') || this.hasModule('inquiry_form_builder')), children: [
            { path: this.setUrl(URLConstants.INQUIRY_LIST), title: 'Inquiry List', type: 'link', active: false, show: (this.hasPermission('inquiry_inquiry')),relatedTo:['inquiry']},
            { path: this.setUrl(URLConstants.CUSTOM_FIELD), title: 'Custom Fields', type: 'link', active: false , show: this.hasPermission('inquiry_custom_field_list'),relatedTo:['inquiry']},
            // { path: this.setsymfonyUrl('inquiry/list'), title: 'Inquiry List', type: 'slink', active: false, show: this.hasPermission('inquiry_inquiry_list') },
            // { path: this.setsymfonyUrl('inquiry/customFieldList'), title: 'Custom Field List', type: 'slink', active: false, show: this.hasPermission('inquiry_custom_field_list') }
              { path: this.setUrl(URLConstants.FORM_BUILDER_INQUIRY_LIST), title: 'Form Builder', type: 'link', active: false, show: this.hasPermission('inquiry_form_builder'),relatedTo:['inquiry'] }, 
            // this.hasPermission('inquiry_form_builder'),
            // below listed are for side bar just to compare path  
            { path: this.setUrl(URLConstants.INQUIRY_EDIT), relatedTo: ['inquiry']},
            { path: this.setUrl(URLConstants.INQUIRY_IMPORT), relatedTo: ['inquiry']},
            { path: this.setUrl(URLConstants.INQUIRY_VIEW), relatedTo: ['inquiry']},
            { path: this.setUrl(URLConstants.CUSTOM_FIELDS_ADD), relatedTo: ['settings']},      
            { path: this.setUrl(URLConstants.ADD_INQUIRY), relatedTo: ['inquiry']},
            { path: this.setUrl(URLConstants.INQUIRY_FOLLOW_UP), relatedTo: ['inquiry']},
            { path: this.setUrl(URLConstants.FORM_BUILDER_INQUIRY_ADD), relatedTo: ['inquiry']},
            { path: this.setUrl(URLConstants.FORM_BUILDER_INQUIRY_EDIT), relatedTo: ['inquiry']},
        ] },
        ]
      },
      {
        path: this.setsymfonyUrl('frontoffice/callFollowup'), title: 'Front Office', type: 'slink', icon: 'files', badgeClass: 'danger', active: false, show: this.getInstituteModule('Front Office') && this.hasPermission('front_office_front_office')
      },
      // {
      //   title: 'Transport', icon: 'map-alt', type: 'sub', active: false, show: ( (this.getInstituteModule('Transport')) && (this.hasPermission('transport_document_type') || this.hasPermission('transport_stop') || this.hasPermission('transport_driver')
      //   || this.hasPermission('transport_vehicle') || this.hasPermission('transport_route') || this.hasPermission('transport_assign_transport') || this.hasPermission('transport_send_transport_message'))), children: [
      //     { path: this.setUrl(URLConstants.DOCUMENT_TYPE_LIST), title: 'Document Type', type: 'link', active: false , show: this.hasPermission('transport_document_type')},
      //     { path: this.setUrl(URLConstants.STOPS_LIST), title: 'Stops', type: 'link', active: false , show: this.hasPermission('transport_stop')},
      //     { path: this.setUrl(URLConstants.DRIVER_LIST), title: 'Driver', type: 'link', active: false , show: this.hasPermission('transport_driver')},
      //     { path: this.setUrl(URLConstants.VEHICLE_LIST), title: 'Vehicle', type: 'link', active: false , show: this.hasPermission('transport_vehicle')},
      //     { path: this.setUrl(URLConstants.ROUTE_LIST), title: 'Route', type: 'link', active: false , show: this.hasPermission('transport_route')},
      //     { path: this.setUrl(URLConstants.ASSIGN_TRANSPORT_LIST), title: 'Assign transport', type: 'link', active: false , show: this.hasPermission('transport_assign_transport')},
      //     { path: this.setUrl(URLConstants.SEND_TRANSPORT_WHATSAPP_MESSAGE), title: 'Send Transport Message', type: 'link', active: false , show: this.hasPermission('transport_send_transport_message')},        ]
      // },
      {
        title: 'Transport', icon: 'map-alt', type: 'sub', active: false, show:( (this.getInstituteModule('Transport')) && (this.hasModule('transport_document_type') || this.hasModule('transport_stop') || this.hasModule('transport_driver')
        || this.hasModule('transport_vehicle') || this.hasModule('transport_route') || this.hasModule('transport_assign_transport') || this.hasModule('transport_send_transport_message'))), children: [
          { title: 'Transport', type: 'sub', active: false , show:( this.hasModule('transport_document_type') || this.hasModule('transport_stop') || this.hasModule('transport_driver')
          || this.hasModule('transport_vehicle') || this.hasModule('transport_route') || this.hasModule('transport_assign_transport') || this.hasModule('transport_send_transport_message')) , children:[
            { path: this.setUrl(URLConstants.DOCUMENT_TYPE_LIST), title: 'Document Type', type: 'link', active: false , show: this.hasPermission('transport_document_type'),relatedTo:['transport']},
            { path: this.setUrl(URLConstants.STOPS_LIST), title: 'Stops', type: 'link', active: false , show: this.hasPermission('transport_stop'),relatedTo:['transport']},
            { path: this.setUrl(URLConstants.TRANSPORT_AREA), title: 'Area', type: 'link', active: false , show: this.hasPermission('transport_area'),relatedTo:['transport']},
            { path: this.setUrl(URLConstants.DRIVER_LIST), title: 'Driver', type: 'link', active: false , show: this.hasPermission('transport_driver'),relatedTo:['transport']},
            { path: this.setUrl(URLConstants.VEHICLE_LIST), title: 'Vehicle', type: 'link', active: false , show: this.hasPermission('transport_vehicle'),relatedTo:['transport']},
            { path: this.setUrl(URLConstants.ROUTE_LIST), title: 'Route', type: 'link', active: false , show: this.hasPermission('transport_route'),relatedTo:['transport']},
            { path: this.setUrl(URLConstants.ASSIGN_TRANSPORT), title: 'Assign transport', type: 'link', active: false , show: this.hasPermission('transport_assign_transport'),relatedTo:['transport']},
            { path: this.setUrl(URLConstants.SEND_TRANSPORT_WHATSAPP_MESSAGE), title: 'Send Transport Message', type: 'link', active: false , show: this.hasPermission('transport_send_transport_message'),relatedTo:['transport']},
            { path: this.setUrl(URLConstants.TRANSPORT_TRANSFER), title: 'Student Transport Transfer', type: 'link', active: false , show: this.hasPermission('transport_assign_transport'),relatedTo:['transport']},     
            // below listed are for side bar just to compare path   
            { path: this.setUrl(URLConstants.DOCUMENT_TYPE_CREATE), relatedTo: ['transport']},
            { path: this.setUrl(URLConstants.DOCUMENT_TYPE_EDIT), relatedTo: ['transport']},
            { path: this.setUrl(URLConstants.VEHICLE_CREATE), relatedTo: ['transport']},
            { path: this.setUrl(URLConstants.VEHICLE_EDIT), relatedTo: ['transport']},
            { path: this.setUrl(URLConstants.VEHICLE_DOCUMENT_LIST), relatedTo: ['transport']},
            { path: this.setUrl(URLConstants.DRIVER_CREATE), relatedTo: ['transport']},
            { path: this.setUrl(URLConstants.DRIVER_EDIT), relatedTo: ['transport']},
            { path: this.setUrl(URLConstants.ROUTE_CREATE), relatedTo: ['transport']},
            { path: this.setUrl(URLConstants.ROUTE_EDIT), relatedTo: ['transport']},
            { path: this.setUrl(URLConstants.STOPS_CREATE), relatedTo: ['transport']},
            { path: this.setUrl(URLConstants.STOPS_EDIT), relatedTo: ['transport']},            
            { path: this.setUrl(URLConstants.ASSIGN_TRANSPORT_CREATE), relatedTo: ['transport']},
            { path: this.setUrl(URLConstants.ASSIGN_TRANSPORT_EDIT), relatedTo: ['transport']},
            { path: this.setUrl(URLConstants.TRANSPORT_TRANSFER_LIST), relatedTo: ['transport']}
          ] },
        ]
      },
      // {
      //   title: 'Online Exam', icon: 'desktop', type: 'sub', active: false, show: ( (this.getInstituteModule('Online Exam')) && (this.hasPermission('online_exam_chapter') || this.hasPermission('online_exam_question')
        // || this.hasPermission('online_exam_result') || this.hasPermission('online_exam_exam')) && (this.getInstituteModule('MCQ'))), children: [
      //     { path: this.setUrl(URLConstants.CHAPTER_LIST), title: 'Chapter', type: 'link', active: false , show: this.hasPermission('online_exam_chapter')},
      //     { path: this.setUrl(URLConstants.QUESTION_LIST), title: 'Question', type: 'link', active: false , show: this.hasPermission('online_exam_question') },
      //     { path: this.setUrl(URLConstants.EXAM_LIST), title: 'Exam', type: 'link', active: false , show: this.hasPermission('online_exam_exam')},
      //     { path: this.setUrl(URLConstants.RESULT_LIST), title: 'Result', type: 'link', active: false , show: this.hasPermission('online_exam_result')}
      //   ]
      // },
      {
        title: 'Online Exam', icon: 'desktop', type: 'sub', active: false, show: ( (this.getInstituteModule('Online Exam')) && (this.hasModule('online_exam_chapter') || this.hasModule('online_exam_question')
        || this.hasModule('online_exam_result') || this.hasModule('online_exam_exam')) && (this.getInstituteModule('MCQ'))), children: [
          { title: 'Online Exam', type: 'sub', active: false , show:( (this.hasModule('online_exam_chapter') || this.hasModule('online_exam_question') || this.hasModule('online_exam_result')
            || this.hasModule('online_exam_exam'))) , children:[
            { path: this.setUrl(URLConstants.CHAPTER_LIST), title: 'Chapter', type: 'link', active: false , show: this.hasPermission('online_exam_chapter'),relatedTo:['online_exam']},
            { path: this.setUrl(URLConstants.QUESTION_LIST), title: 'Question', type: 'link', active: false , show: this.hasPermission('online_exam_question') ,relatedTo:['online_exam']},
            { path: this.setUrl(URLConstants.EXAM_LIST), title: 'Exam', type: 'link', active: false , show: this.hasPermission('online_exam_exam'),relatedTo:['online_exam']},
            { path: this.setUrl(URLConstants.RESULT_LIST), title: 'Result', type: 'link', active: false , show: this.hasPermission('online_exam_result'),relatedTo:['online_exam']},
            // below listed are for side bar just to compare path   
            { path: this.setUrl(URLConstants.CHAPTER_EDIT), relatedTo: ['online_exam']},
            { path: this.setUrl(URLConstants.CHAPTER_CREATE), relatedTo: ['online_exam']},
            { path: this.setUrl(URLConstants.QUESTION_CREATE), relatedTo: ['online_exam']},
            { path: this.setUrl(URLConstants.QUESTION_EDIT), relatedTo: ['online_exam']},
            { path: this.setUrl(URLConstants.QUESTION_VIEW), relatedTo: ['online_exam']},
            { path: this.setUrl(URLConstants.EXAM_CREATE), relatedTo: ['online_exam']},
            { path: this.setUrl(URLConstants.EXAM_EDIT), relatedTo: ['online_exam']}
        ] },

        ]
      },
      // {
      //   title: 'Inventory', icon: 'ruler-pencil', type: 'sub', active: false, show: ( this.getInstituteModule('Inventory') && (this.hasPermission('inventory_vendor_list') || this.hasPermission('inventory_inventory_item_list') || this.hasPermission('inventory_requisition_list') || this.hasPermission('inventory_inventory_setting')
      //   || this.hasPermission('inventory_purchase_order_list') || this.hasPermission('inventory_invoice_order_list') || this.hasPermission('inventory_purchase_return_order_list') || this.hasPermission('inventory_internal_issue_list') || this.hasPermission('inventory_internal_issue_return_list')
      //   || this.hasPermission('inventory_discard_item_list') || this.hasPermission('inventory_adjust_stock_item_list') || this.hasPermission('inventory_kit_list') || this.hasPermission('inventory_item_summary'))),children: [
      //     { path: this.setUrl(URLConstants.VENDOR_LIST), title: 'Vendor List', type: 'link', active: false, show: this.hasPermission('inventory_vendor_list')},
      //     { path: this.setUrl(URLConstants.INVENTORY_LIST), title: 'Inventory Item List', type: 'link', active: false, show: this.hasPermission('inventory_inventory_item_list') },
      //     { path: this.setUrl(URLConstants.REQUISITION_LIST), title: 'Requisition List', type: 'link', active: false, show: this.hasPermission('inventory_requisition_list') && this.is_admin },
      //     { path: this.setUrl(URLConstants.FACULTY_REQUISITION_LIST), title: 'Requisition List', type: 'link', active: false, show: this.hasPermission('inventory_requisition_list') && this.is_faculty },
      //     { path: this.setUrl(URLConstants.INVENTORY_SETTINGS), title: 'Inventory Setting', type: 'link', active: false, show: this.hasPermission('inventory_inventory_setting') },
      //     { path: this.setUrl(URLConstants.PURCHASE_ORDER_LIST), title: 'Purchase Order List', type: 'link', active: false, show: this.hasPermission('inventory_purchase_order_list') },
      //     { path: this.setUrl(URLConstants.INVOICE_ORDER_LIST), title: 'Invoice Order List', type: 'link', active: false, show: this.hasPermission('inventory_invoice_order_list') },
      //     { path: this.setUrl(URLConstants.PURCHASE_RETURN_LIST), title: 'Purchase Return Order List', type: 'link', active: false, show: this.hasPermission('inventory_purchase_return_order_list') },
      //     { path: this.setUrl(URLConstants.INTERNAL_ISSUE_LIST), title: 'Internal Issue List', type: 'link', active: false, show: this.hasPermission('inventory_internal_issue_list') },
      //     { path: this.setUrl(URLConstants.INTERNAL_ISSUE_RETURN_LIST), title: 'Internal Issue Return List', type: 'link', active: false, show: this.hasPermission('inventory_internal_issue_return_list') },
      //     { path: this.setUrl(URLConstants.DISCARD_ITEM_LIST), title: 'Discard Item List', type: 'link', active: false, show: this.hasPermission('inventory_discard_item_list') },
      //     { path: this.setUrl(URLConstants.ADJUST_STOCK_ITEM_LIST), title: 'Adjust Stock Item List', type: 'link', active: false, show: this.hasPermission('inventory_adjust_stock_item_list') },
      //     { path: this.setUrl(URLConstants.KIT_LIST), title: 'Kit List', type: 'link', active: false, show: this.hasPermission('inventory_kit_list') },
      //     { path: this.setUrl(URLConstants.ITEM_SUMMARY), title: 'Item Summary', type: 'link', active: false, show: this.hasPermission('inventory_item_summary') },
      //   ]
      // },
      {
        title: 'Inventory', icon: 'ruler-pencil', type: 'sub', active: false, show:( this.getInstituteModule('Inventory') && (this.hasModule('inventory_vendor_list') || this.hasModule('inventory_inventory_item_list') || this.hasModule('inventory_requisition_list') || this.hasModule('inventory_inventory_setting')
          || this.hasModule('inventory_purchase_order_list') || this.hasModule('inventory_invoice_order_list') || this.hasModule('inventory_purchase_return_order_list') || this.hasModule('inventory_internal_issue_list') || this.hasModule('inventory_internal_issue_return_list')
          || this.hasModule('inventory_discard_item_list') || this.hasModule('inventory_adjust_stock_item_list') || this.hasModule('inventory_kit_list') || this.hasModule('inventory_item_summary'))) ,children: [
          { title: 'Inventory', type: 'sub', active: false , show:( (this.hasModule('inventory_vendor_list') || this.hasModule('inventory_inventory_item_list') || this.hasModule('inventory_requisition_list') || this.hasModule('inventory_inventory_setting')
          || this.hasModule('inventory_purchase_order_list') || this.hasModule('inventory_invoice_order_list') || this.hasModule('inventory_purchase_return_order_list') || this.hasModule('inventory_internal_issue_list') || this.hasModule('inventory_internal_issue_return_list')
          || this.hasModule('inventory_discard_item_list') || this.hasModule('inventory_adjust_stock_item_list') || this.hasModule('inventory_kit_list') || this.hasModule('inventory_item_summary'))) , children:[
            { path: this.setUrl(URLConstants.ADD_INVENTORY_TYPE), title: 'Item Types', type: 'link', active: false, show: this.hasPermission('inventory_inventory_item_list'),relatedTo: ['inventory'] },
            { path: this.setUrl(URLConstants.ADD_STORE_TYPE), title: 'Inventory Warehouse', type: 'link', active: false, show: this.hasPermission('inventory_inventory_item_list') ,relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.INVENTORY_LIST), title: 'Inventory Items', type: 'link', active: false, show: this.hasPermission('inventory_inventory_item_list'), relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.VENDOR_LIST), title: 'Vendor List', type: 'link', active: false, show: this.hasPermission('inventory_vendor_list'),relatedTo: ['inventory'] },
            { path: this.setUrl(URLConstants.REQUISITION_LIST), title: 'Requisition List', type: 'link', active: false, show: this.hasPermission('inventory_requisition_list') && this.is_admin ,relatedTo: ['inventory'] },
            { path: this.setUrl(URLConstants.PURCHASE_ORDER_LIST), title: 'Purchase Order', type: 'link', active: false, show: this.hasPermission('inventory_purchase_order_list') ,relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.INVOICE_ORDER_LIST), title: 'Invoice Verification', type: 'link', active: false, show: this.hasPermission('inventory_invoice_order_list') ,relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.PURCHASE_RETURN_LIST), title: 'Purchase Return Order List', type: 'link', active: false, show: this.hasPermission('inventory_purchase_return_order_list') ,relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.KIT_LIST), title: 'Kit List', type: 'link', active: false, show: this.hasPermission('inventory_kit_list') ,relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.INTERNAL_ISSUE_LIST), title: 'Items Issue List', type: 'link', active: false, show: this.hasPermission('inventory_internal_issue_list') ,relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.INTERNAL_ISSUE_RETURN_LIST), title: 'Items Issue Return List', type: 'link', active: false, show: this.hasPermission('inventory_internal_issue_return_list') ,relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.DISCARD_ITEM_LIST), title: 'Discard Item List', type: 'link', active: false, show: this.hasPermission('inventory_discard_item_list'),relatedTo: ['inventory'] },
            { path: this.setUrl(URLConstants.ITEM_SUMMARY), title: 'Item Summary', type: 'link', active: false, show: this.hasPermission('inventory_item_summary') ,relatedTo: ['inventory']},
            // { path: this.setUrl(URLConstants.FACULTY_REQUISITION_LIST), title: 'Requisition List', type: 'link', active: false, show: this.hasPermission('inventory_requisition_list') && !this.is_admin },
            // { path: this.setUrl(URLConstants.VENDOR_LIST), title: 'Vendor List', type: 'link', active: false, show: this.hasPermission('inventory_vendor_list')},
            // { path: this.setUrl(URLConstants.INVENTORY_SETTINGS), title: 'Inventory Setting', type: 'link', active: false, show: this.hasPermission('inventory_inventory_setting') },
            // { path: this.setUrl(URLConstants.INVOICE_ORDER_LIST), title: 'Invoice Order List', type: 'link', active: false, show: this.hasPermission('inventory_invoice_order_list') },
            // { path: this.setUrl(URLConstants.ADJUST_STOCK_ITEM_LIST), title: 'Adjust Stock Item List', type: 'link', active: false, show: this.hasPermission('inventory_adjust_stock_item_list') },
            { path: this.setUrl(URLConstants.VENDOR_FORM), relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.VENDOR_ITEM), relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.ADD_VENDOR_ITEM), relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.INVENTORY_ADD_FORM), relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.PURCHASE_ADD_FORM), relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.ADD_INVENTORY_TYPE), relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.ADD_STORE_TYPE), relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.REQUISITION_FORM), relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.INTERNAL_ISSUE_FORM), relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.INTERNAL_ISSUE_RETURN_FORM), relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.DISCARD_ITEM_FORM), relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.ADJUST_STOCK_ITEM_FORM), relatedTo: ['inventory']}, 
            { path: this.setUrl(URLConstants.KIT_FORM), relatedTo: ['inventory']},
            { path: this.setUrl(URLConstants.PURCHASE_RETURN_FORM), relatedTo: ['inventory']}
        ] },
        ]
      },
      // {
      //   path: this.setUrl(URLConstants.TRANSPORT), title: 'Transport', type: 'link', icon: 'map-alt', badgeClass: 'danger', active: false, show: (this.getInstituteModule('Transport') && this.hasPermission('transport_faculty_transport'))
      // },

      // {
      //   title: 'HRA', icon: 'id-badge', type: 'sub', active: false, show: (this.is_admin && (this.getInstituteModule('HRA')) && (this.hasPermission('hra_role_list') || this.hasPermission('hra_leave_type') || this.hasPermission('online_exam_chapter')) && this.getInstituteModule('HRA')), children: [
      //     { path: this.setUrl(URLConstants.ROLE_LIST), title: 'Role List', type: 'link', active: false , show: this.hasPermission('hra_role_list')},
      //     { path: this.setUrl(URLConstants.LEAVE_TYPE_LIST), title: 'Leave Type', type: 'link', active: false , show: this.hasPermission('hra_leave_type') },
      //     { path: this.setUrl(URLConstants.ROLE_ACCESS_LIST), title: 'Access List', type: 'link', active: false , show: (this.is_staff || this.is_admin || this.hasPermission('hra_access_list'))}
      //   ]
      // },
      {
        title: 'HRA', icon: 'id-badge', type: 'sub', active: false, show: ((this.getInstituteModule('HRA')) && (this.hasModule('hra_role_list') || this.hasModule('hra_leave_type') || this.hasModule('hra_access_list'))), children: [
          { title: 'HRA', type: 'sub', active: false , show:((this.hasModule('hra_role_list') || this.hasModule('hra_leave_type') || this.hasModule('hra_access_list'))) , children:[
            { path: this.setUrl(URLConstants.ROLE_LIST), title: 'Role List', type: 'link', active: false , show: this.hasPermission('hra_role_list'),relatedTo:['hra']},
            { path: this.setUrl(URLConstants.LEAVE_TYPE_LIST), title: 'Leave Type', type: 'link', active: false , show: this.hasPermission('hra_leave_type') ,relatedTo:['hra']},
            { path: this.setUrl(URLConstants.ROLE_ACCESS_LIST), title: 'Access List', type: 'link', active: false , show: (this.is_staff || this.is_admin || this.hasPermission('hra_access_list')),relatedTo:['hra']},
            // below listed are for side bar just to compare path  
            { path: this.setUrl(URLConstants.ADD_ROLE), relatedTo: ['hra']},
            { path: this.setUrl(URLConstants.EDIT_ROLE), relatedTo: ['hra']},
            { path: this.setUrl(URLConstants.ADD_LEAVE_TYPE), relatedTo: ['hra']},
            { path: this.setUrl(URLConstants.EDIT_LEAVE_TYPE), relatedTo: ['hra']},
            { path: this.setUrl(URLConstants.ASSIGN_LEAVE_ROLE), relatedTo: ['hra']},
            { path: this.setUrl(URLConstants.MENU_LIST), relatedTo: ['hra']},
            { path: this.setUrl(URLConstants.SET_LEAVE_APPROVER), relatedTo: ['hra']}
        ] },
        ]
      },
      {
        path: this.setUrl(URLConstants.CHAT), title: 'Chat', type: 'link', icon: 'comment', badgeClass: 'danger', active: false, show: (!this.is_back_office && this.getInstituteModule('Chat') && this.hasPermission('chat'))
      },
      {
        title: 'Hostel', icon: 'home', type: 'sub', active: false, show: (this.getInstituteModule('Hostel management') && (this.hasModule('hostel_management_warden') || this.hasModule('hostel_management_hostel') || this.hasModule('hostel_management_room')
        || this.hasModule('hostel_management_wings') || this.hasModule('hostel_management_room_type') || this.hasModule('hostel_management_hostel_student_transfer') || this.hasModule('hostel_management_hostel_room_report'))), children: [
          { title: 'Hostel', type: 'sub', active: false , show:((this.hasModule('hostel_management_warden') || this.hasModule('hostel_management_hostel') || this.hasModule('hostel_management_room')
            || this.hasModule('hostel_management_wings') || this.hasModule('hostel_management_room_type') || this.hasModule('hostel_management_hostel_student_transfer') || this.hasModule('hostel_management_hostel_room_report'))) , children:[ 
            { path: this.setUrl(URLConstants.WARDEN_LIST), title: 'Warden', type: 'link', active: false , show: this.hasPermission('hostel_management_warden'),relatedTo:['hostel']},
            { path: this.setUrl(URLConstants.HOSTEL_LIST), title: 'Hostel', type: 'link', active: false , show: this.hasPermission('hostel_management_hostel'),relatedTo:['hostel']},
            { path: this.setUrl(URLConstants.ROOM_LIST), title: 'Room', type: 'link', active: false , show: this.hasPermission('hostel_management_room'),relatedTo:['hostel']},
            { path: this.setUrl(URLConstants.WING_LIST), title: 'Wings', type: 'link', active: false, show:  this.hasPermission('hostel_management_wings'),relatedTo:['hostel'] },
            { path: this.setUrl(URLConstants.ROOM_TYPE_LIST), title: 'Room Type', type: 'link', active: false , show: this.hasPermission('hostel_management_room_type'),relatedTo:['hostel']},
            { path: this.setUrl(URLConstants.HOSTEL_STUDENT_TRANSFER), title: 'Hostel Student Transfer', type: 'link', active: false , show: this.hasPermission('hostel_management_hostel_student_transfer'),relatedTo:['hostel']},
            { path: this.setUrl(URLConstants.HOSTEL_REPORT), title: 'Hostel Room Report', type: 'link', active: false , show: this.hasPermission('hostel_management_hostel_room_report'),relatedTo:['hostel']},
            // below listed are for side bar just to compare path  
            { path: this.setUrl(URLConstants.HOSTEL_CREATE), relatedTo: ['hostel']},
            { path: this.setUrl(URLConstants.HOSTEL_EDIT), relatedTo: ['hostel']},
            { path: this.setUrl(URLConstants.ROOM_CREATE), relatedTo: ['hostel']},
            { path: this.setUrl(URLConstants.ROOM_EDIT), relatedTo: ['hostel']},
            { path: this.setUrl(URLConstants.ASSIGN_STUDENT_ROOM), relatedTo: ['hostel']},
            { path: this.setUrl(URLConstants.FLOOR_LIST), relatedTo: ['hostel']}
        ] },
        ]
      },
      {
        title: 'Settings', icon: 'settings', type: 'sub', active: false, show: this.getInstituteModule('Settings'), children: [
          { title: 'Settings', type: 'sub', active: false , show: this.getInstituteModule('Settings') , children:[
          { path: this.setUrl(URLConstants.ACADEMIC_YEAR_LIST), title: 'Academic Year', type: 'link', active: false , show: this.hasPermission('settings_academic_year'),relatedTo:['settings']},
          { path: this.setUrl(URLConstants.LIST_SCHOOL), title: 'School Name', type: 'link', active: false , show: (this.isSchool == 1 && (this.hasPermission('settings_school_name'))),relatedTo:['settings']},
          // { path: this.setsymfonyUrl('viewSection'), title: 'Section', type: 'slink', active: false , show: this.hasPermission('settings_section')},
          { path: this.setUrl(URLConstants.SECTION_LIST), title: 'Section', type: 'link', active: false, show: this.hasPermission('settings_section') ,relatedTo:['settings']},
          { path: this.setUrl(URLConstants.SUBJECT_LIST), title: 'Subject', type: 'link', active: false, show: this.hasPermission('settings_subject') ,relatedTo:['settings']},
          { path: this.setUrl(URLConstants.COURSE_LIST), title: 'Course', type: 'link', active: false, show: this.hasPermission('settings_course') ,relatedTo:['settings']},
          { path: this.setsymfonyUrl('class/viewClass'), title: 'Class', type: 'slink', active: false , show: (this.hasPermission('settings_class') && this.notification.course_as_class != 1),relatedTo:['settings']},
          // { path: this.setsymfonyUrl('batch/'), title: 'Batch', type: 'slink', active: false , show: this.hasPermission('settings_batch')},
          { path: this.setUrl(URLConstants.INQUIRY_FIELD_SETTING), title: 'Inquiry Field', type: 'link', active: false , show: this.hasPermission('inquiry_inquiry_field_setting'),relatedTo:['inquiry']},
          { path: this.setUrl(URLConstants.BATCH), title: 'Batch', type: 'link', active: false , show: this.hasPermission('settings_batch'),relatedTo:['settings']},
          { path: this.setUrl(URLConstants.EXAM_TYPE_LIST), title: 'Exam Type', type: 'link', active: false , show: this.hasPermission('settings_exam_type'),relatedTo:['exam']},
          { path: this.setUrl(URLConstants.EXAM_SETTING), title: 'Exam Setting', type: 'link', active: false , show: this.hasPermission('settings_exam_setting'),relatedTo:['exam']},
          { path: this.setUrl(URLConstants.LIST_EXAM_GRADE), title: 'Exam Grade', type: 'link', active: false , show: this.hasPermission('settings_exam_grade'),relatedTo:['exam']},
          { path: this.setUrl(URLConstants.CUSTOM_FIELD), title: 'Custom Fields', type: 'link', active: false , show: this.hasPermission('inquiry_custom_field_list'),relatedTo:['settings']},
          { path: this.setUrl(URLConstants.TRANSPORT_SETTING), title: 'Transport Setting', type: 'link', active: false , show: this.hasPermission('settings_transport_settings'),relatedTo:['transport']},
          { path: this.setUrl(URLConstants.TEMPLATE_MANAGER), title: 'Template Setting', type: 'link', active: false , show: this.hasPermission('settings_template_settings'),relatedTo:['settings']},
          { path: this.setUrl(URLConstants.FEES_RECEIPT_NO), title: 'Fees Setting', type: 'link', active: false , show: this.hasPermission('settings_fees_settings'),relatedTo:['settings']},
          { path: this.setUrl(URLConstants.SYSTEM_SETTING), title: 'System Setting', type: 'link', active: false , show: this.hasPermission('settings_system_setting'),relatedTo:['settings']},
          { path: this.setUrl(URLConstants.NOTIFICATION_SETTING), title: 'Notifications Setting', type: 'link', active: false , show: this.hasPermission('settings_notification'),relatedTo:['settings']},
          { path: this.setsymfonyUrl('notification'), title: 'Notification', type: 'slink', active: false , show: this.hasPermission('settings_notification'),relatedTo:['settings']},
          { path: this.setUrl(URLConstants.TRUST_LIST), title: 'Trust Detail', type: 'link', active: false , show: this.hasPermission('settings_trust_details'),relatedTo:['settings']},     
          { path: this.setUrl(URLConstants.FEES_CATEGORY_LIST), title: 'Fees Category', type: 'link', active: false , show: this.hasPermission('settings_fees_category'),relatedTo:['fees']},    
          { path: this.setUrl(URLConstants.OPT_LOG), title: 'OTP Logs', type: 'link', active: false , show: this.otp_generate ,relatedTo:['settings']},
          // { path: this.setUrl(URLConstants.ACTIVITY_LOG_LIST), title: 'Activity Log', type: 'link', active: false , show: this.isActivityLog },
          { path: this.setUrl(URLConstants.EVENT_TYPE_LIST), title: 'Event Type', type: 'link', active: false , show: (this.is_staff || this.is_branch_admin || this.is_admin || (!this.is_faculty && !this.is_back_office) || this.hasPermission('administrator_event_type')),relatedTo:['calendar']},
          { path: '/logout', title: 'Sign Out', type: 'logout', active: false , show: true,relatedTo:['settings']},
          // below listed are for side bar just to compare path        
          { path: this.setUrl(URLConstants.ACADEMIC_YEAR_CREATE), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.ACADEMIC_YEAR_EDIT), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.YEAR_TRANSFER), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.CREATE_SCHOOL), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.EDIT_SCHOOL), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.BATCH_TRANSFER), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.BATCH_LIST), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.BATCH_ORDER), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.ASSIGN_SUBJECT_STUDENT), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.ADD_SUBJECT), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.CLASS_ORDER), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.COURSE_ADD), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.COURSE_EDIT), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.COURSE_ORDER), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.TRUST_CREATE), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.TRUST_EDIT), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.FEES_CATEGORY_CREATE), relatedTo: ['fees']},
          { path: this.setUrl(URLConstants.FEES_CATEGORY_EDIT), relatedTo: ['fees']},
          { path: this.setUrl(URLConstants.SYSTEM_SETTING+"/2"),relatedTo:['fees']},
          { path: this.setUrl(URLConstants.SYSTEM_SETTING+"/5"),relatedTo:['exam']},
          { path: this.setUrl(URLConstants.SYSTEM_SETTING+"/12"),relatedTo:['marksheet']},  
          { path: this.setUrl(URLConstants.SYSTEM_SETTING+"/10"),relatedTo:['inquiry']},        
          { path: this.setUrl(URLConstants.NOTIFICATION_SETTING+"/7"),relatedTo:['fees']},
          { path: this.setUrl(URLConstants.NOTIFICATION_SETTING+"/6"),relatedTo:['exam']},
          { path: this.setUrl(URLConstants.NOTIFICATION_SETTING+"/10"),relatedTo:['inquiry']},
          { path: this.setUrl(URLConstants.SYSTEM_SETTING+"/7"),relatedTo:['timetable']},
          { path: this.setUrl(URLConstants.NOTIFICATION_SETTING+"/9"),relatedTo:['transport']},
          { path: this.setUrl(URLConstants.NOTIFICATION_SETTING),relatedTo:['settings']},
          { path: this.setUrl(URLConstants.SYSTEM_SETTING+"/4"),relatedTo:['students']},
          { path: this.setUrl(URLConstants.YEAR_LIST),relatedTo:['settings']},
          { path: this.setUrl(URLConstants.CREATE_EXAM_GRADE), relatedTo: ['settings']} ,
          { path: this.setUrl(URLConstants.EDIT_EXAM_GRADE), relatedTo: ['settings']} ,
          { path: this.setUrl(URLConstants.LIST_EXAM_GRADE), relatedTo: ['settings']}, 
          { path: this.setUrl(URLConstants.BATCH_STUDENT), relatedTo: ['settings']},
          { path: this.setUrl(URLConstants.NOTIFICATION_SETTING + "/3"),relatedTo:['students']},
          { path: this.setUrl(URLConstants.NOTIFICATION_SETTING + "/4"),relatedTo:['students']},
          { path: this.setUrl(URLConstants.NOTIFICATION_SETTING + "/5"),relatedTo:['students']}, 
          { path: this.setUrl(URLConstants.SYSTEM_SETTING+"/1"),relatedTo:['event_gallery']}, 
        ] },
        ]
      }
    ];
  }
  items = new BehaviorSubject<any[]>(this.MENUITEMS);

}