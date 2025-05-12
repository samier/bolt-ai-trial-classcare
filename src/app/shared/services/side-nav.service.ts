import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from '../constants/routerLink-constants';
import { Router } from '@angular/router';
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
  slug?: string
}

@Injectable({
  providedIn: 'root'
})
export class SideNavService implements OnDestroy {

  private unsubscriber: Subject<any> = new Subject();
  private API_URL = enviroment.apiUrl;
  private selectedCategories = new BehaviorSubject<string[]>([]);
  public selectedCategories$ = this.selectedCategories.asObservable();
  public instituteModules: any = []
  public notification: any = [];
  public is_admin = window.localStorage?.getItem("role")?.includes('ROLE_ADMIN');
  public is_faculty = window.localStorage?.getItem("role")?.includes('ROLE_FACULTY');
  public is_staff   = window.localStorage?.getItem("role")?.includes('ROLE_STAFF');
  public isSchool:any = ('; '+document.cookie)?.split(`; ISSCHOOL=`)?.pop()?.split(';')[0];
  public is_branch_admin   = window.localStorage?.getItem("role")?.includes('ROLE_BRANCH_ADMIN');
  public is_back_office   = window.localStorage?.getItem("role")?.includes('ROLE_BACK_OFFICE');
  public otp_generate:any;
  public bulk_discount:any;

  setSelectedCategories(categories: string[]) {
    this.selectedCategories.next(categories);
  }

  constructor(
    private CommonService: CommonService,
    private httpRequest: HttpClient,
    private router: Router
  ) {
    const urlSegments = this.router.parseUrl(this.router.url).root.children['primary'].segments;
    if (Number(urlSegments[0]?.path)) {
      this.httpRequest.get(this.API_URL + 'api/get-branch-notification/' + urlSegments[0].path).subscribe((res: any) => {
        this.notification = res.data;
      });
    }
    if(this.is_admin){
      this.is_faculty=this.is_staff=this.is_branch_admin=false;
    }
  }

  ngOnDestroy() {
    this.unsubscriber.next(true);
    this.unsubscriber.complete();
  }

  async fetchModules(): Promise<any> {
    const response = await this.httpRequest.get(this.API_URL + 'api/get-institute-modules').toPromise();
    return response;
  }

  async systemSetting(key_name: any): Promise<any>{
    const response_data:any = await this.httpRequest.get(this.API_URL+'api/assign-otp/system_setting/'+ key_name).toPromise();
    this.otp_generate  = response_data;
    return response_data;
  }

  setModules(modules) {
    this.instituteModules = modules;
  }

  getInstituteModule(module_name: string) {
    return this.instituteModules?.includes(module_name);
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  setsymfonyUrl(url: string) {
    return enviroment.symfonyHost + window.localStorage.getItem("branch") + '/' + url;
  }

  hasPermission(module_name: any, action: any = null) {
    return this.CommonService.hasPermission(module_name, action);
  }

  hasModule(key: any) {
    return this.CommonService.hasModule(key);
  }

  async getBulkDiscountPermission(): Promise<any>{
    const bulk_discount:any = await this.httpRequest.get(this.API_URL+'api/fees/get-bulk-discount-permission').toPromise();
    this.bulk_discount = bulk_discount?.data;
    return this.bulk_discount;
  }

  getSideMenuItems(moduleName: any) {
    return {
      ...moduleName.find(item => item == 'students') && {
        title: 'Student',
        icon: 'user',
        type: 'sub',
        show:
          (((this.getInstituteModule('Student')) || this.getInstituteModule('Settings') ||(this.getInstituteModule('Report'))) && this.hasModule('student_student') ||
            this.hasModule('settings_batch') || this.hasModule('student_student_bulk_edit') ||
            this.hasModule('administrator_leave') || this.hasModule('student_report_student_report') ||
            this.hasModule('student_student_performance') || this.hasModule('student_report_student_category_report') ||
            this.hasModule('student_report_student_gender_report') || this.hasModule('student_report_student_active_inactive_report') ||
            this.hasModule('student_leaving_certificate') || this.hasModule('administrator_certificate_generator') || this.hasModule('student_student_dashboard') || this.hasModule('student_student_strength_report') || this.hasModule('report_student_monthly_report') || this.hasModule('report_birthday_report') || this.hasModule('settings_exam_setting')
          ),
        active: false,
        children: [
          { 
            title: 'Dashboard', 
            type: 'link', 
            path: this.setUrl(URLConstants.STUDENT_DASHBOARD), 
            show: this.hasPermission('student_student_dashboard'),
            active: false, 
            svgPath:'<svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.0422363" width="5.7931" height="4.22535" rx="1" /><rect x="6.66296" y="7.60564" width="5.29655" height="4.22535" rx="1" /><rect x="0.0422363" y="5.07043" width="5.37931" height="6.92958" rx="1" /><rect x="6.66296" width="5.37931" height="6.92958" rx="1" /></svg>'
          },
          {
            title: 'Student List',
            type: 'link',
            path: this.setUrl(URLConstants.STUDENT_LIST),
            show: this.hasPermission('student_student'),
            active: false,
            svgPath: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" ><circle cx="30" cy="40" r="20"/><circle cx="30" cy="100" r="20"/><circle cx="30" cy="160" r="20"/><rect x="60" y="25" width="120" height="30" rx="15"/><rect x="60" y="85" width="120" height="30" rx="15"/><rect x="60" y="145" width="120" height="30" rx="15"/></svg>'
          },
          {
            title: 'Add Student',
            type: 'link',
            path: this.setUrl(URLConstants.STUDENT_ADD),
            show: this.hasPermission('student_student', 'has_create'),
            active: false,
            svgPath: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M50 20 h80 l30 30 v100 a30 30 0 0 1 -30 30 h-80 a30 30 0 0 1 -30 -30 v-100 a30 30 0 0 1 30 -30 z" /><path class="cr-color" d="M130 20 v30 h30 z" fill="white"/><rect class="cr-color" x="90" y="70" width="20" height="60" fill="white"/><rect class="cr-color" x="70" y="90" width="60" height="20" fill="white"/></svg>'
          },
          {
            title: 'Import Student',
            type: 'link',
            path: this.setUrl(URLConstants.IMPORT_STUDENT),
            show: this.hasPermission('student_student', 'has_import'),
            active: false,
            svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M128 64c0-35.3 28.7-64 64-64L352 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64l-256 0c-35.3 0-64-28.7-64-64l0-112 174.1 0-39 39c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l80-80c9.4-9.4 9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l39 39L128 288l0-224zm0 224l0 48L24 336c-13.3 0-24-10.7-24-24s10.7-24 24-24l104 0zM512 128l-128 0L384 0 512 128z"/></svg>'
          },
          {
            title: 'Manage Student Roll No',
            type: 'link',
            path: this.setUrl(URLConstants.MANAGE_STUDENT_ROLL_NO),
            show: this.hasPermission('settings_batch'),
            active: false,
            svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 47-92.8 37.1c-21.3 8.5-35.2 29.1-35.2 52c0 56.6 18.9 148 94.2 208.3c-9 4.8-19.3 7.6-30.2 7.6L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zm39.1 97.7c5.7-2.3 12.1-2.3 17.8 0l120 48C570 277.4 576 286.2 576 296c0 63.3-25.9 168.8-134.8 214.2c-5.9 2.5-12.6 2.5-18.5 0C313.9 464.8 288 359.3 288 296c0-9.8 6-18.6 15.1-22.3l120-48zM527.4 312L432 273.8l0 187.8c68.2-33 91.5-99 95.4-149.7z"/></svg>'
          },
          {
            title: 'Student Bulk Edit',
            type: 'link',
            path: this.setUrl(URLConstants.STUDENT_BULK_EDIT),
            show: this.hasPermission('student_student_bulk_edit'),
            active: false,
            svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 125.7-86.8 86.8c-10.3 10.3-17.5 23.1-21 37.2l-18.7 74.9c-2.3 9.2-1.8 18.8 1.3 27.5L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zM549.8 235.7l14.4 14.4c15.6 15.6 15.6 40.9 0 56.6l-29.4 29.4-71-71 29.4-29.4c15.6-15.6 40.9-15.6 56.6 0zM311.9 417L441.1 287.8l71 71L382.9 487.9c-4.1 4.1-9.2 7-14.9 8.4l-60.1 15c-5.5 1.4-11.2-.2-15.2-4.2s-5.6-9.7-4.2-15.2l15-60.1c1.4-5.6 4.3-10.8 8.4-14.9z"/></svg>'
          },
          {
            title: 'Add Student Leaves',
            type: 'link',
            path: this.setUrl(URLConstants.LEAVES_CREATE),
            show: this.hasPermission('administrator_leave', 'has_create'),
            active: false,
            svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z"/></svg>'
          },
          {
            title: 'Student Report',
            type: 'sub',
            show: (this.hasModule('student_report_student_report') ||
              this.hasModule('student_student_performance') || this.hasModule('student_report_student_category_report') ||
              this.hasModule('student_report_student_gender_report') || this.hasModule('student_report_student_active_inactive_report') || this.hasModule('student_student_strength_report') || this.hasModule('report_student_monthly_report') || this.hasModule('report_birthday_report')
            ),
            active: false,
            svgPath: '<svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 0H4.32843C3.79799 0 3.28929 0.210713 2.91421 0.585786L0.585786 2.91421C0.210714 3.28929 0 3.79799 0 4.32843V12C0 13.1046 0.895431 14 2 14H9C10.1046 14 11 13.1046 11 12V2C11 0.895431 10.1046 0 9 0Z"/><path class="cr-color" d="M5.01671 5.55208C5.00484 5.33149 4.81545 5.1596 4.59838 5.20061C4.12584 5.2899 3.67956 5.49158 3.29835 5.79106C2.81182 6.17327 2.45496 6.69619 2.27639 7.28856C2.09781 7.88093 2.1062 8.51395 2.30042 9.10138C2.49464 9.68881 2.86524 10.2021 3.36173 10.5713C3.85822 10.9404 4.45645 11.1476 5.07492 11.1644C5.69339 11.1813 6.30203 11.0071 6.81791 10.6655C7.33378 10.324 7.73181 9.83168 7.95777 9.25572C8.13482 8.80443 8.19947 8.31897 8.14893 7.84073C8.12572 7.62104 7.90658 7.48917 7.69191 7.5413L5.6249 8.04329C5.38166 8.10237 5.14454 7.92605 5.13108 7.6761L5.01671 5.55208Z"/><path d="M8.30925 6.62689C8.51862 6.55642 8.63337 6.32814 8.53814 6.1288C8.31185 5.65511 7.9751 5.24025 7.55394 4.92048C7.13278 4.60072 6.64271 4.38781 6.12563 4.2971C5.90803 4.25893 5.71898 4.43079 5.70735 4.6514L5.58526 6.96624C5.57039 7.2483 5.84462 7.45651 6.11232 7.3664L8.30925 6.62689Z" class="cr-color" /></svg>',
            children: [
              {
                title: 'Student Category Report',
                type: 'link',
                path: this.setUrl(URLConstants.STUDENT_CATEGORY_REPORT),
                show: this.hasPermission('student_report_student_category_report'),
                active: false
              },
              {
                title: 'Student Gender Report',
                type: 'link',
                path: this.setUrl(URLConstants.STUDENT_GENDER_REPORT),
                show: this.hasPermission('student_report_student_gender_report'),
                active: false
              },
              {
                title: 'Student Active/Inactive Report',
                type: 'link',
                path: this.setUrl(URLConstants.STUDENT_ACTIVE_INACTIVE_REPORT),
                show: this.hasPermission('student_report_student_active_inactive_report'),
                active: false
              },
              {
                title: 'Student Dynamic Field Report',
                type: 'link',
                path: this.setUrl(URLConstants.STUDENT_REPORT),
                show: this.hasPermission('student_report_student_report'),
                active: false
              },
              {
                title: 'Student Call List Report',
                type: 'link',
                path: this.setUrl(URLConstants.STUDENT_REPORT),
                show: this.hasPermission('student_report_student_report'),
                slug: 'student-call-report',
                active: false
              },
              {
                title: 'Student Performance',
                type: 'link',
                path: this.setUrl(URLConstants.STUDENT_PERFORMANCE),
                show: this.hasPermission('student_student_performance'),
                active: false
              },
              {
                path: this.setUrl(URLConstants.BIRTHDAY_LIST),
                title: 'Birthday Report',
                type: 'link',
                active: false,
                show: this.hasPermission('report_birthday_report')
              },
              {
                path: this.setUrl(URLConstants.STUDENT_MONTHLY_REPORT),
                title: 'Student Monthly Report',
                type: 'link',
                active: false,
                show: this.hasPermission('report_student_monthly_report'),
              },
              {
                path: this.setUrl(URLConstants.STUDENT_STRENGTH_REPORT),
                title: 'Student Strength Report',
                type: 'link',
                active: false,
                show: this.hasPermission('student_student_strength_report')
              },
              {
                path: this.setUrl(URLConstants.STUDENT_BLANK_REPORT),
                title: 'Student Blank Report',
                type: 'link',
                active: false,
                show: this.hasPermission('student_student_blank_report')
              },
              {
                path: this.setUrl(URLConstants.STUDENT_WALLET_MINUS_REPORT),
                title: 'Student Wallet Minus Report',
                type: 'link',
                active: false,
                show: this.hasPermission('report_student_wallet_minus_report')
              }
            ]
          },
          {
            title: 'Certificate Generate',
            type: 'link',
            path: this.setUrl(URLConstants.GENERATE_CERTIFICATE),
            show: this.hasPermission('administrator_certificate_generator'),
            active: false,
            svgPath: '<svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1 5.5V12.5C1 13.0523 1.44772 13.5 2 13.5H8.3411C7.53275 12.9625 7 12.0435 7 11C7 9.34315 8.34315 8 10 8C10.5464 8 11.0587 8.14609 11.5 8.40135V1C11.5 0.447715 11.0523 0 10.5 0H5.5C4.94772 0 4.5 0.447715 4.5 1V3.5C4.5 4.05228 4.05228 4.5 3.5 4.5H2C1.44772 4.5 1 4.94772 1 5.5Z"/><path d="M3.65858 0.841421L0.841421 3.65858C0.715428 3.78457 0.804662 4 0.982843 4H3.8C3.91046 4 4 3.91046 4 3.8V0.982843C4 0.804662 3.78457 0.715428 3.65858 0.841421Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 13C11.1046 13 12 12.1046 12 11C12 9.89543 11.1046 9 10 9C8.89543 9 8 9.89543 8 11C8 12.1046 8.89543 13 10 13ZM9.82576 11.3561V12.1345H10.1439V11.3561H10.9223V11.0379H10.1439V10.2595H9.82576V11.0379H9.04735V11.3561H9.82576Z"/></svg>',
          },
          {
            title: 'Leaving Certificate',
            type: 'link',
            path: this.setUrl(URLConstants.LEAVING_CERTIFICATE_LIST),
            show: this.hasPermission('student_leaving_certificate'),
            active: false,
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8.84201" cy="8.21054" r="1.57895"/><circle cx="8.84201" cy="8.21054" r="1.57895"/><path d="M9.92616 9.95164C9.09205 10.6305 8.23135 10.3046 7.76117 9.94744C7.69023 9.89354 7.57898 9.94182 7.57898 10.0309V11.7586C7.57898 11.8477 7.68669 11.8923 7.74969 11.8293L8.77143 10.8076C8.81048 10.7685 8.8738 10.7685 8.91285 10.8076L9.93458 11.8293C9.99758 11.8923 10.1053 11.8477 10.1053 11.7586V10.0309C10.1053 9.94182 9.99526 9.89541 9.92616 9.95164Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2 10.1053H5.03417C6.0908 10.1053 6.94737 9.24869 6.94737 8.19206C6.94737 7.79331 7.06185 7.39278 7.33557 7.10281C8.56014 5.80556 9.73755 6.42611 10.4205 7.1751C10.6462 7.42263 10.7368 7.7577 10.7368 8.09269V9.1579C10.7368 9.50671 11.0196 9.78947 11.3684 9.78947C11.7172 9.78947 12 9.50671 12 9.15789V2C12 0.89543 11.1046 0 10 0H2C0.895431 0 0 0.895432 0 2V8.10526C0 9.20983 0.895429 10.1053 2 10.1053ZM3.15776 1.57896C3.15776 1.40455 3.29914 1.26317 3.47355 1.26317H8.52618C8.70059 1.26317 8.84197 1.40455 8.84197 1.57896C8.84197 1.75336 8.70059 1.89475 8.52618 1.89475H3.47355C3.29914 1.89475 3.15776 1.75336 3.15776 1.57896ZM2.84207 3.15791C2.66766 3.15791 2.52628 3.2993 2.52628 3.4737C2.52628 3.64811 2.66766 3.78949 2.84207 3.78949H9.15786C9.33226 3.78949 9.47365 3.64811 9.47365 3.4737C9.47365 3.2993 9.33226 3.15791 9.15786 3.15791H2.84207ZM2.52628 5.36841C2.52628 5.194 2.66766 5.05262 2.84207 5.05262H9.15786C9.33226 5.05262 9.47365 5.194 9.47365 5.36841C9.47365 5.54282 9.33226 5.6842 9.15786 5.6842H2.84207C2.66766 5.6842 2.52628 5.54282 2.52628 5.36841ZM2.84207 7.57894C2.66766 7.57894 2.52628 7.72033 2.52628 7.89473C2.52628 8.06914 2.66766 8.21052 2.84207 8.21052H5.99996C6.17437 8.21052 6.31575 8.06914 6.31575 7.89473C6.31575 7.72033 6.17437 7.57894 5.99996 7.57894H2.84207Z"/></svg>',
          },
          {
            title: 'Setting',
            type: 'sub', active: false,
            show:  this.hasModule('settings_exam_setting') ,
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z" /><path class="cr-color" d="M8.57371 5.83684C8.57371 7.29312 7.39316 8.47367 5.93688 8.47367C4.4806 8.47367 3.30005 7.29312 3.30005 5.83684C3.30005 4.38056 4.4806 3.20001 5.93688 3.20001C7.39316 3.20001 8.57371 4.38056 8.57371 5.83684ZM4.30547 5.83684C4.30547 6.73785 5.03588 7.46825 5.93688 7.46825C6.83788 7.46825 7.56829 6.73785 7.56829 5.83684C7.56829 4.93584 6.83788 4.20543 5.93688 4.20543C5.03588 4.20543 4.30547 4.93584 4.30547 5.83684Z" fill="white"/><path class="cr-color" d="M5.20496 2.80001C5.20496 2.68955 5.2945 2.60001 5.40496 2.60001H6.32337C6.43383 2.60001 6.52337 2.68955 6.52337 2.80001V3.91842H5.20496V2.80001Z" fill="white"/><path class="cr-color" d="M3.24872 4.39732C3.16414 4.32627 3.15318 4.20012 3.22423 4.11554L3.81498 3.41234C3.88603 3.32776 4.01219 3.3168 4.09676 3.38785L4.9531 4.10725L4.10505 5.11672L3.24872 4.39732Z" fill="white"/><path class="cr-color" d="M8.57404 7.56004C8.65861 7.63109 8.66958 7.75725 8.59853 7.84182L8.00777 8.54503C7.93672 8.6296 7.81057 8.64057 7.72599 8.56952L6.76648 7.76344L7.61452 6.75397L8.57404 7.56004Z" fill="white"/><path class="cr-color" d="M7.94695 3.38114C8.0345 3.31379 8.16007 3.33016 8.22742 3.4177L8.78745 4.14562C8.8548 4.23316 8.83843 4.35873 8.75089 4.42609L7.86445 5.10806L7.06052 4.06312L7.94695 3.38114Z" fill="white"/><path class="cr-color" d="M5.20496 7.87366H6.52337V8.99207C6.52337 9.10253 6.43383 9.19207 6.32337 9.19207H5.40496C5.2945 9.19207 5.20496 9.10253 5.20496 8.99207V7.87366Z" fill="white"/><path class="cr-color" d="M7.8418 6.55521L7.84482 5.23679L8.96323 5.23936C9.07369 5.23961 9.16303 5.32936 9.16278 5.43982L9.16067 6.35823C9.16041 6.46869 9.07067 6.55803 8.96021 6.55777L7.8418 6.55521Z" fill="white"/><path class="cr-color" d="M4.02136 5.24139L4.01834 6.55981L2.89992 6.55724C2.78947 6.55699 2.70013 6.46724 2.70038 6.35678L2.70249 5.43837C2.70274 5.32791 2.79249 5.23857 2.90295 5.23883L4.02136 5.24139Z" fill="white"/><path class="cr-color" d="M4.31238 6.50336L5.19179 7.48563L4.09281 8.46953C4.01051 8.5432 3.88407 8.53622 3.8104 8.45392L3.19779 7.76967C3.12412 7.68737 3.1311 7.56093 3.2134 7.48725L4.31238 6.50336Z" fill="white"/></svg>',
            children: [
              {
                path: this.setUrl(URLConstants.SYSTEM_SETTING+"/4"),
                title: 'Student Setting',
                type: 'link',
                active: false,
                show: this.hasPermission('settings_exam_setting')
              },
            ]
          },
          {
            title: 'Notification',
            type: 'sub',
            show: (this.hasModule('settings_notification')),
            active: false,
            svgPath: '<svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.66321 0.416363C4.66321 0.186412 4.84962 0 5.07957 0C5.30952 0 5.49593 0.186412 5.49593 0.416363V0.832726H4.66321V0.416363Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.36683 0.949529C6.21808 0.901778 6.05909 0.86283 5.88923 0.834128C5.8838 0.83321 5.87815 0.832733 5.87265 0.832733H4.63185C3.79998 0.832733 2.05399 1.41445 1.71834 3.7401C1.71767 3.74478 1.71731 3.74965 1.71731 3.75438V5.82909C1.71731 6.37903 1.39045 7.63717 0.0891269 8.30834C0.0655556 8.3205 0.0469179 8.34132 0.0396388 8.36683C-0.0823034 8.79406 0.00956711 9.57635 1.30095 9.57635H9.58677C9.61329 9.57635 9.63883 9.56602 9.65682 9.54654C9.92994 9.2509 10.2692 8.5596 9.63531 7.91807C9.63069 7.91339 9.62567 7.90924 9.62021 7.90555C9.20129 7.6231 8.3791 6.82202 8.3791 5.82909V4.99585C8.36184 4.9962 8.34454 4.99638 8.32719 4.99638C6.94749 4.99638 5.82902 3.8779 5.82902 2.4982C5.82902 1.91324 6.03006 1.37524 6.36683 0.949529Z"/><circle cx="8.32732" cy="2.49818" r="1.66545"/><path d="M6.66184 9.99272C6.66184 10.4344 6.48637 10.858 6.17404 11.1704C5.8617 11.4827 5.43809 11.6582 4.99638 11.6582C4.55468 11.6582 4.13107 11.4827 3.81873 11.1704C3.5064 10.858 3.33093 10.4344 3.33093 9.99272L4.99638 9.99272H6.66184Z"/></svg>',
            children: [
              {
                title: 'Student Birthday Notification',
                type: 'link',
                path: this.setUrl(URLConstants.NOTIFICATION_SETTING + "/3"),
                show: this.hasPermission('settings_notification'),
                active: false
              },
              {
                title: 'Assignment Notification',
                type: 'link',
                path: this.setUrl(URLConstants.NOTIFICATION_SETTING + "/4"),
                show: this.hasPermission('settings_notification'),
                active: false
              },
              {
                title: 'Attendance Notification',
                type: 'link',
                path: this.setUrl(URLConstants.NOTIFICATION_SETTING + "/5"),
                show: this.hasPermission('settings_notification'),
                active: false
              },
            ]
          }
        ],
      },
      ...moduleName.find(item => item == 'planning') && {
        title: 'Lesson Planning',
        type: 'sub',
        active: false,
        show: ((this.getInstituteModule('Faculty')) || this.getInstituteModule('Teacher\'s Diary') )&& this.hasModule('faculty_lesson_plan') || this.hasModule('faculty_lecture_plan') || this.hasModule('faculty_teachers_diary'),
        svgPath: '<svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="path-1-inside-1_46_77"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 12V0.5C0 0.223858 0.223857 0 0.5 0H9C9.27614 0 9.5 0.223858 9.5 0.5V12C9.5 12.2761 9.27614 12.5 9 12.5H0.5C0.223858 12.5 0 12.2761 0 12ZM4.20801 1.86132C4.2846 1.97621 4.25356 2.13142 4.13867 2.20801L2.7961 3.10306C2.59738 3.23554 2.32978 3.18971 2.18648 2.99864L1.8 2.48333C1.71716 2.37288 1.73954 2.21618 1.85 2.13333C1.96046 2.05049 2.11716 2.07288 2.2 2.18333L2.5581 2.6608L3.86132 1.79199C3.97621 1.7154 4.13142 1.74644 4.20801 1.86132ZM4.13867 4.70801C4.25356 4.63142 4.2846 4.47621 4.20801 4.36132C4.13142 4.24644 3.97621 4.2154 3.86132 4.29199L2.5581 5.1608L2.2 4.68333C2.11716 4.57288 1.96046 4.55049 1.85 4.63333C1.73954 4.71618 1.71716 4.87288 1.8 4.98333L2.18648 5.49864C2.32978 5.68971 2.59738 5.73554 2.7961 5.60306L4.13867 4.70801ZM4.20801 6.86132C4.2846 6.97621 4.25356 7.13142 4.13867 7.20801L2.7961 8.10306C2.59738 8.23554 2.32978 8.18971 2.18648 7.99864L1.8 7.48333C1.71716 7.37288 1.73954 7.21618 1.85 7.13333C1.96046 7.05049 2.11716 7.07288 2.2 7.18333L2.5581 7.6608L3.86132 6.79199C3.97621 6.7154 4.13142 6.74644 4.20801 6.86132ZM4.13867 9.70801C4.25356 9.63142 4.2846 9.47621 4.20801 9.36133C4.13142 9.24644 3.97621 9.2154 3.86132 9.29199L2.5581 10.1608L2.2 9.68333C2.11716 9.57288 1.96046 9.55049 1.85 9.63333C1.73954 9.71618 1.71716 9.87288 1.8 9.98333L2.18648 10.4986C2.32978 10.6897 2.59738 10.7355 2.7961 10.6031L4.13867 9.70801ZM5 2.4C5 2.17909 5.17909 2 5.4 2H7.6C7.82091 2 8 2.17909 8 2.4C8 2.62091 7.82091 2.8 7.6 2.8H5.4C5.17909 2.8 5 2.62091 5 2.4ZM5.4 4.29999C5.17909 4.29999 5 4.47907 5 4.69999C5 4.9209 5.17909 5.09999 5.4 5.09999H7.6C7.82091 5.09999 8 4.9209 8 4.69999C8 4.47907 7.82091 4.29999 7.6 4.29999H5.4ZM5 6.99998C5 6.77906 5.17909 6.59998 5.4 6.59998H7.6C7.82091 6.59998 8 6.77906 8 6.99998C8 7.22089 7.82091 7.39998 7.6 7.39998H5.4C5.17909 7.39998 5 7.22089 5 6.99998ZM5.4 9.19998C5.17909 9.19998 5 9.37907 5 9.59998C5 9.8209 5.17909 9.99998 5.4 9.99998H7.6C7.82091 9.99998 8 9.8209 8 9.59998C8 9.37907 7.82091 9.19998 7.6 9.19998H5.4Z"/></mask><path fill-rule="evenodd" clip-rule="evenodd" d="M0 12V0.5C0 0.223858 0.223857 0 0.5 0H9C9.27614 0 9.5 0.223858 9.5 0.5V12C9.5 12.2761 9.27614 12.5 9 12.5H0.5C0.223858 12.5 0 12.2761 0 12ZM4.20801 1.86132C4.2846 1.97621 4.25356 2.13142 4.13867 2.20801L2.7961 3.10306C2.59738 3.23554 2.32978 3.18971 2.18648 2.99864L1.8 2.48333C1.71716 2.37288 1.73954 2.21618 1.85 2.13333C1.96046 2.05049 2.11716 2.07288 2.2 2.18333L2.5581 2.6608L3.86132 1.79199C3.97621 1.7154 4.13142 1.74644 4.20801 1.86132ZM4.13867 4.70801C4.25356 4.63142 4.2846 4.47621 4.20801 4.36132C4.13142 4.24644 3.97621 4.2154 3.86132 4.29199L2.5581 5.1608L2.2 4.68333C2.11716 4.57288 1.96046 4.55049 1.85 4.63333C1.73954 4.71618 1.71716 4.87288 1.8 4.98333L2.18648 5.49864C2.32978 5.68971 2.59738 5.73554 2.7961 5.60306L4.13867 4.70801ZM4.20801 6.86132C4.2846 6.97621 4.25356 7.13142 4.13867 7.20801L2.7961 8.10306C2.59738 8.23554 2.32978 8.18971 2.18648 7.99864L1.8 7.48333C1.71716 7.37288 1.73954 7.21618 1.85 7.13333C1.96046 7.05049 2.11716 7.07288 2.2 7.18333L2.5581 7.6608L3.86132 6.79199C3.97621 6.7154 4.13142 6.74644 4.20801 6.86132ZM4.13867 9.70801C4.25356 9.63142 4.2846 9.47621 4.20801 9.36133C4.13142 9.24644 3.97621 9.2154 3.86132 9.29199L2.5581 10.1608L2.2 9.68333C2.11716 9.57288 1.96046 9.55049 1.85 9.63333C1.73954 9.71618 1.71716 9.87288 1.8 9.98333L2.18648 10.4986C2.32978 10.6897 2.59738 10.7355 2.7961 10.6031L4.13867 9.70801ZM5 2.4C5 2.17909 5.17909 2 5.4 2H7.6C7.82091 2 8 2.17909 8 2.4C8 2.62091 7.82091 2.8 7.6 2.8H5.4C5.17909 2.8 5 2.62091 5 2.4ZM5.4 4.29999C5.17909 4.29999 5 4.47907 5 4.69999C5 4.9209 5.17909 5.09999 5.4 5.09999H7.6C7.82091 5.09999 8 4.9209 8 4.69999C8 4.47907 7.82091 4.29999 7.6 4.29999H5.4ZM5 6.99998C5 6.77906 5.17909 6.59998 5.4 6.59998H7.6C7.82091 6.59998 8 6.77906 8 6.99998C8 7.22089 7.82091 7.39998 7.6 7.39998H5.4C5.17909 7.39998 5 7.22089 5 6.99998ZM5.4 9.19998C5.17909 9.19998 5 9.37907 5 9.59998C5 9.8209 5.17909 9.99998 5.4 9.99998H7.6C7.82091 9.99998 8 9.8209 8 9.59998C8 9.37907 7.82091 9.19998 7.6 9.19998H5.4Z"/><path d="M4.13867 2.20801L3.58398 1.37596L3.58397 1.37596L4.13867 2.20801ZM4.20801 1.86132L5.04006 1.30662L5.04006 1.30662L4.20801 1.86132ZM2.7961 3.10306L3.3508 3.93512L3.3508 3.93512L2.7961 3.10306ZM2.18648 2.99864L2.98648 2.39864L2.98648 2.39864L2.18648 2.99864ZM1.8 2.48333L1 3.08333L1 3.08333L1.8 2.48333ZM1.85 2.13333L2.45 2.93333L2.45 2.93333L1.85 2.13333ZM2.2 2.18333L3 1.58333L3 1.58333L2.2 2.18333ZM2.5581 2.6608L1.7581 3.2608L2.32569 4.01759L3.1128 3.49285L2.5581 2.6608ZM3.86132 1.79199L3.30663 0.959937L3.30662 0.959937L3.86132 1.79199ZM4.20801 4.36132L5.04006 3.80663L5.04006 3.80662L4.20801 4.36132ZM4.13867 4.70801L3.58398 3.87596L3.58397 3.87596L4.13867 4.70801ZM3.86132 4.29199L3.30663 3.45994L3.30662 3.45994L3.86132 4.29199ZM2.5581 5.1608L1.7581 5.7608L2.32569 6.51759L3.1128 5.99285L2.5581 5.1608ZM2.2 4.68333L3 4.08333L3 4.08333L2.2 4.68333ZM1.85 4.63333L1.25 3.83333L1.25 3.83333L1.85 4.63333ZM1.8 4.98333L0.999999 5.58333L1 5.58333L1.8 4.98333ZM2.18648 5.49864L2.98648 4.89864L2.98648 4.89864L2.18648 5.49864ZM2.7961 5.60306L2.2414 4.77101L2.2414 4.77101L2.7961 5.60306ZM4.13867 7.20801L3.58398 6.37596L3.58397 6.37596L4.13867 7.20801ZM4.20801 6.86132L5.04006 6.30663L5.04006 6.30662L4.20801 6.86132ZM2.7961 8.10306L2.2414 7.27101L2.24139 7.27102L2.7961 8.10306ZM2.18648 7.99864L2.98648 7.39864L2.98648 7.39864L2.18648 7.99864ZM1.8 7.48333L0.999999 8.08333L1 8.08333L1.8 7.48333ZM1.85 7.13333L1.25 6.33333L1.25 6.33333L1.85 7.13333ZM2.2 7.18333L3 6.58333L3 6.58333L2.2 7.18333ZM2.5581 7.6608L1.7581 8.2608L2.32569 9.01759L3.1128 8.49285L2.5581 7.6608ZM3.86132 6.79199L3.30663 5.95994L3.30662 5.95994L3.86132 6.79199ZM4.20801 9.36133L3.37596 9.91602L3.37596 9.91603L4.20801 9.36133ZM4.13867 9.70801L3.58398 8.87596L3.58397 8.87596L4.13867 9.70801ZM3.86132 9.29199L3.30663 8.45993L3.30662 8.45994L3.86132 9.29199ZM2.5581 10.1608L1.7581 10.7608L2.32569 11.5176L3.1128 10.9929L2.5581 10.1608ZM2.2 9.68333L1.4 10.2833L1.4 10.2833L2.2 9.68333ZM1.8 9.98333L0.999999 10.5833L1 10.5833L1.8 9.98333ZM2.18648 10.4986L2.98648 9.89864L2.98648 9.89864L2.18648 10.4986ZM2.7961 10.6031L2.2414 9.77101L2.24139 9.77102L2.7961 10.6031ZM-1 0.5V12H1V0.5H-1ZM0.5 -1C-0.328428 -1 -1 -0.328427 -1 0.5H1C1 0.776142 0.776143 1 0.5 1V-1ZM9 -1H0.5V1H9V-1ZM10.5 0.5C10.5 -0.328427 9.82843 -1 9 -1V1C8.72386 1 8.5 0.776142 8.5 0.5H10.5ZM10.5 12V0.5H8.5V12H10.5ZM9 13.5C9.82843 13.5 10.5 12.8284 10.5 12H8.5C8.5 11.7239 8.72386 11.5 9 11.5V13.5ZM0.5 13.5H9V11.5H0.5V13.5ZM-1 12C-1 12.8284 -0.328427 13.5 0.5 13.5V11.5C0.776143 11.5 1 11.7239 1 12H-1ZM4.69337 3.04006C5.26779 2.65712 5.423 1.88104 5.04006 1.30662L3.37596 2.41603C3.1462 2.07138 3.23933 1.60573 3.58398 1.37596L4.69337 3.04006ZM3.3508 3.93512L4.69338 3.04006L3.58397 1.37596L2.2414 2.27101L3.3508 3.93512ZM1.38648 3.59864C1.84822 4.2143 2.71048 4.36199 3.3508 3.93512L2.2414 2.27101C2.48427 2.1091 2.81134 2.16512 2.98648 2.39864L1.38648 3.59864ZM1 3.08333L1.38648 3.59864L2.98648 2.39864L2.6 1.88333L1 3.08333ZM1.25 1.33333C0.697715 1.74755 0.585786 2.53105 1 3.08333L2.6 1.88333C2.84853 2.2147 2.78137 2.68481 2.45 2.93333L1.25 1.33333ZM3 1.58333C2.58579 1.03105 1.80229 0.919119 1.25 1.33333L2.45 2.93333C2.11863 3.18186 1.64853 3.1147 1.4 2.78333L3 1.58333ZM3.3581 2.0608L3 1.58333L1.4 2.78333L1.7581 3.2608L3.3581 2.0608ZM3.30662 0.959937L2.0034 1.82875L3.1128 3.49285L4.41603 2.62404L3.30662 0.959937ZM5.04006 1.30662C4.65712 0.732214 3.88104 0.576997 3.30663 0.959937L4.41602 2.62404C4.07138 2.8538 3.60573 2.76067 3.37596 2.41603L5.04006 1.30662ZM3.37596 4.91602C3.1462 4.57138 3.23933 4.10573 3.58398 3.87596L4.69337 5.54006C5.26779 5.15712 5.423 4.38104 5.04006 3.80663L3.37596 4.91602ZM4.41602 5.12404C4.07138 5.3538 3.60573 5.26067 3.37596 4.91603L5.04006 3.80662C4.65712 3.23221 3.88104 3.077 3.30663 3.45994L4.41602 5.12404ZM3.1128 5.99285L4.41603 5.12404L3.30662 3.45994L2.0034 4.32875L3.1128 5.99285ZM1.4 5.28333L1.7581 5.7608L3.3581 4.5608L3 4.08333L1.4 5.28333ZM2.45 5.43333C2.11863 5.68186 1.64853 5.6147 1.4 5.28333L3 4.08333C2.58579 3.53105 1.80229 3.41912 1.25 3.83333L2.45 5.43333ZM2.6 4.38334C2.84853 4.7147 2.78137 5.1848 2.45 5.43333L1.25 3.83333C0.697715 4.24755 0.585787 5.03105 0.999999 5.58333L2.6 4.38334ZM2.98648 4.89864L2.6 4.38333L1 5.58333L1.38648 6.09864L2.98648 4.89864ZM2.2414 4.77101C2.48427 4.6091 2.81134 4.66512 2.98648 4.89864L1.38648 6.09864C1.84822 6.7143 2.71048 6.86199 3.3508 6.43511L2.2414 4.77101ZM3.58397 3.87596L2.2414 4.77101L3.3508 6.43511L4.69337 5.54006L3.58397 3.87596ZM4.69337 8.04006C5.26779 7.65712 5.423 6.88104 5.04006 6.30663L3.37596 7.41602C3.1462 7.07138 3.23933 6.60573 3.58398 6.37596L4.69337 8.04006ZM3.3508 8.93511L4.69337 8.04006L3.58397 6.37596L2.2414 7.27101L3.3508 8.93511ZM1.38648 8.59864C1.84822 9.21429 2.71048 9.36199 3.3508 8.93511L2.24139 7.27102C2.48427 7.1091 2.81134 7.16512 2.98648 7.39864L1.38648 8.59864ZM1 8.08333L1.38648 8.59864L2.98648 7.39864L2.6 6.88333L1 8.08333ZM1.25 6.33333C0.697715 6.74755 0.585787 7.53105 0.999999 8.08333L2.6 6.88334C2.84853 7.2147 2.78137 7.6848 2.45 7.93333L1.25 6.33333ZM3 6.58333C2.58579 6.03105 1.80229 5.91912 1.25 6.33333L2.45 7.93333C2.11863 8.18186 1.64853 8.1147 1.4 7.78333L3 6.58333ZM3.3581 7.0608L3 6.58333L1.4 7.78333L1.7581 8.2608L3.3581 7.0608ZM3.30662 5.95994L2.0034 6.82875L3.1128 8.49285L4.41603 7.62404L3.30662 5.95994ZM5.04006 6.30662C4.65712 5.73221 3.88104 5.577 3.30663 5.95994L4.41602 7.62404C4.07138 7.8538 3.60573 7.76067 3.37596 7.41603L5.04006 6.30662ZM3.37596 9.91603C3.1462 9.57138 3.23933 9.10572 3.58398 8.87596L4.69337 10.5401C5.26779 10.1571 5.423 9.38103 5.04006 8.80662L3.37596 9.91603ZM4.41602 10.124C4.07138 10.3538 3.60573 10.2607 3.37596 9.91602L5.04006 8.80663C4.65712 8.23221 3.88104 8.077 3.30663 8.45993L4.41602 10.124ZM3.1128 10.9929L4.41603 10.124L3.30662 8.45994L2.0034 9.32875L3.1128 10.9929ZM1.4 10.2833L1.7581 10.7608L3.3581 9.5608L3 9.08333L1.4 10.2833ZM2.45 10.4333C2.11863 10.6819 1.64853 10.6147 1.4 10.2833L3 9.08333C2.58579 8.53105 1.80228 8.41912 1.25 8.83333L2.45 10.4333ZM2.6 9.38334C2.84853 9.7147 2.78137 10.1848 2.45 10.4333L1.25 8.83333C0.697715 9.24755 0.585787 10.031 0.999999 10.5833L2.6 9.38334ZM2.98648 9.89864L2.6 9.38333L1 10.5833L1.38648 11.0986L2.98648 9.89864ZM2.24139 9.77102C2.48427 9.6091 2.81134 9.66512 2.98648 9.89864L1.38648 11.0986C1.84822 11.7143 2.71048 11.862 3.3508 11.4351L2.24139 9.77102ZM3.58397 8.87596L2.2414 9.77101L3.3508 11.4351L4.69337 10.5401L3.58397 8.87596ZM5.4 1C4.6268 1 4 1.6268 4 2.4H6C6 2.73137 5.73137 3 5.4 3V1ZM7.6 1H5.4V3H7.6V1ZM9 2.4C9 1.6268 8.3732 1 7.6 1V3C7.26863 3 7 2.73137 7 2.4H9ZM7.6 3.8C8.3732 3.8 9 3.1732 9 2.4H7C7 2.06863 7.26863 1.8 7.6 1.8V3.8ZM5.4 3.8H7.6V1.8H5.4V3.8ZM4 2.4C4 3.1732 4.6268 3.8 5.4 3.8V1.8C5.73137 1.8 6 2.06863 6 2.4H4ZM6 4.69999C6 5.03136 5.73137 5.29999 5.4 5.29999V3.29999C4.6268 3.29999 4 3.92679 4 4.69999H6ZM5.4 4.09999C5.73137 4.09999 6 4.36862 6 4.69999H4C4 5.47318 4.6268 6.09999 5.4 6.09999V4.09999ZM7.6 4.09999H5.4V6.09999H7.6V4.09999ZM7 4.69999C7 4.36862 7.26863 4.09999 7.6 4.09999V6.09999C8.3732 6.09999 9 5.47319 9 4.69999H7ZM7.6 5.29999C7.26863 5.29999 7 5.03136 7 4.69999H9C9 3.92679 8.3732 3.29999 7.6 3.29999V5.29999ZM5.4 5.29999H7.6V3.29999H5.4V5.29999ZM5.4 5.59998C4.6268 5.59998 4 6.22678 4 6.99998H6C6 7.33135 5.73137 7.59998 5.4 7.59998V5.59998ZM7.6 5.59998H5.4V7.59998H7.6V5.59998ZM9 6.99998C9 6.22678 8.3732 5.59998 7.6 5.59998V7.59998C7.26863 7.59998 7 7.33134 7 6.99998H9ZM7.6 8.39998C8.3732 8.39998 9 7.77317 9 6.99998H7C7 6.6686 7.26863 6.39998 7.6 6.39998V8.39998ZM5.4 8.39998H7.6V6.39998H5.4V8.39998ZM4 6.99998C4 7.77317 4.6268 8.39998 5.4 8.39998V6.39998C5.73137 6.39998 6 6.66861 6 6.99998H4ZM6 9.59998C6 9.93135 5.73137 10.2 5.4 10.2V8.19998C4.6268 8.19998 4 8.82678 4 9.59998H6ZM5.4 8.99998C5.73137 8.99998 6 9.26861 6 9.59998H4C4 10.3732 4.6268 11 5.4 11V8.99998ZM7.6 8.99998H5.4V11H7.6V8.99998ZM7 9.59998C7 9.26861 7.26863 8.99998 7.6 8.99998V11C8.3732 11 9 10.3732 9 9.59998H7ZM7.6 10.2C7.26863 10.2 7 9.93135 7 9.59998H9C9 8.82678 8.3732 8.19998 7.6 8.19998V10.2ZM5.4 10.2H7.6V8.19998H5.4V10.2Z" mask="url(#path-1-inside-1_46_77)"/><path d="M10.5 1V13V13.3C10.5 13.4105 10.4105 13.5 10.3 13.5H1.5" stroke-width="0.7" stroke-linecap="round"/></svg>',
        children: [
          {
            title: 'Lesson Plan',
            type: 'link',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_128_1804)"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 1C1.5 0.447715 1.94772 0 2.5 0H9.92857C10.4809 0 10.9286 0.447715 10.9286 1V8.64456C10.7945 8.5972 10.6503 8.57143 10.5001 8.57143C9.78999 8.57143 9.21436 9.14706 9.21436 9.85714C9.21436 10.5672 9.78999 11.1429 10.5001 11.1429C10.6494 11.1429 10.7928 11.1174 10.9261 11.0706C10.8899 11.5899 10.4571 12 9.92857 12H2.5C1.94772 12 1.5 11.5523 1.5 11V1ZM7.9121 8.57143H2.79899C2.73967 8.57143 2.683 8.59723 2.64743 8.64471C2.32033 9.08123 2.0316 9.87985 2.64912 11.0406C2.68292 11.1041 2.74984 11.1429 2.82181 11.1429H7.91213C8.07194 11.1429 8.17415 10.96 8.11173 10.8129C7.91371 10.3461 7.77582 9.62097 8.10406 8.89805C8.17013 8.75253 8.07191 8.57143 7.9121 8.57143Z" /></g><defs><clipPath id="clip0_128_1804"><rect width="12" height="12" fill="white"/></clipPath></defs></svg>',
            path: this.setUrl(URLConstants.LESSON_PLAN_LIST),
            show: this.hasPermission('faculty_lesson_plan'),
            active: false
          },
          {
            title: 'Lectures',
            type: 'link',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_128_1803)"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.53101 4.24042C4.34937 4.29858 4.17395 4.36658 4.00623 4.44379C3.74011 4.56641 3.49341 4.71228 3.27161 4.87866C2.90015 5.15723 2.60547 5.48798 2.40442 5.85193C2.20349 6.21594 2.09998 6.60602 2.09998 7H6.09998H10.1C10.1 6.60602 9.99646 6.21594 9.79553 5.85193C9.59448 5.48798 9.2998 5.15723 8.92834 4.87866C8.56677 4.60742 8.13916 4.39087 7.66895 4.24042C7.30261 4.70312 6.73596 5 6.09998 5C5.46399 5 4.89734 4.70312 4.53101 4.24042Z" /><circle cx="6.09998" cy="2" r="2" /><path d="M10.1764 7.40002H1.82361C1.67493 7.40002 1.57823 7.55649 1.64472 7.68947L2.44472 9.28947C2.4786 9.35722 2.54785 9.40002 2.62361 9.40002H9.37639C9.45215 9.40002 9.5214 9.35722 9.55528 9.28947L10.3553 7.68947C10.4218 7.55649 10.3251 7.40002 10.1764 7.40002Z" /><path d="M3.59998 12.5L3.09998 9H9.09998L8.59998 12.5H3.59998Z" /></g><defs><clipPath id="clip0_128_1803"><rect width="12" height="12" fill="white"/></clipPath></defs></svg>',
            path: this.setUrl(URLConstants.LECTURES_LIST),
            show: this.hasPermission('faculty_lecture_plan'),
            active: false
          },
          {
            path: this.setUrl(URLConstants.ADMIN_DIARY_LIST),
            title: 'Teachers Diary',
            type: 'link',
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.85718 0C1.75261 0 0.857178 0.895431 0.857178 2V10C0.857178 11.1046 1.75261 12 2.85718 12H9.14289C10.2475 12 11.1429 11.1046 11.1429 10V2C11.1429 0.895431 10.2475 0 9.14289 0H2.85718ZM8.7857 0.857143H8.57141V11.1429H8.7857C9.61412 11.1429 10.2857 10.4713 10.2857 9.64286V2.35714C10.2857 1.52872 9.61412 0.857143 8.7857 0.857143ZM2.57141 3C2.57141 2.76331 2.76329 2.57143 2.99998 2.57143H6.42855C6.66525 2.57143 6.85713 2.76331 6.85713 3C6.85713 3.23669 6.66525 3.42857 6.42855 3.42857H2.99998C2.76329 3.42857 2.57141 3.23669 2.57141 3ZM2.99998 4.28571C2.76329 4.28571 2.57141 4.47759 2.57141 4.71429C2.57141 4.95098 2.76329 5.14286 2.99998 5.14286H4.71427C4.95096 5.14286 5.14284 4.95098 5.14284 4.71429C5.14284 4.47759 4.95096 4.28571 4.71427 4.28571H2.99998Z" /><rect y="2.57141" width="1.71429" height="0.857143" rx="0.428571" /><rect y="6" width="1.71429" height="0.857143" rx="0.428571" /><rect y="9.42859" width="1.71429" height="0.857143" rx="0.428571" /></svg>',
            active: false,
            show: this.hasPermission('faculty_teachers_diary') &&  this.is_admin
          },
          {
            path: this.setUrl(URLConstants.TEACHER_DIARY_LIST),
            title: 'Teachers Diary',
            type: 'link',
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.85718 0C1.75261 0 0.857178 0.895431 0.857178 2V10C0.857178 11.1046 1.75261 12 2.85718 12H9.14289C10.2475 12 11.1429 11.1046 11.1429 10V2C11.1429 0.895431 10.2475 0 9.14289 0H2.85718ZM8.7857 0.857143H8.57141V11.1429H8.7857C9.61412 11.1429 10.2857 10.4713 10.2857 9.64286V2.35714C10.2857 1.52872 9.61412 0.857143 8.7857 0.857143ZM2.57141 3C2.57141 2.76331 2.76329 2.57143 2.99998 2.57143H6.42855C6.66525 2.57143 6.85713 2.76331 6.85713 3C6.85713 3.23669 6.66525 3.42857 6.42855 3.42857H2.99998C2.76329 3.42857 2.57141 3.23669 2.57141 3ZM2.99998 4.28571C2.76329 4.28571 2.57141 4.47759 2.57141 4.71429C2.57141 4.95098 2.76329 5.14286 2.99998 5.14286H4.71427C4.95096 5.14286 5.14284 4.95098 5.14284 4.71429C5.14284 4.47759 4.95096 4.28571 4.71427 4.28571H2.99998Z" /><rect y="2.57141" width="1.71429" height="0.857143" rx="0.428571" /><rect y="6" width="1.71429" height="0.857143" rx="0.428571" /><rect y="9.42859" width="1.71429" height="0.857143" rx="0.428571" /></svg>',
            active: false,
            show: this.hasPermission('faculty_teachers_diary') && this.getInstituteModule('Teacher\'s Diary') && !this.is_admin
          },
        ]
      },
      ...moduleName.find(item => item == 'employees') && {
        title: 'Employee',
        icon: 'briefcase',
        show: (
          (this.getInstituteModule('Faculty') || this.getInstituteModule('Settings') || (this.getInstituteModule('Report'))) && this.hasModule('faculty_faculty') ||
          this.hasModule('faculty_staff_attendance') || this.hasModule('faculty_attendance_report') ||
          this.hasModule('faculty_attendance_machine_report')
        ),
        children: [
          {
            title: 'Employee list',
            type: 'link',
            path: this.setUrl(URLConstants.USER_LIST),
            show: this.hasPermission('faculty_faculty'),
            active: false,
            svgPath: '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" ><circle cx="30" cy="40" r="20"/><circle cx="30" cy="100" r="20"/><circle cx="30" cy="160" r="20"/><rect x="60" y="25" width="120" height="30" rx="15"/><rect x="60" y="85" width="120" height="30" rx="15"/><rect x="60" y="145" width="120" height="30" rx="15"/></svg>'
          },
          { path: this.setUrl(URLConstants.ADD_USER),
            title:'Add Employee',
            active: false,
            show: this.hasPermission('faculty_faculty','has_create'),
            svgPath:'<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4991 2.87343L9.00767 0.3887C8.87538 0.256768 8.6505 0.362151 8.66724 0.548232L8.87525 2.8604C8.88401 2.95778 8.96189 3.03455 9.05938 3.04192L11.3428 3.21447C11.5279 3.22847 11.6306 3.00455 11.4991 2.87343Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M4 0.127594H8V2.12759C8 3.23216 8.89543 4.12759 10 4.12759H12V8.12759C12 10.3367 10.2091 12.1276 8 12.1276H4C1.79086 12.1276 0 10.3367 0 8.12759V4.12759C0 1.91845 1.79086 0.127594 4 0.127594ZM5.8054 6.79805V8.69791H6.92045V6.79805H8.82031V5.68299H6.92045V3.78313H5.8054V5.68299H3.90554V6.79805H5.8054Z"/></svg>',
          },
          {
            title: 'Import Employee',
            type: 'link',
            path: this.setUrl(URLConstants.IMPORT_USERS),
            show: this.hasPermission('faculty_faculty',  'has_import'),
            active: false,
            svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M128 64c0-35.3 28.7-64 64-64L352 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64l-256 0c-35.3 0-64-28.7-64-64l0-112 174.1 0-39 39c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l80-80c9.4-9.4 9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l39 39L128 288l0-224zm0 224l0 48L24 336c-13.3 0-24-10.7-24-24s10.7-24 24-24l104 0zM512 128l-128 0L384 0 512 128z"/></svg>'
          },
          {
            title: 'Staff Attendance',
            type: 'link',
            path: this.setUrl(URLConstants.STAFF_ATTENDANCE),
            show: (
              this.hasPermission('faculty_staff_attendance', 'has_create') || this.hasPermission('faculty_staff_attendance', 'has_edit') ||
              this.hasPermission('faculty_staff_attendance', 'has_update')
            ),
            active: false,
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="3" r="3"/><path d="M0.309 12L4.57374 12C5.1798 12 5.48283 12 5.48691 11.9999C5.81605 11.991 5.84194 11.9579 5.77189 11.6362C5.77102 11.6322 5.67135 11.2277 5.47203 10.4187L5.47172 10.4175C5.19352 9.28837 5.29092 7.84182 5.67861 6.99067L5.67884 6.99016C5.72231 6.89471 5.74406 6.84697 5.74572 6.84302C5.83625 6.62814 5.73557 6.45554 5.50397 6.42855C5.4997 6.42806 5.47095 6.42554 5.41344 6.42051C1.6457 6.09069 0.144725 9.57387 0.0100643 11.6925L0.00998537 11.6937C0.00998753 11.6937 0.0105372 11.6853 0.0104184 11.6883C0.00417871 11.8484 0.142695 11.996 0.302838 11.9999L0.309 12Z"/><path  fill-rule="evenodd" clip-rule="evenodd" d="M9 12C10.6569 12 12 10.6569 12 9C12 7.34315 10.6569 6 9 6C7.34315 6 6 7.34315 6 9C6 10.6569 7.34315 12 9 12ZM10.3039 8.17365C10.3998 8.00582 10.3415 7.79202 10.1736 7.69611C10.0058 7.60021 9.79202 7.65852 9.69612 7.82635L8.86669 9.27784C8.81868 9.36186 8.70485 9.3791 8.63411 9.31308L8.23881 8.94413C8.0975 8.81224 7.87602 8.81988 7.74413 8.96119C7.61224 9.1025 7.61988 9.32398 7.76119 9.45587L8.15649 9.82481C8.55737 10.199 9.2024 10.1012 9.47446 9.62514L10.3039 8.17365Z"/></svg>',
          },
          {
            title: 'Report',
            type: 'sub',
            active: false,
            show: ( (this.hasModule('faculty_attendance_report') || this.hasModule('faculty_lesson_planning') 
            ||  this.hasModule('faculty_attendance_machine_report') )),
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z" /><path class="cr-color" d="M8.57371 5.83684C8.57371 7.29312 7.39316 8.47367 5.93688 8.47367C4.4806 8.47367 3.30005 7.29312 3.30005 5.83684C3.30005 4.38056 4.4806 3.20001 5.93688 3.20001C7.39316 3.20001 8.57371 4.38056 8.57371 5.83684ZM4.30547 5.83684C4.30547 6.73785 5.03588 7.46825 5.93688 7.46825C6.83788 7.46825 7.56829 6.73785 7.56829 5.83684C7.56829 4.93584 6.83788 4.20543 5.93688 4.20543C5.03588 4.20543 4.30547 4.93584 4.30547 5.83684Z" fill="white"/><path class="cr-color" d="M5.20496 2.80001C5.20496 2.68955 5.2945 2.60001 5.40496 2.60001H6.32337C6.43383 2.60001 6.52337 2.68955 6.52337 2.80001V3.91842H5.20496V2.80001Z" fill="white"/><path class="cr-color" d="M3.24872 4.39732C3.16414 4.32627 3.15318 4.20012 3.22423 4.11554L3.81498 3.41234C3.88603 3.32776 4.01219 3.3168 4.09676 3.38785L4.9531 4.10725L4.10505 5.11672L3.24872 4.39732Z" fill="white"/><path class="cr-color" d="M8.57404 7.56004C8.65861 7.63109 8.66958 7.75725 8.59853 7.84182L8.00777 8.54503C7.93672 8.6296 7.81057 8.64057 7.72599 8.56952L6.76648 7.76344L7.61452 6.75397L8.57404 7.56004Z" fill="white"/><path class="cr-color" d="M7.94695 3.38114C8.0345 3.31379 8.16007 3.33016 8.22742 3.4177L8.78745 4.14562C8.8548 4.23316 8.83843 4.35873 8.75089 4.42609L7.86445 5.10806L7.06052 4.06312L7.94695 3.38114Z" fill="white"/><path class="cr-color" d="M5.20496 7.87366H6.52337V8.99207C6.52337 9.10253 6.43383 9.19207 6.32337 9.19207H5.40496C5.2945 9.19207 5.20496 9.10253 5.20496 8.99207V7.87366Z" fill="white"/><path class="cr-color" d="M7.8418 6.55521L7.84482 5.23679L8.96323 5.23936C9.07369 5.23961 9.16303 5.32936 9.16278 5.43982L9.16067 6.35823C9.16041 6.46869 9.07067 6.55803 8.96021 6.55777L7.8418 6.55521Z" fill="white"/><path class="cr-color" d="M4.02136 5.24139L4.01834 6.55981L2.89992 6.55724C2.78947 6.55699 2.70013 6.46724 2.70038 6.35678L2.70249 5.43837C2.70274 5.32791 2.79249 5.23857 2.90295 5.23883L4.02136 5.24139Z" fill="white"/><path class="cr-color" d="M4.31238 6.50336L5.19179 7.48563L4.09281 8.46953C4.01051 8.5432 3.88407 8.53622 3.8104 8.45392L3.19779 7.76967C3.12412 7.68737 3.1311 7.56093 3.2134 7.48725L4.31238 6.50336Z" fill="white"/></svg>',
            children: [
              { 
                path: this.setUrl(URLConstants.STAFF_ATTENDANCE_MACHINE_REPORT), 
                title: 'Attendance Machine Report', 
                type: 'link', 
                active: false , 
                show: this.hasPermission('faculty_attendance_machine_report')
              },
              {
                title: 'Attendance Report',
                type: 'link',
                path: this.setUrl(URLConstants.FACULTY_ATTENDANCE_REPORT),
                show: this.hasPermission('faculty_attendance_report'),
                active: false,
                svgPath: '<svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 0H4.32843C3.79799 0 3.28929 0.210713 2.91421 0.585786L0.585786 2.91421C0.210714 3.28929 0 3.79799 0 4.32843V12C0 13.1046 0.895431 14 2 14H9C10.1046 14 11 13.1046 11 12V2C11 0.895431 10.1046 0 9 0Z"/><path class="cr-color" d="M5.01671 5.55208C5.00484 5.33149 4.81545 5.1596 4.59838 5.20061C4.12584 5.2899 3.67956 5.49158 3.29835 5.79106C2.81182 6.17327 2.45496 6.69619 2.27639 7.28856C2.09781 7.88093 2.1062 8.51395 2.30042 9.10138C2.49464 9.68881 2.86524 10.2021 3.36173 10.5713C3.85822 10.9404 4.45645 11.1476 5.07492 11.1644C5.69339 11.1813 6.30203 11.0071 6.81791 10.6655C7.33378 10.324 7.73181 9.83168 7.95777 9.25572C8.13482 8.80443 8.19947 8.31897 8.14893 7.84073C8.12572 7.62104 7.90658 7.48917 7.69191 7.5413L5.6249 8.04329C5.38166 8.10237 5.14454 7.92605 5.13108 7.6761L5.01671 5.55208Z"/><path d="M8.30925 6.62689C8.51862 6.55642 8.63337 6.32814 8.53814 6.1288C8.31185 5.65511 7.9751 5.24025 7.55394 4.92048C7.13278 4.60072 6.64271 4.38781 6.12563 4.2971C5.90803 4.25893 5.71898 4.43079 5.70735 4.6514L5.58526 6.96624C5.57039 7.2483 5.84462 7.45651 6.11232 7.3664L8.30925 6.62689Z" class="cr-color" /></svg>',
              },
            ]
          },    
        ]
      },
      ...moduleName.find(item => item == 'assignment') && {
        title: 'Assignments',
        type: 'sub',
        active: false,
        show: ((this.getInstituteModule('Faculty'))) &&  (
          this.hasModule('administrator_homework') || this.hasModule('administrator_assignment') ||
          this.hasModule('administrator_classwork') || this.hasModule('administrator_syllabus') ||
          this.hasModule('administrator_notes') || this.hasModule('administrator_videolink') ||
          this.hasModule('administrator_notice')
        ),
        svgPath: '<svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 1.1V12.9C0 13.2314 0.268629 13.5 0.6 13.5H9.4C9.73137 13.5 10 13.2314 10 12.9V1.1C10 0.76863 9.73137 0.5 9.4 0.5H0.600001C0.26863 0.5 0 0.768629 0 1.1ZM0.512132 1.98787L1.48787 1.01213C1.67686 0.823142 2 0.956993 2 1.22426V2.2C2 2.36569 1.86569 2.5 1.7 2.5H0.724264C0.456993 2.5 0.323143 2.17686 0.512132 1.98787ZM2.25 4C2.25 3.86193 2.36193 3.75 2.5 3.75H8C8.13807 3.75 8.25 3.86193 8.25 4C8.25 4.13807 8.13807 4.25 8 4.25H2.5C2.36193 4.25 2.25 4.13807 2.25 4ZM2.25 6C2.25 5.86193 2.36193 5.75 2.5 5.75H8C8.13807 5.75 8.25 5.86193 8.25 6C8.25 6.13807 8.13807 6.25 8 6.25H2.5C2.36193 6.25 2.25 6.13807 2.25 6ZM2.25 8C2.25 7.86193 2.36193 7.75 2.5 7.75H8C8.13807 7.75 8.25 7.86193 8.25 8C8.25 8.13807 8.13807 8.25 8 8.25H2.5C2.36193 8.25 2.25 8.13807 2.25 8ZM2.25 10C2.25 9.86193 2.36193 9.75 2.5 9.75H8C8.13807 9.75 8.25 9.86193 8.25 10C8.25 10.1381 8.13807 10.25 8 10.25H2.5C2.36193 10.25 2.25 10.1381 2.25 10Z"/></svg>',
        children: [
          {
            title: 'Homework',
            type: 'link',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_183_691)"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.99963 3.39997H0V10.8C0 11.1314 0.268629 11.4 0.6 11.4H7.39998C7.73135 11.4 7.99998 11.1314 7.99998 10.8V1.60003C7.99998 1.26866 7.73135 1.00003 7.39998 1.00003H2.39963V2.99997C2.39963 3.22088 2.22054 3.39997 1.99963 3.39997ZM1.87962 4.99993C1.72498 4.99993 1.59962 5.12529 1.59962 5.27993C1.59962 5.43457 1.72498 5.55993 1.87962 5.55993H6.11961C6.27425 5.55993 6.39961 5.43457 6.39961 5.27993C6.39961 5.12529 6.27425 4.99993 6.11961 4.99993H1.87962ZM1.59962 6.87994C1.59962 6.7253 1.72498 6.59994 1.87962 6.59994H6.11961C6.27425 6.59994 6.39961 6.7253 6.39961 6.87994C6.39961 7.03458 6.27425 7.15994 6.11961 7.15994H1.87962C1.72498 7.15994 1.59962 7.03458 1.59962 6.87994ZM1.87962 8.19998C1.72498 8.19998 1.59962 8.32534 1.59962 8.47998C1.59962 8.63462 1.72498 8.75998 1.87962 8.75998H6.11961C6.27425 8.75998 6.39961 8.63462 6.39961 8.47998C6.39961 8.32534 6.27425 8.19998 6.11961 8.19998H1.87962Z"/><path d="M2.00014 3.00001V1.40001L0.400146 3.00001H2.00014Z"/><path d="M8.24596 9.21516L8.32118 4.16732L11.1743 4.20984L11.0991 9.25768L9.53336 11.21L8.24596 9.21516Z"/><path d="M8.40479 3.23087L8.41869 2.39563C8.43152 1.62485 9.06676 1.01041 9.83754 1.02324C10.6083 1.03607 11.2228 1.67131 11.2099 2.44209L11.196 3.27733L8.40479 3.23087Z"/></g><defs><clipPath id="clip0_183_691"><rect width="12" height="12" fill="white"/></clipPath></defs></svg>',
            path: this.setUrl(URLConstants.HOMEWORK_LIST),
            show: this.hasPermission('administrator_homework'),
            active: false
          },
          {
            title: 'Assignment',
            type: 'link',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_183_661)"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.78405 2.723H1.46143V11.2C1.46143 11.5314 1.73005 11.8 2.06143 11.8H9.93835C10.2697 11.8 10.5383 11.5314 10.5383 11.2V0.600001C10.5383 0.26863 10.2697 0 9.93835 0H4.18405V2.323C4.18405 2.54392 4.00496 2.723 3.78405 2.723ZM3.59405 4.53837C3.41859 4.53837 3.27636 4.6806 3.27636 4.85606C3.27636 5.03152 3.41859 5.17375 3.59405 5.17375H8.40482C8.58028 5.17375 8.72251 5.03152 8.72251 4.85606C8.72251 4.6806 8.58028 4.53837 8.40482 4.53837H3.59405ZM3.27636 6.67146C3.27636 6.49601 3.41859 6.35377 3.59405 6.35377H8.40482C8.58028 6.35377 8.72251 6.49601 8.72251 6.67146C8.72251 6.84692 8.58028 6.98916 8.40482 6.98916H3.59405C3.41859 6.98916 3.27636 6.84692 3.27636 6.67146ZM3.59405 8.16918C3.41859 8.16918 3.27636 8.31141 3.27636 8.48687C3.27636 8.66232 3.41859 8.80456 3.59405 8.80456H8.40482C8.58028 8.80456 8.72251 8.66232 8.72251 8.48687C8.72251 8.31141 8.58028 8.16918 8.40482 8.16918H3.59405Z"/><path d="M3.73067 2.26921V0.453827L1.91528 2.26921H3.73067Z"/></g><defs><clipPath id="clip0_183_661"><rect width="12" height="12" fill="white"/></clipPath></defs></svg>',
            path: this.setUrl(URLConstants.ASSIGNMENT_LIST),
            show: this.hasPermission('administrator_assignment'),
            active: false
          },
          {
            title: 'Syllabus',
            type: 'link',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.1377 7.26209C3.1377 7.15163 3.22724 7.06209 3.3377 7.06209H5.35471C5.46517 7.06209 5.55471 7.15163 5.55471 7.26209V10.6634C5.55471 10.833 5.35694 10.9256 5.22667 10.8171L4.47424 10.1901C4.40007 10.1282 4.29233 10.1282 4.21816 10.1901L3.46573 10.8171C3.33547 10.9256 3.1377 10.833 3.1377 10.6634V7.26209Z"/><path d="M8.61209 4.54743L6.28443 3.4894C5.98413 3.3529 5.96882 2.93205 6.25841 2.77409L8.58607 1.50446C8.70547 1.43933 8.84977 1.43933 8.96916 1.50446L11.2968 2.77409C11.5864 2.93205 11.5711 3.3529 11.2708 3.4894L8.94314 4.54743C8.83797 4.59523 8.71726 4.59523 8.61209 4.54743Z"/><path d="M8.77736 5.02551L6.36035 3.817V5.02551L8.77736 6.23401L11.1944 5.02551V3.817L8.77736 5.02551Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.73743 1.42235C5.95464 1.42701 4.99228 2.95508 5.95761 4.24219C5.95761 5.04676 6.39709 6.13757 7.97174 6.3637V8.47906C7.97174 9.03134 7.52403 9.47906 6.97174 9.47906H1.7207C1.16842 9.47906 0.720703 9.03134 0.720703 8.47906V2.42235C0.720703 1.87006 1.16842 1.42235 1.7207 1.42235H6.73743ZM1.52648 8.27056C1.52648 8.04808 1.70684 7.86772 1.92932 7.86772H7.16618V8.67339H1.92932C1.70684 8.67339 1.52648 8.49304 1.52648 8.27056Z"/></svg>',
            path: this.setUrl(URLConstants.SYLLABUS_LIST),
            show: this.hasPermission('administrator_syllabus'),
            active: false
          },
          {
            title: 'Classwork',
            type: 'link',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.10878 10.2064L8.73217 7.58299L10.215 9.06578L7.59157 11.6892L5.7666 11.9173L6.10878 10.2064Z"/><path d="M9.27588 7.16519L9.79109 6.65178C10.1755 6.26869 10.7977 6.26978 11.1808 6.6542C11.5639 7.03863 11.5628 7.66083 11.1784 8.04391L10.6632 8.55733L9.27588 7.16519Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M1 10.7247H4.57489H4.57492L4.57491 10.7247L8.7456 5.95816V5.36234V2.38326L6.36234 0H1V10.7247ZM2.54914 2.38324C2.3517 2.38324 2.19165 2.54329 2.19165 2.74073C2.19165 2.93817 2.3517 3.09822 2.54914 3.09822H4.21742C4.41486 3.09822 4.57491 2.93817 4.57491 2.74073C4.57491 2.54329 4.41486 2.38324 4.21742 2.38324H2.54914ZM2.19165 4.64735C2.19165 4.44991 2.3517 4.28986 2.54914 4.28986H7.79232C7.98975 4.28986 8.14981 4.44991 8.14981 4.64735C8.14981 4.84478 7.98975 5.00483 7.79232 5.00483H2.54914C2.3517 5.00483 2.19165 4.84478 2.19165 4.64735ZM2.54914 6.31561C2.3517 6.31561 2.19165 6.47567 2.19165 6.6731C2.19165 6.87054 2.3517 7.03059 2.54914 7.03059H6.60069C6.79812 7.03059 6.95818 6.87054 6.95818 6.6731C6.95818 6.47567 6.79812 6.31561 6.60069 6.31561H2.54914Z"/></svg>',
            path: this.setUrl(URLConstants.CLASSWORK_LIST),
            show: this.hasPermission('administrator_classwork'),
            active: false
          },
          {
            title: 'Notes',
            type: 'link',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_183_716)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.3 2.723H7.97742C7.75651 2.723 7.57742 2.54392 7.57742 2.323V0H1.82312C1.49175 0 1.22313 0.26863 1.22313 0.600001V11.2C1.22313 11.5314 1.49175 11.8 1.82312 11.8H9.70005C10.0314 11.8 10.3 11.5314 10.3 11.2V2.723ZM8.48511 4.85605C8.48511 4.6806 8.34287 4.53836 8.16742 4.53836H3.35665C3.18119 4.53836 3.03895 4.6806 3.03895 4.85605C3.03895 5.03151 3.18119 5.17375 3.35665 5.17375H8.16742C8.34287 5.17375 8.48511 5.03151 8.48511 4.85605ZM5.71895 3C5.89568 3 6.03895 3.14327 6.03895 3.32C6.03895 3.49673 5.89569 3.64 5.71895 3.64H3.35895C3.18222 3.64 3.03895 3.49673 3.03895 3.32C3.03895 3.14327 3.18222 3 3.35895 3H5.71895ZM8.48512 6.67146C8.48512 6.49601 8.34288 6.35377 8.16742 6.35377H3.35666C3.1812 6.35377 3.03896 6.49601 3.03896 6.67146C3.03896 6.84692 3.1812 6.98916 3.35666 6.98916H8.16742C8.34288 6.98916 8.48512 6.84692 8.48512 6.67146ZM8.16742 8.16918C8.34288 8.16918 8.48512 8.31141 8.48512 8.48687C8.48512 8.66232 8.34288 8.80456 8.16742 8.80456H3.35666C3.1812 8.80456 3.03896 8.66232 3.03896 8.48687C3.03896 8.31141 3.1812 8.16918 3.35666 8.16918H8.16742Z"/><path d="M8.03081 2.26921V0.453827L9.84619 2.26921H8.03081Z"/></g><defs><clipPath id="clip0_183_716"><rect width="12" height="12" fill="white"/></clipPath></defs></svg>',
            path: this.setUrl(URLConstants.NOTES_LIST),
            show: this.hasPermission('administrator_notes'),
            active: false
          },
          {
            title: 'VideoLink',
            type: 'link',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2C0 1.44772 0.447715 1 1 1H11C11.5523 1 12 1.44772 12 2V8H0V2ZM0 9H12V10C12 10.5523 11.5523 11 11 11H1C0.447715 11 0 10.5523 0 10V9ZM3 9.75C2.86193 9.75 2.75 9.86193 2.75 10C2.75 10.1381 2.86193 10.25 3 10.25H11C11.1381 10.25 11.25 10.1381 11.25 10C11.25 9.86193 11.1381 9.75 11 9.75H3ZM2.5 10.05C2.5 10.4642 2.16421 10.8 1.75 10.8C1.33579 10.8 1 10.4642 1 10.05C1 9.63577 1.33579 9.29999 1.75 9.29999C2.16421 9.29999 2.5 9.63577 2.5 10.05ZM7.94444 3.15554H6.38889C6.17375 3.15554 5.97521 3.22664 5.8155 3.34663C6.57802 3.4467 7.16667 4.09905 7.16667 4.88888C7.16667 4.94899 7.16326 5.00831 7.15662 5.06665H7.94444C8.47218 5.06665 8.9 4.63884 8.9 4.1111C8.9 3.58336 8.47218 3.15554 7.94444 3.15554ZM6.38889 2.55554C5.81311 2.55554 5.3104 2.86836 5.04144 3.33332H4.05556C3.19645 3.33332 2.5 4.02977 2.5 4.88888C2.5 5.74799 3.19645 6.44443 4.05556 6.44443H5.61111C6.18689 6.44443 6.6896 6.13161 6.95856 5.66665H7.94444C8.80355 5.66665 9.5 4.97021 9.5 4.1111C9.5 3.25199 8.80355 2.55554 7.94444 2.55554H6.38889ZM5.61111 5.84443C5.82625 5.84443 6.02479 5.77333 6.1845 5.65335C5.42198 5.55327 4.83333 4.90093 4.83333 4.1111C4.83333 4.05098 4.83674 3.99166 4.84338 3.93332H4.05556C3.52782 3.93332 3.1 4.36114 3.1 4.88888C3.1 5.41661 3.52782 5.84443 4.05556 5.84443H5.61111ZM6.38889 5.06665H6.55016C6.561 5.00905 6.56667 4.94963 6.56667 4.88888C6.56667 4.36114 6.13885 3.93332 5.61111 3.93332H5.44984C5.439 3.99092 5.43333 4.05035 5.43333 4.1111C5.43333 4.63884 5.86115 5.06665 6.38889 5.06665Z"/></svg>',
            path: this.setUrl(URLConstants.VIDEO_LIST),
            show: this.hasPermission('administrator_videolink'),
            active: false
          },
          {
            title: 'Notice',
            type: 'link',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 1C1.89543 1 1 1.89543 1 3V6.3737V7V10.5172C1 10.6953 1.21543 10.7846 1.34142 10.6586L3 9H9C10.1046 9 11 8.10457 11 7V3C11 1.89543 10.1046 1 9 1H3ZM5.40002 3.10001C5.40002 2.82386 5.62388 2.60001 5.90002 2.60001C6.17617 2.60001 6.40002 2.82386 6.40002 3.10001V5.10001C6.40002 5.37615 6.17617 5.60001 5.90002 5.60001C5.62388 5.60001 5.40002 5.37615 5.40002 5.10001V3.10001ZM5.90002 6.10001C5.62388 6.10001 5.40002 6.32386 5.40002 6.60001C5.40002 6.87615 5.62388 7.10001 5.90002 7.10001C6.17617 7.10001 6.40002 6.87615 6.40002 6.60001C6.40002 6.32386 6.17617 6.10001 5.90002 6.10001Z"/></svg>',
            path: this.setUrl(URLConstants.NOTICE_LIST),
            show: this.hasPermission('administrator_notice'),
            active: false
          }
        ]
      },
      ...moduleName.find(item => item == 'expense') && {
        title: 'Expense',
        type: 'sub',
        active: false,
        show: ((this.getInstituteModule('Finance')) && ( (this.hasModule('finance_expenses')) || this.hasModule('finance_expense_report')|| this.hasModule('finance_bank_accounts') 
        || this.hasModule('finance_taxes') || this.hasModule('finance_ac_group') || this.hasModule('finance_ledger_accounts') || this.hasModule('finance_incomes')
        || this.hasModule('finance_profit_loss_report'))),
        svgPath: '<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.92927 2.32929L7.77069 0.170711C7.70769 0.107714 7.59998 0.152331 7.59998 0.241421V2.4C7.59998 2.45523 7.64475 2.5 7.69998 2.5H9.85855C9.94764 2.5 9.99226 2.39229 9.92927 2.32929Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M7 0H2C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.89543 12 2 12H8C9.10457 12 10 11.1046 10 10V3H8C7.44772 3 7 2.55228 7 2V0ZM6.38431 4.60857C6.439 4.51411 6.407 4.39256 6.3091 4.34429C5.77778 4.08236 5.17851 3.98516 4.58887 4.06782C3.93382 4.15965 3.32838 4.46819 2.86911 4.94422C2.40985 5.42026 2.12321 6.03637 2.05492 6.69429C1.98662 7.35222 2.14061 8.01406 2.4923 8.57428C2.844 9.13449 3.37316 9.5608 3.99539 9.78522C4.61761 10.0096 5.29707 10.0192 5.92539 9.8125C6.55371 9.60575 7.09471 9.19456 7.46209 8.64451C7.7928 8.14939 7.96569 7.56743 7.96069 6.97507C7.95977 6.86593 7.8642 6.78428 7.75536 6.79248C7.64652 6.80068 7.56573 6.89564 7.56553 7.00479C7.56459 7.50894 7.41505 8.00331 7.1334 8.42497C6.81506 8.9016 6.34629 9.25789 5.80185 9.43704C5.2574 9.61618 4.66865 9.60786 4.12949 9.4134C3.59033 9.21894 3.13181 8.84954 2.82707 8.36411C2.52232 7.87869 2.38889 7.3052 2.44807 6.7351C2.50725 6.16501 2.75562 5.63115 3.15357 5.21866C3.55153 4.80618 4.07614 4.53883 4.64375 4.45926C5.14592 4.38886 5.65614 4.46901 6.11061 4.68728C6.209 4.73453 6.32963 4.70304 6.38431 4.60857ZM4.796 8.54087V8.86364H5.02895V8.5408C5.21168 8.53049 5.37077 8.49559 5.50623 8.43608C5.671 8.36316 5.79695 8.26231 5.88407 8.13352C5.97119 8.00379 6.01475 7.85369 6.01475 7.68324C6.01475 7.55729 5.99107 7.44744 5.94373 7.35369C5.89638 7.25994 5.83198 7.17992 5.75054 7.11364C5.67005 7.04735 5.57867 6.99242 5.4764 6.94886C5.37507 6.9053 5.26948 6.87074 5.15963 6.84517L5.02895 6.8125V6.00336C5.13614 6.01613 5.22658 6.04863 5.30026 6.10085C5.39874 6.16998 5.45462 6.26657 5.46787 6.39062H5.97498C5.97213 6.2268 5.92621 6.08191 5.83719 5.95597C5.74818 5.82907 5.62554 5.73011 5.46929 5.65909C5.34018 5.59926 5.1934 5.5643 5.02895 5.55421V5.22727H4.796V5.55631C4.64427 5.56862 4.50554 5.60288 4.37981 5.65909C4.21882 5.73011 4.09145 5.83002 3.9977 5.95881C3.9049 6.08759 3.8585 6.23769 3.8585 6.40909C3.8585 6.61742 3.92763 6.78456 4.06588 6.91051C4.20509 7.03551 4.39448 7.12879 4.63407 7.19034L4.796 7.23204V8.08774C4.72907 8.08022 4.66657 8.06565 4.6085 8.04403C4.52043 8.01089 4.44893 7.9607 4.39401 7.89347C4.33909 7.82623 4.30784 7.74195 4.30026 7.64062H3.78179C3.78937 7.83381 3.83956 7.99763 3.93236 8.1321C4.02611 8.26657 4.15585 8.36884 4.32157 8.43892C4.45933 8.49684 4.61747 8.53083 4.796 8.54087ZM5.02895 8.08665C5.0942 8.07868 5.15386 8.064 5.20793 8.04261C5.29505 8.00758 5.36323 7.95928 5.41248 7.89773C5.46172 7.83523 5.48681 7.76231 5.48776 7.67898C5.48681 7.60322 5.46456 7.54072 5.421 7.49148C5.37744 7.44129 5.31636 7.39962 5.23776 7.36648C5.17643 7.33955 5.10683 7.31499 5.02895 7.29279V8.08665ZM4.796 6.75267V6.00501C4.7373 6.01295 4.68427 6.0269 4.63691 6.04688C4.55831 6.08002 4.49818 6.125 4.45651 6.18182C4.41484 6.23864 4.39354 6.3035 4.39259 6.37642C4.39259 6.43703 4.40632 6.48958 4.43378 6.53409C4.46219 6.5786 4.50054 6.61648 4.54884 6.64773C4.59713 6.67803 4.65064 6.7036 4.70935 6.72443C4.73812 6.73464 4.767 6.74405 4.796 6.75267Z" /></svg>',
        children: [
          {
            path: this.setUrl(URLConstants.EXPENSE_REPORT),
            title: 'Expense Report',
            type: 'link',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.857178 2.14286L6.00003 0L11.1429 2.14286V3.42857H0.857178V2.14286ZM3.72857 1.71428C3.56289 1.71428 3.42857 1.84859 3.42857 2.01428C3.42857 2.17996 3.56289 2.31428 3.72857 2.31428H8.27143C8.43711 2.31428 8.57143 2.17996 8.57143 2.01428C8.57143 1.84859 8.43711 1.71428 8.27143 1.71428H3.72857Z"/><rect x="1.71436" y="4.28571" width="1.71429" height="3.42857"/><rect x="8.57153" y="4.28571" width="1.71429" height="3.42857"/><path d="M0.857178 9.42855C0.857178 8.95517 1.24093 8.57141 1.71432 8.57141H3.42861C3.90199 8.57141 4.28575 8.95517 4.28575 9.42855H0.857178Z"/><path d="M7.71436 9.42855C7.71436 8.95517 8.09811 8.57141 8.5715 8.57141H10.2858C10.7592 8.57141 11.1429 8.95517 11.1429 9.42855H7.71436Z"/><rect y="10.2857" width="12" height="1.28571" rx="0.5"/><path d="M5.85904 8.39934V4.76298H6.092V8.39934H5.85904ZM6.64313 5.85389C6.62609 5.70995 6.55696 5.59821 6.43575 5.51866C6.31453 5.43911 6.16586 5.39934 5.98972 5.39934C5.86094 5.39934 5.74825 5.42018 5.65166 5.46184C5.55601 5.50351 5.4812 5.5608 5.42722 5.63372C5.37419 5.70663 5.34768 5.78949 5.34768 5.8823C5.34768 5.95995 5.36614 6.02671 5.40308 6.08258C5.44095 6.1375 5.48925 6.18343 5.54796 6.22036C5.60667 6.25635 5.66823 6.28618 5.73262 6.30985C5.79702 6.33258 5.8562 6.35105 5.91018 6.36525L6.20563 6.4448C6.28139 6.46468 6.36567 6.49214 6.45847 6.52718C6.55222 6.56222 6.64171 6.61004 6.72694 6.67065C6.81311 6.73031 6.88414 6.80701 6.94001 6.90076C6.99588 6.99451 7.02381 7.10957 7.02381 7.24593C7.02381 7.40313 6.98262 7.54518 6.90024 7.67207C6.8188 7.79896 6.69948 7.89982 6.54228 7.97463C6.38603 8.04944 6.19616 8.08684 5.97268 8.08684C5.76435 8.08684 5.58395 8.05322 5.43149 7.98599C5.27997 7.91875 5.16065 7.825 5.07353 7.70474C4.98736 7.58447 4.93859 7.4448 4.92722 7.28571H5.29086C5.30033 7.39555 5.33726 7.48646 5.40166 7.55843C5.467 7.62946 5.54938 7.68249 5.64881 7.71752C5.74919 7.75161 5.85715 7.76866 5.97268 7.76866C6.10715 7.76866 6.22789 7.74688 6.33489 7.70332C6.4419 7.65881 6.52666 7.59726 6.58916 7.51866C6.65166 7.43911 6.68291 7.34631 6.68291 7.24025C6.68291 7.14366 6.65592 7.06506 6.60194 7.00446C6.54796 6.94385 6.47694 6.89461 6.38887 6.85673C6.3008 6.81885 6.20563 6.78571 6.10336 6.7573L5.74541 6.65502C5.51813 6.58968 5.33821 6.49641 5.20563 6.37519C5.07306 6.25398 5.00677 6.09536 5.00677 5.89934C5.00677 5.73646 5.0508 5.59442 5.13887 5.47321C5.22789 5.35105 5.3472 5.25635 5.49683 5.18911C5.64739 5.12093 5.81548 5.08684 6.00109 5.08684C6.18859 5.08684 6.35525 5.12046 6.50109 5.18769C6.64692 5.25398 6.76245 5.34489 6.84768 5.46042C6.93385 5.57595 6.97931 5.70711 6.98404 5.85389H6.64313Z"/></svg>',
            active: false,
            show: this.hasPermission('finance_expense_report')
          },
          {
            path: this.setUrl(URLConstants.BANK_ACCOUNT_LIST),
            title: 'Bank Accounts',
            type: 'link',
            svgPath:'<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 12.0357C9.31371 12.0357 12 9.34941 12 6.03571C12 2.722 9.31371 0.0357056 6 0.0357056C2.68629 0.0357056 0 2.722 0 6.03571C0 9.34941 2.68629 12.0357 6 12.0357ZM5.79403 8.09702V8.58116H6.14347V8.0969C6.41755 8.08145 6.65619 8.02909 6.85938 7.93983C7.10653 7.83045 7.29545 7.67917 7.42614 7.48599C7.55682 7.29139 7.62216 7.06625 7.62216 6.81056C7.62216 6.62164 7.58665 6.45687 7.51562 6.31625C7.4446 6.17562 7.34801 6.05559 7.22585 5.95616C7.10511 5.85673 6.96804 5.77434 6.81463 5.709C6.66264 5.64366 6.50426 5.59181 6.33949 5.55346L6.14347 5.50446V4.29075C6.30425 4.30991 6.4399 4.35865 6.55043 4.43698C6.69815 4.54068 6.78196 4.68556 6.80185 4.87164H7.5625C7.55824 4.6259 7.48935 4.40857 7.35582 4.21965C7.2223 4.02931 7.03835 3.88088 6.80398 3.77434C6.61031 3.68459 6.39014 3.63215 6.14347 3.61702V3.12661H5.79403V3.62017C5.56644 3.63864 5.35835 3.69003 5.16974 3.77434C4.92827 3.88088 4.73722 4.03073 4.59659 4.22392C4.45739 4.4171 4.38778 4.64224 4.38778 4.89934C4.38778 5.21184 4.49148 5.46255 4.69886 5.65147C4.90767 5.83897 5.19176 5.97889 5.55114 6.07122L5.79403 6.13377V7.41732C5.69363 7.40604 5.59988 7.38419 5.51278 7.35176C5.38068 7.30204 5.27344 7.22676 5.19105 7.1259C5.10866 7.02505 5.06179 6.89863 5.05043 6.74664H4.27273C4.28409 7.03642 4.35938 7.28215 4.49858 7.48386C4.6392 7.68556 4.83381 7.83897 5.08239 7.94409C5.28903 8.03097 5.52625 8.08195 5.79403 8.09702ZM6.14347 7.41568C6.24134 7.40373 6.33083 7.38171 6.41193 7.34963C6.54261 7.29707 6.64489 7.22463 6.71875 7.1323C6.79261 7.03855 6.83026 6.92917 6.83168 6.80417C6.83026 6.69054 6.79688 6.59679 6.73153 6.52292C6.66619 6.44764 6.57457 6.38514 6.45668 6.33542C6.36468 6.29503 6.26028 6.25819 6.14347 6.22489V7.41568ZM5.79403 5.41471V4.29323C5.70598 4.30513 5.62643 4.32606 5.5554 4.35602C5.4375 4.40573 5.3473 4.47321 5.2848 4.55843C5.2223 4.64366 5.19034 4.74096 5.18892 4.85034C5.18892 4.94125 5.20952 5.02008 5.25071 5.08684C5.29332 5.1536 5.35085 5.21042 5.4233 5.2573C5.49574 5.30275 5.57599 5.3411 5.66406 5.37235C5.70722 5.38767 5.75054 5.40178 5.79403 5.41471Z"/></svg>',
            active: false,
            show: this.hasPermission('finance_bank_accounts')
          },
          {
            path: this.setUrl(URLConstants.TAX_LIST),
            title: 'Taxes',
            type: 'link',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9C12 10.6569 10.6569 12 9 12C7.34315 12 6 10.6569 6 9C6 7.34315 7.34315 6 9 6C10.6569 6 12 7.34315 12 9ZM6.42804 9C6.42804 10.4205 7.57954 11.572 9 11.572C10.4205 11.572 11.572 10.4205 11.572 9C11.572 7.57954 10.4205 6.42804 9 6.42804C7.57954 6.42804 6.42804 7.57954 6.42804 9Z"/><circle cx="5" cy="3" r="3"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2 6H2.76389C3.31321 6.61375 4.1115 7 5 7C5.8885 7 6.68679 6.61375 7.23611 6H8C8.15428 6 8.30449 6.01747 8.44874 6.05054C7.05519 6.30936 6 7.53146 6 9C6 9.76835 6.28885 10.4692 6.76389 11H2C0.89543 11 0 10.1046 0 9V8C0 6.89543 0.895431 6 2 6Z"/><path d="M8.9027 10.2852V7.82777H9.46023V10.2852H8.9027ZM7.95277 9.33523V8.7777H10.4102V9.33523H7.95277Z"/></svg>',
            active: false,
            show: this.hasPermission('finance_taxes')
          },
          {
            path: this.setUrl(URLConstants.LEDGER_LIST),
            title: 'A/C Group',
            type: 'link',
            svgPath:'<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.25543 10.6239C9.36734 10.7885 9.32521 11.0137 9.15357 11.1144C8.41886 11.5454 7.59097 11.7972 6.73724 11.8471C5.76336 11.904 4.79226 11.696 3.92718 11.2451C3.06209 10.7942 2.33535 10.1173 1.82422 9.2864C1.31309 8.45549 1.03667 7.50159 1.02435 6.52613C1.01202 5.55067 1.26426 4.5901 1.75424 3.74654C2.24422 2.90297 2.95363 2.20795 3.80705 1.73535C4.66047 1.26274 5.626 1.03023 6.60101 1.06253C7.45572 1.09084 8.28971 1.32172 9.03507 1.73398C9.2092 1.83029 9.257 2.0544 9.14929 2.22173C9.04158 2.38905 8.8192 2.43602 8.64408 2.34151C8.00902 1.99873 7.30168 1.80675 6.57715 1.78275C5.7323 1.75477 4.89565 1.95624 4.15615 2.36575C3.41665 2.77527 2.80194 3.37752 2.37737 4.10848C1.95279 4.83943 1.73423 5.67178 1.74491 6.51703C1.75558 7.36228 1.9951 8.18884 2.43801 8.90884C2.88091 9.62884 3.51064 10.2154 4.26024 10.6061C5.00985 10.9968 5.85132 11.177 6.6952 11.1277C7.41889 11.0854 8.12115 10.8756 8.74736 10.5169C8.92003 10.418 9.14353 10.4594 9.25543 10.6239Z"/><mask id="path-2-inside-1_216_30" fill="white"><path d="M8.81773 10.8901C8.91234 11.0651 9.13172 11.1314 9.30008 11.0253C10.0739 10.5377 10.7129 9.86037 11.1548 9.05514C11.6547 8.14437 11.8811 7.10873 11.8069 6.07248C11.7327 5.03623 11.3611 4.04339 10.7366 3.21311C10.1845 2.47903 9.45553 1.89959 8.62017 1.52723C8.43841 1.44622 8.2307 1.54302 8.16199 1.72977C8.09328 1.91652 8.18969 2.12235 8.37061 2.20523C9.07613 2.52845 9.692 3.02304 10.1607 3.64626C10.7018 4.36571 11.0238 5.22601 11.0881 6.12393C11.1524 7.02186 10.9562 7.91925 10.5231 8.70844C10.1479 9.39207 9.60878 9.96934 8.95649 10.3898C8.78923 10.4976 8.72311 10.715 8.81773 10.8901Z"/></mask><path d="M8.81773 10.8901C8.91234 11.0651 9.13172 11.1314 9.30008 11.0253C10.0739 10.5377 10.7129 9.86037 11.1548 9.05514C11.6547 8.14437 11.8811 7.10873 11.8069 6.07248C11.7327 5.03623 11.3611 4.04339 10.7366 3.21311C10.1845 2.47903 9.45553 1.89959 8.62017 1.52723C8.43841 1.44622 8.2307 1.54302 8.16199 1.72977C8.09328 1.91652 8.18969 2.12235 8.37061 2.20523C9.07613 2.52845 9.692 3.02304 10.1607 3.64626C10.7018 4.36571 11.0238 5.22601 11.0881 6.12393C11.1524 7.02186 10.9562 7.91925 10.5231 8.70844C10.1479 9.39207 9.60878 9.96934 8.95649 10.3898C8.78923 10.4976 8.72311 10.715 8.81773 10.8901Z" stroke="black" stroke-width="2" stroke-dasharray="2 2" mask="url(#path-2-inside-1_216_30)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.42216 10.0569C8.40978 10.0569 10.0211 8.44561 10.0211 6.45799C10.0211 4.47036 8.40978 2.85907 6.42216 2.85907C4.43453 2.85907 2.82324 4.47036 2.82324 6.45799C2.82324 8.44561 4.43453 10.0569 6.42216 10.0569ZM6.4167 8.92037V9.40451H6.76613V8.92025C7.04021 8.9048 7.27885 8.85244 7.48204 8.76318C7.7292 8.6538 7.91812 8.50252 8.0488 8.30934C8.17948 8.11474 8.24482 7.8896 8.24482 7.63391C8.24482 7.44499 8.20931 7.28022 8.13829 7.1396C8.06727 6.99897 7.97067 6.87894 7.84852 6.77951C7.72778 6.68008 7.5907 6.59769 7.43729 6.53235C7.28531 6.46701 7.12692 6.41516 6.96215 6.37681L6.76613 6.32781V5.1141C6.92691 5.13326 7.06256 5.182 7.17309 5.26034C7.32082 5.36403 7.40462 5.50892 7.42451 5.69499H8.18516C8.1809 5.44926 8.11201 5.23193 7.97849 5.04301C7.84496 4.85266 7.66102 4.70423 7.42664 4.59769C7.23298 4.50795 7.01281 4.4555 6.76613 4.44037V3.94997H6.4167V4.44353C6.1891 4.46199 5.98101 4.51338 5.79241 4.59769C5.55093 4.70423 5.35988 4.85409 5.21925 5.04727C5.08005 5.24045 5.01045 5.46559 5.01045 5.72269C5.01045 6.03519 5.11414 6.2859 5.32153 6.47482C5.53033 6.66232 5.81442 6.80224 6.1738 6.89457L6.4167 6.95712V8.24067C6.3163 8.22939 6.22255 8.20754 6.13545 8.17511C6.00334 8.12539 5.8961 8.05011 5.81371 7.94926C5.73133 7.8484 5.68445 7.72198 5.67309 7.56999H4.89539C4.90675 7.85977 4.98204 8.10551 5.12124 8.30721C5.26187 8.50891 5.45647 8.66232 5.70505 8.76744C5.91169 8.85432 6.14891 8.9053 6.4167 8.92037ZM6.76613 8.23903C6.86401 8.22708 6.95349 8.20506 7.03459 8.17298C7.16528 8.12042 7.26755 8.04798 7.34141 7.95565C7.41528 7.8619 7.45292 7.75252 7.45434 7.62752C7.45292 7.51389 7.41954 7.42014 7.3542 7.34627C7.28886 7.27099 7.19724 7.20849 7.07934 7.15877C6.98734 7.11838 6.88294 7.08154 6.76613 7.04824V8.23903ZM6.4167 6.23806V5.11658C6.32864 5.12848 6.2491 5.14941 6.17806 5.17937C6.06016 5.22909 5.96996 5.29656 5.90746 5.38178C5.84496 5.46701 5.813 5.56431 5.81158 5.67369C5.81158 5.7646 5.83218 5.84343 5.87337 5.91019C5.91599 5.97695 5.97352 6.03377 6.04596 6.08065C6.1184 6.1261 6.19866 6.16445 6.28673 6.1957C6.32988 6.21102 6.3732 6.22514 6.4167 6.23806Z"/></svg>',
            active: false,
            show: this.hasPermission('finance_ac_group')
          },
          {
            path: this.setUrl(URLConstants.HEAD_LIST),
            title: 'Ledger Accounts',
            type: 'link',
            svgPath:'<svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11 8.80847C11 11.2938 8.98528 13.3085 6.5 13.3085C4.01472 13.3085 2 11.2938 2 8.80847C2 6.32319 4.01472 4.30847 6.5 4.30847C8.98528 4.30847 11 6.32319 11 8.80847ZM6.4999 12.0584C8.29482 12.0584 9.7499 10.6034 9.7499 8.80844C9.7499 7.01351 8.29482 5.55844 6.4999 5.55844C4.70497 5.55844 3.2499 7.01351 3.2499 8.80844C3.2499 10.6034 4.70497 12.0584 6.4999 12.0584ZM6.4999 12.5584C8.57096 12.5584 10.2499 10.8795 10.2499 8.80844C10.2499 6.73737 8.57096 5.05844 6.4999 5.05844C4.42883 5.05844 2.7499 6.73737 2.7499 8.80844C2.7499 10.8795 4.42883 12.5584 6.4999 12.5584ZM6.52598 10.5093V10.8321H6.75893V10.5093C6.94166 10.4989 7.10075 10.464 7.23621 10.4045C7.40098 10.3316 7.52693 10.2308 7.61405 10.102C7.70117 9.97224 7.74473 9.82215 7.74473 9.65169C7.74473 9.52575 7.72105 9.4159 7.67371 9.32215C7.62636 9.2284 7.56196 9.14838 7.48052 9.08209C7.40003 9.0158 7.30865 8.96088 7.20638 8.91732C7.10505 8.87376 6.99946 8.83919 6.88962 8.81363L6.75893 8.78096V7.97182C6.86612 7.98459 6.95656 8.01709 7.03024 8.06931C7.12873 8.13844 7.1846 8.23503 7.19785 8.35908H7.70496C7.70212 8.19526 7.65619 8.05037 7.56717 7.92442C7.47816 7.79753 7.35552 7.69857 7.19927 7.62755C7.07016 7.56772 6.92338 7.53275 6.75893 7.52266V7.19573H6.52598V7.52477C6.37425 7.53708 6.23552 7.57134 6.10979 7.62755C5.9488 7.69857 5.82143 7.79847 5.72768 7.92726C5.63488 8.05605 5.58848 8.20615 5.58848 8.37755C5.58848 8.58588 5.65761 8.75302 5.79587 8.87897C5.93507 9.00397 6.12446 9.09724 6.36405 9.1588L6.52598 9.2005V10.0562C6.45905 10.0487 6.39655 10.0341 6.33848 10.0125C6.25041 9.97935 6.17891 9.92916 6.12399 9.86192C6.06907 9.79469 6.03782 9.71041 6.03024 9.60908H5.51177C5.51935 9.80226 5.56954 9.96609 5.66234 10.1006C5.75609 10.235 5.88583 10.3373 6.05155 10.4074C6.18931 10.4653 6.34745 10.4993 6.52598 10.5093ZM6.75893 10.0551C6.82418 10.0471 6.88384 10.0325 6.93791 10.0111C7.02503 9.97603 7.09321 9.92774 7.14246 9.86618C7.1917 9.80368 7.21679 9.73077 7.21774 9.64743C7.21679 9.57168 7.19454 9.50918 7.15098 9.45993C7.10742 9.40974 7.04634 9.36808 6.96774 9.33493C6.90641 9.30801 6.83681 9.28344 6.75893 9.26124V10.0551ZM6.52598 8.72113V7.97347C6.46728 7.98141 6.41425 7.99536 6.36689 8.01533C6.28829 8.04847 6.22816 8.09346 6.18649 8.15027C6.14482 8.20709 6.12352 8.27196 6.12257 8.34488C6.12257 8.40548 6.1363 8.45804 6.16376 8.50255C6.19217 8.54705 6.23052 8.58493 6.27882 8.61618C6.32712 8.64649 6.38062 8.67205 6.43933 8.69289C6.4681 8.7031 6.49698 8.71251 6.52598 8.72113Z"/><path d="M6.5 1.03571V3.49025" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M7.22798 2.97627L6.50519 4.19523L5.81094 2.9598L7.22798 2.97627Z"/></svg>',
            active: false,
            show: this.hasPermission('finance_ledger_accounts')
          },
          {
            path: this.setUrl(URLConstants.INCOME_LIST),
            title: 'Incomes',
            type: 'link',
            svgPath:'<svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.92939 2.365L7.77081 0.206416C7.70781 0.14342 7.6001 0.188037 7.6001 0.277127V2.43571C7.6001 2.49093 7.64487 2.53571 7.7001 2.53571H9.85868C9.94777 2.53571 9.99238 2.42799 9.92939 2.365Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7 0.0357056H2C0.895431 0.0357056 0 0.931136 0 2.03571V10.0357C0 11.1403 0.89543 12.0357 2 12.0357H8C9.10457 12.0357 10 11.1403 10 10.0357V3.03571H8C7.44772 3.03571 7 2.58799 7 2.03571V0.0357056ZM6.38431 4.64428C6.439 4.54982 6.407 4.42826 6.3091 4.38C5.77778 4.11807 5.17851 4.02086 4.58887 4.10352C3.93382 4.19536 3.32838 4.5039 2.86911 4.97993C2.40985 5.45596 2.12321 6.07207 2.05492 6.73C1.98662 7.38792 2.14061 8.04977 2.4923 8.60998C2.844 9.17019 3.37316 9.59651 3.99539 9.82093C4.61761 10.0453 5.29707 10.0549 5.92539 9.8482C6.55371 9.64146 7.09471 9.23027 7.46209 8.68022C7.7928 8.1851 7.96569 7.60314 7.96069 7.01078C7.95977 6.90163 7.8642 6.81999 7.75536 6.82819C7.64652 6.83638 7.56573 6.93134 7.56553 7.04049C7.56459 7.54465 7.41505 8.03901 7.1334 8.46068C6.81506 8.9373 6.34629 9.2936 5.80185 9.47274C5.2574 9.65189 4.66865 9.64357 4.12949 9.44911C3.59033 9.25465 3.13181 8.88525 2.82707 8.39982C2.52232 7.91439 2.38889 7.3409 2.44807 6.77081C2.50725 6.20071 2.75562 5.66685 3.15357 5.25437C3.55153 4.84189 4.07614 4.57454 4.64375 4.49496C5.14592 4.42456 5.65614 4.50472 6.11061 4.72298C6.209 4.77023 6.32963 4.73874 6.38431 4.64428ZM4.796 8.57658V8.89934H5.02895V8.5765C5.21168 8.5662 5.37077 8.53129 5.50623 8.47179C5.671 8.39887 5.79695 8.29802 5.88407 8.16923C5.97119 8.03949 6.01475 7.8894 6.01475 7.71894C6.01475 7.593 5.99107 7.48315 5.94373 7.3894C5.89638 7.29565 5.83198 7.21563 5.75054 7.14934C5.67005 7.08305 5.57867 7.02813 5.4764 6.98457C5.37507 6.94101 5.26948 6.90644 5.15963 6.88088L5.02895 6.84821V6.03907C5.13614 6.05184 5.22658 6.08434 5.30026 6.13656C5.39874 6.20569 5.45462 6.30228 5.46787 6.42633H5.97498C5.97213 6.2625 5.92621 6.11762 5.83719 5.99167C5.74818 5.86478 5.62554 5.76582 5.46929 5.6948C5.34018 5.63496 5.1934 5.6 5.02895 5.58991V5.26298H4.796V5.59202C4.64427 5.60433 4.50554 5.63859 4.37981 5.6948C4.21882 5.76582 4.09145 5.86572 3.9977 5.99451C3.9049 6.1233 3.8585 6.27339 3.8585 6.4448C3.8585 6.65313 3.92763 6.82027 4.06588 6.94622C4.20509 7.07122 4.39448 7.16449 4.63407 7.22605L4.796 7.26775V8.12345C4.72907 8.11593 4.66657 8.10136 4.6085 8.07974C4.52043 8.0466 4.44893 7.99641 4.39401 7.92917C4.33909 7.86194 4.30784 7.77766 4.30026 7.67633H3.78179C3.78937 7.86951 3.83956 8.03334 3.93236 8.16781C4.02611 8.30228 4.15585 8.40455 4.32157 8.47463C4.45933 8.53255 4.61747 8.56653 4.796 8.57658ZM5.02895 8.12236C5.0942 8.11439 5.15386 8.09971 5.20793 8.07832C5.29505 8.04328 5.36323 7.99499 5.41248 7.93343C5.46172 7.87093 5.48681 7.79802 5.48776 7.71468C5.48681 7.63893 5.46456 7.57643 5.421 7.52718C5.37744 7.47699 5.31636 7.43533 5.23776 7.40218C5.17643 7.37526 5.10683 7.35069 5.02895 7.32849V8.12236ZM4.796 6.78837V6.04072C4.7373 6.04866 4.68427 6.06261 4.63691 6.08258C4.55831 6.11572 4.49818 6.16071 4.45651 6.21752C4.41484 6.27434 4.39354 6.33921 4.39259 6.41213C4.39259 6.47273 4.40632 6.52529 4.43378 6.5698C4.46219 6.6143 4.50054 6.65218 4.54884 6.68343C4.59713 6.71374 4.65064 6.7393 4.70935 6.76014C4.73812 6.77035 4.767 6.77976 4.796 6.78837Z"/></svg>',
            active: false,
            show: this.hasPermission('finance_incomes')
          },
          {
            path: this.setUrl(URLConstants.EXPENSE_LIST),
            title: 'Expenses',
            type: 'link',
            svgPath:'<svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 0.0357056H2C0.895431 0.0357056 0 0.931136 0 2.03571V10.0357C0 11.1403 0.89543 12.0357 2 12.0357H8C9.10457 12.0357 10 11.1403 10 10.0357V3.03571H8C7.44772 3.03571 7 2.58799 7 2.03571V0.0357056ZM2.69995 3.53571C2.69995 3.25956 2.92381 3.03571 3.19995 3.03571C3.47609 3.03571 3.69995 3.25956 3.69995 3.53571V9.53571C3.69995 9.81185 3.47609 10.0357 3.19995 10.0357C2.92381 10.0357 2.69995 9.81185 2.69995 9.53571V3.53571ZM5.19995 5.03571C4.92381 5.03571 4.69995 5.25956 4.69995 5.53571V9.53571C4.69995 9.81185 4.92381 10.0357 5.19995 10.0357C5.47609 10.0357 5.69995 9.81185 5.69995 9.53571V5.53571C5.69995 5.25956 5.47609 5.03571 5.19995 5.03571ZM6.69995 7.53571C6.69995 7.25956 6.92381 7.03571 7.19995 7.03571C7.47609 7.03571 7.69995 7.25956 7.69995 7.53571V9.53571C7.69995 9.81185 7.47609 10.0357 7.19995 10.0357C6.92381 10.0357 6.69995 9.81185 6.69995 9.53571V7.53571Z"/><path d="M9.92939 2.365L7.77081 0.206416C7.70781 0.14342 7.6001 0.188037 7.6001 0.277127V2.43571C7.6001 2.49093 7.64487 2.53571 7.7001 2.53571H9.85868C9.94777 2.53571 9.99238 2.42799 9.92939 2.365Z"/><path d="M7.85858 6.17713C7.93668 6.25523 8.06332 6.25523 8.14142 6.17713C8.21953 6.09902 8.21953 5.97239 8.14142 5.89428L7.85858 6.17713ZM4 1.83571C3.88954 1.83571 3.8 1.92525 3.8 2.03571V3.83571C3.8 3.94616 3.88954 4.03571 4 4.03571C4.11046 4.03571 4.2 3.94616 4.2 3.83571V2.23571H5.8C5.91046 2.23571 6 2.14616 6 2.03571C6 1.92525 5.91046 1.83571 5.8 1.83571H4ZM8.14142 5.89428L6.64142 4.39428L6.35858 4.67713L7.85858 6.17713L8.14142 5.89428ZM6.64142 4.39428L4.14142 1.89428L3.85858 2.17713L6.35858 4.67713L6.64142 4.39428Z" fill="white"/></svg>',
            active: false,
            show: this.hasPermission('finance_expenses')
          },
          {
            path: this.setUrl(URLConstants.PROFIT_LOSS),
            title: 'Profit Loss Report',
            type: 'link',
            svgPath:'<svg width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 0.0357056C0.895431 0.0357056 0 0.931136 0 2.03571V10.0357C0 11.1403 0.89543 12.0357 2 12.0357H8C9.10457 12.0357 10 11.1397 10 10.0351V2.03627C10 0.931704 9.10457 0.0357056 8 0.0357056H2ZM2.5 2.03571C2.22386 2.03571 2 2.25956 2 2.53571C2 2.81185 2.22386 3.03571 2.5 3.03571H4.5C4.77614 3.03571 5 2.81185 5 2.53571C5 2.25956 4.77614 2.03571 4.5 2.03571H2.5ZM2 4.53571C2 4.25956 2.22386 4.03571 2.5 4.03571H7.5C7.77614 4.03571 8 4.25956 8 4.53571C8 4.81185 7.77614 5.03571 7.5 5.03571H2.5C2.22386 5.03571 2 4.81185 2 4.53571ZM7.89043 6.84805C8.06294 6.63242 8.02798 6.31778 7.81235 6.14527C7.59672 5.97277 7.28207 6.00773 7.10957 6.22336L5.51275 8.21937L4.67672 7.10467C4.34811 6.66651 3.70761 6.62099 3.32033 7.00827L1.64645 8.68215C1.45118 8.87741 1.45118 9.194 1.64645 9.38926C1.84171 9.58452 2.15829 9.58452 2.35355 9.38926L3.9459 7.79691L4.7902 8.92264C5.1432 9.3933 5.84546 9.40428 6.21298 8.94487L7.89043 6.84805Z"/></svg>',
            active: false,
            show: this.hasPermission('finance_profit_loss_report')
          },
        ]
      },
      ...moduleName.find(item => item == 'attendance') && {
        title: 'Attendance',
        svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9C12 10.6569 10.6569 12 9 12C7.34315 12 6 10.6569 6 9C6 7.34315 7.34315 6 9 6C10.6569 6 12 7.34315 12 9ZM6.42804 9C6.42804 10.4205 7.57954 11.572 9 11.572C10.4205 11.572 11.572 10.4205 11.572 9C11.572 7.57954 10.4205 6.42804 9 6.42804C7.57954 6.42804 6.42804 7.57954 6.42804 9Z" /><path d="M8 9.2L8.51971 9.68506C8.71027 9.86292 9.0055 9.86454 9.198 9.68878L10.5 8.5" stroke="#FFF" stroke-width="0.7" stroke-linecap="round"/><circle cx="5" cy="3" r="3" /><path fill-rule="evenodd" clip-rule="evenodd" d="M2 6H2.76389C3.31321 6.61375 4.1115 7 5 7C5.8885 7 6.68679 6.61375 7.23611 6H8C8.15428 6 8.30449 6.01747 8.44874 6.05054C7.05519 6.30936 6 7.53146 6 9C6 9.76835 6.28885 10.4692 6.76389 11H2C0.89543 11 0 10.1046 0 9V8C0 6.89543 0.895431 6 2 6Z" /></svg>',
        type: 'sub',
        show: (this.getInstituteModule('Report') || this.getInstituteModule('Student')) && (this.hasModule('student_attendance') && this.notification.attendance_type == '2' || this.hasModule('student_quick_attendance') || this.hasModule('report_student_monthly_yearly_attendance_report') || this.hasModule('report_blank_attendance_sheet')),
        active: false,
        children: [
          {
            title: 'Take Attendance',
            type: 'link',
            path: this.setUrl(URLConstants.STUDENT_TAKE_ATTENDANCE),
            show: this.hasPermission('student_attendance', 'has_access'),
            active: false,
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="3" r="3" /><path d="M0.309 12L4.57374 12C5.1798 12 5.48283 12 5.48691 11.9999C5.81605 11.991 5.84194 11.9579 5.77189 11.6362C5.77102 11.6322 5.67135 11.2277 5.47203 10.4187L5.47172 10.4175C5.19352 9.28837 5.29092 7.84182 5.67861 6.99067L5.67884 6.99016C5.72231 6.89471 5.74406 6.84697 5.74572 6.84302C5.83625 6.62814 5.73557 6.45554 5.50397 6.42855C5.4997 6.42806 5.47095 6.42554 5.41344 6.42051C1.6457 6.09069 0.144725 9.57387 0.0100643 11.6925L0.00998537 11.6937C0.00998753 11.6937 0.0105372 11.6853 0.0104184 11.6883C0.00417871 11.8484 0.142695 11.996 0.302838 11.9999L0.309 12Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M9 12C10.6569 12 12 10.6569 12 9C12 7.34315 10.6569 6 9 6C7.34315 6 6 7.34315 6 9C6 10.6569 7.34315 12 9 12ZM10.3039 8.17365C10.3998 8.00582 10.3415 7.79202 10.1736 7.69611C10.0058 7.60021 9.79202 7.65852 9.69612 7.82635L8.86669 9.27784C8.81868 9.36186 8.70485 9.3791 8.63411 9.31308L8.23881 8.94413C8.0975 8.81224 7.87602 8.81988 7.74413 8.96119C7.61224 9.1025 7.61988 9.32398 7.76119 9.45587L8.15649 9.82481C8.55737 10.199 9.2024 10.1012 9.47446 9.62514L10.3039 8.17365Z" /></svg>'
          },
          {
            title: 'Quick Attendance',
            type: 'link',
            path: this.setUrl(URLConstants.QUICK_ATTENDANCE),
            show: this.hasPermission('student_quick_attendance'),
            active: false,
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="6.12498" cy="2.7" rx="2.775" ry="2.7" /><path d="M10.75 8.89999C10.75 7.74278 10.2918 6.63005 9.47061 5.79295C8.64941 4.95585 7.52834 4.45873 6.34027 4.40487C5.1522 4.35101 3.98847 4.74454 3.09083 5.50372C2.19318 6.26289 1.63063 7.32935 1.52004 8.48155L2.69542 8.58835C2.77779 7.73024 3.19675 6.93599 3.86528 6.37059C4.5338 5.80519 5.4005 5.5121 6.28532 5.55222C7.17015 5.59233 8.00508 5.96256 8.61667 6.586C9.22826 7.20943 9.5695 8.03815 9.5695 8.89999H10.75Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M6.12498 11.6C7.65757 11.6 8.89998 10.3911 8.89998 8.89998C8.89998 7.40881 7.65757 6.19998 6.12498 6.19998C4.59239 6.19998 3.34998 7.40881 3.34998 8.89998C3.34998 10.3911 4.59239 11.6 6.12498 11.6ZM8.12861 8.19728C8.23756 8.11247 8.25714 7.95539 8.17233 7.84644C8.08752 7.73748 7.93044 7.71791 7.82149 7.80272L5.68082 9.46897L4.91189 8.72081C4.81293 8.62453 4.65465 8.6267 4.55837 8.72566C4.46208 8.82462 4.46425 8.98289 4.56321 9.07918L5.48821 9.97918L5.64428 10.131L5.81611 9.99728L8.12861 8.19728Z" /></svg>    '
          },
          {
            title: 'Student Attendance',
            type: 'link',
            path: this.setUrl(URLConstants.STUDENT_ATTENDANCE_LIST),
            show: this.hasPermission('student_quick_attendance'),
            active: false,
            svgPath: '<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.88886 12.2222C7.42299 12.2222 8.66664 10.9786 8.66664 9.44443C8.66664 7.91031 7.42299 6.66666 5.88886 6.66666C4.35474 6.66666 3.11108 7.91031 3.11108 9.44443C3.11108 10.9786 4.35474 12.2222 5.88886 12.2222ZM7.32817 9.01293C7.39667 8.89305 7.35503 8.74033 7.23515 8.67183C7.11527 8.60333 6.96255 8.64498 6.89405 8.76486L5.93764 10.4386C5.85763 10.5786 5.66791 10.6073 5.55 10.4973L5.05947 10.0395C4.95853 9.94525 4.80033 9.95071 4.70613 10.0516C4.61192 10.1526 4.61737 10.3108 4.71831 10.405L5.20885 10.8628C5.56257 11.193 6.13171 11.1067 6.37177 10.6866L7.32817 9.01293Z" /><path d="M5.80574 6.00319L1.57346 3.65192C1.31169 3.50649 1.29667 3.13555 1.54584 2.96944L5.77812 0.14792C5.91248 0.0583469 6.08752 0.0583471 6.22188 0.14792L10.4542 2.96944C10.7033 3.13555 10.6883 3.50649 10.4265 3.65192L6.19426 6.00319C6.07345 6.07031 5.92655 6.07031 5.80574 6.00319Z" /><path d="M5.99996 6.66667L2.66663 5V6.66667L5.99996 8.33333L9.33329 6.66667V5L5.99996 6.66667Z" /><path d="M10.4445 3.88889L9.88892 4.44444V6.66666H10.4445V3.88889Z" /><circle cx="10.2223" cy="7.1111" r="0.555556" /></svg>    '
          },
          {
            title: 'Report',
            type: 'sub',
            svgPath: '<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 0H2C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.89543 12 2 12H8C9.10457 12 10 11.1046 10 10V3H8C7.44772 3 7 2.55228 7 2V0ZM2.69995 3.5C2.69995 3.22386 2.92381 3 3.19995 3C3.47609 3 3.69995 3.22386 3.69995 3.5V9.5C3.69995 9.77614 3.47609 10 3.19995 10C2.92381 10 2.69995 9.77614 2.69995 9.5V3.5ZM5.19995 5C4.92381 5 4.69995 5.22386 4.69995 5.5V9.5C4.69995 9.77614 4.92381 10 5.19995 10C5.47609 10 5.69995 9.77614 5.69995 9.5V5.5C5.69995 5.22386 5.47609 5 5.19995 5ZM6.69995 7.5C6.69995 7.22386 6.92381 7 7.19995 7C7.47609 7 7.69995 7.22386 7.69995 7.5V9.5C7.69995 9.77614 7.47609 10 7.19995 10C6.92381 10 6.69995 9.77614 6.69995 9.5V7.5Z" /><path d="M9.92927 2.32929L7.77069 0.170711C7.70769 0.107714 7.59998 0.152331 7.59998 0.241421V2.4C7.59998 2.45523 7.64475 2.5 7.69998 2.5H9.85855C9.94764 2.5 9.99226 2.39229 9.92927 2.32929Z" /></svg>',
            active: false,
            show: (this.hasModule('student_attendance') || this.hasModule('report_student_monthly_yearly_attendance_report') || this.hasModule('report_blank_attendance_sheet')),
            children: [
              {
                title: 'Daily Attendance report',
                path: this.setUrl(URLConstants.STUDENT_DAILY_ATTENDANCE_REPORT_GENERATE),
                type: 'link',
                active: false,
                show: this.hasPermission('student_attendance')
              },
              {
                title: 'Blank Attendance Sheet',
                path: this.setUrl(URLConstants.Blank_Attendance),
                type: 'link',
                active: false,
                show: this.hasPermission('report_blank_attendance_sheet')
              },
              {
                path: this.setUrl(URLConstants.BATCHWISE_ATTENDANCE_LIST),
                title: 'Batch wise Attendance List',
                type: 'link',
                active: false,
                show: this.hasPermission('student_attendance')
              },
              { 
                path: this.setUrl(URLConstants.STUDENT_ATTENDANCE_MONTHLY_YEARLY), 
                title: 'Student Monthly Yearly Attendance Report', 
                type: 'link', 
                active: false, 
                show: this.hasPermission('report_student_monthly_yearly_attendance_report')
              },
              {
                path: this.setUrl(URLConstants.VIEW_ATTENDANCE_LIST),
                title: 'View Attendance Report',
                type: 'link',
                active: false,
                show: this.hasPermission('student_attendance')
              }
            ],
          },
        ]
      },
      ...moduleName.find(item => item == 'exam') && {
        title: 'Exam',
        svgPath: '<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.30005" y="0.200012" width="6.5" height="2.5" rx="1" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2 0C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.895431 12 2 12H6.00017L6 12.0008L6.00668 12H9C10.1046 12 11 11.1046 11 10V2C11 0.895431 10.1046 0 9 0H8.1C8.59706 0 9 0.402944 9 0.9V2.1C9 2.59706 8.59706 3 8.1 3H2.9C2.40294 3 2 2.59706 2 2.1V0.9C2 0.402944 2.40294 0 2.9 0H2ZM6.00668 12L7.53149 11.8094L9.733 9.60789L8.48866 8.36356L6.28715 10.5651L6.00017 12H6.00668ZM2.5 5C2.22386 5 2 5.22386 2 5.5C2 5.77614 2.22386 6 2.5 6H7.5C7.77614 6 8 5.77614 8 5.5C8 5.22386 7.77614 5 7.5 5H2.5ZM2 7.5C2 7.22386 2.22386 7 2.5 7H5.5C5.77614 7 6 7.22386 6 7.5C6 7.77614 5.77614 8 5.5 8H2.5C2.22386 8 2 7.77614 2 7.5ZM9.3773 7.58209L8.94495 8.01294L10.1091 9.1812L10.5415 8.75035C10.8641 8.42887 10.865 7.90673 10.5435 7.58413C10.222 7.26152 9.69991 7.26061 9.3773 7.58209Z" fill="white"/></svg>',
        type: 'sub',
        show: ((this.getInstituteModule('Report') || (this.getInstituteModule('Student')) || this.getInstituteModule('Settings'))) && ((this.hasModule('report_exam_general_report') || this.hasModule('student_exam') || this.hasModule('settings_exam_type') || this.hasModule('student_blank_exam_sheet') || this.hasModule('settings_exam_grade') || this.hasModule('settings_notification') || this.hasModule('settings_exam_setting') || this.hasModule('administrator_hall_ticket') || this.hasModule('student_student_rank_list'))),
        active: false,
        children: [
          {
            title: 'Exam Setup',
            active: false,
            type: 'sub',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z"/><path class="cr-color" d="M8.25325 5.84397C8.25325 7.12351 7.21598 8.16078 5.93644 8.16078C4.6569 8.16078 3.61963 7.12351 3.61963 5.84397C3.61963 4.56443 4.6569 3.52716 5.93644 3.52716C7.21598 3.52716 8.25325 4.56443 8.25325 5.84397ZM4.50303 5.84397C4.50303 6.63562 5.14479 7.27738 5.93644 7.27738C6.72809 7.27738 7.36985 6.63562 7.36985 5.84397C7.36985 5.05232 6.72809 4.41056 5.93644 4.41056C5.14479 4.41056 4.50303 5.05232 4.50303 5.84397Z" fill="white"/><path class="cr-color" d="M5.29346 3.2C5.29346 3.08954 5.383 3 5.49346 3H6.25186C6.36232 3 6.45186 3.08954 6.45186 3.2V4.15841H5.29346V3.2Z" fill="white"/><path class="cr-color" d="M3.59308 4.59483C3.5085 4.52378 3.49754 4.39763 3.56859 4.31305L4.05642 3.73236C4.12747 3.64779 4.25362 3.63683 4.3382 3.70787L5.07202 4.32435L4.3269 5.21131L3.59308 4.59483Z" fill="white"/><path class="cr-color" d="M8.23505 7.34242C8.31962 7.41347 8.33059 7.53963 8.25954 7.6242L7.77171 8.20489C7.70066 8.28947 7.5745 8.30043 7.48993 8.22938L6.66545 7.53675L7.41057 6.64979L8.23505 7.34242Z" fill="white"/><path class="cr-color" d="M7.68328 3.70112C7.77083 3.63376 7.8964 3.65013 7.96375 3.73768L8.4262 4.33877C8.49356 4.42632 8.47719 4.55189 8.38964 4.61924L7.63003 5.20365L6.92367 4.28552L7.68328 3.70112Z" fill="white"/><path class="cr-color" d="M5.29346 7.63367H6.45186V8.59207C6.45186 8.70253 6.36232 8.79207 6.25186 8.79207H5.49346C5.383 8.79207 5.29346 8.70253 5.29346 8.59207V7.63367Z" fill="white"/><path class="cr-color" d="M7.61011 6.47516L7.61277 5.31676L8.57117 5.31896C8.68162 5.31921 8.77096 5.40896 8.77071 5.51941L8.76897 6.27782C8.76872 6.38827 8.67897 6.47761 8.56851 6.47736L7.61011 6.47516Z" fill="white"/><path class="cr-color" d="M4.25342 5.3208L4.25076 6.4792L3.29236 6.477C3.1819 6.47675 3.09256 6.387 3.09282 6.27655L3.09456 5.51814C3.09481 5.40769 3.18456 5.31835 3.29502 5.3186L4.25342 5.3208Z" fill="white"/><path class="cr-color" d="M4.50903 6.42957L5.28171 7.29262L4.3342 8.14092C4.2519 8.2146 4.12546 8.20761 4.05178 8.12532L3.54591 7.56027C3.47223 7.47798 3.47922 7.35154 3.56152 7.27786L4.50903 6.42957Z" fill="white"/><mask id="path-11-inside-1_183_159" fill="white"><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z"/></mask><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-11-inside-1_183_159)"/><mask id="path-12-inside-2_183_159" fill="white"><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z"/></mask><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-12-inside-2_183_159)"/><path class="cr-color" d="M1.97291 4.91572L2.10774 3.75636L3.04436 4.4528L1.97291 4.91572Z" fill="white"/><path  d="M9.9355 7.02695L9.98777 8.19295L8.95184 7.65522L9.9355 7.02695Z" fill="white"/></svg>',
            show:this.hasModule('settings_exam_type') || this.hasModule('settings_exam_grade') ,
            children: [
              {
                path: this.setUrl(URLConstants.EXAM_TYPE_LIST),
                title: 'Exam Type',
                type: 'link',
                active: false,
                show: this.hasPermission('settings_exam_type')

              },
              {
                path: this.setUrl(URLConstants.LIST_EXAM_GRADE),
                title: 'Exam Grade',
                type: 'link',
                active: false,
                show: this.hasPermission('settings_exam_grade')
              },
              ]
          },
          {
            title: 'Exam List',
            path: this.setUrl(URLConstants.EXAM_VIEW_LIST),
            type: 'link',
            active: false,
            show: this.hasPermission('student_exam'),
            svgPath: '<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.30005" y="0.200012" width="6.5" height="2.5" rx="1" /><path fill-rule="evenodd" clip-rule="evenodd" d="M2 0C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.895431 12 2 12H6.00017L6 12.0008L6.00668 12H9C10.1046 12 11 11.1046 11 10V2C11 0.895431 10.1046 0 9 0H8.1C8.59706 0 9 0.402944 9 0.9V2.1C9 2.59706 8.59706 3 8.1 3H2.9C2.40294 3 2 2.59706 2 2.1V0.9C2 0.402944 2.40294 0 2.9 0H2ZM6.00668 12L7.53149 11.8094L9.733 9.60789L8.48866 8.36356L6.28715 10.5651L6.00017 12H6.00668ZM2.5 5C2.22386 5 2 5.22386 2 5.5C2 5.77614 2.22386 6 2.5 6H7.5C7.77614 6 8 5.77614 8 5.5C8 5.22386 7.77614 5 7.5 5H2.5ZM2 7.5C2 7.22386 2.22386 7 2.5 7H5.5C5.77614 7 6 7.22386 6 7.5C6 7.77614 5.77614 8 5.5 8H2.5C2.22386 8 2 7.77614 2 7.5ZM9.3773 7.58209L8.94495 8.01294L10.1091 9.1812L10.5415 8.75035C10.8641 8.42887 10.865 7.90673 10.5435 7.58413C10.222 7.26152 9.69991 7.26061 9.3773 7.58209Z" /></svg>    '
          },
          {
            title: 'Student Rank List',
            path: this.setUrl(URLConstants.STUDENT_RANKING),
            type: 'link',
            active: false,
            show: this.hasPermission('student_student_rank_list'),
            svgPath: '<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 9C0 8.44772 0.447715 8 1 8H2C2.55228 8 3 8.44772 3 9V11.7C3 11.8657 2.86569 12 2.7 12H0.3C0.134314 12 0 11.8657 0 11.7V9Z"/><path d="M4 7C4 6.44772 4.44772 6 5 6H6C6.55228 6 7 6.44772 7 7V11.7C7 11.8657 6.86569 12 6.7 12H4.3C4.13431 12 4 11.8657 4 11.7V7Z"/><path d="M8 10C8 9.44772 8.44772 9 9 9H10C10.5523 9 11 9.44772 11 10V11.7C11 11.8657 10.8657 12 10.7 12H8.3C8.13431 12 8 11.8657 8 11.7V10Z"/><path d="M5.13673 1.11803C5.25107 0.766125 5.74893 0.766125 5.86327 1.11803L6.08779 1.80902C6.13892 1.9664 6.28558 2.07295 6.45106 2.07295H7.1776C7.54762 2.07295 7.70146 2.54644 7.40211 2.76393L6.81433 3.19098C6.68045 3.28825 6.62444 3.46066 6.67557 3.61803L6.90008 4.30902C7.01443 4.66093 6.61165 4.95356 6.3123 4.73607L5.72451 4.30902C5.59064 4.21175 5.40936 4.21175 5.27549 4.30902L4.6877 4.73607C4.38835 4.95356 3.98557 4.66093 4.09992 4.30902L4.32443 3.61803C4.37556 3.46066 4.31955 3.28825 4.18567 3.19098L3.59789 2.76393C3.29854 2.54644 3.45238 2.07295 3.8224 2.07295H4.54894C4.71442 2.07295 4.86108 1.9664 4.91221 1.80902L5.13673 1.11803Z"/></svg>'
          },
          {
            title: 'Add Exam',
            path: this.setUrl(URLConstants.CREATE_EXAM),
            type: 'link',
            active: false,
            show: this.hasPermission('student_exam', 'has_create'),
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1 2C1 0.895431 1.89543 0 3 0H9C10.1046 0 11 0.895431 11 2V8.08976C10.5175 7.65125 9.88031 7.38461 9.1818 7.38461C7.67557 7.38461 6.45452 8.62444 6.45452 10.1538C6.45452 10.8631 6.71712 11.5101 7.14898 12H3C1.89543 12 1 11.1046 1 10V2ZM2.81813 2.3077C2.81813 2.0528 3.02477 1.84616 3.27967 1.84616H5.99296C6.24786 1.84616 6.45449 2.0528 6.45449 2.3077C6.45449 2.5626 6.24786 2.76924 5.99296 2.76924H3.27967C3.02477 2.76924 2.81813 2.5626 2.81813 2.3077ZM3.27967 3.69229C3.02477 3.69229 2.81813 3.89893 2.81813 4.15383C2.81813 4.40873 3.02477 4.61537 3.27967 4.61537H7.81114C8.06604 4.61537 8.27268 4.40873 8.27268 4.15383C8.27268 3.89893 8.06604 3.69229 7.81114 3.69229H3.27967ZM2.81813 6.00002C2.81813 5.74512 3.02477 5.53848 3.27967 5.53848H9.62932C9.88422 5.53848 10.0909 5.74512 10.0909 6.00002C10.0909 6.25492 9.88422 6.46156 9.62932 6.46156H3.27967C3.02477 6.46156 2.81813 6.25492 2.81813 6.00002Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M9.10104 11.986C10.1129 11.986 10.9331 11.1657 10.9331 10.1539C10.9331 9.14201 10.1129 8.32175 9.10104 8.32175C8.08919 8.32175 7.26892 9.14201 7.26892 10.1539C7.26892 11.1657 8.08919 11.986 9.10104 11.986ZM9.05412 10.4055V10.9893H9.29276V10.4055H9.87657V10.1669H9.29276V9.58309H9.05412V10.1669H8.47032V10.4055H9.05412Z" /></svg>            '
          },
          {
            path: this.setUrl(URLConstants.BLANK_EXAM_SHEET),
            title: 'Blank Exam Sheet',
            type: 'link',
            active: false,
            show: this.hasPermission('student_blank_exam_sheet'),
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1 2C1 0.895416 1.89539 0 3 0H10C11.1046 0 12 0.895416 12 2V10C12 11.1046 11.1046 12 10 12H3C1.89539 12 1 11.1046 1 10V2ZM3 2.5C3 2.22385 3.22388 2 3.5 2H4.5C4.77612 2 5 2.22385 5 2.5C5 2.77615 4.77612 3 4.5 3H3.5C3.22388 3 3 2.77615 3 2.5ZM3.5 4C3.22388 4 3 4.22385 3 4.5C3 4.77615 3.22388 5 3.5 5H6.5C6.77612 5 7 4.77615 7 4.5C7 4.22385 6.77612 4 6.5 4H3.5ZM3 6.5C3 6.22385 3.22388 6 3.5 6H8.5C8.77612 6 9 6.22385 9 6.5C9 6.77615 8.77612 7 8.5 7H3.5C3.22388 7 3 6.77615 3 6.5ZM3.5 8C3.22388 8 3 8.22385 3 8.5C3 8.77615 3.22388 9 3.5 9H10.5C10.7761 9 11 8.77615 11 8.5C11 8.22385 10.7761 8 10.5 8H3.5Z" /></svg>    '
          },
          {
            path: this.setUrl(URLConstants.GENERATE_EXAM_TIMETABLE), 
            title: 'Exam Timetable', 
            type: 'link', 
            active: false,
            svgPath:'<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 0.5C3 0.223858 3.22386 0 3.5 0C3.77614 0 4 0.223858 4 0.5V3H3V0.5Z"/><path d="M7 0.5C7 0.223858 7.22386 0 7.5 0C7.77614 0 8 0.223858 8 0.5V3H7V0.5Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M0 4C0 2.89543 0.895431 2 2 2H9C10.1046 2 11 2.89543 11 4V5H0V4ZM0 6H11V8.17071C10.6872 8.06015 10.3506 8 10 8C8.34315 8 7 9.34315 7 11C7 11.3506 7.06015 11.6872 7.17071 12H2C0.895431 12 0 11.1046 0 10V6Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 13C11.1046 13 12 12.1046 12 11C12 9.89543 11.1046 9 10 9C8.89543 9 8 9.89543 8 11C8 12.1046 8.89543 13 10 13ZM10.2 10C10.2 9.88954 10.1105 9.8 10 9.8C9.88954 9.8 9.8 9.88954 9.8 10V11V11.0828L9.85858 11.1414L10.3586 11.6414C10.4367 11.7195 10.5633 11.7195 10.6414 11.6414C10.7195 11.5633 10.7195 11.4367 10.6414 11.3586L10.2 10.9172V10Z"/></svg>',
            show:true
          },
          {
            title: 'Hall Ticket',
            type: 'sub',
            active: false,
            svgPath: '<svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2C0 0.895429 0.895431 0 2 0H8.16667V1.45833C8.16667 1.61942 8.29725 1.75 8.45833 1.75C8.61942 1.75 8.75 1.61942 8.75 1.45833V0H12C13.1046 0 14 0.895431 14 2V3.49999C13.3557 3.49999 12.8333 4.02232 12.8333 4.66666C12.8333 5.31099 13.3557 5.83332 14 5.83332V7.33333C14 8.4379 13.1046 9.33333 12 9.33333L8.75 9.33333V9.04167C8.75 8.88058 8.61942 8.75 8.45833 8.75C8.29725 8.75 8.16667 8.88058 8.16667 9.04167V9.33333L2 9.33333C0.89543 9.33333 0 8.4379 0 7.33333V5.83332C0.644332 5.83332 1.16667 5.31099 1.16667 4.66666C1.16667 4.02232 0.644332 3.49999 0 3.49999V2ZM8.45833 2.91667C8.29725 2.91667 8.16667 3.04725 8.16667 3.20833V4.375C8.16667 4.53608 8.29725 4.66667 8.45833 4.66667C8.61942 4.66667 8.75 4.53608 8.75 4.375V3.20833C8.75 3.04725 8.61942 2.91667 8.45833 2.91667ZM8.16667 6.125C8.16667 5.96392 8.29725 5.83333 8.45833 5.83333C8.61942 5.83333 8.75 5.96392 8.75 6.125V7.29167C8.75 7.45275 8.61942 7.58333 8.45833 7.58333C8.29725 7.58333 8.16667 7.45275 8.16667 7.29167V6.125Z"/></svg>',
            show: this.hasPermission('administrator_hall_ticket'),
            path: this.setUrl(URLConstants.HALL_TICKET)
          },
          {
            title: 'Report',
            type: 'sub',
            svgPath: '<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 0H2C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.89543 12 2 12H8C9.10457 12 10 11.1046 10 10V3H8C7.44772 3 7 2.55228 7 2V0ZM2.69995 3.5C2.69995 3.22386 2.92381 3 3.19995 3C3.47609 3 3.69995 3.22386 3.69995 3.5V9.5C3.69995 9.77614 3.47609 10 3.19995 10C2.92381 10 2.69995 9.77614 2.69995 9.5V3.5ZM5.19995 5C4.92381 5 4.69995 5.22386 4.69995 5.5V9.5C4.69995 9.77614 4.92381 10 5.19995 10C5.47609 10 5.69995 9.77614 5.69995 9.5V5.5C5.69995 5.22386 5.47609 5 5.19995 5ZM6.69995 7.5C6.69995 7.22386 6.92381 7 7.19995 7C7.47609 7 7.69995 7.22386 7.69995 7.5V9.5C7.69995 9.77614 7.47609 10 7.19995 10C6.92381 10 6.69995 9.77614 6.69995 9.5V7.5Z" /><path d="M9.92927 2.32929L7.77069 0.170711C7.70769 0.107714 7.59998 0.152331 7.59998 0.241421V2.4C7.59998 2.45523 7.64475 2.5 7.69998 2.5H9.85855C9.94764 2.5 9.99226 2.39229 9.92927 2.32929Z" /></svg>',
            active: false,
            show:   ((this.hasModule('report_exam_general_report') || this.hasModule('report_batch_report'))),
            children:
              [
                {
                  path: this.setUrl(URLConstants.EXAM_GENERAL_REPORT),
                  title: 'Exam General Report',
                  type: 'link',
                  active: false,
                  show: this.hasPermission('report_exam_general_report'),
                  svgPath: '<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.30005" y="0.200012" width="6.5" height="2.5" rx="1" /><path fill-rule="evenodd" clip-rule="evenodd" d="M2 0C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.895431 12 2 12H6.00017L6 12.0008L6.00668 12H9C10.1046 12 11 11.1046 11 10V2C11 0.895431 10.1046 0 9 0H8.1C8.59706 0 9 0.402944 9 0.9V2.1C9 2.59706 8.59706 3 8.1 3H2.9C2.40294 3 2 2.59706 2 2.1V0.9C2 0.402944 2.40294 0 2.9 0H2ZM6.00668 12L7.53149 11.8094L9.733 9.60789L8.48866 8.36356L6.28715 10.5651L6.00017 12H6.00668ZM9.3773 7.58209L8.94495 8.01294L10.1091 9.1812L10.5415 8.75035C10.8641 8.42887 10.865 7.90673 10.5435 7.58413C10.222 7.26152 9.69991 7.26061 9.3773 7.58209ZM8.85355 3.64645C9.04882 3.84171 9.04882 4.15829 8.85355 4.35355L5.46079 7.74632C5.1562 8.05091 4.63941 7.94483 4.47944 7.54489L3.92035 6.14717L2.43412 8.74807C2.29712 8.98783 1.99169 9.07113 1.75193 8.93412C1.51217 8.79712 1.42887 8.49169 1.56588 8.25193L3.46312 4.93175C3.71224 4.4958 4.35468 4.54041 4.54116 5.0066L5.18262 6.61027L8.14645 3.64645C8.34171 3.45118 8.65829 3.45118 8.85355 3.64645Z" /></svg>'
                },
                {
                  path: this.setUrl(URLConstants.BATCH_REPORT),
                  title: 'Batchwise Monthly Report',
                  type: 'link',
                  active: false,
                  show: this.hasPermission('report_batch_report'),
                  svgPath: '<svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 0C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.89543 12 2 12H8C9.10457 12 10 11.104 10 9.99943V2.00057C10 0.895998 9.10457 0 8 0H2ZM2.5 2C2.22386 2 2 2.22386 2 2.5C2 2.77614 2.22386 3 2.5 3H4.5C4.77614 3 5 2.77614 5 2.5C5 2.22386 4.77614 2 4.5 2H2.5ZM2 4.5C2 4.22386 2.22386 4 2.5 4H7.5C7.77614 4 8 4.22386 8 4.5C8 4.77614 7.77614 5 7.5 5H2.5C2.22386 5 2 4.77614 2 4.5ZM7.89043 6.81235C8.06294 6.59672 8.02798 6.28207 7.81235 6.10957C7.59672 5.93706 7.28207 5.97202 7.10957 6.18765L5.51275 8.18367L4.67672 7.06896C4.34811 6.63081 3.70761 6.58529 3.32033 6.97257L1.64645 8.64645C1.45118 8.84171 1.45118 9.15829 1.64645 9.35355C1.84171 9.54882 2.15829 9.54882 2.35355 9.35355L3.9459 7.7612L4.7902 8.88694C5.1432 9.3576 5.84546 9.36857 6.21298 8.90916L7.89043 6.81235Z" /></svg>'
                },
              ]
          },
          {
            title: 'Setting',
            type: 'sub', active: false,
            show:  this.hasModule('settings_exam_setting') ,
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z" /><path class="cr-color" d="M8.57371 5.83684C8.57371 7.29312 7.39316 8.47367 5.93688 8.47367C4.4806 8.47367 3.30005 7.29312 3.30005 5.83684C3.30005 4.38056 4.4806 3.20001 5.93688 3.20001C7.39316 3.20001 8.57371 4.38056 8.57371 5.83684ZM4.30547 5.83684C4.30547 6.73785 5.03588 7.46825 5.93688 7.46825C6.83788 7.46825 7.56829 6.73785 7.56829 5.83684C7.56829 4.93584 6.83788 4.20543 5.93688 4.20543C5.03588 4.20543 4.30547 4.93584 4.30547 5.83684Z" fill="white"/><path class="cr-color" d="M5.20496 2.80001C5.20496 2.68955 5.2945 2.60001 5.40496 2.60001H6.32337C6.43383 2.60001 6.52337 2.68955 6.52337 2.80001V3.91842H5.20496V2.80001Z" fill="white"/><path class="cr-color" d="M3.24872 4.39732C3.16414 4.32627 3.15318 4.20012 3.22423 4.11554L3.81498 3.41234C3.88603 3.32776 4.01219 3.3168 4.09676 3.38785L4.9531 4.10725L4.10505 5.11672L3.24872 4.39732Z" fill="white"/><path class="cr-color" d="M8.57404 7.56004C8.65861 7.63109 8.66958 7.75725 8.59853 7.84182L8.00777 8.54503C7.93672 8.6296 7.81057 8.64057 7.72599 8.56952L6.76648 7.76344L7.61452 6.75397L8.57404 7.56004Z" fill="white"/><path class="cr-color" d="M7.94695 3.38114C8.0345 3.31379 8.16007 3.33016 8.22742 3.4177L8.78745 4.14562C8.8548 4.23316 8.83843 4.35873 8.75089 4.42609L7.86445 5.10806L7.06052 4.06312L7.94695 3.38114Z" fill="white"/><path class="cr-color" d="M5.20496 7.87366H6.52337V8.99207C6.52337 9.10253 6.43383 9.19207 6.32337 9.19207H5.40496C5.2945 9.19207 5.20496 9.10253 5.20496 8.99207V7.87366Z" fill="white"/><path class="cr-color" d="M7.8418 6.55521L7.84482 5.23679L8.96323 5.23936C9.07369 5.23961 9.16303 5.32936 9.16278 5.43982L9.16067 6.35823C9.16041 6.46869 9.07067 6.55803 8.96021 6.55777L7.8418 6.55521Z" fill="white"/><path class="cr-color" d="M4.02136 5.24139L4.01834 6.55981L2.89992 6.55724C2.78947 6.55699 2.70013 6.46724 2.70038 6.35678L2.70249 5.43837C2.70274 5.32791 2.79249 5.23857 2.90295 5.23883L4.02136 5.24139Z" fill="white"/><path class="cr-color" d="M4.31238 6.50336L5.19179 7.48563L4.09281 8.46953C4.01051 8.5432 3.88407 8.53622 3.8104 8.45392L3.19779 7.76967C3.12412 7.68737 3.1311 7.56093 3.2134 7.48725L4.31238 6.50336Z" fill="white"/></svg>',
            children: [
              {
                path: this.setUrl(URLConstants.SYSTEM_SETTING+"/5"),
                title: 'Exam Setting',
                type: 'link',
                active: false,
                show: this.hasPermission('settings_exam_setting')
              },
            ]
          },
          {
            title: 'Notification',
            type: 'sub',
            show: (this.hasModule('settings_notification')),
            active: false,
            svgPath: '<svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.66321 0.416363C4.66321 0.186412 4.84962 0 5.07957 0C5.30952 0 5.49593 0.186412 5.49593 0.416363V0.832726H4.66321V0.416363Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.36683 0.949529C6.21808 0.901778 6.05909 0.86283 5.88923 0.834128C5.8838 0.83321 5.87815 0.832733 5.87265 0.832733H4.63185C3.79998 0.832733 2.05399 1.41445 1.71834 3.7401C1.71767 3.74478 1.71731 3.74965 1.71731 3.75438V5.82909C1.71731 6.37903 1.39045 7.63717 0.0891269 8.30834C0.0655556 8.3205 0.0469179 8.34132 0.0396388 8.36683C-0.0823034 8.79406 0.00956711 9.57635 1.30095 9.57635H9.58677C9.61329 9.57635 9.63883 9.56602 9.65682 9.54654C9.92994 9.2509 10.2692 8.5596 9.63531 7.91807C9.63069 7.91339 9.62567 7.90924 9.62021 7.90555C9.20129 7.6231 8.3791 6.82202 8.3791 5.82909V4.99585C8.36184 4.9962 8.34454 4.99638 8.32719 4.99638C6.94749 4.99638 5.82902 3.8779 5.82902 2.4982C5.82902 1.91324 6.03006 1.37524 6.36683 0.949529Z"/><circle cx="8.32732" cy="2.49818" r="1.66545"/><path d="M6.66184 9.99272C6.66184 10.4344 6.48637 10.858 6.17404 11.1704C5.8617 11.4827 5.43809 11.6582 4.99638 11.6582C4.55468 11.6582 4.13107 11.4827 3.81873 11.1704C3.5064 10.858 3.33093 10.4344 3.33093 9.99272L4.99638 9.99272H6.66184Z"/></svg>',
            children: [
              {
                title: 'Exam Notification',
                type: 'link',
                path: this.setUrl(URLConstants.NOTIFICATION_SETTING+"/6"),
                show: this.hasPermission('settings_notification'),
                active: false
              },
            ]
		      }
        ]
      },
      ...moduleName.find(item => item == 'marksheet') && {
        title:'Marksheet',
        type: 'sub',
        svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 0C1.89543 0 1 0.895431 1 2V10C1 11.1046 1.89543 12 3 12H9C10.1046 12 11 11.1046 11 10V2C11 0.895431 10.1046 0 9 0H3ZM3.27965 5.84619C3.02475 5.84619 2.81812 6.05283 2.81812 6.30773C2.81812 6.56263 3.02475 6.76927 3.27965 6.76927H5.99294C6.24784 6.76927 6.45448 6.56263 6.45448 6.30773C6.45448 6.05283 6.24784 5.84619 5.99294 5.84619H3.27965ZM2.81812 8.1538C2.81812 7.8989 3.02475 7.69226 3.27965 7.69226H7.81112C8.06602 7.69226 8.27266 7.8989 8.27266 8.1538C8.27266 8.4087 8.06602 8.61534 7.81112 8.61534H3.27965C3.02475 8.61534 2.81812 8.4087 2.81812 8.1538ZM3.27965 9.53845C3.02475 9.53845 2.81812 9.74509 2.81812 9.99999C2.81812 10.2549 3.02475 10.4615 3.27965 10.4615H9.6293C9.8842 10.4615 10.0908 10.2549 10.0908 9.99999C10.0908 9.74509 9.8842 9.53845 9.6293 9.53845H3.27965ZM4.75426 4H4.09517L5.09943 1.09091H5.89205L6.89489 4H6.2358L6.02042 3.33665H4.97006L4.75426 4ZM5.5071 1.75568L5.86453 2.85653H5.12625L5.48438 1.75568H5.5071ZM6.82884 1.31818V1.88175H7.21023V1.31818H7.77379V0.93679H7.21023V0.373224H6.82884V0.93679H6.26527V1.31818H6.82884Z" fill="white"/></svg>',
        active: false,
        show: (this.getInstituteModule('Student')) && (this.hasModule('student_marksheet_create')) || this.hasModule('student_exam_report_card') || this.hasModule('settings_system_setting'),
        children: [
          {
            title:'Marksheet Setup',
            type: 'sub',
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z"/><path class="cr-color" d="M8.25325 5.84397C8.25325 7.12351 7.21598 8.16078 5.93644 8.16078C4.6569 8.16078 3.61963 7.12351 3.61963 5.84397C3.61963 4.56443 4.6569 3.52716 5.93644 3.52716C7.21598 3.52716 8.25325 4.56443 8.25325 5.84397ZM4.50303 5.84397C4.50303 6.63562 5.14479 7.27738 5.93644 7.27738C6.72809 7.27738 7.36985 6.63562 7.36985 5.84397C7.36985 5.05232 6.72809 4.41056 5.93644 4.41056C5.14479 4.41056 4.50303 5.05232 4.50303 5.84397Z" fill="white"/><path class="cr-color" d="M5.29346 3.2C5.29346 3.08954 5.383 3 5.49346 3H6.25186C6.36232 3 6.45186 3.08954 6.45186 3.2V4.15841H5.29346V3.2Z" fill="white"/><path class="cr-color" d="M3.59308 4.59483C3.5085 4.52378 3.49754 4.39763 3.56859 4.31305L4.05642 3.73236C4.12747 3.64779 4.25362 3.63683 4.3382 3.70787L5.07202 4.32435L4.3269 5.21131L3.59308 4.59483Z" fill="white"/><path class="cr-color" d="M8.23505 7.34242C8.31962 7.41347 8.33059 7.53963 8.25954 7.6242L7.77171 8.20489C7.70066 8.28947 7.5745 8.30043 7.48993 8.22938L6.66545 7.53675L7.41057 6.64979L8.23505 7.34242Z" fill="white"/><path class="cr-color" d="M7.68328 3.70112C7.77083 3.63376 7.8964 3.65013 7.96375 3.73768L8.4262 4.33877C8.49356 4.42632 8.47719 4.55189 8.38964 4.61924L7.63003 5.20365L6.92367 4.28552L7.68328 3.70112Z" fill="white"/><path class="cr-color" d="M5.29346 7.63367H6.45186V8.59207C6.45186 8.70253 6.36232 8.79207 6.25186 8.79207H5.49346C5.383 8.79207 5.29346 8.70253 5.29346 8.59207V7.63367Z" fill="white"/><path class="cr-color" d="M7.61011 6.47516L7.61277 5.31676L8.57117 5.31896C8.68162 5.31921 8.77096 5.40896 8.77071 5.51941L8.76897 6.27782C8.76872 6.38827 8.67897 6.47761 8.56851 6.47736L7.61011 6.47516Z" fill="white"/><path class="cr-color" d="M4.25342 5.3208L4.25076 6.4792L3.29236 6.477C3.1819 6.47675 3.09256 6.387 3.09282 6.27655L3.09456 5.51814C3.09481 5.40769 3.18456 5.31835 3.29502 5.3186L4.25342 5.3208Z" fill="white"/><path class="cr-color" d="M4.50903 6.42957L5.28171 7.29262L4.3342 8.14092C4.2519 8.2146 4.12546 8.20761 4.05178 8.12532L3.54591 7.56027C3.47223 7.47798 3.47922 7.35154 3.56152 7.27786L4.50903 6.42957Z" fill="white"/><mask id="path-11-inside-1_183_159" fill="white"><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z"/></mask><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-11-inside-1_183_159)"/><mask id="path-12-inside-2_183_159" fill="white"><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z"/></mask><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-12-inside-2_183_159)"/><path class="cr-color" d="M1.97291 4.91572L2.10774 3.75636L3.04436 4.4528L1.97291 4.91572Z" fill="white"/><path  d="M9.9355 7.02695L9.98777 8.19295L8.95184 7.65522L9.9355 7.02695Z" fill="white"/></svg>',
            active: false,
            show:true,
            children:
            [
              {
                title:('MARKSHEET TEMPLATE LIST'),
                type:'link',
                active:false,
                path: this.setUrl(URLConstants.MARKSHEET_TEMP_LIST),
                show:true,
              },
              {
                title:('MARKSHEET TEMPLATE CREATE'),
                type:'link',
                active:false,
                path: this.setUrl(URLConstants.MARKSHEET_TEMP_DESIGN),
                show:true,
              }
            ]  
          },
          {
            path: this.setUrl(URLConstants.MARKSHEET_LIST), 
            title: 'Marksheet List', 
            type: 'link', 
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 0C1.89543 0 1 0.895431 1 2V10C1 11.1046 1.89543 12 3 12H9C10.1046 12 11 11.1046 11 10V2C11 0.895431 10.1046 0 9 0H3ZM3.27965 5.84619C3.02475 5.84619 2.81812 6.05283 2.81812 6.30773C2.81812 6.56263 3.02475 6.76927 3.27965 6.76927H5.99294C6.24784 6.76927 6.45448 6.56263 6.45448 6.30773C6.45448 6.05283 6.24784 5.84619 5.99294 5.84619H3.27965ZM2.81812 8.1538C2.81812 7.8989 3.02475 7.69226 3.27965 7.69226H7.81112C8.06602 7.69226 8.27266 7.8989 8.27266 8.1538C8.27266 8.4087 8.06602 8.61534 7.81112 8.61534H3.27965C3.02475 8.61534 2.81812 8.4087 2.81812 8.1538ZM3.27965 9.53845C3.02475 9.53845 2.81812 9.74509 2.81812 9.99999C2.81812 10.2549 3.02475 10.4615 3.27965 10.4615H9.6293C9.8842 10.4615 10.0908 10.2549 10.0908 9.99999C10.0908 9.74509 9.8842 9.53845 9.6293 9.53845H3.27965ZM4.75426 4H4.09517L5.09943 1.09091H5.89205L6.89489 4H6.2358L6.02042 3.33665H4.97006L4.75426 4ZM5.5071 1.75568L5.86453 2.85653H5.12625L5.48438 1.75568H5.5071ZM6.82884 1.31818V1.88175H7.21023V1.31818H7.77379V0.93679H7.21023V0.373224H6.82884V0.93679H6.26527V1.31818H6.82884Z"/></svg>',
            active: false, 
            show: this.hasPermission('student_marksheet_create') 
          },
          {
            path: this.setUrl(URLConstants.CREATE_MARKSHEET),
            title: 'Marksheet Create', 
            type: 'link', 
            svgPath:'<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1 0C0.447715 0 0 0.447715 0 1V11C0 11.5523 0.447715 12 1 12H7.17071C7.06015 11.6872 7 11.3506 7 11C7 9.34315 8.34315 8 10 8C10.3506 8 10.6872 8.06015 11 8.17071V1C11 0.447715 10.5523 0 10 0H1ZM3.09517 5H3.75426L3.97006 4.33665H5.02042L5.2358 5H5.89489L4.89205 2.09091H4.09943L3.09517 5ZM4.86453 3.85653L4.5071 2.75568H4.48438L4.12625 3.85653H4.86453ZM6.10511 2.84233V2.09091H5.35369V1.58239H6.10511V0.830966H6.61364V1.58239H7.36506V2.09091H6.61364V2.84233H6.10511ZM1.4 6C1.17909 6 1 6.17909 1 6.4C1 6.62091 1.17909 6.8 1.4 6.8H9.6C9.82091 6.8 10 6.62091 10 6.4C10 6.17909 9.82091 6 9.6 6H1.4ZM1 8.00001C1 7.77909 1.17909 7.60001 1.4 7.60001H7.6C7.82091 7.60001 8 7.77909 8 8.00001C8 8.22092 7.82091 8.40001 7.6 8.40001H1.4C1.17909 8.40001 1 8.22092 1 8.00001Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 13C11.1046 13 12 12.1046 12 11C12 9.89543 11.1046 9 10 9C8.89543 9 8 9.89543 8 11C8 12.1046 8.89543 13 10 13ZM9.82884 11.0182V11.5818H10.2102V11.0182H10.7738V10.6368H10.2102V10.0732H9.82884V10.6368H9.26527V11.0182H9.82884Z"/></svg>',
            active: false, 
            show: this.hasPermission('student_marksheet_create') 
          },
          {
            path: this.setUrl(URLConstants.COMBINE_MARKSHEET_LIST), 
            title: 'Combine Marksheet List', 
            type: 'link',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_183_1345)"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 0C1.44772 0 1 0.447715 1 1V11C1 11.5523 1.44771 12 2 12H10V10H12V1C12 0.447715 11.5523 0 11 0H2ZM4.09517 5H4.75426L4.97006 4.33665H6.02042L6.2358 5H6.89489L5.89205 2.09091H5.09943L4.09517 5ZM5.86453 3.85653L5.5071 2.75568H5.48438L5.12625 3.85653H5.86453ZM7.10511 2.84233V2.09091H6.35369V1.58239H7.10511V0.830966H7.61364V1.58239H8.36506V2.09091H7.61364V2.84233H7.10511ZM2.4 6C2.17909 6 2 6.17909 2 6.4C2 6.62091 2.17909 6.8 2.4 6.8H10.6C10.8209 6.8 11 6.62091 11 6.4C11 6.17909 10.8209 6 10.6 6H2.4ZM2 8.4C2 8.17909 2.17909 8 2.4 8H10.6C10.8209 8 11 8.17909 11 8.4C11 8.62091 10.8209 8.8 10.6 8.8H2.4C2.17909 8.8 2 8.62091 2 8.4Z"/><path d="M10.5 10.5V12L12 10.5H10.5Z"/></g><defs><clipPath id="clip0_183_1345"><rect width="12" height="12" fill="white"/></clipPath></defs></svg>',
            active: false, 
            show: this.hasPermission('student_marksheet_create') 

          },
          {
            path: this.setUrl(URLConstants.CREATE_COMBINE_MARKSHEET),
            title: 'Combine Marksheet Create', 
            type: 'link',
            svgPath:'<svg width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.00863 1.82393L8.824 1.81536L7.00007 0.00856753L7.00863 1.82393Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 12.5C8.88071 12.5 10 11.3807 10 10C10 8.61929 8.88071 7.5 7.5 7.5C6.11929 7.5 5 8.61929 5 10C5 11.3807 6.11929 12.5 7.5 12.5ZM7.32884 10.0182V10.5818H7.71023V10.0182H8.27379V9.6368H7.71023V9.07324H7.32884V9.6368H6.76527V10.0182H7.32884Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.02906 0L6.04973 2.09953C6.0519 2.32044 6.23274 2.49775 6.45364 2.49558L9.07692 2.46976V7.42398C8.62708 7.15475 8.10084 7 7.53845 7C5.8816 7 4.53845 8.34315 4.53845 10C4.53845 10.6754 4.76162 11.2986 5.13823 11.8H0.6C0.268629 11.8 0 11.5314 0 11.2V0.6C0 0.268629 0.268629 0 0.6 0H6.02906ZM1 3.31769C1 3.14224 1.14224 3 1.31769 3H6.12846C6.30392 3 6.44615 3.14224 6.44615 3.31769C6.44615 3.49315 6.30392 3.63538 6.12846 3.63538H1.31769C1.14224 3.63538 1 3.49315 1 3.31769ZM1.31769 4.81537C1.14224 4.81537 1 4.9576 1 5.13306C1 5.30852 1.14224 5.45075 1.31769 5.45075H6.12846C6.30392 5.45075 6.44615 5.30852 6.44615 5.13306C6.44615 4.9576 6.30392 4.81537 6.12846 4.81537H1.31769ZM1 6.78161C1 6.60488 1.14327 6.46161 1.32 6.46161H3.68C3.85673 6.46161 4 6.60488 4 6.78161C4 6.95834 3.85673 7.10161 3.68 7.10161H1.32C1.14327 7.10161 1 6.95834 1 6.78161Z"/></svg>',
            active: false, 
            show: this.hasPermission('student_marksheet_create') 
          },
          {
            path: this.setUrl(URLConstants.EXAM_REPORT_CARD_GENERATE), 
            title: 'Student Exam Report Card', 
            type: 'link', 
            svgPath:'<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1 0C0.447715 0 0 0.447715 0 1V11C0 11.5523 0.447715 12 1 12H10C10.5523 12 11 11.5523 11 11V1C11 0.447715 10.5523 0 10 0H1ZM5.69021 1.58541C5.63034 1.40115 5.36966 1.40115 5.30979 1.58541L4.98362 2.58926C4.95684 2.67167 4.88005 2.72746 4.79341 2.72746H3.7379C3.54415 2.72746 3.4636 2.97538 3.62034 3.08926L4.47426 3.70967C4.54436 3.7606 4.57369 3.85088 4.54692 3.93328L4.22075 4.93713C4.16088 5.12139 4.37177 5.27462 4.52852 5.16074L5.38244 4.54033C5.45254 4.4894 5.54746 4.4894 5.61756 4.54033L6.47148 5.16074C6.62823 5.27462 6.83912 5.12139 6.77925 4.93713L6.45308 3.93328C6.42631 3.85088 6.45564 3.7606 6.52574 3.70967L7.37966 3.08926C7.5364 2.97538 7.45585 2.72746 7.2621 2.72746H6.20659C6.11995 2.72746 6.04316 2.67167 6.01638 2.58926L5.69021 1.58541ZM1 7.5C1 7.22386 1.22386 7 1.5 7H9.5C9.77614 7 10 7.22386 10 7.5C10 7.77614 9.77614 8 9.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1.5 9C1.22386 9 1 9.22386 1 9.5C1 9.77614 1.22386 10 1.5 10H9.5C9.77614 10 10 9.77614 10 9.5C10 9.22386 9.77614 9 9.5 9H1.5Z"/></svg>',
            active: false, 
            show: this.hasPermission('student_exam_report_card'),
          },
          {
            title: 'Setting',
            type: 'sub',
            show: (this.hasModule('settings_system_setting')),
            active: false,
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z" /><path class="cr-color" d="M8.57371 5.83684C8.57371 7.29312 7.39316 8.47367 5.93688 8.47367C4.4806 8.47367 3.30005 7.29312 3.30005 5.83684C3.30005 4.38056 4.4806 3.20001 5.93688 3.20001C7.39316 3.20001 8.57371 4.38056 8.57371 5.83684ZM4.30547 5.83684C4.30547 6.73785 5.03588 7.46825 5.93688 7.46825C6.83788 7.46825 7.56829 6.73785 7.56829 5.83684C7.56829 4.93584 6.83788 4.20543 5.93688 4.20543C5.03588 4.20543 4.30547 4.93584 4.30547 5.83684Z" fill="white"/><path class="cr-color" d="M5.20496 2.80001C5.20496 2.68955 5.2945 2.60001 5.40496 2.60001H6.32337C6.43383 2.60001 6.52337 2.68955 6.52337 2.80001V3.91842H5.20496V2.80001Z" fill="white"/><path class="cr-color" d="M3.24872 4.39732C3.16414 4.32627 3.15318 4.20012 3.22423 4.11554L3.81498 3.41234C3.88603 3.32776 4.01219 3.3168 4.09676 3.38785L4.9531 4.10725L4.10505 5.11672L3.24872 4.39732Z" fill="white"/><path class="cr-color" d="M8.57404 7.56004C8.65861 7.63109 8.66958 7.75725 8.59853 7.84182L8.00777 8.54503C7.93672 8.6296 7.81057 8.64057 7.72599 8.56952L6.76648 7.76344L7.61452 6.75397L8.57404 7.56004Z" fill="white"/><path class="cr-color" d="M7.94695 3.38114C8.0345 3.31379 8.16007 3.33016 8.22742 3.4177L8.78745 4.14562C8.8548 4.23316 8.83843 4.35873 8.75089 4.42609L7.86445 5.10806L7.06052 4.06312L7.94695 3.38114Z" fill="white"/><path class="cr-color" d="M5.20496 7.87366H6.52337V8.99207C6.52337 9.10253 6.43383 9.19207 6.32337 9.19207H5.40496C5.2945 9.19207 5.20496 9.10253 5.20496 8.99207V7.87366Z" fill="white"/><path class="cr-color" d="M7.8418 6.55521L7.84482 5.23679L8.96323 5.23936C9.07369 5.23961 9.16303 5.32936 9.16278 5.43982L9.16067 6.35823C9.16041 6.46869 9.07067 6.55803 8.96021 6.55777L7.8418 6.55521Z" fill="white"/><path class="cr-color" d="M4.02136 5.24139L4.01834 6.55981L2.89992 6.55724C2.78947 6.55699 2.70013 6.46724 2.70038 6.35678L2.70249 5.43837C2.70274 5.32791 2.79249 5.23857 2.90295 5.23883L4.02136 5.24139Z" fill="white"/><path class="cr-color" d="M4.31238 6.50336L5.19179 7.48563L4.09281 8.46953C4.01051 8.5432 3.88407 8.53622 3.8104 8.45392L3.19779 7.76967C3.12412 7.68737 3.1311 7.56093 3.2134 7.48725L4.31238 6.50336Z" fill="white"/></svg>',
            children: [
              {
                title: 'Krupa Siddhi Gun Settings',
                type: 'link',
                path: this.setUrl(URLConstants.SYSTEM_SETTING + "/12"),
                show: this.hasPermission('settings_system_setting'),
                active: false
              },
            ]
          }
        ]
      },
      ...moduleName.find(item => item == 'fees') && {
        title: 'Fees',
        icon: 'money',
        type: 'sub',
        show: (((this.getInstituteModule('Finance')) || this.getInstituteModule('Settings')|| (this.getInstituteModule('Report'))) && (this.hasModule('finance_assign_optional_fees'))
         || this.hasModule('settings_fees_settings') ||this.hasModule('finance_collect_fees') || this.hasModule('finance_import_fees') || this.hasModule('finance_imported_fees_list') ||  this.hasModule('finance_fees_collection_center') || this.hasModule('finance_fees') ||this.hasModule('finance_fees_refund') || this.hasModule('finance_remaining_fee_sms') || this.hasModule('finance_dashboard')) || this.hasModule('settings_fees_category') || this.hasModule('fees_report_master_fees_report') || this.hasModule('fees_report_fees_due_report') || this.hasModule('report_fees_reminder') || this.hasModule('fees_report_fees_receipt_report') || this.hasModule('fees_report_fees_report_date_wise') || this.hasModule('fees_report_fees_discount_module') || this.hasModule('student_report_student_academic_fees_report') || this.hasModule('settings_system_setting') || (this.hasModule('settings_notification') ),
        children:
          [
            {
              path: this.setUrl(URLConstants.FEES_DASHBOARD),
              type: 'link',
              title: 'Dashboard',
              svgPath: '<svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.0422363" width="5.7931" height="4.22535" rx="1" /><rect x="6.66296" y="7.60564" width="5.29655" height="4.22535" rx="1" /><rect x="0.0422363" y="5.07043" width="5.37931" height="6.92958" rx="1" /><rect x="6.66296" width="5.37931" height="6.92958" rx="1" /></svg>',
              active: false,
              show: this.hasPermission('finance_dashboard'),
            },
            {
              title: 'Fees Setup',
              type: 'sub',
              svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z"/><path class="cr-color" d="M8.25325 5.84397C8.25325 7.12351 7.21598 8.16078 5.93644 8.16078C4.6569 8.16078 3.61963 7.12351 3.61963 5.84397C3.61963 4.56443 4.6569 3.52716 5.93644 3.52716C7.21598 3.52716 8.25325 4.56443 8.25325 5.84397ZM4.50303 5.84397C4.50303 6.63562 5.14479 7.27738 5.93644 7.27738C6.72809 7.27738 7.36985 6.63562 7.36985 5.84397C7.36985 5.05232 6.72809 4.41056 5.93644 4.41056C5.14479 4.41056 4.50303 5.05232 4.50303 5.84397Z" fill="white"/><path class="cr-color" d="M5.29346 3.2C5.29346 3.08954 5.383 3 5.49346 3H6.25186C6.36232 3 6.45186 3.08954 6.45186 3.2V4.15841H5.29346V3.2Z" fill="white"/><path class="cr-color" d="M3.59308 4.59483C3.5085 4.52378 3.49754 4.39763 3.56859 4.31305L4.05642 3.73236C4.12747 3.64779 4.25362 3.63683 4.3382 3.70787L5.07202 4.32435L4.3269 5.21131L3.59308 4.59483Z" fill="white"/><path class="cr-color" d="M8.23505 7.34242C8.31962 7.41347 8.33059 7.53963 8.25954 7.6242L7.77171 8.20489C7.70066 8.28947 7.5745 8.30043 7.48993 8.22938L6.66545 7.53675L7.41057 6.64979L8.23505 7.34242Z" fill="white"/><path class="cr-color" d="M7.68328 3.70112C7.77083 3.63376 7.8964 3.65013 7.96375 3.73768L8.4262 4.33877C8.49356 4.42632 8.47719 4.55189 8.38964 4.61924L7.63003 5.20365L6.92367 4.28552L7.68328 3.70112Z" fill="white"/><path class="cr-color" d="M5.29346 7.63367H6.45186V8.59207C6.45186 8.70253 6.36232 8.79207 6.25186 8.79207H5.49346C5.383 8.79207 5.29346 8.70253 5.29346 8.59207V7.63367Z" fill="white"/><path class="cr-color" d="M7.61011 6.47516L7.61277 5.31676L8.57117 5.31896C8.68162 5.31921 8.77096 5.40896 8.77071 5.51941L8.76897 6.27782C8.76872 6.38827 8.67897 6.47761 8.56851 6.47736L7.61011 6.47516Z" fill="white"/><path class="cr-color" d="M4.25342 5.3208L4.25076 6.4792L3.29236 6.477C3.1819 6.47675 3.09256 6.387 3.09282 6.27655L3.09456 5.51814C3.09481 5.40769 3.18456 5.31835 3.29502 5.3186L4.25342 5.3208Z" fill="white"/><path class="cr-color" d="M4.50903 6.42957L5.28171 7.29262L4.3342 8.14092C4.2519 8.2146 4.12546 8.20761 4.05178 8.12532L3.54591 7.56027C3.47223 7.47798 3.47922 7.35154 3.56152 7.27786L4.50903 6.42957Z" fill="white"/><mask id="path-11-inside-1_183_159" fill="white"><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z"/></mask><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-11-inside-1_183_159)"/><mask id="path-12-inside-2_183_159" fill="white"><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z"/></mask><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-12-inside-2_183_159)"/><path class="cr-color" d="M1.97291 4.91572L2.10774 3.75636L3.04436 4.4528L1.97291 4.91572Z" fill="white"/><path  d="M9.9355 7.02695L9.98777 8.19295L8.95184 7.65522L9.9355 7.02695Z" fill="white"/></svg>',
              active: false,
              show: this.hasModule('settings_fees_category') || this.hasModule('settings_fees_settings') || this.hasModule('finance_fees_collection_center') || this.hasModule('finance_import_fees') || this.hasModule('finance_imported_fees_list'),
              children:
                [
                  {
                    path: this.setUrl(URLConstants.FEES_CATEGORY_LIST),
                    title: 'Fees Category',
                    type: 'link',
                    active: false,
                    show: this.hasPermission('settings_fees_category')
                  },
                  {
                    title: 'Fees Receipt Number Setting',
                    path: this.setUrl(URLConstants.CREATE_FEES_RECEIPT_NO),
                    active: false,
                    type: 'link',
                    show: this.hasPermission('settings_fees_settings')
                  },
                  {
                    path: this.setUrl(URLConstants.FEES_CENTER),
                    title: 'Fees Collection Center',
                    type: 'link',
                    active: false,
                    show: this.hasPermission('finance_fees_collection_center')
                  },
                  {
                    path: this.setUrl(URLConstants.IMPORT_FEES),
                    title: 'Import Fees',
                    type: 'link',
                    active: false,
                    show: this.hasPermission('finance_import_fees'),
                  },
                  {
                    path: this.setUrl(URLConstants.FEES_IMPORT_LIST),
                    title: 'Imported Fees List',
                    type: 'link',
                    active: false,
                    show: this.hasPermission('finance_imported_fees_list')
                  }
                ]
            },
            {
              path: this.setUrl(URLConstants.COLLECT_FEES),
              title: 'Collect Fees',
              type: 'link',
              svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.84863 10.6388V9.15696C2.84863 9.08871 2.9155 9.04051 2.98026 9.06209L4.75112 9.65238C5.16634 9.79079 5.51549 9.46663 5.70584 9.18985C5.75253 9.12195 5.86269 9.12264 5.90973 9.1903C6.26348 9.69904 6.82069 9.7163 7.07637 9.65238L8.63236 9.06889C8.69773 9.04437 8.76747 9.0927 8.76747 9.16252V10.6388C8.76747 10.6811 8.7409 10.7188 8.7011 10.733L5.84169 11.7542C5.81994 11.762 5.79617 11.762 5.77442 11.7542L2.915 10.733C2.8752 10.7188 2.84863 10.6811 2.84863 10.6388Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.1409 8.67187L6.48416 9.18676C6.58422 9.33684 6.77235 9.40139 6.94347 9.34435L9.31065 8.55529C9.56596 8.47019 9.66607 8.16232 9.50965 7.94332L8.93357 7.13681C8.83423 6.99774 8.83423 6.8109 8.93357 6.67182L9.52826 5.83925C9.67902 5.6282 9.59214 5.33169 9.35133 5.23537L6.9768 4.28555C6.79152 4.21144 6.57995 4.28523 6.48095 4.45849L6.15538 5.02823C6.00182 5.29695 5.61434 5.29695 5.46079 5.02823L5.12523 4.441C5.03063 4.27545 4.83233 4.19969 4.65144 4.25999L2.2737 5.05257C2.0281 5.13443 1.92378 5.4245 2.06099 5.64404L2.7069 6.67749C2.7927 6.81477 2.78729 6.99025 2.69319 7.12198L2.10652 7.94332C1.95009 8.16232 2.05021 8.47019 2.30552 8.55529L4.6727 9.34435C4.84382 9.40139 5.03195 9.33684 5.13201 9.18676L5.47526 8.67187C5.63359 8.43438 5.98257 8.43438 6.1409 8.67187ZM5.04406 6.10207L5.68163 5.88955C5.76374 5.86218 5.85251 5.86218 5.93461 5.88955L6.57219 6.10207C6.93686 6.22363 6.93687 6.73946 6.57219 6.86102L5.93461 7.07354C5.85251 7.10091 5.76374 7.10091 5.68163 7.07354L5.04406 6.86102C4.67938 6.73946 4.67938 6.22363 5.04406 6.10207Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M5.8498 3.57302C6.53696 3.57302 7.09401 2.99703 7.09401 2.28651C7.09401 1.57599 6.53696 1 5.8498 1C5.16264 1 4.60559 1.57599 4.60559 2.28651C4.60559 2.99703 5.16264 3.57302 5.8498 3.57302ZM5.79801 3.02044V3.18182H5.91449V3.0204C6.00585 3.01525 6.0854 2.99779 6.15313 2.96804C6.23551 2.93158 6.29848 2.88116 6.34205 2.81676C6.38561 2.75189 6.40739 2.67685 6.40739 2.59162C6.40739 2.52865 6.39555 2.47372 6.37188 2.42685C6.3482 2.37997 6.316 2.33996 6.27528 2.30682C6.23504 2.27367 6.18935 2.24621 6.13821 2.22443C6.08755 2.20265 6.03475 2.18537 5.97983 2.17259L5.91449 2.15625V1.75168C5.96808 1.75807 6.0133 1.77432 6.05014 1.80043C6.09938 1.83499 6.12732 1.88329 6.13395 1.94531H6.3875C6.38608 1.8634 6.36312 1.79096 6.31861 1.72798C6.2741 1.66454 6.21278 1.61506 6.13466 1.57955C6.0701 1.54963 5.99671 1.53215 5.91449 1.5271V1.36364H5.79801V1.52816C5.72215 1.53431 5.65278 1.55144 5.58991 1.57955C5.50942 1.61506 5.44574 1.66501 5.39886 1.7294C5.35246 1.7938 5.32926 1.86884 5.32926 1.95455C5.32926 2.05871 5.36383 2.14228 5.43295 2.20526C5.50256 2.26776 5.59725 2.31439 5.71705 2.34517L5.79801 2.36602V2.79387C5.76454 2.79011 5.73329 2.78283 5.70426 2.77202C5.66023 2.75545 5.62448 2.73035 5.59702 2.69673C5.56955 2.66312 5.55393 2.62098 5.55014 2.57031H5.29091C5.2947 2.6669 5.31979 2.74882 5.36619 2.81605C5.41307 2.88329 5.47794 2.93442 5.5608 2.96946C5.62968 2.99842 5.70875 3.01541 5.79801 3.02044ZM5.91449 2.79333C5.94711 2.78934 5.97694 2.782 6.00398 2.77131C6.04754 2.75379 6.08163 2.72964 6.10625 2.69886C6.13087 2.66761 6.14342 2.63116 6.14389 2.58949C6.14342 2.55161 6.13229 2.52036 6.11051 2.49574C6.08873 2.47064 6.05819 2.44981 6.01889 2.43324C5.98823 2.41978 5.95343 2.40749 5.91449 2.39639V2.79333ZM5.79801 2.12633V1.75251C5.76866 1.75648 5.74214 1.76345 5.71847 1.77344C5.67917 1.79001 5.6491 1.8125 5.62827 1.84091C5.60743 1.86932 5.59678 1.90175 5.59631 1.93821C5.59631 1.96851 5.60317 1.99479 5.6169 2.01705C5.63111 2.0393 5.65028 2.05824 5.67443 2.07386C5.69858 2.08902 5.72533 2.1018 5.75469 2.11222C5.76907 2.11732 5.78351 2.12203 5.79801 2.12633Z"/></svg>',
              active: false,
              show: this.hasPermission('finance_collect_fees')
            },
            {
              path: this.setUrl(URLConstants.COLLECT_CHEQUE),
              title: 'Collect Cheque',
              type: 'link',
              svgPath: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.0804 6.95996L16.9604 9.27996C16.6404 9.91996 16.1604 10.48 15.6004 10.88L14.3204 11.76C13.7604 12.16 12.9604 12.24 12.2404 11.92C11.6004 11.6 11.1204 10.88 11.0404 10.16L10.9604 8.55996C10.9604 7.99996 11.0404 7.43996 11.2004 6.95996H1.92039C1.04039 6.95996 0.400391 7.67996 0.400391 8.47996V17.12C0.400391 17.92 1.12039 18.64 1.92039 18.64H18.0804C18.9604 18.64 19.6004 17.92 19.6004 17.12V8.55996C19.6004 7.67996 18.8804 6.95996 18.0804 6.95996ZM3.92039 9.91996H8.24039C8.64039 9.91996 9.04039 10.32 9.04039 10.72C9.04039 11.12 8.64039 11.52 8.24039 11.52H3.92039C3.52039 11.52 3.12039 11.12 3.12039 10.72C3.12039 10.32 3.44039 9.91996 3.92039 9.91996ZM16.0804 15.68H3.92039C3.52039 15.68 3.12039 15.28 3.12039 14.88C3.12039 14.48 3.52039 14.08 3.92039 14.08H16.1604C16.5604 14.08 16.9604 14.48 16.9604 14.88C16.9604 15.28 16.5604 15.68 16.0804 15.68Z" /><path d="M17.2805 1.43997C16.8805 1.27997 16.4005 1.43997 16.1605 1.83997L15.6805 2.71997C15.2805 2.63997 14.8805 2.79997 14.7205 3.19997L12.8005 7.35997C12.6405 7.75997 12.5605 8.15997 12.5605 8.55997L12.6405 10.08C12.6405 10.24 12.7205 10.4 12.8805 10.48C13.0405 10.56 13.2005 10.56 13.3605 10.48L14.6405 9.59997C14.9605 9.35997 15.2805 9.03997 15.4405 8.63997L17.4405 4.47997C17.6005 4.07997 17.5205 3.67997 17.2005 3.43997L17.6805 2.55997C17.8405 2.07997 17.6805 1.59997 17.2805 1.43997Z"/></svg>',
              active: false,
              show: this.hasPermission('finance_collect_cheque')
            },
            {
              path: this.setUrl(URLConstants.ASSIGN_OPTIONAL_FEES),
              title: 'Assign Optional Fees',
              type: 'link',
              svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12ZM5.79403 8.06131V8.54545H6.14347V8.0612C6.41755 8.04574 6.65619 7.99338 6.85938 7.90412C7.10653 7.79474 7.29545 7.64347 7.42614 7.45028C7.55682 7.25568 7.62216 7.03054 7.62216 6.77486C7.62216 6.58594 7.58665 6.42116 7.51562 6.28054C7.4446 6.13991 7.34801 6.01989 7.22585 5.92045C7.10511 5.82102 6.96804 5.73864 6.81463 5.6733C6.66264 5.60795 6.50426 5.55611 6.33949 5.51776L6.14347 5.46875V4.25504C6.30425 4.2742 6.4399 4.32295 6.55043 4.40128C6.69815 4.50497 6.78196 4.64986 6.80185 4.83594H7.5625C7.55824 4.5902 7.48935 4.37287 7.35582 4.18395C7.2223 3.99361 7.03835 3.84517 6.80398 3.73864C6.61031 3.64889 6.39014 3.59645 6.14347 3.58131V3.09091H5.79403V3.58447C5.56644 3.60293 5.35835 3.65432 5.16974 3.73864C4.92827 3.84517 4.73722 3.99503 4.59659 4.18821C4.45739 4.38139 4.38778 4.60653 4.38778 4.86364C4.38778 5.17614 4.49148 5.42685 4.69886 5.61577C4.90767 5.80327 5.19176 5.94318 5.55114 6.03551L5.79403 6.09806V7.38161C5.69363 7.37034 5.59988 7.34848 5.51278 7.31605C5.38068 7.26634 5.27344 7.19105 5.19105 7.0902C5.10866 6.98935 5.06179 6.86293 5.05043 6.71094H4.27273C4.28409 7.00071 4.35938 7.24645 4.49858 7.44815C4.6392 7.64986 4.83381 7.80327 5.08239 7.90838C5.28903 7.99527 5.52625 8.04624 5.79403 8.06131ZM6.14347 7.37998C6.24134 7.36802 6.33083 7.346 6.41193 7.31392C6.54261 7.26136 6.64489 7.18892 6.71875 7.09659C6.79261 7.00284 6.83026 6.89347 6.83168 6.76847C6.83026 6.65483 6.79688 6.56108 6.73153 6.48722C6.66619 6.41193 6.57457 6.34943 6.45668 6.29972C6.36468 6.25933 6.26028 6.22248 6.14347 6.18918V7.37998ZM5.79403 5.379V4.25752C5.70598 4.26943 5.62643 4.29036 5.5554 4.32031C5.4375 4.37003 5.3473 4.4375 5.2848 4.52273C5.2223 4.60795 5.19034 4.70526 5.18892 4.81463C5.18892 4.90554 5.20952 4.98438 5.25071 5.05114C5.29332 5.1179 5.35085 5.17472 5.4233 5.22159C5.49574 5.26705 5.57599 5.3054 5.66406 5.33665C5.70722 5.35196 5.75054 5.36608 5.79403 5.379Z"/></svg>',
              active: false,
              show: this.hasPermission('finance_assign_optional_fees'),
            },    
            {
              path: this.setUrl(URLConstants.FEES_REFUND_LIST),
              title: 'Fees Refund',
              type: 'link',
              svgPath:'<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.92927 2.32929L7.77069 0.170711C7.70769 0.107714 7.59998 0.152331 7.59998 0.241421V2.4C7.59998 2.45523 7.64475 2.5 7.69998 2.5H9.85855C9.94764 2.5 9.99226 2.39229 9.92927 2.32929Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7 0H2C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.89543 12 2 12H8C9.10457 12 10 11.1046 10 10V3H8C7.44772 3 7 2.55228 7 2V0ZM6.38431 4.60857C6.439 4.51411 6.407 4.39256 6.3091 4.34429C5.77778 4.08236 5.17851 3.98516 4.58887 4.06782C3.93382 4.15965 3.32838 4.46819 2.86911 4.94422C2.40985 5.42026 2.12321 6.03637 2.05492 6.69429C1.98662 7.35222 2.14061 8.01406 2.4923 8.57428C2.844 9.13449 3.37316 9.5608 3.99539 9.78522C4.61761 10.0096 5.29707 10.0192 5.92539 9.8125C6.55371 9.60575 7.09471 9.19456 7.46209 8.64451C7.7928 8.14939 7.96569 7.56743 7.96069 6.97507C7.95977 6.86593 7.8642 6.78428 7.75536 6.79248C7.64652 6.80068 7.56573 6.89564 7.56553 7.00479C7.56459 7.50894 7.41505 8.00331 7.1334 8.42497C6.81506 8.9016 6.34629 9.25789 5.80185 9.43704C5.2574 9.61618 4.66865 9.60786 4.12949 9.4134C3.59033 9.21894 3.13181 8.84954 2.82707 8.36411C2.52232 7.87869 2.38889 7.3052 2.44807 6.7351C2.50725 6.16501 2.75562 5.63115 3.15357 5.21866C3.55153 4.80618 4.07614 4.53883 4.64375 4.45926C5.14592 4.38886 5.65614 4.46901 6.11061 4.68728C6.209 4.73453 6.32963 4.70304 6.38431 4.60857ZM4.796 8.54087V8.86364H5.02895V8.5408C5.21168 8.53049 5.37077 8.49559 5.50623 8.43608C5.671 8.36316 5.79695 8.26231 5.88407 8.13352C5.97119 8.00379 6.01475 7.85369 6.01475 7.68324C6.01475 7.55729 5.99107 7.44744 5.94373 7.35369C5.89638 7.25994 5.83198 7.17992 5.75054 7.11364C5.67005 7.04735 5.57867 6.99242 5.4764 6.94886C5.37507 6.9053 5.26948 6.87074 5.15963 6.84517L5.02895 6.8125V6.00336C5.13614 6.01613 5.22658 6.04863 5.30026 6.10085C5.39874 6.16998 5.45462 6.26657 5.46787 6.39062H5.97498C5.97213 6.2268 5.92621 6.08191 5.83719 5.95597C5.74818 5.82907 5.62554 5.73011 5.46929 5.65909C5.34018 5.59926 5.1934 5.5643 5.02895 5.55421V5.22727H4.796V5.55631C4.64427 5.56862 4.50554 5.60288 4.37981 5.65909C4.21882 5.73011 4.09145 5.83002 3.9977 5.95881C3.9049 6.08759 3.8585 6.23769 3.8585 6.40909C3.8585 6.61742 3.92763 6.78456 4.06588 6.91051C4.20509 7.03551 4.39448 7.12879 4.63407 7.19034L4.796 7.23204V8.08774C4.72907 8.08022 4.66657 8.06565 4.6085 8.04403C4.52043 8.01089 4.44893 7.9607 4.39401 7.89347C4.33909 7.82623 4.30784 7.74195 4.30026 7.64062H3.78179C3.78937 7.83381 3.83956 7.99763 3.93236 8.1321C4.02611 8.26657 4.15585 8.36884 4.32157 8.43892C4.45933 8.49684 4.61747 8.53083 4.796 8.54087ZM5.02895 8.08665C5.0942 8.07868 5.15386 8.064 5.20793 8.04261C5.29505 8.00758 5.36323 7.95928 5.41248 7.89773C5.46172 7.83523 5.48681 7.76231 5.48776 7.67898C5.48681 7.60322 5.46456 7.54072 5.421 7.49148C5.37744 7.44129 5.31636 7.39962 5.23776 7.36648C5.17643 7.33955 5.10683 7.31499 5.02895 7.29279V8.08665ZM4.796 6.75267V6.00501C4.7373 6.01295 4.68427 6.0269 4.63691 6.04688C4.55831 6.08002 4.49818 6.125 4.45651 6.18182C4.41484 6.23864 4.39354 6.3035 4.39259 6.37642C4.39259 6.43703 4.40632 6.48958 4.43378 6.53409C4.46219 6.5786 4.50054 6.61648 4.54884 6.64773C4.59713 6.67803 4.65064 6.7036 4.70935 6.72443C4.73812 6.73464 4.767 6.74405 4.796 6.75267Z"/></svg>',
              active: false,
              show: this.hasPermission('finance_fees_refund')
            },     
            { 
              path: this.setUrl(URLConstants.GENERATE_DISCOUNT_RECEIPT), 
              title: 'Bulk Discount', 
              type: 'link', 
              svgPath:'<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.21614 0.871995C6.89872 -0.290665 5.24961 -0.290665 4.93219 0.871995C4.72841 1.61841 3.87507 1.97188 3.20317 1.58818C2.1566 0.990503 0.990503 2.1566 1.58818 3.20317C1.97188 3.87507 1.61841 4.72841 0.871995 4.93219C-0.290665 5.24961 -0.290665 6.89872 0.871995 7.21614C1.61841 7.41992 1.97188 8.27326 1.58818 8.94516C0.990503 9.99173 2.1566 11.1578 3.20317 10.5602C3.87507 10.1765 4.72841 10.5299 4.93219 11.2763C5.24961 12.439 6.89872 12.439 7.21614 11.2763C7.41992 10.5299 8.27326 10.1765 8.94516 10.5602C9.99173 11.1578 11.1578 9.99173 10.5602 8.94516C10.1765 8.27326 10.5299 7.41992 11.2763 7.21614C12.439 6.89872 12.439 5.24961 11.2763 4.93219C10.5299 4.72841 10.1765 3.87507 10.5602 3.20317C11.1578 2.1566 9.99173 0.990503 8.94516 1.58818C8.27326 1.97188 7.41992 1.61841 7.21614 0.871995ZM6.03475 7.16145V7.39156C6.03475 7.5606 6.06955 7.71614 6.13915 7.85818C6.21017 8.00023 6.31458 8.11457 6.45236 8.20122C6.59014 8.28787 6.75847 8.33119 6.95733 8.33119C7.15619 8.33119 7.32381 8.28787 7.46017 8.20122C7.59796 8.11457 7.70236 8.00023 7.77338 7.85818C7.8444 7.71614 7.87992 7.5606 7.87992 7.39156V7.16145C7.87992 6.99099 7.8444 6.83474 7.77338 6.6927C7.70378 6.55065 7.6008 6.43702 7.46443 6.35179C7.32807 6.26514 7.15904 6.22182 6.95733 6.22182C6.76131 6.22182 6.5944 6.26514 6.45662 6.35179C6.31884 6.43844 6.21372 6.55278 6.14128 6.69483C6.07026 6.83687 6.03475 6.99241 6.03475 7.16145ZM6.59085 7.39156V7.16145C6.59085 7.04781 6.61855 6.94412 6.67395 6.85037C6.72935 6.7552 6.82381 6.70761 6.95733 6.70761C7.09938 6.70761 7.19526 6.7552 7.24497 6.85037C7.29469 6.94412 7.31955 7.04781 7.31955 7.16145V7.39156C7.31955 7.5052 7.29327 7.60889 7.24071 7.70264C7.18958 7.79497 7.09511 7.84114 6.95733 7.84114C6.82097 7.84114 6.7258 7.79426 6.67182 7.70051C6.61784 7.60676 6.59085 7.50378 6.59085 7.39156ZM3.81671 4.66429V4.8944C3.81671 5.06344 3.85222 5.21898 3.92324 5.36102C3.99426 5.50307 4.09796 5.6167 4.23432 5.70193C4.3721 5.78716 4.54114 5.82977 4.74142 5.82977C4.93886 5.82977 5.10648 5.78716 5.24426 5.70193C5.38205 5.6167 5.48574 5.50378 5.55534 5.36315C5.62636 5.22111 5.66188 5.06486 5.66188 4.8944V4.66429C5.66188 4.49383 5.62708 4.33758 5.55747 4.19554C5.48787 4.05349 5.38418 3.93986 5.24639 3.85463C5.11003 3.76798 4.94171 3.72466 4.74142 3.72466C4.5454 3.72466 4.3785 3.76798 4.24071 3.85463C4.10293 3.93986 3.99781 4.05349 3.92537 4.19554C3.85293 4.33758 3.81671 4.49383 3.81671 4.66429ZM4.37707 4.8944V4.66429C4.37707 4.55207 4.40406 4.44838 4.45804 4.35321C4.51202 4.25804 4.60648 4.21045 4.74142 4.21045C4.88205 4.21045 4.97722 4.25804 5.02693 4.35321C5.07665 4.44696 5.10151 4.55065 5.10151 4.66429V4.8944C5.10151 5.00804 5.07523 5.11173 5.02267 5.20548C4.97154 5.29781 4.87779 5.34398 4.74142 5.34398C4.60506 5.34398 4.50989 5.29781 4.45591 5.20548C4.40335 5.11173 4.37707 5.00804 4.37707 4.8944ZM7.0596 3.84611L4.0596 8.20974H4.59227L7.59227 3.84611H7.0596Z"/></svg>',
              active: false,  
              show: this.bulk_discount 
            } ,
            {
              path: this.setUrl(URLConstants.STUDENT_BULK_DISCOUNT),
              title: 'Student Bulk Discount',
              type: 'link',
              svgPath:'<svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="6.12498" cy="2.7" rx="2.775" ry="2.7"/><path d="M10.75 8.89999C10.75 7.74278 10.2918 6.63005 9.47061 5.79295C8.64941 4.95585 7.52834 4.45873 6.34027 4.40487C5.1522 4.35101 3.98847 4.74454 3.09083 5.50372C2.19318 6.26289 1.63063 7.32935 1.52004 8.48155L2.69542 8.58835C2.77779 7.73024 3.19675 6.93599 3.86528 6.37059C4.5338 5.80519 5.4005 5.5121 6.28532 5.55222C7.17015 5.59233 8.00508 5.96256 8.61667 6.586C9.22826 7.20943 9.5695 8.03815 9.5695 8.89999H10.75Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.12498 11.6C7.65757 11.6 8.89998 10.3911 8.89998 8.89998C8.89998 7.40881 7.65757 6.19998 6.12498 6.19998C4.59239 6.19998 3.34998 7.40881 3.34998 8.89998C3.34998 10.3911 4.59239 11.6 6.12498 11.6ZM6.31392 9.70113V9.85454C6.31392 9.96723 6.33712 10.0709 6.38352 10.1656C6.43087 10.2603 6.50047 10.3365 6.59233 10.3943C6.68419 10.4521 6.7964 10.481 6.92898 10.481C7.06155 10.481 7.1733 10.4521 7.2642 10.3943C7.35606 10.3365 7.42566 10.2603 7.47301 10.1656C7.52036 10.0709 7.54403 9.96723 7.54403 9.85454V9.70113C7.54403 9.58749 7.52036 9.48333 7.47301 9.38863C7.42661 9.29393 7.35795 9.21818 7.26705 9.16136C7.17614 9.10359 7.06345 9.07471 6.92898 9.07471C6.7983 9.07471 6.68703 9.10359 6.59517 9.16136C6.50331 9.21912 6.43324 9.29535 6.38494 9.39005C6.33759 9.48475 6.31392 9.58844 6.31392 9.70113ZM6.68466 9.85454V9.70113C6.68466 9.62537 6.70313 9.55624 6.74006 9.49374C6.77699 9.4303 6.83996 9.39857 6.92898 9.39857C7.02367 9.39857 7.08759 9.4303 7.12074 9.49374C7.15388 9.55624 7.17045 9.62537 7.17045 9.70113V9.85454C7.17045 9.9303 7.15294 9.99943 7.1179 10.0619C7.08381 10.1235 7.02083 10.1543 6.92898 10.1543C6.83807 10.1543 6.77462 10.123 6.73864 10.0605C6.70265 9.99801 6.68466 9.92935 6.68466 9.85454ZM4.83523 8.03636V8.18977C4.83523 8.30246 4.8589 8.40615 4.90625 8.50085C4.9536 8.59554 5.02273 8.6713 5.11364 8.72812C5.20549 8.78494 5.31818 8.81335 5.4517 8.81335C5.58333 8.81335 5.69508 8.78494 5.78693 8.72812C5.87879 8.6713 5.94792 8.59602 5.99432 8.50227C6.04167 8.40757 6.06534 8.3034 6.06534 8.18977V8.03636C6.06534 7.92272 6.04214 7.81855 5.99574 7.72386C5.94934 7.62916 5.88021 7.5534 5.78835 7.49658C5.69744 7.43882 5.58523 7.40994 5.4517 7.40994C5.32102 7.40994 5.20975 7.43882 5.1179 7.49658C5.02604 7.5534 4.95597 7.62916 4.90767 7.72386C4.85938 7.81855 4.83523 7.92272 4.83523 8.03636ZM5.20881 8.18977V8.03636C5.20881 7.96155 5.2268 7.89242 5.26278 7.82897C5.29877 7.76552 5.36174 7.7338 5.4517 7.7338C5.54545 7.7338 5.6089 7.76552 5.64205 7.82897C5.67519 7.89147 5.69176 7.9606 5.69176 8.03636V8.18977C5.69176 8.26552 5.67424 8.33465 5.6392 8.39715C5.60511 8.45871 5.54261 8.48948 5.4517 8.48948C5.3608 8.48948 5.29735 8.45871 5.26136 8.39715C5.22633 8.33465 5.20881 8.26552 5.20881 8.18977ZM6.99716 7.4909L4.99716 10.4H5.35227L7.35227 7.4909H6.99716Z"/></svg>',
              active: false,
              show: this.hasPermission('finance_fees')
            },
            {
              title: 'Remaining Fee SMS',
              path: this.setUrl(URLConstants.REMAINING_FEE_SMS),
              type: 'link',
              active: false,
              svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.66321 0.416363C5.66321 0.186412 5.84962 0 6.07957 0C6.30952 0 6.49593 0.186412 6.49593 0.416363V0.832726H5.66321V0.416363Z" /><path d="M7.66184 9.99272C7.66184 10.4344 7.48637 10.858 7.17404 11.1704C6.8617 11.4827 6.43809 11.6582 5.99638 11.6582C5.55468 11.6582 5.13107 11.4827 4.81873 11.1704C4.5064 10.858 4.33093 10.4344 4.33093 9.99272L5.99638 9.99272H7.66184Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M5.63185 0.832733C4.79998 0.832733 3.05399 1.41445 2.71834 3.7401C2.71767 3.74478 2.71731 3.74965 2.71731 3.75438V5.82909C2.71731 6.37903 2.39045 7.63717 1.08913 8.30834C1.06556 8.3205 1.04692 8.34132 1.03964 8.36683C0.917698 8.79406 1.00957 9.57635 2.30095 9.57635H10.5868C10.6133 9.57635 10.6388 9.56602 10.6568 9.54654C10.9299 9.2509 11.2692 8.5596 10.6353 7.91807C10.6307 7.91339 10.6257 7.90924 10.6202 7.90555C10.2013 7.6231 9.3791 6.82202 9.3791 5.82909V3.74727C9.3791 2.9157 8.88085 1.17068 6.88924 0.834128C6.8838 0.83321 6.87816 0.832733 6.87265 0.832733H5.63185ZM6 2.3C6 2.13431 6.13432 2 6.3 2C6.46568 2 6.6 2.13431 6.6 2.3V5.7C6.6 5.86569 6.46568 6 6.3 6C6.13432 6 6 5.86569 6 5.7V2.3ZM6.30009 7C6.02395 7 5.80009 7.22386 5.80009 7.5C5.80009 7.77614 6.02395 8 6.30009 8C6.57624 8 6.80009 7.77614 6.80009 7.5C6.80009 7.22386 6.57624 7 6.30009 7Z" /></svg>',
              show: this.hasPermission('finance_remaining_fee_sms')
            },
            {
              title: 'Report',
              active: false,
              type: 'sub',
              svgPath:'<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 0H2C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.89543 12 2 12H8C9.10457 12 10 11.1046 10 10V3H8C7.44772 3 7 2.55228 7 2V0ZM2.69995 3.5C2.69995 3.22386 2.92381 3 3.19995 3C3.47609 3 3.69995 3.22386 3.69995 3.5V9.5C3.69995 9.77614 3.47609 10 3.19995 10C2.92381 10 2.69995 9.77614 2.69995 9.5V3.5ZM5.19995 5C4.92381 5 4.69995 5.22386 4.69995 5.5V9.5C4.69995 9.77614 4.92381 10 5.19995 10C5.47609 10 5.69995 9.77614 5.69995 9.5V5.5C5.69995 5.22386 5.47609 5 5.19995 5ZM6.69995 7.5C6.69995 7.22386 6.92381 7 7.19995 7C7.47609 7 7.69995 7.22386 7.69995 7.5V9.5C7.69995 9.77614 7.47609 10 7.19995 10C6.92381 10 6.69995 9.77614 6.69995 9.5V7.5Z" /><path d="M9.92927 2.32929L7.77069 0.170711C7.70769 0.107714 7.59998 0.152331 7.59998 0.241421V2.4C7.59998 2.45523 7.64475 2.5 7.69998 2.5H9.85855C9.94764 2.5 9.99226 2.39229 9.92927 2.32929Z" /></svg>',
              show: this.hasModule('fees_report_master_fees_report') || this.hasModule('fees_report_fees_due_report') || this.hasModule('report_fees_reminder') ||this.hasModule('fees_report_fees_receipt_report') || this.hasModule('fees_report_fees_report_date_wise') || this.hasModule('fees_report_fees_discount_module') || this.hasModule('student_report_student_academic_fees_report'),
              children:[
                { 
                  path: this.setUrl(URLConstants.MASTER_FEES_REPORT), 
                  title: 'Master Fees report', 
                  type: 'link', 
                  active: false, 
                  show: this.hasPermission('fees_report_master_fees_report') 
                },
                {
                  path: this.setUrl(URLConstants.FEES_DUE_REPORT),
                  title: 'Fees Due Report',
                  type: 'link',
                  active: false,
                  show: this.hasPermission('fees_report_fees_due_report')
                },
                {
                  path: this.setUrl(URLConstants.FEES_REMINDER),
                  title: 'Fees Reminder',
                  type: 'link',
                  active: false,
                  show: this.hasPermission('report_fees_reminder')

                },
                {
                  path: this.setUrl(URLConstants.FEES_RECEIPT_LIST),
                  title: 'Fees Receipt Report',
                  type: 'link',
                  active: false,
                  show: this.hasPermission('fees_report_fees_receipt_report')
                },
                {
                  path: this.setUrl(URLConstants.FEES_REPORT_DATEWISE),
                  title: 'Fees Report date wise',
                  type: 'link',
                  active: false,
                  show: this.hasPermission('fees_report_fees_report_date_wise')
                },
                {
                  path: this.setUrl(URLConstants.FEES_DISCOUNT_REPORT),
                  title: 'Fees Discount Report',
                  type: 'link',
                  active: false,
                  show: this.hasPermission('fees_report_fees_discount_module')
                },
                {
                  path: this.setUrl(URLConstants.COURSE_FEES_UPDATE),
                  title: 'Student Academic Fees Report',
                  type: 'link',
                  active: false,
                  show: this.hasPermission('student_report_student_academic_fees_report')
                }
              ]
            },
            {
              title: 'Setting',
              type: 'sub',
              show: (this.hasModule('settings_system_setting')),
              active: false,
              svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.85718 0C1.75261 0 0.857178 0.895431 0.857178 2V10C0.857178 11.1046 1.75261 12 2.85718 12H9.14289C10.2475 12 11.1429 11.1046 11.1429 10V2C11.1429 0.895431 10.2475 0 9.14289 0H2.85718ZM8.7857 0.857143H8.57141V11.1429H8.7857C9.61412 11.1429 10.2857 10.4713 10.2857 9.64286V2.35714C10.2857 1.52872 9.61412 0.857143 8.7857 0.857143ZM2.57141 3C2.57141 2.76331 2.76329 2.57143 2.99998 2.57143H6.42855C6.66525 2.57143 6.85713 2.76331 6.85713 3C6.85713 3.23669 6.66525 3.42857 6.42855 3.42857H2.99998C2.76329 3.42857 2.57141 3.23669 2.57141 3ZM2.99998 4.28571C2.76329 4.28571 2.57141 4.47759 2.57141 4.71429C2.57141 4.95098 2.76329 5.14286 2.99998 5.14286H4.71427C4.95096 5.14286 5.14284 4.95098 5.14284 4.71429C5.14284 4.47759 4.95096 4.28571 4.71427 4.28571H2.99998Z" /><rect y="2.57144" width="1.71429" height="0.857143" rx="0.428571" /><rect y="6" width="1.71429" height="0.857143" rx="0.428571" /><rect y="9.42856" width="1.71429" height="0.857143" rx="0.428571" /></svg>',
              children: [
                {
                  title: 'Fees Setting',
                  type: 'link',
                  path: this.setUrl(URLConstants.SYSTEM_SETTING + "/2"),
                  show: this.hasPermission('settings_system_setting'),
                  active: false
                },
              ]
            },
            {
              title: 'Notification',
              type: 'sub',
              show: (this.hasModule('settings_notification')),
              active: false,
              svgPath: '<svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.66321 0.416363C4.66321 0.186412 4.84962 0 5.07957 0C5.30952 0 5.49593 0.186412 5.49593 0.416363V0.832726H4.66321V0.416363Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.36683 0.949529C6.21808 0.901778 6.05909 0.86283 5.88923 0.834128C5.8838 0.83321 5.87815 0.832733 5.87265 0.832733H4.63185C3.79998 0.832733 2.05399 1.41445 1.71834 3.7401C1.71767 3.74478 1.71731 3.74965 1.71731 3.75438V5.82909C1.71731 6.37903 1.39045 7.63717 0.0891269 8.30834C0.0655556 8.3205 0.0469179 8.34132 0.0396388 8.36683C-0.0823034 8.79406 0.00956711 9.57635 1.30095 9.57635H9.58677C9.61329 9.57635 9.63883 9.56602 9.65682 9.54654C9.92994 9.2509 10.2692 8.5596 9.63531 7.91807C9.63069 7.91339 9.62567 7.90924 9.62021 7.90555C9.20129 7.6231 8.3791 6.82202 8.3791 5.82909V4.99585C8.36184 4.9962 8.34454 4.99638 8.32719 4.99638C6.94749 4.99638 5.82902 3.8779 5.82902 2.4982C5.82902 1.91324 6.03006 1.37524 6.36683 0.949529Z"/><circle cx="8.32732" cy="2.49818" r="1.66545"/><path d="M6.66184 9.99272C6.66184 10.4344 6.48637 10.858 6.17404 11.1704C5.8617 11.4827 5.43809 11.6582 4.99638 11.6582C4.55468 11.6582 4.13107 11.4827 3.81873 11.1704C3.5064 10.858 3.33093 10.4344 3.33093 9.99272L4.99638 9.99272H6.66184Z"/></svg>',
              children: [
                {
                  title: 'Fees and Wallet Notification',
                  type: 'link',
                  path: this.setUrl(URLConstants.NOTIFICATION_SETTING + "/7"),
                  show: this.hasPermission('settings_notification'),
                  active: false
                },
              ]
            }
          ]
      },
      ...moduleName.find(item => item == 'calendar') && {
        title: 'Calender',
        svgPath: '<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 0.5C3 0.223858 3.22386 0 3.5 0C3.77614 0 4 0.223858 4 0.5V3H3V0.5Z" fill="white"/><path d="M7 0.5C7 0.223858 7.22386 0 7.5 0C7.77614 0 8 0.223858 8 0.5V3H7V0.5Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2 2C0.895431 2 0 2.89543 0 4V5H11V4C11 2.89543 10.1046 2 9 2H2ZM11 6H0V10C0 11.1046 0.895431 12 2 12H9C10.1046 12 11 11.1046 11 10V6Z" fill="white"/></svg>',
        type: 'sub',
        active: false,
        show: ((this.getInstituteModule('Administrator')) && this.hasModule('administrator_calender') || this.hasModule('administrator_holiday') || this.hasModule('administrator_event') || this.hasModule('administrator_event_type')),
        children:
          [
            {
              title: 'Calendar',
              type: 'link',
              svgPath: '<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 0.5C3 0.223858 3.22386 0 3.5 0C3.77614 0 4 0.223858 4 0.5V3H3V0.5Z"/><path d="M7 0.5C7 0.223858 7.22386 0 7.5 0C7.77614 0 8 0.223858 8 0.5V3H7V0.5Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M0 4C0 2.89543 0.895431 2 2 2H9C10.1046 2 11 2.89543 11 4V5H0V4ZM0 6H11V8.17071C10.6872 8.06015 10.3506 8 10 8C8.34315 8 7 9.34315 7 11C7 11.3506 7.06015 11.6872 7.17071 12H2C0.895431 12 0 11.1046 0 10V6Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 13C11.1046 13 12 12.1046 12 11C12 9.89543 11.1046 9 10 9C8.89543 9 8 9.89543 8 11C8 12.1046 8.89543 13 10 13ZM10.2245 10.691L10 10L9.77549 10.691H9.04894L9.63673 11.118L9.41221 11.809L10 11.382L10.5878 11.809L10.3633 11.118L10.9511 10.691H10.2245Z"/></svg>',
              active: false,
              show: this.hasPermission('administrator_calender', 'has_access'),
              path: this.setUrl(URLConstants.CALENDAR),
            },
            {
              title: 'Calendar Setup',
              type: 'sub',
              svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z"/><path class="cr-color" d="M8.25325 5.84397C8.25325 7.12351 7.21598 8.16078 5.93644 8.16078C4.6569 8.16078 3.61963 7.12351 3.61963 5.84397C3.61963 4.56443 4.6569 3.52716 5.93644 3.52716C7.21598 3.52716 8.25325 4.56443 8.25325 5.84397ZM4.50303 5.84397C4.50303 6.63562 5.14479 7.27738 5.93644 7.27738C6.72809 7.27738 7.36985 6.63562 7.36985 5.84397C7.36985 5.05232 6.72809 4.41056 5.93644 4.41056C5.14479 4.41056 4.50303 5.05232 4.50303 5.84397Z" fill="white"/><path class="cr-color" d="M5.29346 3.2C5.29346 3.08954 5.383 3 5.49346 3H6.25186C6.36232 3 6.45186 3.08954 6.45186 3.2V4.15841H5.29346V3.2Z" fill="white"/><path class="cr-color" d="M3.59308 4.59483C3.5085 4.52378 3.49754 4.39763 3.56859 4.31305L4.05642 3.73236C4.12747 3.64779 4.25362 3.63683 4.3382 3.70787L5.07202 4.32435L4.3269 5.21131L3.59308 4.59483Z" fill="white"/><path class="cr-color" d="M8.23505 7.34242C8.31962 7.41347 8.33059 7.53963 8.25954 7.6242L7.77171 8.20489C7.70066 8.28947 7.5745 8.30043 7.48993 8.22938L6.66545 7.53675L7.41057 6.64979L8.23505 7.34242Z" fill="white"/><path class="cr-color" d="M7.68328 3.70112C7.77083 3.63376 7.8964 3.65013 7.96375 3.73768L8.4262 4.33877C8.49356 4.42632 8.47719 4.55189 8.38964 4.61924L7.63003 5.20365L6.92367 4.28552L7.68328 3.70112Z" fill="white"/><path class="cr-color" d="M5.29346 7.63367H6.45186V8.59207C6.45186 8.70253 6.36232 8.79207 6.25186 8.79207H5.49346C5.383 8.79207 5.29346 8.70253 5.29346 8.59207V7.63367Z" fill="white"/><path class="cr-color" d="M7.61011 6.47516L7.61277 5.31676L8.57117 5.31896C8.68162 5.31921 8.77096 5.40896 8.77071 5.51941L8.76897 6.27782C8.76872 6.38827 8.67897 6.47761 8.56851 6.47736L7.61011 6.47516Z" fill="white"/><path class="cr-color" d="M4.25342 5.3208L4.25076 6.4792L3.29236 6.477C3.1819 6.47675 3.09256 6.387 3.09282 6.27655L3.09456 5.51814C3.09481 5.40769 3.18456 5.31835 3.29502 5.3186L4.25342 5.3208Z" fill="white"/><path class="cr-color" d="M4.50903 6.42957L5.28171 7.29262L4.3342 8.14092C4.2519 8.2146 4.12546 8.20761 4.05178 8.12532L3.54591 7.56027C3.47223 7.47798 3.47922 7.35154 3.56152 7.27786L4.50903 6.42957Z" fill="white"/><mask id="path-11-inside-1_183_159" fill="white"><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z"/></mask><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-11-inside-1_183_159)"/><mask id="path-12-inside-2_183_159" fill="white"><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z"/></mask><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-12-inside-2_183_159)"/><path class="cr-color" d="M1.97291 4.91572L2.10774 3.75636L3.04436 4.4528L1.97291 4.91572Z" fill="white"/><path  d="M9.9355 7.02695L9.98777 8.19295L8.95184 7.65522L9.9355 7.02695Z" fill="white"/></svg>',
              active: false,
              show: (this.is_staff || this.is_branch_admin || this.is_admin || (!this.is_faculty && !this.is_back_office) || this.hasPermission('administrator_event_type')),
              children:
                [
                  {
                    title: 'Event Type',
                    path: this.setUrl(URLConstants.EVENT_TYPE_LIST),
                    type: 'link',
                    active: false,
                    show: (this.is_staff || this.is_branch_admin || this.is_admin || (!this.is_faculty && !this.is_back_office) || this.hasPermission('administrator_event_type'))
                  },
                ]
            },
            {
              title: 'Add  Event',
              path: this.setUrl(URLConstants.ADD_MULTI_EVENT),
              type: 'link',
              svgPath:'<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 0.5C3 0.223858 3.22386 0 3.5 0C3.77614 0 4 0.223858 4 0.5V3H3V0.5Z"/><path d="M7 0.5C7 0.223858 7.22386 0 7.5 0C7.77614 0 8 0.223858 8 0.5V3H7V0.5Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M0 4C0 2.89543 0.895431 2 2 2H9C10.1046 2 11 2.89543 11 4V5H0V4ZM0 6H11V10C11 11.1046 10.1046 12 9 12H2C0.895431 12 0 11.1046 0 10V6ZM5.69021 7.58541C5.63034 7.40115 5.36966 7.40115 5.30979 7.58541L5.09587 8.24377C5.0691 8.32617 4.99231 8.38197 4.90566 8.38197H4.21342C4.01968 8.38197 3.93912 8.62989 4.09587 8.74377L4.6559 9.15066C4.726 9.20159 4.75533 9.29186 4.72855 9.37426L4.51464 10.0326C4.45477 10.2169 4.66567 10.3701 4.82241 10.2562L5.38244 9.84934C5.45254 9.79841 5.54746 9.79841 5.61756 9.84934L6.17759 10.2562C6.33433 10.3701 6.54523 10.2169 6.48536 10.0326L6.27145 9.37426C6.24467 9.29186 6.274 9.20159 6.3441 9.15066L6.90413 8.74377C7.06088 8.62989 6.98032 8.38197 6.78658 8.38197H6.09434C6.00769 8.38197 5.9309 8.32617 5.90413 8.24377L5.69021 7.58541Z"/></svg>',
              active: false,
              show: this.hasPermission('administrator_event', 'has_create'),
              slug: 'event'
            },
            {
              title: 'Add Holiday',
              path: this.setUrl(URLConstants.ADD_MULTI_EVENT),
              type: 'link',
              svgPath:'<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 0.5C3 0.223858 3.22386 0 3.5 0C3.77614 0 4 0.223858 4 0.5V3H3V0.5Z"/><path d="M7 0.5C7 0.223858 7.22386 0 7.5 0C7.77614 0 8 0.223858 8 0.5V3H7V0.5Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2 2C0.895431 2 0 2.89543 0 4V5H11V4C11 2.89543 10.1046 2 9 2H2ZM11 6H0V10C0 11.1046 0.895431 12 2 12H9C10.1046 12 11 11.1046 11 10V6ZM5.12216 9.06818V9.82812H5.56818V9.06818H6.32812V8.62216H5.56818V7.86222H5.12216V8.62216H4.36222V9.06818H5.12216Z"/></svg>',
              active: false,
              show: this.hasPermission('administrator_holiday', 'has_create'),
              slug: 'holiday'
            },
            {
              title: 'Event List',
              path: this.setUrl(URLConstants.EVENT_HOLIDAY_LIST),
              type: 'link',
              svgPath:'<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 0.5C3 0.223858 3.22386 0 3.5 0V0C3.77614 0 4 0.223858 4 0.5V3H3V0.5Z"/><path d="M7 0.5C7 0.223858 7.22386 0 7.5 0V0C7.77614 0 8 0.223858 8 0.5V3H7V0.5Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2 2C0.895431 2 0 2.89543 0 4V5H11V4C11 2.89543 10.1046 2 9 2H2ZM11 6H0V10C0 11.1046 0.895431 12 2 12H9C10.1046 12 11 11.1046 11 10V6ZM3.95 7C3.7567 7 3.6 7.1567 3.6 7.35C3.6 7.5433 3.7567 7.7 3.95 7.7H9.25C9.4433 7.7 9.6 7.5433 9.6 7.35C9.6 7.1567 9.4433 7 9.25 7H3.95ZM1.6 7.5C1.6 7.22386 1.82386 7 2.1 7C2.37614 7 2.6 7.22386 2.6 7.5C2.6 7.77614 2.37614 8 2.1 8C1.82386 8 1.6 7.77614 1.6 7.5ZM2.1 9C1.82386 9 1.6 9.22386 1.6 9.5C1.6 9.77614 1.82386 10 2.1 10C2.37614 10 2.6 9.77614 2.6 9.5C2.6 9.22386 2.37614 9 2.1 9ZM3.6 9.35C3.6 9.1567 3.7567 9 3.95 9H9.25C9.4433 9 9.6 9.1567 9.6 9.35C9.6 9.5433 9.4433 9.7 9.25 9.7H3.95C3.7567 9.7 3.6 9.5433 3.6 9.35Z"/></svg>',
              active: false,
              show: this.hasPermission('administrator_event', 'has_access'),
              slug: 'event'
            },
            {
              title: 'Holiday List',
              path: this.setUrl(URLConstants.EVENT_HOLIDAY_LIST),
              type: 'link',
              svgPath:'<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 0.5C3 0.223858 3.22386 0 3.5 0V0C3.77614 0 4 0.223858 4 0.5V3H3V0.5Z"/><path d="M7 0.5C7 0.223858 7.22386 0 7.5 0V0C7.77614 0 8 0.223858 8 0.5V3H7V0.5Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M0 4C0 2.89543 0.895431 2 2 2H9C10.1046 2 11 2.89543 11 4V5H0V4ZM0 6H11V10C11 11.1046 10.1046 12 9 12H2C0.895431 12 0 11.1046 0 10V6ZM2.59998 8.35C2.59998 8.1567 2.75668 8 2.94998 8H8.24998C8.44328 8 8.59998 8.1567 8.59998 8.35C8.59998 8.5433 8.44328 8.7 8.24998 8.7H2.94998C2.75668 8.7 2.59998 8.5433 2.59998 8.35ZM2.94998 9.70001C2.75668 9.70001 2.59998 9.85671 2.59998 10.05C2.59998 10.2433 2.75668 10.4 2.94998 10.4H8.24998C8.44328 10.4 8.59998 10.2433 8.59998 10.05C8.59998 9.85671 8.44328 9.70001 8.24998 9.70001H2.94998Z"/></svg>',
              active: false,
              show: this.hasPermission('administrator_holiday', 'has_access'),
              slug: 'holiday'
            },
            // {
            //   title: 'Setting',
            //   type: 'link',
            //   svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z" /><path class="cr-color" d="M8.57371 5.83684C8.57371 7.29312 7.39316 8.47367 5.93688 8.47367C4.4806 8.47367 3.30005 7.29312 3.30005 5.83684C3.30005 4.38056 4.4806 3.20001 5.93688 3.20001C7.39316 3.20001 8.57371 4.38056 8.57371 5.83684ZM4.30547 5.83684C4.30547 6.73785 5.03588 7.46825 5.93688 7.46825C6.83788 7.46825 7.56829 6.73785 7.56829 5.83684C7.56829 4.93584 6.83788 4.20543 5.93688 4.20543C5.03588 4.20543 4.30547 4.93584 4.30547 5.83684Z" fill="white"/><path class="cr-color" d="M5.20496 2.80001C5.20496 2.68955 5.2945 2.60001 5.40496 2.60001H6.32337C6.43383 2.60001 6.52337 2.68955 6.52337 2.80001V3.91842H5.20496V2.80001Z" fill="white"/><path class="cr-color" d="M3.24872 4.39732C3.16414 4.32627 3.15318 4.20012 3.22423 4.11554L3.81498 3.41234C3.88603 3.32776 4.01219 3.3168 4.09676 3.38785L4.9531 4.10725L4.10505 5.11672L3.24872 4.39732Z" fill="white"/><path class="cr-color" d="M8.57404 7.56004C8.65861 7.63109 8.66958 7.75725 8.59853 7.84182L8.00777 8.54503C7.93672 8.6296 7.81057 8.64057 7.72599 8.56952L6.76648 7.76344L7.61452 6.75397L8.57404 7.56004Z" fill="white"/><path class="cr-color" d="M7.94695 3.38114C8.0345 3.31379 8.16007 3.33016 8.22742 3.4177L8.78745 4.14562C8.8548 4.23316 8.83843 4.35873 8.75089 4.42609L7.86445 5.10806L7.06052 4.06312L7.94695 3.38114Z" fill="white"/><path class="cr-color" d="M5.20496 7.87366H6.52337V8.99207C6.52337 9.10253 6.43383 9.19207 6.32337 9.19207H5.40496C5.2945 9.19207 5.20496 9.10253 5.20496 8.99207V7.87366Z" fill="white"/><path class="cr-color" d="M7.8418 6.55521L7.84482 5.23679L8.96323 5.23936C9.07369 5.23961 9.16303 5.32936 9.16278 5.43982L9.16067 6.35823C9.16041 6.46869 9.07067 6.55803 8.96021 6.55777L7.8418 6.55521Z" fill="white"/><path class="cr-color" d="M4.02136 5.24139L4.01834 6.55981L2.89992 6.55724C2.78947 6.55699 2.70013 6.46724 2.70038 6.35678L2.70249 5.43837C2.70274 5.32791 2.79249 5.23857 2.90295 5.23883L4.02136 5.24139Z" fill="white"/><path class="cr-color" d="M4.31238 6.50336L5.19179 7.48563L4.09281 8.46953C4.01051 8.5432 3.88407 8.53622 3.8104 8.45392L3.19779 7.76967C3.12412 7.68737 3.1311 7.56093 3.2134 7.48725L4.31238 6.50336Z" fill="white"/></svg>',
            //   active: false,
            //   show: (this.is_staff || this.is_branch_admin || this.is_admin || (!this.is_faculty && !this.is_back_office)),
            //   children:
            //     [
            //       {
            //         path: this.setUrl(URLConstants.LIST_EVENT),
            //         title: 'Event Type',
            //         type: 'link',
            //         active: false,
            //         show: (this.is_staff || this.is_branch_admin || this.is_admin || (!this.is_faculty && !this.is_back_office))
            //       }
            //     ]
            // },
          ]
      },
      ...moduleName.find(item => item == 'event_gallery') && {
        title: 'Event Gallery',
        svgPath: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_261_742)"><path d="M11.248 -0.0368042C11.5868 -0.0368042 11.8622 0.238672 11.8623 0.577454V0.891907H12.6406C14.2592 0.892152 15.5724 2.20514 15.5742 3.82355V13.1038C15.5742 14.7241 14.2609 16.0381 12.6406 16.0384H3.36035C1.73991 16.0384 0.425781 14.7243 0.425781 13.1038V3.8255C0.425828 2.2051 1.73994 0.891907 3.36035 0.891907H4.1377V0.577454C4.13777 0.238745 4.41326 -0.0366859 4.75195 -0.0368042C5.09075 -0.0368042 5.36614 0.238672 5.36621 0.577454V0.891907H10.6338V0.577454C10.6339 0.238713 10.9093 -0.0367363 11.248 -0.0368042ZM1.6543 13.1019L1.66309 13.2767C1.75172 14.1361 2.47795 14.8065 3.36035 14.8079H12.6387L12.8125 14.7991C13.6718 14.7107 14.343 13.9851 14.3447 13.1028V5.83038H1.6543V13.1019ZM8 7.38605C8.33884 7.38605 8.61426 7.66146 8.61426 8.00031V9.70636H10.3203C10.659 9.70644 10.9344 9.981 10.9346 10.3196C10.9346 10.6584 10.6591 10.9338 10.3203 10.9339H8.61426V12.64C8.61426 12.9788 8.33884 13.2542 8 13.2542C7.66124 13.2541 7.38574 12.9787 7.38574 12.64V10.9339H5.67969C5.34107 10.9336 5.06641 10.6583 5.06641 10.3196C5.06659 9.98112 5.34118 9.70662 5.67969 9.70636H7.38574V8.00031C7.38574 7.66152 7.66124 7.38614 8 7.38605ZM3.1875 2.12726C2.3281 2.21591 1.65763 2.9421 1.65625 3.82452V4.60187H14.3457V3.82452L14.3369 3.64972C14.2542 2.8477 13.6165 2.20999 12.8145 2.12726L12.6396 2.11847H11.8623V2.43195C11.8623 2.77079 11.5869 3.0462 11.248 3.0462C10.9093 3.04614 10.6338 2.77075 10.6338 2.43195V2.11847H5.36816V2.43195C5.36816 2.77074 5.09269 3.04613 4.75391 3.0462C4.41506 3.0462 4.13965 2.77079 4.13965 2.43195V2.11847H3.3623L3.1875 2.12726Z" stroke="white" stroke-width="0.3"/></g><defs><clipPath id="clip0_261_742"><rect width="16" height="16"/></clipPath></defs></svg>',
        type: 'sub',
        active: false,
        show: this.hasModule('administrator_event_gallary'),
        children: [
          {
            title: 'Event Gallery',
            path: this.setUrl(URLConstants.EVENT_GALLERY_LIST),
            type: 'link',
            active: false,
            show: true,
            svgPath: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 1.97998H11.75V3.45998C11.75 3.73498 11.525 3.95998 11.25 3.95998C10.975 3.95998 10.75 3.73498 10.75 3.45998V1.97998H5.25V3.45998C5.25 3.73498 5.025 3.95998 4.75 3.95998C4.475 3.95998 4.25 3.73498 4.25 3.45998V1.97998H3.5C2.12 1.97998 1 3.09998 1 4.47998V4.98498H15V4.47998C15 3.09998 13.88 1.97998 12.5 1.97998ZM6.38 10.18C6.645 10.44 6.765 10.81 6.705 11.175L6.565 11.995C6.555 12.055 6.585 12.095 6.615 12.115C6.64 12.135 6.685 12.15 6.745 12.125L7.475 11.735C7.63733 11.6512 7.81734 11.6075 8 11.6075C8.18266 11.6075 8.36267 11.6512 8.525 11.735L9.255 12.125C9.31 12.15 9.36 12.135 9.385 12.115C9.415 12.095 9.445 12.055 9.435 11.995L9.295 11.175C9.235 10.81 9.355 10.44 9.62 10.18L10.21 9.60498C10.255 9.55998 10.255 9.50998 10.245 9.47498C10.23 9.44498 10.205 9.39998 10.145 9.39498L9.325 9.27498C8.955 9.21998 8.64 8.98998 8.475 8.65998L8.11 7.91498C8.085 7.85998 8.035 7.84498 8 7.84498C7.965 7.84498 7.915 7.85998 7.89 7.91498L7.525 8.65998C7.36 8.98998 7.045 9.21998 6.675 9.27498L5.855 9.39498C5.795 9.39998 5.77 9.44498 5.755 9.47498C5.745 9.50998 5.745 9.55998 5.79 9.60498L6.38 10.18Z"/><path d="M1 12.5C1 13.88 2.12 15 3.5 15H12.5C13.88 15 15 13.88 15 12.5V5.985H1V12.5ZM4.805 9.165C4.94 8.76 5.285 8.465 5.71 8.405L6.535 8.285C6.575 8.28 6.61 8.255 6.625 8.215L6.995 7.475C7.185 7.085 7.57 6.845 8 6.845C8.43 6.845 8.815 7.085 9.005 7.475L9.375 8.215C9.39 8.255 9.425 8.28 9.465 8.285L10.29 8.405C10.715 8.465 11.06 8.76 11.195 9.165C11.325 9.575 11.22 10.02 10.91 10.32L10.315 10.895C10.285 10.925 10.275 10.965 10.28 11.005L10.42 11.825C10.495 12.25 10.325 12.67 9.975 12.925C9.625 13.175 9.175 13.21 8.79 13.01L8.055 12.62C8.03762 12.6126 8.01891 12.6087 8 12.6087C7.98109 12.6087 7.96239 12.6126 7.945 12.62L7.21 13.01C7.045 13.095 6.865 13.14 6.685 13.14C6.455 13.14 6.225 13.065 6.025 12.925C5.675 12.67 5.505 12.25 5.58 11.825L5.72 11.005C5.725 10.965 5.715 10.925 5.685 10.9L5.09 10.32C4.9393 10.1734 4.83272 9.9874 4.78234 9.78325C4.73197 9.5791 4.73982 9.36492 4.805 9.165ZM5.25 1.5C5.25 1.225 5.025 1 4.75 1C4.475 1 4.25 1.225 4.25 1.5V1.98H5.25V1.5ZM11.75 1.5C11.75 1.225 11.525 1 11.25 1C10.975 1 10.75 1.225 10.75 1.5V1.98H11.75V1.5Z"/></svg>'
          },
          {
            title:'Setting',
            type: 'sub', 
            active: false ,
            show: (this.hasModule('settings_system_settings')  ),
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z" /><path class="cr-color" d="M8.57371 5.83684C8.57371 7.29312 7.39316 8.47367 5.93688 8.47367C4.4806 8.47367 3.30005 7.29312 3.30005 5.83684C3.30005 4.38056 4.4806 3.20001 5.93688 3.20001C7.39316 3.20001 8.57371 4.38056 8.57371 5.83684ZM4.30547 5.83684C4.30547 6.73785 5.03588 7.46825 5.93688 7.46825C6.83788 7.46825 7.56829 6.73785 7.56829 5.83684C7.56829 4.93584 6.83788 4.20543 5.93688 4.20543C5.03588 4.20543 4.30547 4.93584 4.30547 5.83684Z" fill="white"/><path class="cr-color" d="M5.20496 2.80001C5.20496 2.68955 5.2945 2.60001 5.40496 2.60001H6.32337C6.43383 2.60001 6.52337 2.68955 6.52337 2.80001V3.91842H5.20496V2.80001Z" fill="white"/><path class="cr-color" d="M3.24872 4.39732C3.16414 4.32627 3.15318 4.20012 3.22423 4.11554L3.81498 3.41234C3.88603 3.32776 4.01219 3.3168 4.09676 3.38785L4.9531 4.10725L4.10505 5.11672L3.24872 4.39732Z" fill="white"/><path class="cr-color" d="M8.57404 7.56004C8.65861 7.63109 8.66958 7.75725 8.59853 7.84182L8.00777 8.54503C7.93672 8.6296 7.81057 8.64057 7.72599 8.56952L6.76648 7.76344L7.61452 6.75397L8.57404 7.56004Z" fill="white"/><path class="cr-color" d="M7.94695 3.38114C8.0345 3.31379 8.16007 3.33016 8.22742 3.4177L8.78745 4.14562C8.8548 4.23316 8.83843 4.35873 8.75089 4.42609L7.86445 5.10806L7.06052 4.06312L7.94695 3.38114Z" fill="white"/><path class="cr-color" d="M5.20496 7.87366H6.52337V8.99207C6.52337 9.10253 6.43383 9.19207 6.32337 9.19207H5.40496C5.2945 9.19207 5.20496 9.10253 5.20496 8.99207V7.87366Z" fill="white"/><path class="cr-color" d="M7.8418 6.55521L7.84482 5.23679L8.96323 5.23936C9.07369 5.23961 9.16303 5.32936 9.16278 5.43982L9.16067 6.35823C9.16041 6.46869 9.07067 6.55803 8.96021 6.55777L7.8418 6.55521Z" fill="white"/><path class="cr-color" d="M4.02136 5.24139L4.01834 6.55981L2.89992 6.55724C2.78947 6.55699 2.70013 6.46724 2.70038 6.35678L2.70249 5.43837C2.70274 5.32791 2.79249 5.23857 2.90295 5.23883L4.02136 5.24139Z" fill="white"/><path class="cr-color" d="M4.31238 6.50336L5.19179 7.48563L4.09281 8.46953C4.01051 8.5432 3.88407 8.53622 3.8104 8.45392L3.19779 7.76967C3.12412 7.68737 3.1311 7.56093 3.2134 7.48725L4.31238 6.50336Z" fill="white"/></svg>',
            children:
            [
              {
                title: 'General Settings',
                type: 'link',
                path: this.setUrl(URLConstants.SYSTEM_SETTING+"/1"),
                show: this.hasPermission('settings_system_settings'),
                active: false
              }
            ]
          }          
        ]
      },
      ...moduleName.find(item => item == 'document_management') && {
        title: 'Document Management',
        type: 'sub',
        active: false,
        svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_183_1704)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.3 2.723H7.97742C7.75651 2.723 7.57742 2.54392 7.57742 2.323V0H1.82312C1.49175 0 1.22313 0.26863 1.22313 0.600001V11.2C1.22313 11.5314 1.49175 11.8 1.82312 11.8H9.70005C10.0314 11.8 10.3 11.5314 10.3 11.2V2.723ZM8.48511 4.85605C8.48511 4.6806 8.34287 4.53836 8.16742 4.53836H3.35665C3.18119 4.53836 3.03895 4.6806 3.03895 4.85605C3.03895 5.03151 3.18119 5.17375 3.35665 5.17375H8.16742C8.34287 5.17375 8.48511 5.03151 8.48511 4.85605ZM5.71895 3C5.89568 3 6.03895 3.14327 6.03895 3.32C6.03895 3.49673 5.89569 3.64 5.71895 3.64H3.35895C3.18222 3.64 3.03895 3.49673 3.03895 3.32C3.03895 3.14327 3.18222 3 3.35895 3H5.71895ZM8.48512 6.67146C8.48512 6.49601 8.34288 6.35377 8.16742 6.35377H3.35666C3.1812 6.35377 3.03896 6.49601 3.03896 6.67146C3.03896 6.84692 3.1812 6.98916 3.35666 6.98916H8.16742C8.34288 6.98916 8.48512 6.84692 8.48512 6.67146ZM8.16742 8.16918C8.34288 8.16918 8.48512 8.31141 8.48512 8.48687C8.48512 8.66232 8.34288 8.80456 8.16742 8.80456H3.35666C3.1812 8.80456 3.03896 8.66232 3.03896 8.48687C3.03896 8.31141 3.1812 8.16918 3.35666 8.16918H8.16742Z" fill="white"/><path d="M8.03081 2.26921V0.453827L9.84619 2.26921H8.03081Z" fill="white"/></g><defs><clipPath id="clip0_183_1704"><rect width="12" height="12" fill="white"/></clipPath></defs></svg>',
        show: this.getInstituteModule('Document Manager') && (this.hasModule('administrator_document_manager') ),
        children: [
          {
            path: this.setUrl(URLConstants.DOCUMENT_MANAGER),
            title: 'Document Manager',
            type: 'link',
            svgPath: '<svg width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.59951 2.99985H0V12.4C0 12.7314 0.268629 13 0.6 13H9.4C9.73137 13 10 12.7314 10 12.4V0.600001C10 0.26863 9.73137 0 9.4 0H2.99951V2.59985C2.99951 2.82076 2.82043 2.99985 2.59951 2.99985ZM2.34951 4.99985C2.15621 4.99985 1.99951 5.15655 1.99951 5.34985C1.99951 5.54315 2.15621 5.69985 2.34951 5.69985H7.64951C7.84281 5.69985 7.99951 5.54315 7.99951 5.34985C7.99951 5.15655 7.84281 4.99985 7.64951 4.99985H2.34951ZM1.99951 7.34985C1.99951 7.15655 2.15621 6.99985 2.34951 6.99985H7.64951C7.84281 6.99985 7.99951 7.15655 7.99951 7.34985C7.99951 7.54315 7.84281 7.69985 7.64951 7.69985H2.34951C2.15621 7.69985 1.99951 7.54315 1.99951 7.34985ZM2.34951 8.99985C2.15621 8.99985 1.99951 9.15655 1.99951 9.34985C1.99951 9.54315 2.15621 9.69985 2.34951 9.69985H7.64951C7.84281 9.69985 7.99951 9.54315 7.99951 9.34985C7.99951 9.15655 7.84281 8.99985 7.64951 8.99985H2.34951Z"/><path d="M2.5 2.5V0.5L0.5 2.5H2.5Z"/></svg>',
            active: false,
            show: this.hasModule('administrator_document_manager')

          },
          {
            path: this.setUrl(URLConstants.DOCUMENT_ADD),
            title: 'Add Document',
            type: 'link',
            svgPath: '<svg width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.00863 1.82393L8.824 1.81536L7.00007 0.00856753L7.00863 1.82393Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 12.5C8.88071 12.5 10 11.3807 10 10C10 8.61929 8.88071 7.5 7.5 7.5C6.11929 7.5 5 8.61929 5 10C5 11.3807 6.11929 12.5 7.5 12.5ZM7.32884 10.0182V10.5818H7.71023V10.0182H8.27379V9.6368H7.71023V9.07324H7.32884V9.6368H6.76527V10.0182H7.32884Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.02906 0L6.04973 2.09953C6.0519 2.32044 6.23274 2.49775 6.45364 2.49558L9.07692 2.46976V7.42398C8.62708 7.15475 8.10084 7 7.53845 7C5.8816 7 4.53845 8.34315 4.53845 10C4.53845 10.6754 4.76162 11.2986 5.13823 11.8H0.6C0.268629 11.8 0 11.5314 0 11.2V0.6C0 0.268629 0.268629 0 0.6 0H6.02906ZM1 3.31769C1 3.14224 1.14224 3 1.31769 3H6.12846C6.30392 3 6.44615 3.14224 6.44615 3.31769C6.44615 3.49315 6.30392 3.63538 6.12846 3.63538H1.31769C1.14224 3.63538 1 3.49315 1 3.31769ZM1.31769 4.81537C1.14224 4.81537 1 4.9576 1 5.13306C1 5.30852 1.14224 5.45075 1.31769 5.45075H6.12846C6.30392 5.45075 6.44615 5.30852 6.44615 5.13306C6.44615 4.9576 6.30392 4.81537 6.12846 4.81537H1.31769ZM1 6.78161C1 6.60488 1.14327 6.46161 1.32 6.46161H3.68C3.85673 6.46161 4 6.60488 4 6.78161C4 6.95834 3.85673 7.10161 3.68 7.10161H1.32C1.14327 7.10161 1 6.95834 1 6.78161Z"/></svg>',
            active: false,
            show: this.hasPermission('administrator_document_manager', 'has_create')
          }
        ]
      },
      ...moduleName.find(item => item == 'meal_management') && {
        title: 'Meal Management',
        type: 'sub',
        active: false,
        svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.25 6.75C11.25 5.35761 10.6969 4.02226 9.71231 3.03769C8.72775 2.05312 7.39239 1.5 6 1.5C4.60761 1.5 3.27226 2.05312 2.28769 3.03769C1.30312 4.02225 0.75 5.35761 0.75 6.75L6 6.75H11.25Z" /><path d="M0 7.5H12C12 8.24558 11.3956 8.85 10.65 8.85H1.35C0.604415 8.85 0 8.24558 0 7.5Z" /><path d="M7.5 1.5C7.5 2.32843 6.82843 3 6 3C5.17157 3 4.5 2.32843 4.5 1.5C4.5 0.671573 5.17157 0 6 0C6.82843 0 7.5 0.671573 7.5 1.5ZM5.29327 1.5C5.29327 1.89032 5.60968 2.20673 6 2.20673C6.39032 2.20673 6.70673 1.89032 6.70673 1.5C6.70673 1.10968 6.39032 0.793266 6 0.793266C5.60968 0.793266 5.29327 1.10968 5.29327 1.5Z" /></svg>',
        show: (this.getInstituteModule('Meal') && this.hasModule('administrator_meal') || this.hasModule('administrator_date_wise_meal')),
        children: [
          {
            path: this.setUrl(URLConstants.MEALS_LIST),
            title: 'Meal list',
            type: 'link',
            svgPath: '<svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 0C0.895431 0 0 0.89543 0 2V11C0 12.1046 0.895431 13 2 13H9C10.1046 13 11 12.1046 11 11V2C11 0.895431 10.1046 0 9 0H2ZM7.45613 3.51884C7.94841 4.01113 8.22498 4.67881 8.22498 5.375H5.59998L2.97498 5.375C2.97498 4.67881 3.25154 4.01113 3.74382 3.51884C4.2361 3.02656 4.90378 2.75 5.59998 2.75C6.29617 2.75 6.96385 3.02656 7.45613 3.51884ZM8.59998 5.75C8.59998 6.12279 8.29777 6.425 7.92498 6.425H3.27498C2.90218 6.425 2.59998 6.12279 2.59998 5.75H8.59998ZM6.30673 2.49901C6.34101 2.59553 6.35515 2.69805 6.34829 2.80024L5.95255 2.77367C5.95578 2.72552 5.94912 2.67722 5.93297 2.63174C5.91682 2.58627 5.89152 2.54458 5.85865 2.50926C5.82577 2.47393 5.786 2.44571 5.7418 2.42634C5.6976 2.40697 5.6499 2.39686 5.60164 2.39664C5.55339 2.39641 5.50559 2.40607 5.46121 2.42502C5.41683 2.44397 5.3768 2.47181 5.34359 2.50682C5.31038 2.54184 5.28469 2.58328 5.26811 2.62861C5.25154 2.67393 5.24442 2.72216 5.24719 2.77034L4.85122 2.79318C4.84532 2.69092 4.86043 2.58854 4.89562 2.49235C4.93081 2.39616 4.98532 2.30819 5.05581 2.23388C5.1263 2.15956 5.21126 2.10047 5.30546 2.06025C5.39965 2.02003 5.50109 1.99952 5.60352 2.00001C5.70594 2.00049 5.80718 2.02195 5.90099 2.06306C5.99481 2.10417 6.07921 2.16406 6.14899 2.23904C6.21877 2.31401 6.27245 2.40249 6.30673 2.49901ZM2 8.5C2 8.22386 2.22386 8 2.5 8H8.5C8.77614 8 9 8.22386 9 8.5C9 8.77614 8.77614 9 8.5 9H2.5C2.22386 9 2 8.77614 2 8.5ZM2.5 10C2.22386 10 2 10.2239 2 10.5C2 10.7761 2.22386 11 2.5 11H8.5C8.77614 11 9 10.7761 9 10.5C9 10.2239 8.77614 10 8.5 10H2.5Z"/></svg>',
            active: false,
            show: (this.getInstituteModule('Meal') && this.hasPermission('administrator_meal'))
          },
          {
            path: this.setUrl(URLConstants.MEALS_CREATE),
            title: 'Add Meal',
            type: 'link',
            svgPath: '<svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2C0 0.89543 0.895431 0 2 0H9C10.1046 0 11 0.895431 11 2V11C11 12.1046 10.1046 13 9 13H2C0.895431 13 0 12.1046 0 11V2ZM8.22498 5.375C8.22498 4.67881 7.94841 4.01113 7.45613 3.51884C6.96385 3.02656 6.29617 2.75 5.59998 2.75C4.90378 2.75 4.2361 3.02656 3.74382 3.51884C3.25154 4.01113 2.97498 4.67881 2.97498 5.375L5.59998 5.375H8.22498ZM7.92498 6.425C8.29777 6.425 8.59998 6.12279 8.59998 5.75H2.59998C2.59998 6.12279 2.90218 6.425 3.27498 6.425H7.92498ZM6.34829 2.80024C6.35515 2.69805 6.34101 2.59553 6.30673 2.49901C6.27245 2.40249 6.21877 2.31401 6.14899 2.23904C6.07921 2.16406 5.99481 2.10417 5.90099 2.06306C5.80718 2.02195 5.70594 2.00049 5.60352 2.00001C5.50109 1.99952 5.39965 2.02003 5.30546 2.06025C5.21126 2.10047 5.1263 2.15956 5.05581 2.23388C4.98532 2.30819 4.93081 2.39616 4.89562 2.49235C4.86043 2.58854 4.84532 2.69092 4.85122 2.79318L5.24719 2.77034C5.24442 2.72216 5.25154 2.67393 5.26811 2.62861C5.28469 2.58328 5.31038 2.54184 5.34359 2.50682C5.3768 2.47181 5.41683 2.44397 5.46121 2.42502C5.50559 2.40607 5.55339 2.39641 5.60164 2.39664C5.6499 2.39686 5.6976 2.40697 5.7418 2.42634C5.786 2.44571 5.82577 2.47393 5.85865 2.50926C5.89152 2.54458 5.91682 2.58627 5.93297 2.63174C5.94912 2.67722 5.95578 2.72552 5.95255 2.77367L6.34829 2.80024ZM5.5 11C6.60457 11 7.5 10.1046 7.5 9C7.5 7.89543 6.60457 7 5.5 7C4.39543 7 3.5 7.89543 3.5 9C3.5 10.1046 4.39543 11 5.5 11Z"/><path d="M5.34162 9.67108V8.19665H5.67614V9.67108H5.34162ZM4.77166 9.10112V8.76661H6.24609V9.10112H4.77166Z"/></svg>',
            active: false,
            show: (this.getInstituteModule('Meal') && this.hasPermission('administrator_meal', 'has_create'))
          },
          {
            path: this.setUrl(URLConstants.DATE_WISE_MEALS_LIST),
            title: 'Datewise meal',
            type: 'link',
            svgPath: '<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 0.5C3 0.223858 3.22386 0 3.5 0C3.77614 0 4 0.223858 4 0.5V3H3V0.5Z"/><path d="M7 0.5C7 0.223858 7.22386 0 7.5 0C7.77614 0 8 0.223858 8 0.5V3H7V0.5Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M0 4C0 2.89543 0.895431 2 2 2H9C10.1046 2 11 2.89543 11 4V5H0V4ZM0 6H11V8.17071C10.6872 8.06015 10.3506 8 10 8C8.34315 8 7 9.34315 7 11C7 11.3506 7.06015 11.6872 7.17071 12H2C0.895431 12 0 11.1046 0 10V6Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 13C11.1046 13 12 12.1046 12 11C12 9.89543 11.1046 9 10 9C8.89543 9 8 9.89543 8 11C8 12.1046 8.89543 13 10 13ZM10.6187 10.7063C10.7828 10.8704 10.875 11.0929 10.875 11.325H10L9.125 11.325C9.125 11.0929 9.21719 10.8704 9.38128 10.7063C9.4856 10.602 9.61354 10.5267 9.75253 10.4857C9.75086 10.4741 9.75 10.4621 9.75 10.45C9.75 10.3119 9.86193 10.2 10 10.2C10.1381 10.2 10.25 10.3119 10.25 10.45C10.25 10.4621 10.2491 10.4741 10.2475 10.4857C10.3865 10.5267 10.5144 10.602 10.6187 10.7063ZM10.1175 10.4579C10.1177 10.4553 10.1178 10.4527 10.1178 10.45C10.1178 10.385 10.0651 10.3322 10 10.3322C9.93495 10.3322 9.88221 10.385 9.88221 10.45C9.88221 10.4527 9.8823 10.4553 9.88247 10.4579C9.92121 10.4527 9.96047 10.45 10 10.45C10.0395 10.45 10.0788 10.4527 10.1175 10.4579ZM11 11.45C11 11.5743 10.8993 11.675 10.775 11.675H9.225C9.10074 11.675 9 11.5743 9 11.45H11Z"/></svg>',
            active: false,
            show: (this.getInstituteModule('Meal') && this.hasPermission('administrator_date_wise_meal')),
          },
          {
            path: this.setUrl(URLConstants.DATE_WISE_MEALS_CREATE),
            title: 'Add Datewise meal',
            type: 'link',
            svgPath: '<svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.963 4.52745C11.5517 4.82477 11.0463 5 10.5 5C9.11929 5 8 3.88071 8 2.5C8 2.32877 8.01721 2.16155 8.05001 2H3C1.34315 2 0 3.34315 0 5V11C0 12.6569 1.34315 14 3 14H9C10.6569 14 12 12.6569 12 11V5C12 4.83922 11.9873 4.68139 11.963 4.52745ZM4 6.5C4 6.22386 4.22386 6 4.5 6H9.5C9.77614 6 10 6.22386 10 6.5C10 6.77614 9.77614 7 9.5 7H4.5C4.22386 7 4 6.77614 4 6.5ZM4.5 9C4.22386 9 4 9.22386 4 9.5C4 9.77614 4.22386 10 4.5 10H9.5C9.77614 10 10 9.77614 10 9.5C10 9.22386 9.77614 9 9.5 9H4.5ZM4 12.5C4 12.2239 4.22386 12 4.5 12H9.5C9.77614 12 10 12.2239 10 12.5C10 12.7761 9.77614 13 9.5 13H4.5C4.22386 13 4 12.7761 4 12.5ZM2.5 6C2.22386 6 2 6.22386 2 6.5C2 6.77614 2.22386 7 2.5 7C2.77614 7 3 6.77614 3 6.5C3 6.22386 2.77614 6 2.5 6ZM2 9.5C2 9.22386 2.22386 9 2.5 9C2.77614 9 3 9.22386 3 9.5C3 9.77614 2.77614 10 2.5 10C2.22386 10 2 9.77614 2 9.5ZM2.5 12C2.22386 12 2 12.2239 2 12.5C2 12.7761 2.22386 13 2.5 13C2.77614 13 3 12.7761 3 12.5C3 12.2239 2.77614 12 2.5 12Z"/><path d="M10.1051 3.84233V1.83097H10.6136V3.84233H10.1051ZM9.35369 3.09091V2.58239H11.3651V3.09091H9.35369Z"/></svg>',
            active: false,
            show: (this.getInstituteModule('Meal') && this.hasPermission('administrator_date_wise_meal', 'has_create'))
          }
        ]
      },
      ...moduleName.find(item => item == 'timetable') && {
        title: 'Timetable',
        type: 'sub',
        active: false,
        svgPath:'<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 0.5C3 0.223858 3.22386 0 3.5 0C3.77614 0 4 0.223858 4 0.5V3H3V0.5Z" fill="white"/><path d="M7 0.5C7 0.223858 7.22386 0 7.5 0C7.77614 0 8 0.223858 8 0.5V3H7V0.5Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M0 4C0 2.89543 0.895431 2 2 2H9C10.1046 2 11 2.89543 11 4V5H0V4ZM0 6H11V8.17071C10.6872 8.06015 10.3506 8 10 8C8.34315 8 7 9.34315 7 11C7 11.3506 7.06015 11.6872 7.17071 12H2C0.895431 12 0 11.1046 0 10V6Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 13C11.1046 13 12 12.1046 12 11C12 9.89543 11.1046 9 10 9C8.89543 9 8 9.89543 8 11C8 12.1046 8.89543 13 10 13ZM10.2 10C10.2 9.88954 10.1105 9.8 10 9.8C9.88954 9.8 9.8 9.88954 9.8 10V11V11.0828L9.85858 11.1414L10.3586 11.6414C10.4367 11.7195 10.5633 11.7195 10.6414 11.6414C10.7195 11.5633 10.7195 11.4367 10.6414 11.3586L10.2 10.9172V10Z" fill="white"/></svg>',
        show: (((this.getInstituteModule('Administrator')) || (this.getInstituteModule('Settings')))&& ((this.hasModule('administrator_timetable') || this.hasModule('administrator_subject_lecture') || this.hasModule('administrator_subject_faculty')  || this.hasModule('administrator_assign_room')  || this.hasModule('administrator_extra_lecture') || this.hasModule('settings_system_setting') || this.hasModule('administrator_proxy_lecture') && (this.hasPermission('faculty_faculty','has_access') && this.notification.timetable_module == 1)))),
        children: [
          {
            title:'Timetable Setup',
            type: 'sub',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z"/><path class="cr-color" d="M8.25325 5.84397C8.25325 7.12351 7.21598 8.16078 5.93644 8.16078C4.6569 8.16078 3.61963 7.12351 3.61963 5.84397C3.61963 4.56443 4.6569 3.52716 5.93644 3.52716C7.21598 3.52716 8.25325 4.56443 8.25325 5.84397ZM4.50303 5.84397C4.50303 6.63562 5.14479 7.27738 5.93644 7.27738C6.72809 7.27738 7.36985 6.63562 7.36985 5.84397C7.36985 5.05232 6.72809 4.41056 5.93644 4.41056C5.14479 4.41056 4.50303 5.05232 4.50303 5.84397Z" fill="white"/><path class="cr-color" d="M5.29346 3.2C5.29346 3.08954 5.383 3 5.49346 3H6.25186C6.36232 3 6.45186 3.08954 6.45186 3.2V4.15841H5.29346V3.2Z" fill="white"/><path class="cr-color" d="M3.59308 4.59483C3.5085 4.52378 3.49754 4.39763 3.56859 4.31305L4.05642 3.73236C4.12747 3.64779 4.25362 3.63683 4.3382 3.70787L5.07202 4.32435L4.3269 5.21131L3.59308 4.59483Z" fill="white"/><path class="cr-color" d="M8.23505 7.34242C8.31962 7.41347 8.33059 7.53963 8.25954 7.6242L7.77171 8.20489C7.70066 8.28947 7.5745 8.30043 7.48993 8.22938L6.66545 7.53675L7.41057 6.64979L8.23505 7.34242Z" fill="white"/><path class="cr-color" d="M7.68328 3.70112C7.77083 3.63376 7.8964 3.65013 7.96375 3.73768L8.4262 4.33877C8.49356 4.42632 8.47719 4.55189 8.38964 4.61924L7.63003 5.20365L6.92367 4.28552L7.68328 3.70112Z" fill="white"/><path class="cr-color" d="M5.29346 7.63367H6.45186V8.59207C6.45186 8.70253 6.36232 8.79207 6.25186 8.79207H5.49346C5.383 8.79207 5.29346 8.70253 5.29346 8.59207V7.63367Z" fill="white"/><path class="cr-color" d="M7.61011 6.47516L7.61277 5.31676L8.57117 5.31896C8.68162 5.31921 8.77096 5.40896 8.77071 5.51941L8.76897 6.27782C8.76872 6.38827 8.67897 6.47761 8.56851 6.47736L7.61011 6.47516Z" fill="white"/><path class="cr-color" d="M4.25342 5.3208L4.25076 6.4792L3.29236 6.477C3.1819 6.47675 3.09256 6.387 3.09282 6.27655L3.09456 5.51814C3.09481 5.40769 3.18456 5.31835 3.29502 5.3186L4.25342 5.3208Z" fill="white"/><path class="cr-color" d="M4.50903 6.42957L5.28171 7.29262L4.3342 8.14092C4.2519 8.2146 4.12546 8.20761 4.05178 8.12532L3.54591 7.56027C3.47223 7.47798 3.47922 7.35154 3.56152 7.27786L4.50903 6.42957Z" fill="white"/><mask id="path-11-inside-1_183_159" fill="white"><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z"/></mask><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-11-inside-1_183_159)"/><mask id="path-12-inside-2_183_159" fill="white"><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z"/></mask><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-12-inside-2_183_159)"/><path class="cr-color" d="M1.97291 4.91572L2.10774 3.75636L3.04436 4.4528L1.97291 4.91572Z" fill="white"/><path  d="M9.9355 7.02695L9.98777 8.19295L8.95184 7.65522L9.9355 7.02695Z" fill="white"/></svg>',
            active: false,
            show:(this.hasModule('administrator_timetable') || this.hasModule('administrator_subject_lecture') || this.hasModule('administrator_subject_faculty')  || this.hasModule('administrator_assign_room')  && (this.notification.timetable_module == 1)),
            children:
            [
              {
                path: this.setUrl(URLConstants.ADD_LECTURE_TIMINGS),
                title: 'Add lecture Timing',
                type: 'link',
                active: false,
                show: (this.hasPermission('administrator_timetable','has_create') )
              },
              { 
                path: this.setUrl(URLConstants.ASSIGN_LECTURE), 
                title: 'Assign Subject Lecture', 
                type: 'link', 
                active: false ,
                show: this.hasPermission('administrator_subject_lecture') && this.notification.timetable_module == 1
              },
              { 
                path: this.setUrl(URLConstants.ASSIGN_SUBJECT), 
                title: 'Assign Subject Faculty', 
                type: 'link', active: false , 
                show: (this.hasPermission('administrator_subject_faculty') && this.hasPermission('faculty_faculty','has_access') && this.notification.timetable_module == 1)
              },
              { 
                path: this.setUrl(URLConstants.ASSIGN_ROOM), 
                title: 'Assign Room', 
                type: 'link', active: false , 
                show: this.hasPermission('administrator_assign_room') && this.notification.timetable_module == 1
              }
            ]
          },
          {
            path: this.setUrl(URLConstants.ADD_TIMETABLE),
            title: 'Create Timetable',
            type: 'link',
            svgPath:'<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 0.5C3 0.223858 3.22386 0 3.5 0C3.77614 0 4 0.223858 4 0.5V3H3V0.5Z"/><path d="M7 0.5C7 0.223858 7.22386 0 7.5 0C7.77614 0 8 0.223858 8 0.5V3H7V0.5Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M0 4C0 2.89543 0.895431 2 2 2H9C10.1046 2 11 2.89543 11 4V5H0V4ZM0 6H11V8.17071C10.6872 8.06015 10.3506 8 10 8C8.34315 8 7 9.34315 7 11C7 11.3506 7.06015 11.6872 7.17071 12H2C0.895431 12 0 11.1046 0 10V6Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 13C11.1046 13 12 12.1046 12 11C12 9.89543 11.1046 9 10 9C8.89543 9 8 9.89543 8 11C8 12.1046 8.89543 13 10 13ZM9.82211 11.1682V11.9281H10.2681V11.1682H11.0281V10.7221H10.2681V9.96219H9.82211V10.7221H9.06217V11.1682H9.82211Z"/></svg>',
            active: false,
            show: (this.hasPermission('administrator_timetable') && this.notification.timetable_module == 1)
          },
          {
            path: this.setUrl(URLConstants.DOWNLOAD_TIMETABLE),
            title: 'Download Timetable',
            type: 'link',
            svgPath:'<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 0.5C3 0.223858 3.22386 0 3.5 0C3.77614 0 4 0.223858 4 0.5V3H3V0.5Z"/><path d="M7 0.5C7 0.223858 7.22386 0 7.5 0C7.77614 0 8 0.223858 8 0.5V3H7V0.5Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M0 4C0 2.89543 0.895431 2 2 2H9C10.1046 2 11 2.89543 11 4V5H0V4ZM0 6H11V8.17071C10.6872 8.06015 10.3506 8 10 8C8.34315 8 7 9.34315 7 11C7 11.3506 7.06015 11.6872 7.17071 12H2C0.895431 12 0 11.1046 0 10V6Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 11C12 12.1046 11.1046 13 10 13C8.89543 13 8 12.1046 8 11C8 9.89543 8.89543 9 10 9C11.1046 9 12 9.89543 12 11ZM9 10.9C9.05523 10.9 9.1 10.9448 9.1 11V11.8C9.1 11.8552 9.14477 11.9 9.2 11.9H10.8C10.8552 11.9 10.9 11.8552 10.9 11.8V11C10.9 10.9448 10.9448 10.9 11 10.9C11.0552 10.9 11.1 10.9448 11.1 11V11.8C11.1 11.9657 10.9657 12.1 10.8 12.1H9.2C9.03431 12.1 8.9 11.9657 8.9 11.8V11C8.9 10.9448 8.94477 10.9 9 10.9ZM10.1 9.5C10.1 9.44477 10.0552 9.4 10 9.4C9.94477 9.4 9.9 9.44477 9.9 9.5V10.7586L9.57071 10.4293C9.53166 10.3902 9.46834 10.3902 9.42929 10.4293C9.39024 10.4683 9.39024 10.5317 9.42929 10.5707L9.92929 11.0707L10 11.1414L10.0707 11.0707L10.5707 10.5707C10.6098 10.5317 10.6098 10.4683 10.5707 10.4293C10.5317 10.3902 10.4683 10.3902 10.4293 10.4293L10.1 10.7586V9.5Z"/></svg>',
            active: false,
            show: (this.hasPermission('administrator_timetable', 'has_download') && this.notification.timetable_module == 1)
          },
          { 
            path: this.setUrl(URLConstants.PROXY_TEACHERS_TIMETABLE), 
            title: 'Add Proxy Lecture', 
            type: 'link', 
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9C12 10.6569 10.6569 12 9 12C7.34315 12 6 10.6569 6 9C6 7.34315 7.34315 6 9 6C10.6569 6 12 7.34315 12 9ZM6.42804 9C6.42804 10.4205 7.57954 11.572 9 11.572C10.4205 11.572 11.572 10.4205 11.572 9C11.572 7.57954 10.4205 6.42804 9 6.42804C7.57954 6.42804 6.42804 7.57954 6.42804 9Z"/><circle cx="5" cy="3" r="3"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2 6H2.76389C3.31321 6.61375 4.1115 7 5 7C5.8885 7 6.68679 6.61375 7.23611 6H8C8.15428 6 8.30449 6.01747 8.44874 6.05054C7.05519 6.30936 6 7.53146 6 9C6 9.76835 6.28885 10.4692 6.76389 11H2C0.89543 11 0 10.1046 0 9V8C0 6.89543 0.895431 6 2 6Z"/><path d="M8.9027 10.2852V7.82777H9.46023V10.2852H8.9027ZM7.95277 9.33523V8.7777H10.4102V9.33523H7.95277Z"/></svg>',
            active: false , 
            show: this.hasPermission('administrator_proxy_lecture') && this.notification.timetable_module == 1
          },
          { 
            path: this.setUrl(URLConstants.PROXY_TIMETABLE_LIST), 
            title: 'Proxy Teacher Timetable List', 
            type: 'link', 
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9C12 10.6569 10.6569 12 9 12C7.34315 12 6 10.6569 6 9C6 7.34315 7.34315 6 9 6C10.6569 6 12 7.34315 12 9ZM6.42804 9C6.42804 10.4205 7.57954 11.572 9 11.572C10.4205 11.572 11.572 10.4205 11.572 9C11.572 7.57954 10.4205 6.42804 9 6.42804C7.57954 6.42804 6.42804 7.57954 6.42804 9Z"/><circle cx="5" cy="3" r="3"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2 6H2.76389C3.31321 6.61375 4.1115 7 5 7C5.8885 7 6.68679 6.61375 7.23611 6H8C8.15428 6 8.30449 6.01747 8.44874 6.05054C7.05519 6.30936 6 7.53146 6 9C6 9.76835 6.28885 10.4692 6.76389 11H2C0.89543 11 0 10.1046 0 9V8C0 6.89543 0.895431 6 2 6Z"/><path d="M8 7.5H10.5V8H8V7.5Z"/><path d="M8 8.75H10.5V9.25H8V8.75Z"/><path d="M8 10H10.5V10.5H8V10Z"/></svg>',
            active: false , 
            show: this.hasPermission('administrator_proxy_lecture') && this.notification.timetable_module == 1
          },
          { 
            path: this.setUrl(URLConstants.ADD_EXTRA_LECTURE), 
            title: 'Add Extra Lecture', 
            type: 'link', 
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_183_1006)"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.53112 4.24042C4.06089 4.3908 3.63332 4.60744 3.27167 4.87868C2.90024 5.15726 2.6056 5.48797 2.40458 5.85195C2.20356 6.21593 2.1001 6.60603 2.1001 7L6.1001 7H10.1001C10.1001 6.60603 9.99663 6.21593 9.79562 5.85195C9.5946 5.48797 9.29996 5.15726 8.92852 4.87868C8.56687 4.60744 8.13931 4.3908 7.66907 4.24042C7.30276 4.70314 6.73609 5 6.1001 5C5.4641 5 4.89744 4.70314 4.53112 4.24042Z"/><circle cx="6.1001" cy="2" r="2"/><path d="M10.1764 7.40002H1.82361C1.67493 7.40002 1.57823 7.55649 1.64472 7.68947L2.44472 9.28947C2.4786 9.35722 2.54785 9.40002 2.62361 9.40002H9.37639C9.45215 9.40002 9.5214 9.35722 9.55528 9.28947L10.3553 7.68947C10.4218 7.55649 10.3251 7.40002 10.1764 7.40002Z"/><path d="M3.6001 12.5L3.1001 9H9.1001L8.6001 12.5H3.6001Z"/></g><defs><clipPath id="clip0_183_1006"><rect width="12" height="12" fill="white"/></clipPath></defs></svg>',
            active: false , 
            show: this.hasPermission('administrator_extra_lecture') && this.notification.timetable_module == 1
          }  ,
          { 
            path: this.setUrl(URLConstants.EXTRA_LECTURE_LIST), 
            title: 'Extra Lecture List', 
            type: 'link', 
            svgPath:'<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.7904 0H11.2463C10.0261 0 9.03711 0.989156 9.03711 2.20917V7.40292C9.5945 7.67995 10.1968 7.97953 10.7589 8.25895L11.6189 6.53817C12.1397 5.49755 13.4091 5.07473 14.4494 5.59458C15.4918 6.1163 15.9142 7.38225 15.3924 8.42489L13.8592 11.4919C13.9003 11.899 13.863 12.3101 13.7494 12.7031H14.7616L12.0919 20.0442C11.9335 20.4796 12.2397 20.9877 12.7529 20.9877C13.0398 20.9877 13.3098 20.8107 13.4134 20.5246L16.2577 12.7031H16.7505L19.6237 20.527C19.7283 20.8116 19.9975 20.9877 20.2842 20.9877C20.7637 20.9877 21.1153 20.5088 20.9437 20.0423L18.2485 12.7031H21.7905C23.0105 12.7031 23.9996 11.714 23.9996 10.494V2.20922C23.9996 0.989156 23.0105 0 21.7904 0ZM20.2839 9.69084H17.1291C16.7409 9.69084 16.426 9.37594 16.426 8.98772C16.426 8.59917 16.7409 8.28459 17.1291 8.28459H20.2838C20.6724 8.28459 20.987 8.59917 20.987 8.98772C20.987 9.37594 20.6725 9.69084 20.2839 9.69084ZM20.2839 7.05469H17.1291C16.7409 7.05469 16.426 6.74016 16.426 6.35156C16.426 5.96339 16.7409 5.64844 17.1291 5.64844H20.2838C20.6724 5.64844 20.987 5.96339 20.987 6.35156C20.987 6.74016 20.6725 7.05469 20.2839 7.05469ZM20.2839 4.41891H12.7529C12.3643 4.41891 12.0498 4.10391 12.0498 3.71578C12.0498 3.32766 12.3643 3.01266 12.7529 3.01266H20.2838C20.6724 3.01266 20.987 3.32756 20.987 3.71578C20.987 4.104 20.6724 4.41891 20.2839 4.41891Z"/><path d="M12.3713 12.4015C12.4984 12.0293 12.4975 11.6404 12.3902 11.2855L14.1352 7.79587C14.3088 7.44853 14.1682 7.02614 13.8208 6.85252C13.4737 6.67875 13.0512 6.81956 12.8775 7.16695L11.3892 10.1431C10.4996 9.70017 9.14813 9.02822 8.05941 8.48677C7.04644 7.98305 6.32353 7.53131 5.09016 7.53131H4.46887C5.42925 7.53131 6.28636 7.08928 6.84741 6.3975C7.27552 5.87109 7.5315 5.20017 7.5315 4.46906C7.5315 2.77734 6.16041 1.40625 4.4685 1.40625C2.77734 1.40625 1.40625 2.77734 1.40625 4.46906C1.40625 5.2815 1.72266 6.01978 2.23884 6.56766C2.79694 7.16109 3.58959 7.53131 4.46831 7.5315C3.2902 7.5315 2.13848 8.00883 1.30992 8.83959C0.465234 9.68208 0 10.8045 0 12.0002V14.2596C0 15.2322 0.631547 16.0598 1.50623 16.3543V20.2844C1.50623 20.6728 1.821 20.9875 2.20936 20.9875H6.72802C7.11638 20.9875 7.43114 20.6728 7.43114 20.2844V12.3844C8.09784 12.7177 8.97366 13.1555 9.68227 13.5099C10.179 13.7582 10.7595 13.7805 11.2771 13.57C11.7933 13.3576 12.1912 12.9348 12.3686 12.4098L12.3713 12.4015Z"/></svg>',
            active: false , 
            show: this.hasPermission('administrator_extra_lecture') && this.notification.timetable_module == 1
          }  ,
          {
            title:'Setting',
            type: 'sub', 
            active: false ,
            show: (this.hasModule('settings_system_setting')  ),
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z" /><path class="cr-color" d="M8.57371 5.83684C8.57371 7.29312 7.39316 8.47367 5.93688 8.47367C4.4806 8.47367 3.30005 7.29312 3.30005 5.83684C3.30005 4.38056 4.4806 3.20001 5.93688 3.20001C7.39316 3.20001 8.57371 4.38056 8.57371 5.83684ZM4.30547 5.83684C4.30547 6.73785 5.03588 7.46825 5.93688 7.46825C6.83788 7.46825 7.56829 6.73785 7.56829 5.83684C7.56829 4.93584 6.83788 4.20543 5.93688 4.20543C5.03588 4.20543 4.30547 4.93584 4.30547 5.83684Z" fill="white"/><path class="cr-color" d="M5.20496 2.80001C5.20496 2.68955 5.2945 2.60001 5.40496 2.60001H6.32337C6.43383 2.60001 6.52337 2.68955 6.52337 2.80001V3.91842H5.20496V2.80001Z" fill="white"/><path class="cr-color" d="M3.24872 4.39732C3.16414 4.32627 3.15318 4.20012 3.22423 4.11554L3.81498 3.41234C3.88603 3.32776 4.01219 3.3168 4.09676 3.38785L4.9531 4.10725L4.10505 5.11672L3.24872 4.39732Z" fill="white"/><path class="cr-color" d="M8.57404 7.56004C8.65861 7.63109 8.66958 7.75725 8.59853 7.84182L8.00777 8.54503C7.93672 8.6296 7.81057 8.64057 7.72599 8.56952L6.76648 7.76344L7.61452 6.75397L8.57404 7.56004Z" fill="white"/><path class="cr-color" d="M7.94695 3.38114C8.0345 3.31379 8.16007 3.33016 8.22742 3.4177L8.78745 4.14562C8.8548 4.23316 8.83843 4.35873 8.75089 4.42609L7.86445 5.10806L7.06052 4.06312L7.94695 3.38114Z" fill="white"/><path class="cr-color" d="M5.20496 7.87366H6.52337V8.99207C6.52337 9.10253 6.43383 9.19207 6.32337 9.19207H5.40496C5.2945 9.19207 5.20496 9.10253 5.20496 8.99207V7.87366Z" fill="white"/><path class="cr-color" d="M7.8418 6.55521L7.84482 5.23679L8.96323 5.23936C9.07369 5.23961 9.16303 5.32936 9.16278 5.43982L9.16067 6.35823C9.16041 6.46869 9.07067 6.55803 8.96021 6.55777L7.8418 6.55521Z" fill="white"/><path class="cr-color" d="M4.02136 5.24139L4.01834 6.55981L2.89992 6.55724C2.78947 6.55699 2.70013 6.46724 2.70038 6.35678L2.70249 5.43837C2.70274 5.32791 2.79249 5.23857 2.90295 5.23883L4.02136 5.24139Z" fill="white"/><path class="cr-color" d="M4.31238 6.50336L5.19179 7.48563L4.09281 8.46953C4.01051 8.5432 3.88407 8.53622 3.8104 8.45392L3.19779 7.76967C3.12412 7.68737 3.1311 7.56093 3.2134 7.48725L4.31238 6.50336Z" fill="white"/></svg>',
            children:
            [
              {
                title: 'Timetable Settings',
                type: 'link',
                path: this.setUrl(URLConstants.SYSTEM_SETTING+"/7"),
                show: this.hasPermission('settings_system_setting'),
                active: false
              }
            ]
          }        
        ]
      },
      ...moduleName.find(item => item == 'payroll') && {
        title: 'Payroll',
        icon: 'wallet',
        type: 'sub',
        active: false,
        show: ((this.getInstituteModule('Payroll')) && (this.hasModule('payroll_payroll_management') || this.hasModule('payroll_payslip_list'))),
        children:
          [
            {
              path: this.setUrl(URLConstants.PAYROLL),
              title: 'Payroll Management',
              type: 'link',
              active: false,
              svgPath: '<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 0.5C3 0.223858 3.22386 0 3.5 0C3.77614 0 4 0.223858 4 0.5V3H3V0.5Z" /><path d="M7 0.5C7 0.223858 7.22386 0 7.5 0C7.77614 0 8 0.223858 8 0.5V3H7V0.5Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M0 4C0 2.89543 0.895431 2 2 2H9C10.1046 2 11 2.89543 11 4V5H0V4ZM0 6H11V8.17071C10.6872 8.06015 10.3506 8 10 8C8.34315 8 7 9.34315 7 11C7 11.3506 7.06015 11.6872 7.17071 12H2C0.895431 12 0 11.1046 0 10V6Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M10 13C11.1046 13 12 12.1046 12 11C12 9.89543 11.1046 9 10 9C8.89543 9 8 9.89543 8 11C8 12.1046 8.89543 13 10 13ZM9.89702 12.0307V12.2727H10.0717V12.0306C10.2088 12.0229 10.3281 11.9967 10.4297 11.9521C10.5533 11.8974 10.6477 11.8217 10.7131 11.7251C10.7784 11.6278 10.8111 11.5153 10.8111 11.3874C10.8111 11.293 10.7933 11.2106 10.7578 11.1403C10.7223 11.07 10.674 11.0099 10.6129 10.9602C10.5526 10.9105 10.484 10.8693 10.4073 10.8366C10.3313 10.804 10.2521 10.7781 10.1697 10.7589L10.0717 10.7344V10.1275C10.1521 10.1371 10.22 10.1615 10.2752 10.2006C10.3491 10.2525 10.391 10.3249 10.4009 10.418H10.7812C10.7791 10.2951 10.7447 10.1864 10.6779 10.092C10.6112 9.9968 10.5192 9.92259 10.402 9.86932C10.3052 9.82444 10.1951 9.79822 10.0717 9.79066V9.54545H9.89702V9.79223C9.78322 9.80147 9.67917 9.82716 9.58487 9.86932C9.46413 9.92259 9.36861 9.99751 9.2983 10.0941C9.22869 10.1907 9.19389 10.3033 9.19389 10.4318C9.19389 10.5881 9.24574 10.7134 9.34943 10.8079C9.45384 10.9016 9.59588 10.9716 9.77557 11.0178L9.89702 11.049V11.6908C9.84682 11.6852 9.79994 11.6742 9.75639 11.658C9.69034 11.6332 9.63672 11.5955 9.59553 11.5451C9.55433 11.4947 9.53089 11.4315 9.52521 11.3555H9.13636C9.14205 11.5004 9.17969 11.6232 9.24929 11.7241C9.3196 11.8249 9.4169 11.9016 9.54119 11.9542C9.64452 11.9976 9.76312 12.0231 9.89702 12.0307ZM10.0717 11.69C10.1207 11.684 10.1654 11.673 10.206 11.657C10.2713 11.6307 10.3224 11.5945 10.3594 11.5483C10.3963 11.5014 10.4151 11.4467 10.4158 11.3842C10.4151 11.3274 10.3984 11.2805 10.3658 11.2436C10.3331 11.206 10.2873 11.1747 10.2283 11.1499C10.1823 11.1297 10.1301 11.1112 10.0717 11.0946V11.69ZM9.89702 10.6895V10.1288C9.85299 10.1347 9.81322 10.1452 9.7777 10.1602C9.71875 10.185 9.67365 10.2187 9.6424 10.2614C9.61115 10.304 9.59517 10.3526 9.59446 10.4073C9.59446 10.4528 9.60476 10.4922 9.62536 10.5256C9.64666 10.5589 9.67543 10.5874 9.71165 10.6108C9.74787 10.6335 9.788 10.6527 9.83203 10.6683C9.85361 10.676 9.87527 10.683 9.89702 10.6895Z" /></svg>',
              show: (this.hasPermission('payroll_payroll_management') && !this.is_faculty)
            },
            {
              path: this.setUrl(URLConstants.STAFF_PAYSLIP),
              title: 'Payslip List',
              type: 'link',
              active: false,
              svgPath: '<svg width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.59951 2.99985H0V12.4C0 12.7314 0.268629 13 0.6 13H9.4C9.73137 13 10 12.7314 10 12.4V0.600001C10 0.26863 9.73137 0 9.4 0H2.99951V2.59985C2.99951 2.82076 2.82043 2.99985 2.59951 2.99985ZM2.34951 4.99985C2.15621 4.99985 1.99951 5.15655 1.99951 5.34985C1.99951 5.54315 2.15621 5.69985 2.34951 5.69985H7.64951C7.84281 5.69985 7.99951 5.54315 7.99951 5.34985C7.99951 5.15655 7.84281 4.99985 7.64951 4.99985H2.34951ZM1.99951 7.34985C1.99951 7.15655 2.15621 6.99985 2.34951 6.99985H7.64951C7.84281 6.99985 7.99951 7.15655 7.99951 7.34985C7.99951 7.54315 7.84281 7.69985 7.64951 7.69985H2.34951C2.15621 7.69985 1.99951 7.54315 1.99951 7.34985ZM2.34951 8.99985C2.15621 8.99985 1.99951 9.15655 1.99951 9.34985C1.99951 9.54315 2.15621 9.69985 2.34951 9.69985H7.64951C7.84281 9.69985 7.99951 9.54315 7.99951 9.34985C7.99951 9.15655 7.84281 8.99985 7.64951 8.99985H2.34951Z" /><path d="M2.5 2.5V0.5L0.5 2.5H2.5Z" /></svg>',
              show: (this.hasPermission('payroll_payslip_list'))
            }
          ],
      },
      ...moduleName.find(item => item == 'leave') && {
        title: 'Leave',
        icon: 'timer',
        type: 'sub',
        active: false,
        show: true,
        children: [
          {
            title: 'Leave List',
            path: this.setUrl(URLConstants.LEAVES_LIST),
            type: 'link',
            active: false,
            show: true,
            svgPath: '<svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="path-1-inside-1_78_689" fill="white"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 12V0.5C0 0.223858 0.223857 0 0.5 0H9C9.27614 0 9.5 0.223858 9.5 0.5V12C9.5 12.2761 9.27614 12.5 9 12.5H0.5C0.223858 12.5 0 12.2761 0 12ZM4.20801 1.86132C4.2846 1.97621 4.25356 2.13142 4.13867 2.20801L2.7961 3.10306C2.59738 3.23554 2.32978 3.18971 2.18648 2.99864L1.8 2.48333C1.71716 2.37288 1.73954 2.21618 1.85 2.13333C1.96046 2.05049 2.11716 2.07288 2.2 2.18333L2.5581 2.6608L3.86132 1.79199C3.97621 1.7154 4.13142 1.74644 4.20801 1.86132ZM4.13867 4.70801C4.25356 4.63142 4.2846 4.47621 4.20801 4.36132C4.13142 4.24644 3.97621 4.2154 3.86132 4.29199L2.5581 5.1608L2.2 4.68333C2.11716 4.57288 1.96046 4.55049 1.85 4.63333C1.73954 4.71618 1.71716 4.87288 1.8 4.98333L2.18648 5.49864C2.32978 5.68971 2.59738 5.73554 2.7961 5.60306L4.13867 4.70801ZM4.20801 6.86132C4.2846 6.97621 4.25356 7.13142 4.13867 7.20801L2.7961 8.10306C2.59738 8.23554 2.32978 8.18971 2.18648 7.99864L1.8 7.48333C1.71716 7.37288 1.73954 7.21618 1.85 7.13333C1.96046 7.05049 2.11716 7.07288 2.2 7.18333L2.5581 7.6608L3.86132 6.79199C3.97621 6.7154 4.13142 6.74644 4.20801 6.86132ZM4.13867 9.70801C4.25356 9.63142 4.2846 9.47621 4.20801 9.36133C4.13142 9.24644 3.97621 9.2154 3.86132 9.29199L2.5581 10.1608L2.2 9.68333C2.11716 9.57288 1.96046 9.55049 1.85 9.63333C1.73954 9.71618 1.71716 9.87288 1.8 9.98333L2.18648 10.4986C2.32978 10.6897 2.59738 10.7355 2.7961 10.6031L4.13867 9.70801ZM5 2.4C5 2.17909 5.17909 2 5.4 2H7.6C7.82091 2 8 2.17909 8 2.4C8 2.62091 7.82091 2.8 7.6 2.8H5.4C5.17909 2.8 5 2.62091 5 2.4ZM5.4 4.29999C5.17909 4.29999 5 4.47907 5 4.69999C5 4.9209 5.17909 5.09999 5.4 5.09999H7.6C7.82091 5.09999 8 4.9209 8 4.69999C8 4.47907 7.82091 4.29999 7.6 4.29999H5.4ZM5 6.99998C5 6.77906 5.17909 6.59998 5.4 6.59998H7.6C7.82091 6.59998 8 6.77906 8 6.99998C8 7.22089 7.82091 7.39998 7.6 7.39998H5.4C5.17909 7.39998 5 7.22089 5 6.99998ZM5.4 9.19998C5.17909 9.19998 5 9.37907 5 9.59998C5 9.8209 5.17909 9.99998 5.4 9.99998H7.6C7.82091 9.99998 8 9.8209 8 9.59998C8 9.37907 7.82091 9.19998 7.6 9.19998H5.4Z"/></mask><path fill-rule="evenodd" clip-rule="evenodd" d="M0 12V0.5C0 0.223858 0.223857 0 0.5 0H9C9.27614 0 9.5 0.223858 9.5 0.5V12C9.5 12.2761 9.27614 12.5 9 12.5H0.5C0.223858 12.5 0 12.2761 0 12ZM4.20801 1.86132C4.2846 1.97621 4.25356 2.13142 4.13867 2.20801L2.7961 3.10306C2.59738 3.23554 2.32978 3.18971 2.18648 2.99864L1.8 2.48333C1.71716 2.37288 1.73954 2.21618 1.85 2.13333C1.96046 2.05049 2.11716 2.07288 2.2 2.18333L2.5581 2.6608L3.86132 1.79199C3.97621 1.7154 4.13142 1.74644 4.20801 1.86132ZM4.13867 4.70801C4.25356 4.63142 4.2846 4.47621 4.20801 4.36132C4.13142 4.24644 3.97621 4.2154 3.86132 4.29199L2.5581 5.1608L2.2 4.68333C2.11716 4.57288 1.96046 4.55049 1.85 4.63333C1.73954 4.71618 1.71716 4.87288 1.8 4.98333L2.18648 5.49864C2.32978 5.68971 2.59738 5.73554 2.7961 5.60306L4.13867 4.70801ZM4.20801 6.86132C4.2846 6.97621 4.25356 7.13142 4.13867 7.20801L2.7961 8.10306C2.59738 8.23554 2.32978 8.18971 2.18648 7.99864L1.8 7.48333C1.71716 7.37288 1.73954 7.21618 1.85 7.13333C1.96046 7.05049 2.11716 7.07288 2.2 7.18333L2.5581 7.6608L3.86132 6.79199C3.97621 6.7154 4.13142 6.74644 4.20801 6.86132ZM4.13867 9.70801C4.25356 9.63142 4.2846 9.47621 4.20801 9.36133C4.13142 9.24644 3.97621 9.2154 3.86132 9.29199L2.5581 10.1608L2.2 9.68333C2.11716 9.57288 1.96046 9.55049 1.85 9.63333C1.73954 9.71618 1.71716 9.87288 1.8 9.98333L2.18648 10.4986C2.32978 10.6897 2.59738 10.7355 2.7961 10.6031L4.13867 9.70801ZM5 2.4C5 2.17909 5.17909 2 5.4 2H7.6C7.82091 2 8 2.17909 8 2.4C8 2.62091 7.82091 2.8 7.6 2.8H5.4C5.17909 2.8 5 2.62091 5 2.4ZM5.4 4.29999C5.17909 4.29999 5 4.47907 5 4.69999C5 4.9209 5.17909 5.09999 5.4 5.09999H7.6C7.82091 5.09999 8 4.9209 8 4.69999C8 4.47907 7.82091 4.29999 7.6 4.29999H5.4ZM5 6.99998C5 6.77906 5.17909 6.59998 5.4 6.59998H7.6C7.82091 6.59998 8 6.77906 8 6.99998C8 7.22089 7.82091 7.39998 7.6 7.39998H5.4C5.17909 7.39998 5 7.22089 5 6.99998ZM5.4 9.19998C5.17909 9.19998 5 9.37907 5 9.59998C5 9.8209 5.17909 9.99998 5.4 9.99998H7.6C7.82091 9.99998 8 9.8209 8 9.59998C8 9.37907 7.82091 9.19998 7.6 9.19998H5.4Z" /><path d="M4.13867 2.20801L3.58398 1.37596L3.58397 1.37596L4.13867 2.20801ZM4.20801 1.86132L5.04006 1.30662L5.04006 1.30662L4.20801 1.86132ZM2.7961 3.10306L3.3508 3.93512L3.3508 3.93512L2.7961 3.10306ZM2.18648 2.99864L2.98648 2.39864L2.98648 2.39864L2.18648 2.99864ZM1.8 2.48333L1 3.08333L1 3.08333L1.8 2.48333ZM1.85 2.13333L2.45 2.93333L2.45 2.93333L1.85 2.13333ZM2.2 2.18333L3 1.58333L3 1.58333L2.2 2.18333ZM2.5581 2.6608L1.7581 3.2608L2.32569 4.01759L3.1128 3.49285L2.5581 2.6608ZM3.86132 1.79199L3.30663 0.959937L3.30662 0.959937L3.86132 1.79199ZM4.20801 4.36132L5.04006 3.80663L5.04006 3.80662L4.20801 4.36132ZM4.13867 4.70801L3.58398 3.87596L3.58397 3.87596L4.13867 4.70801ZM3.86132 4.29199L3.30663 3.45994L3.30662 3.45994L3.86132 4.29199ZM2.5581 5.1608L1.7581 5.7608L2.32569 6.51759L3.1128 5.99285L2.5581 5.1608ZM2.2 4.68333L3 4.08333L3 4.08333L2.2 4.68333ZM1.85 4.63333L1.25 3.83333L1.25 3.83333L1.85 4.63333ZM1.8 4.98333L0.999999 5.58333L1 5.58333L1.8 4.98333ZM2.18648 5.49864L2.98648 4.89864H2.98648L2.18648 5.49864ZM2.7961 5.60306L2.2414 4.77101L2.2414 4.77101L2.7961 5.60306ZM4.13867 7.20801L3.58398 6.37596L3.58397 6.37596L4.13867 7.20801ZM4.20801 6.86132L5.04006 6.30663L5.04006 6.30662L4.20801 6.86132ZM2.7961 8.10306L2.2414 7.27101L2.24139 7.27102L2.7961 8.10306ZM2.18648 7.99864L2.98648 7.39864H2.98648L2.18648 7.99864ZM1.8 7.48333L0.999999 8.08333L1 8.08333L1.8 7.48333ZM1.85 7.13333L1.25 6.33333L1.25 6.33333L1.85 7.13333ZM2.2 7.18333L3 6.58333L3 6.58333L2.2 7.18333ZM2.5581 7.6608L1.7581 8.2608L2.32569 9.01759L3.1128 8.49285L2.5581 7.6608ZM3.86132 6.79199L3.30663 5.95994L3.30662 5.95994L3.86132 6.79199ZM4.20801 9.36133L3.37596 9.91602L3.37596 9.91603L4.20801 9.36133ZM4.13867 9.70801L3.58398 8.87596L3.58397 8.87596L4.13867 9.70801ZM3.86132 9.29199L3.30663 8.45994L3.30662 8.45994L3.86132 9.29199ZM2.5581 10.1608L1.7581 10.7608L2.32569 11.5176L3.1128 10.9929L2.5581 10.1608ZM2.2 9.68333L1.4 10.2833L1.4 10.2833L2.2 9.68333ZM1.8 9.98333L0.999999 10.5833L1 10.5833L1.8 9.98333ZM2.18648 10.4986L2.98648 9.89864L2.98648 9.89864L2.18648 10.4986ZM2.7961 10.6031L2.2414 9.77101L2.24139 9.77102L2.7961 10.6031ZM-1 0.5V12H1V0.5H-1ZM0.5 -1C-0.328428 -1 -1 -0.328427 -1 0.5H1C1 0.776142 0.776143 1 0.5 1V-1ZM9 -1H0.5V1H9V-1ZM10.5 0.5C10.5 -0.328427 9.82843 -1 9 -1V1C8.72386 1 8.5 0.776142 8.5 0.5H10.5ZM10.5 12V0.5H8.5V12H10.5ZM9 13.5C9.82843 13.5 10.5 12.8284 10.5 12H8.5C8.5 11.7239 8.72386 11.5 9 11.5V13.5ZM0.5 13.5H9V11.5H0.5V13.5ZM-1 12C-1 12.8284 -0.328427 13.5 0.5 13.5V11.5C0.776143 11.5 1 11.7239 1 12H-1ZM4.69337 3.04006C5.26779 2.65712 5.423 1.88104 5.04006 1.30662L3.37596 2.41603C3.1462 2.07138 3.23933 1.60573 3.58398 1.37596L4.69337 3.04006ZM3.3508 3.93512L4.69338 3.04006L3.58397 1.37596L2.2414 2.27101L3.3508 3.93512ZM1.38648 3.59864C1.84822 4.2143 2.71048 4.36199 3.3508 3.93512L2.2414 2.27101C2.48427 2.1091 2.81134 2.16512 2.98648 2.39864L1.38648 3.59864ZM1 3.08333L1.38648 3.59864L2.98648 2.39864L2.6 1.88333L1 3.08333ZM1.25 1.33333C0.697715 1.74755 0.585786 2.53105 1 3.08333L2.6 1.88333C2.84853 2.2147 2.78137 2.68481 2.45 2.93333L1.25 1.33333ZM3 1.58333C2.58579 1.03105 1.80229 0.919119 1.25 1.33333L2.45 2.93333C2.11863 3.18186 1.64853 3.1147 1.4 2.78333L3 1.58333ZM3.3581 2.0608L3 1.58333L1.4 2.78333L1.7581 3.2608L3.3581 2.0608ZM3.30662 0.959937L2.0034 1.82875L3.1128 3.49285L4.41603 2.62404L3.30662 0.959937ZM5.04006 1.30662C4.65712 0.732214 3.88104 0.576997 3.30663 0.959937L4.41602 2.62404C4.07138 2.8538 3.60573 2.76067 3.37596 2.41603L5.04006 1.30662ZM3.37596 4.91602C3.1462 4.57138 3.23933 4.10573 3.58398 3.87596L4.69337 5.54006C5.26779 5.15712 5.423 4.38104 5.04006 3.80663L3.37596 4.91602ZM4.41602 5.12404C4.07138 5.3538 3.60573 5.26067 3.37596 4.91603L5.04006 3.80662C4.65712 3.23221 3.88104 3.077 3.30663 3.45994L4.41602 5.12404ZM3.1128 5.99285L4.41603 5.12404L3.30662 3.45994L2.0034 4.32875L3.1128 5.99285ZM1.4 5.28333L1.7581 5.7608L3.3581 4.5608L3 4.08333L1.4 5.28333ZM2.45 5.43333C2.11863 5.68186 1.64853 5.6147 1.4 5.28333L3 4.08333C2.58579 3.53105 1.80229 3.41912 1.25 3.83333L2.45 5.43333ZM2.6 4.38334C2.84853 4.7147 2.78137 5.1848 2.45 5.43333L1.25 3.83333C0.697715 4.24755 0.585787 5.03105 0.999999 5.58333L2.6 4.38334ZM2.98648 4.89864L2.6 4.38333L1 5.58333L1.38648 6.09864L2.98648 4.89864ZM2.2414 4.77101C2.48427 4.6091 2.81134 4.66512 2.98648 4.89864L1.38648 6.09864C1.84822 6.7143 2.71048 6.86199 3.3508 6.43511L2.2414 4.77101ZM3.58397 3.87596L2.2414 4.77101L3.3508 6.43511L4.69338 5.54006L3.58397 3.87596ZM4.69337 8.04006C5.26779 7.65712 5.423 6.88104 5.04006 6.30663L3.37596 7.41602C3.1462 7.07138 3.23933 6.60573 3.58398 6.37596L4.69337 8.04006ZM3.3508 8.93511L4.69338 8.04006L3.58397 6.37596L2.2414 7.27101L3.3508 8.93511ZM1.38648 8.59864C1.84822 9.21429 2.71048 9.36199 3.3508 8.93511L2.24139 7.27102C2.48427 7.1091 2.81134 7.16512 2.98648 7.39864L1.38648 8.59864ZM1 8.08333L1.38648 8.59864L2.98648 7.39864L2.6 6.88333L1 8.08333ZM1.25 6.33333C0.697715 6.74755 0.585787 7.53105 0.999999 8.08333L2.6 6.88334C2.84853 7.2147 2.78137 7.6848 2.45 7.93333L1.25 6.33333ZM3 6.58333C2.58579 6.03105 1.80229 5.91912 1.25 6.33333L2.45 7.93333C2.11863 8.18186 1.64853 8.11471 1.4 7.78333L3 6.58333ZM3.3581 7.0608L3 6.58333L1.4 7.78333L1.7581 8.2608L3.3581 7.0608ZM3.30662 5.95994L2.0034 6.82875L3.1128 8.49285L4.41603 7.62404L3.30662 5.95994ZM5.04006 6.30662C4.65712 5.73221 3.88104 5.577 3.30663 5.95994L4.41602 7.62404C4.07138 7.8538 3.60573 7.76067 3.37596 7.41603L5.04006 6.30662ZM3.37596 9.91603C3.1462 9.57138 3.23933 9.10572 3.58398 8.87596L4.69337 10.5401C5.26779 10.1571 5.423 9.38103 5.04006 8.80662L3.37596 9.91603ZM4.41602 10.124C4.07138 10.3538 3.60573 10.2607 3.37596 9.91602L5.04006 8.80663C4.65712 8.23221 3.88104 8.077 3.30663 8.45994L4.41602 10.124ZM3.1128 10.9929L4.41603 10.124L3.30662 8.45994L2.0034 9.32875L3.1128 10.9929ZM1.4 10.2833L1.7581 10.7608L3.3581 9.5608L3 9.08333L1.4 10.2833ZM2.45 10.4333C2.11863 10.6819 1.64853 10.6147 1.4 10.2833L3 9.08333C2.58579 8.53105 1.80228 8.41912 1.25 8.83333L2.45 10.4333ZM2.6 9.38334C2.84853 9.7147 2.78137 10.1848 2.45 10.4333L1.25 8.83333C0.697715 9.24755 0.585787 10.031 0.999999 10.5833L2.6 9.38334ZM2.98648 9.89864L2.6 9.38333L1 10.5833L1.38648 11.0986L2.98648 9.89864ZM2.24139 9.77102C2.48427 9.6091 2.81134 9.66512 2.98648 9.89864L1.38648 11.0986C1.84822 11.7143 2.71048 11.862 3.3508 11.4351L2.24139 9.77102ZM3.58397 8.87596L2.2414 9.77101L3.3508 11.4351L4.69338 10.5401L3.58397 8.87596ZM5.4 1C4.6268 1 4 1.6268 4 2.4H6C6 2.73137 5.73137 3 5.4 3V1ZM7.6 1H5.4V3H7.6V1ZM9 2.4C9 1.6268 8.3732 1 7.6 1V3C7.26863 3 7 2.73137 7 2.4H9ZM7.6 3.8C8.3732 3.8 9 3.1732 9 2.4H7C7 2.06863 7.26863 1.8 7.6 1.8V3.8ZM5.4 3.8H7.6V1.8H5.4V3.8ZM4 2.4C4 3.1732 4.6268 3.8 5.4 3.8V1.8C5.73137 1.8 6 2.06863 6 2.4H4ZM6 4.69999C6 5.03136 5.73137 5.29999 5.4 5.29999V3.29999C4.6268 3.29999 4 3.92679 4 4.69999H6ZM5.4 4.09999C5.73137 4.09999 6 4.36862 6 4.69999H4C4 5.47319 4.6268 6.09999 5.4 6.09999V4.09999ZM7.6 4.09999H5.4V6.09999H7.6V4.09999ZM7 4.69999C7 4.36862 7.26863 4.09999 7.6 4.09999V6.09999C8.3732 6.09999 9 5.47319 9 4.69999H7ZM7.6 5.29999C7.26863 5.29999 7 5.03136 7 4.69999H9C9 3.92679 8.3732 3.29999 7.6 3.29999V5.29999ZM5.4 5.29999H7.6V3.29999H5.4V5.29999ZM5.4 5.59998C4.6268 5.59998 4 6.22678 4 6.99998H6C6 7.33135 5.73137 7.59998 5.4 7.59998V5.59998ZM7.6 5.59998H5.4V7.59998H7.6V5.59998ZM9 6.99998C9 6.22678 8.3732 5.59998 7.6 5.59998V7.59998C7.26863 7.59998 7 7.33135 7 6.99998H9ZM7.6 8.39998C8.3732 8.39998 9 7.77317 9 6.99998H7C7 6.6686 7.26863 6.39998 7.6 6.39998V8.39998ZM5.4 8.39998H7.6V6.39998H5.4V8.39998ZM4 6.99998C4 7.77317 4.6268 8.39998 5.4 8.39998V6.39998C5.73137 6.39998 6 6.66861 6 6.99998H4ZM6 9.59998C6 9.93135 5.73137 10.2 5.4 10.2V8.19998C4.6268 8.19998 4 8.82678 4 9.59998H6ZM5.4 8.99998C5.73137 8.99998 6 9.26861 6 9.59998H4C4 10.3732 4.6268 11 5.4 11V8.99998ZM7.6 8.99998H5.4V11H7.6V8.99998ZM7 9.59998C7 9.26861 7.26863 8.99998 7.6 8.99998V11C8.3732 11 9 10.3732 9 9.59998H7ZM7.6 10.2C7.26863 10.2 7 9.93135 7 9.59998H9C9 8.82678 8.3732 8.19998 7.6 8.19998V10.2ZM5.4 10.2H7.6V8.19998H5.4V10.2Z"  mask="url(#path-1-inside-1_78_689)"/><path d="M10.5 1V13V13.3C10.5 13.4105 10.4105 13.5 10.3 13.5H1.5" stroke="black" stroke-width="0.7" stroke-linecap="round"/></svg>'
          }
        ]
      },
      ...moduleName.find(item => item == 'inquiry') && {
        title: 'Inquiry',
        icon: 'headphone-alt',
        ype: 'sub',
        active: false,
        show: (((this.getInstituteModule('Inquiry')) || (this.getInstituteModule('Setting')) || (this.getInstituteModule('Report'))) && (this.hasModule('inquiry_inquiry') || (this.hasModule('settings_notification')) ||  this.hasModule('inquiry_inquiry_field_setting')|| this.hasModule('report_inquiry_fees_report') || this.hasModule('settings_system_setting')||this.hasModule('inquiry_form_builder'))),
        children:
          [
            {
              path: this.setUrl(URLConstants.INQUIRY_LIST),
              title: 'Inquiry List',
              type: 'link',
              svgPath: '<svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.6364 6.58539C13.2098 6.73614 12.7509 6.81817 12.2727 6.81817C10.0134 6.81817 8.1818 4.98661 8.1818 2.72726C8.1818 2.24912 8.26383 1.79014 8.41458 1.36362H2C0.895431 1.36362 0 2.25905 0 3.36362V10.2727C0 11.3773 0.895432 12.2727 2 12.2727H11.6364C12.7409 12.2727 13.6364 11.3773 13.6364 10.2727V6.58539ZM1.3636 4.56818C1.3636 4.30459 1.57728 4.0909 1.84087 4.0909H6.34087C6.60446 4.0909 6.81814 4.30459 6.81814 4.56818C6.81814 4.83177 6.60446 5.04545 6.34087 5.04545H1.84087C1.57728 5.04545 1.3636 4.83177 1.3636 4.56818ZM1.84087 6.81818C1.57728 6.81818 1.3636 7.03186 1.3636 7.29545C1.3636 7.55904 1.57728 7.77273 1.84087 7.77273H9.06814C9.33173 7.77273 9.54541 7.55904 9.54541 7.29545C9.54541 7.03186 9.33173 6.81818 9.06814 6.81818H1.84087ZM1.3636 10.0227C1.3636 9.75914 1.57728 9.54545 1.84087 9.54545H7.7045C7.9681 9.54545 8.18178 9.75914 8.18178 10.0227C8.18178 10.2863 7.9681 10.5 7.70451 10.5H1.84087C1.57728 10.5 1.3636 10.2863 1.3636 10.0227ZM10.0228 9.54545C9.75919 9.54545 9.5455 9.75914 9.5455 10.0227C9.5455 10.2863 9.75919 10.5 10.0228 10.5H10.4319C10.6955 10.5 10.9091 10.2863 10.9091 10.0227C10.9091 9.75914 10.6955 9.54545 10.4319 9.54545H10.0228Z" /><path d="M14.5576 5.92743L12.89 4.9589L14.0333 3.95032L14.5576 5.92743Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M12.2728 5.45455C13.779 5.45455 15.0001 4.2335 15.0001 2.72727C15.0001 1.22104 13.779 0 12.2728 0C10.7666 0 9.54553 1.22104 9.54553 2.72727C9.54553 4.2335 10.7666 5.45455 12.2728 5.45455ZM12.074 3.65343V3.69036H12.547V3.65343C12.5479 3.55305 12.5598 3.46877 12.5825 3.40058C12.6062 3.33146 12.6422 3.27132 12.6904 3.22019C12.7397 3.16905 12.8027 3.11981 12.8794 3.07246C12.9665 3.02038 13.0418 2.96119 13.1052 2.8949C13.1687 2.82862 13.2174 2.75286 13.2515 2.66763C13.2866 2.5824 13.3041 2.48581 13.3041 2.37786C13.3041 2.21782 13.2653 2.07956 13.1876 1.96308C13.1109 1.84566 13.0034 1.75523 12.8652 1.69178C12.7279 1.62833 12.5688 1.59661 12.3879 1.59661C12.2222 1.59661 12.0707 1.62691 11.9333 1.68752C11.797 1.74812 11.6871 1.83903 11.6038 1.96024C11.5214 2.08146 11.4779 2.23202 11.4731 2.41195H11.9788C11.9835 2.32293 12.0053 2.24954 12.0441 2.19178C12.0839 2.13307 12.1336 2.08951 12.1933 2.0611C12.2539 2.03174 12.3178 2.01706 12.385 2.01706C12.458 2.01706 12.5238 2.03221 12.5825 2.06252C12.6422 2.09282 12.6895 2.13543 12.7245 2.19036C12.7596 2.24528 12.7771 2.31015 12.7771 2.38496C12.7771 2.45125 12.7638 2.51138 12.7373 2.56536C12.7108 2.61839 12.6743 2.66668 12.6279 2.71024C12.5825 2.75286 12.5309 2.79216 12.4731 2.82814C12.3888 2.88023 12.3173 2.93752 12.2586 3.00002C12.1999 3.06157 12.1545 3.14301 12.1223 3.24433C12.091 3.34566 12.0749 3.48202 12.074 3.65343ZM12.101 4.48581C12.1625 4.54642 12.2359 4.57672 12.3211 4.57672C12.3779 4.57672 12.4296 4.56299 12.476 4.53553C12.5233 4.50712 12.5612 4.46924 12.5896 4.42189C12.619 4.37454 12.6336 4.32199 12.6336 4.26422C12.6336 4.17899 12.6024 4.10608 12.5399 4.04547C12.4783 3.98487 12.4054 3.95456 12.3211 3.95456C12.2359 3.95456 12.1625 3.98487 12.101 4.04547C12.0394 4.10608 12.0086 4.17899 12.0086 4.26422C12.0086 4.35134 12.0394 4.42521 12.101 4.48581Z" /></svg>',
              active: false,
              show: (this.hasPermission('inquiry_inquiry'))
            },
            { 
              path: this.setUrl(URLConstants.ADD_INQUIRY),
              title: 'Add Inquiry',
              type: 'link',
              svgPath:'<svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.6364 6.58542C13.2098 6.73617 12.7509 6.8182 12.2727 6.8182C10.0134 6.8182 8.1818 4.98664 8.1818 2.72729C8.1818 2.24915 8.26383 1.79017 8.41458 1.36365H2C0.895431 1.36365 0 2.25908 0 3.36365V10.2727C0 11.3773 0.895432 12.2727 2 12.2727H11.6364C12.7409 12.2727 13.6364 11.3773 13.6364 10.2727V6.58542ZM1.3636 4.56821C1.3636 4.30462 1.57728 4.09094 1.84087 4.09094H6.34087C6.60446 4.09094 6.81814 4.30462 6.81814 4.56821C6.81814 4.8318 6.60446 5.04548 6.34087 5.04548H1.84087C1.57728 5.04548 1.3636 4.8318 1.3636 4.56821ZM1.84087 6.81821C1.57728 6.81821 1.3636 7.03189 1.3636 7.29548C1.3636 7.55907 1.57728 7.77276 1.84087 7.77276H9.06814C9.33173 7.77276 9.54541 7.55907 9.54541 7.29548C9.54541 7.03189 9.33173 6.81821 9.06814 6.81821H1.84087ZM1.3636 10.0228C1.3636 9.75917 1.57728 9.54549 1.84087 9.54549H7.7045C7.9681 9.54549 8.18178 9.75917 8.18178 10.0228C8.18178 10.2863 7.9681 10.5 7.70451 10.5H1.84087C1.57728 10.5 1.3636 10.2863 1.3636 10.0228ZM10.0228 9.54549C9.75919 9.54549 9.5455 9.75917 9.5455 10.0228C9.5455 10.2863 9.75919 10.5 10.0228 10.5H10.4319C10.6955 10.5 10.9091 10.2863 10.9091 10.0228C10.9091 9.75917 10.6955 9.54549 10.4319 9.54549H10.0228Z"/><path d="M14.5577 5.92743L12.8901 4.9589L14.0334 3.95032L14.5577 5.92743Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12.2727 5.45455C13.7789 5.45455 15 4.2335 15 2.72727C15 1.22104 13.7789 0 12.2727 0C10.7665 0 9.54541 1.22104 9.54541 2.72727C9.54541 4.2335 10.7665 5.45455 12.2727 5.45455ZM12.122 3.06818V3.82812H12.5681V3.06818H13.328V2.62216H12.5681V1.86222H12.122V2.62216H11.3621V3.06818H12.122Z"/></svg>',
              active: false,
              show: this.hasPermission('inquiry_inquiry', 'has_create')
            },
            { 
              path: this.setUrl(URLConstants.INQUIRY_IMPORT),
              active: false,
              show: this.hasPermission('inquiry_inquiry','has_import'),
              title:'Import Inquiry',
              type: 'link',
              svgPath:'<svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2C0 0.89543 0.895431 0 2 0H9C10.1046 0 11 0.895431 11 2V11C11 12.1046 10.1046 13 9 13H2C0.895431 13 0 12.1046 0 11V2ZM2 6.75C2.13807 6.75 2.25 6.86193 2.25 7V8V9.25H8.75V8V7C8.75 6.86193 8.86193 6.75 9 6.75C9.13807 6.75 9.25 6.86193 9.25 7V8V9.5V9.75H9H2H1.75V9.5V8V7C1.75 6.86193 1.86193 6.75 2 6.75ZM5.75 1.5C5.75 1.36193 5.63807 1.25 5.5 1.25C5.36193 1.25 5.25 1.36193 5.25 1.5V5.25L4.2 3.85C4.11716 3.73954 3.96046 3.71716 3.85 3.8C3.73954 3.88284 3.71716 4.03954 3.8 4.15L5.3 6.15L5.5 6.41667L5.7 6.15L7.2 4.15C7.28284 4.03954 7.26046 3.88284 7.15 3.8C7.03954 3.71716 6.88284 3.73954 6.8 3.85L5.75 5.25V1.5Z"/></svg>'
            },
            {
              path: this.setUrl(URLConstants.FORM_BUILDER_INQUIRY_LIST),
              title: 'Form Builder',
              type: 'link',
              svgPath: '<svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2C0 0.895416 0.895386 0 2 0H9C10.1046 0 11 0.895416 11 2V11C11 12.1046 10.1046 13 9 13H2C0.895386 13 0 12.1046 0 11V2ZM2 3.5C2 3.22385 2.22388 3 2.5 3H8.5C8.77612 3 9 3.22385 9 3.5C9 3.77615 8.77612 4 8.5 4H2.5C2.22388 4 2 3.77615 2 3.5ZM2.5 5C2.22388 5 2 5.22385 2 5.5C2 5.77615 2.22388 6 2.5 6H8.5C8.77612 6 9 5.77615 9 5.5C9 5.22385 8.77612 5 8.5 5H2.5ZM2 7.5C2 7.22385 2.22388 7 2.5 7H8.5C8.77612 7 9 7.22385 9 7.5C9 7.77615 8.77612 8 8.5 8H2.5C2.22388 8 2 7.77615 2 7.5ZM2.5 9C2.22388 9 2 9.22385 2 9.5C2 9.77615 2.22388 10 2.5 10H8.5C8.77612 10 9 9.77615 9 9.5C9 9.22385 8.77612 9 8.5 9H2.5Z"/></svg>',
              active: false,
              show: this.hasPermission('inquiry_form_builder')
            },
            {
              title: 'Report',
              type: 'sub',
              svgPath:'<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 0H2C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.89543 12 2 12H8C9.10457 12 10 11.1046 10 10V3H8C7.44772 3 7 2.55228 7 2V0ZM2.69995 3.5C2.69995 3.22386 2.92381 3 3.19995 3C3.47609 3 3.69995 3.22386 3.69995 3.5V9.5C3.69995 9.77614 3.47609 10 3.19995 10C2.92381 10 2.69995 9.77614 2.69995 9.5V3.5ZM5.19995 5C4.92381 5 4.69995 5.22386 4.69995 5.5V9.5C4.69995 9.77614 4.92381 10 5.19995 10C5.47609 10 5.69995 9.77614 5.69995 9.5V5.5C5.69995 5.22386 5.47609 5 5.19995 5ZM6.69995 7.5C6.69995 7.22386 6.92381 7 7.19995 7C7.47609 7 7.69995 7.22386 7.69995 7.5V9.5C7.69995 9.77614 7.47609 10 7.19995 10C6.92381 10 6.69995 9.77614 6.69995 9.5V7.5Z" /><path d="M9.92927 2.32929L7.77069 0.170711C7.70769 0.107714 7.59998 0.152331 7.59998 0.241421V2.4C7.59998 2.45523 7.64475 2.5 7.69998 2.5H9.85855C9.94764 2.5 9.99226 2.39229 9.92927 2.32929Z" /></svg>',
              active:false,
              show:this.hasModule('report_inquiry_fees_report'),
              children:[
                { 
                  path: this.setUrl(URLConstants.INQUIRY_FEES_REPORT), 
                  title: 'Inquiry Fees', 
                  type: 'link', 
                  active: false, 
                  show: this.hasPermission('report_inquiry_fees_report')
                }
              ]
            },
            {
              title: 'Setting',
              type: 'sub',
              show: (this.hasModule('settings_system_setting') || this.hasModule('inquiry_inquiry_field_setting')),
              active: false,
              svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z" /><path class="cr-color" d="M8.57371 5.83684C8.57371 7.29312 7.39316 8.47367 5.93688 8.47367C4.4806 8.47367 3.30005 7.29312 3.30005 5.83684C3.30005 4.38056 4.4806 3.20001 5.93688 3.20001C7.39316 3.20001 8.57371 4.38056 8.57371 5.83684ZM4.30547 5.83684C4.30547 6.73785 5.03588 7.46825 5.93688 7.46825C6.83788 7.46825 7.56829 6.73785 7.56829 5.83684C7.56829 4.93584 6.83788 4.20543 5.93688 4.20543C5.03588 4.20543 4.30547 4.93584 4.30547 5.83684Z" fill="white"/><path class="cr-color" d="M5.20496 2.80001C5.20496 2.68955 5.2945 2.60001 5.40496 2.60001H6.32337C6.43383 2.60001 6.52337 2.68955 6.52337 2.80001V3.91842H5.20496V2.80001Z" fill="white"/><path class="cr-color" d="M3.24872 4.39732C3.16414 4.32627 3.15318 4.20012 3.22423 4.11554L3.81498 3.41234C3.88603 3.32776 4.01219 3.3168 4.09676 3.38785L4.9531 4.10725L4.10505 5.11672L3.24872 4.39732Z" fill="white"/><path class="cr-color" d="M8.57404 7.56004C8.65861 7.63109 8.66958 7.75725 8.59853 7.84182L8.00777 8.54503C7.93672 8.6296 7.81057 8.64057 7.72599 8.56952L6.76648 7.76344L7.61452 6.75397L8.57404 7.56004Z" fill="white"/><path class="cr-color" d="M7.94695 3.38114C8.0345 3.31379 8.16007 3.33016 8.22742 3.4177L8.78745 4.14562C8.8548 4.23316 8.83843 4.35873 8.75089 4.42609L7.86445 5.10806L7.06052 4.06312L7.94695 3.38114Z" fill="white"/><path class="cr-color" d="M5.20496 7.87366H6.52337V8.99207C6.52337 9.10253 6.43383 9.19207 6.32337 9.19207H5.40496C5.2945 9.19207 5.20496 9.10253 5.20496 8.99207V7.87366Z" fill="white"/><path class="cr-color" d="M7.8418 6.55521L7.84482 5.23679L8.96323 5.23936C9.07369 5.23961 9.16303 5.32936 9.16278 5.43982L9.16067 6.35823C9.16041 6.46869 9.07067 6.55803 8.96021 6.55777L7.8418 6.55521Z" fill="white"/><path class="cr-color" d="M4.02136 5.24139L4.01834 6.55981L2.89992 6.55724C2.78947 6.55699 2.70013 6.46724 2.70038 6.35678L2.70249 5.43837C2.70274 5.32791 2.79249 5.23857 2.90295 5.23883L4.02136 5.24139Z" fill="white"/><path class="cr-color" d="M4.31238 6.50336L5.19179 7.48563L4.09281 8.46953C4.01051 8.5432 3.88407 8.53622 3.8104 8.45392L3.19779 7.76967C3.12412 7.68737 3.1311 7.56093 3.2134 7.48725L4.31238 6.50336Z" fill="white"/></svg>',
              children: [
                {
                  title: 'Inquiry Settings',
                  type: 'link',
                  path: this.setUrl(URLConstants.SYSTEM_SETTING+"/10"),
                  show: this.hasPermission('settings_system_setting'),
                  active: false
                },
                {
                  title: 'Inquiry Field',
                  type: 'link',
                  path: this.setUrl(URLConstants.INQUIRY_FIELD_SETTING+"/"),
                  show: this.hasPermission('inquiry_inquiry_field_setting'),
                  active: false
                }
              ]
            },
            {
              title: 'Notification',
              type: 'sub',
              show: (this.hasModule('settings_notification')  ),
              active: false,
              svgPath: '<svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.66321 0.416363C4.66321 0.186412 4.84962 0 5.07957 0C5.30952 0 5.49593 0.186412 5.49593 0.416363V0.832726H4.66321V0.416363Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.36683 0.949529C6.21808 0.901778 6.05909 0.86283 5.88923 0.834128C5.8838 0.83321 5.87815 0.832733 5.87265 0.832733H4.63185C3.79998 0.832733 2.05399 1.41445 1.71834 3.7401C1.71767 3.74478 1.71731 3.74965 1.71731 3.75438V5.82909C1.71731 6.37903 1.39045 7.63717 0.0891269 8.30834C0.0655556 8.3205 0.0469179 8.34132 0.0396388 8.36683C-0.0823034 8.79406 0.00956711 9.57635 1.30095 9.57635H9.58677C9.61329 9.57635 9.63883 9.56602 9.65682 9.54654C9.92994 9.2509 10.2692 8.5596 9.63531 7.91807C9.63069 7.91339 9.62567 7.90924 9.62021 7.90555C9.20129 7.6231 8.3791 6.82202 8.3791 5.82909V4.99585C8.36184 4.9962 8.34454 4.99638 8.32719 4.99638C6.94749 4.99638 5.82902 3.8779 5.82902 2.4982C5.82902 1.91324 6.03006 1.37524 6.36683 0.949529Z"/><circle cx="8.32732" cy="2.49818" r="1.66545"/><path d="M6.66184 9.99272C6.66184 10.4344 6.48637 10.858 6.17404 11.1704C5.8617 11.4827 5.43809 11.6582 4.99638 11.6582C4.55468 11.6582 4.13107 11.4827 3.81873 11.1704C3.5064 10.858 3.33093 10.4344 3.33093 9.99272L4.99638 9.99272H6.66184Z"/></svg>',
              children: [
                {
                  title: 'Inquiry Notification',
                  type: 'link',
                  path: this.setUrl(URLConstants.NOTIFICATION_SETTING+"/10"),
                  show: this.hasPermission('settings_notification'),
                  active: false
                },
              ]
            }
          ]
      },
      ...moduleName.find(item => item == 'transport') && {
        title: 'Transport',
        icon: 'map-alt',
        type: 'sub',
        active: false,
        show: (((this.getInstituteModule('Transport')) || (this.getInstituteModule('Setting'))) && (this.hasModule('transport_document_type') || this.hasModule('transport_stop') || this.hasModule('transport_driver')
          || this.hasModule('transport_vehicle') || this.hasModule('transport_route') || this.hasModule('transport_assign_transport') || this.hasModule('settings_notification') || this.hasModule('settings_transport_settings') || this.hasModule('transport_area') || this.hasModule('transport_send_transport_message'))),
        children:
        [
          {
            title:'Transport Setup',
            type: 'sub',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z"/><path class="cr-color" d="M8.25325 5.84397C8.25325 7.12351 7.21598 8.16078 5.93644 8.16078C4.6569 8.16078 3.61963 7.12351 3.61963 5.84397C3.61963 4.56443 4.6569 3.52716 5.93644 3.52716C7.21598 3.52716 8.25325 4.56443 8.25325 5.84397ZM4.50303 5.84397C4.50303 6.63562 5.14479 7.27738 5.93644 7.27738C6.72809 7.27738 7.36985 6.63562 7.36985 5.84397C7.36985 5.05232 6.72809 4.41056 5.93644 4.41056C5.14479 4.41056 4.50303 5.05232 4.50303 5.84397Z" fill="white"/><path class="cr-color" d="M5.29346 3.2C5.29346 3.08954 5.383 3 5.49346 3H6.25186C6.36232 3 6.45186 3.08954 6.45186 3.2V4.15841H5.29346V3.2Z" fill="white"/><path class="cr-color" d="M3.59308 4.59483C3.5085 4.52378 3.49754 4.39763 3.56859 4.31305L4.05642 3.73236C4.12747 3.64779 4.25362 3.63683 4.3382 3.70787L5.07202 4.32435L4.3269 5.21131L3.59308 4.59483Z" fill="white"/><path class="cr-color" d="M8.23505 7.34242C8.31962 7.41347 8.33059 7.53963 8.25954 7.6242L7.77171 8.20489C7.70066 8.28947 7.5745 8.30043 7.48993 8.22938L6.66545 7.53675L7.41057 6.64979L8.23505 7.34242Z" fill="white"/><path class="cr-color" d="M7.68328 3.70112C7.77083 3.63376 7.8964 3.65013 7.96375 3.73768L8.4262 4.33877C8.49356 4.42632 8.47719 4.55189 8.38964 4.61924L7.63003 5.20365L6.92367 4.28552L7.68328 3.70112Z" fill="white"/><path class="cr-color" d="M5.29346 7.63367H6.45186V8.59207C6.45186 8.70253 6.36232 8.79207 6.25186 8.79207H5.49346C5.383 8.79207 5.29346 8.70253 5.29346 8.59207V7.63367Z" fill="white"/><path class="cr-color" d="M7.61011 6.47516L7.61277 5.31676L8.57117 5.31896C8.68162 5.31921 8.77096 5.40896 8.77071 5.51941L8.76897 6.27782C8.76872 6.38827 8.67897 6.47761 8.56851 6.47736L7.61011 6.47516Z" fill="white"/><path class="cr-color" d="M4.25342 5.3208L4.25076 6.4792L3.29236 6.477C3.1819 6.47675 3.09256 6.387 3.09282 6.27655L3.09456 5.51814C3.09481 5.40769 3.18456 5.31835 3.29502 5.3186L4.25342 5.3208Z" fill="white"/><path class="cr-color" d="M4.50903 6.42957L5.28171 7.29262L4.3342 8.14092C4.2519 8.2146 4.12546 8.20761 4.05178 8.12532L3.54591 7.56027C3.47223 7.47798 3.47922 7.35154 3.56152 7.27786L4.50903 6.42957Z" fill="white"/><mask id="path-11-inside-1_183_159" fill="white"><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z"/></mask><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-11-inside-1_183_159)"/><mask id="path-12-inside-2_183_159" fill="white"><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z"/></mask><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-12-inside-2_183_159)"/><path class="cr-color" d="M1.97291 4.91572L2.10774 3.75636L3.04436 4.4528L1.97291 4.91572Z" fill="white"/><path  d="M9.9355 7.02695L9.98777 8.19295L8.95184 7.65522L9.9355 7.02695Z" fill="white"/></svg>',
            active:false,
            show:this.hasModule('transport_document_type') || this.hasModule('transport_stop') || this.hasModule('transport_driver')
            || this.hasModule('transport_vehicle') || this.hasModule('transport_route') || this.hasModule('transport_area'),
            children:
            [
              {
                path: this.setUrl(URLConstants.DOCUMENT_TYPE_LIST),
                title: 'Document Type',
                type: 'link',
                svgPath: '<svg width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.59951 2.99985H0V12.4C0 12.7314 0.268629 13 0.6 13H9.4C9.73137 13 10 12.7314 10 12.4V0.600001C10 0.26863 9.73137 0 9.4 0H2.99951V2.59985C2.99951 2.82076 2.82043 2.99985 2.59951 2.99985ZM2.34951 4.99985C2.15621 4.99985 1.99951 5.15655 1.99951 5.34985C1.99951 5.54315 2.15621 5.69985 2.34951 5.69985H7.64951C7.84281 5.69985 7.99951 5.54315 7.99951 5.34985C7.99951 5.15655 7.84281 4.99985 7.64951 4.99985H2.34951ZM1.99951 7.34985C1.99951 7.15655 2.15621 6.99985 2.34951 6.99985H7.64951C7.84281 6.99985 7.99951 7.15655 7.99951 7.34985C7.99951 7.54315 7.84281 7.69985 7.64951 7.69985H2.34951C2.15621 7.69985 1.99951 7.54315 1.99951 7.34985ZM2.34951 8.99985C2.15621 8.99985 1.99951 9.15655 1.99951 9.34985C1.99951 9.54315 2.15621 9.69985 2.34951 9.69985H7.64951C7.84281 9.69985 7.99951 9.54315 7.99951 9.34985C7.99951 9.15655 7.84281 8.99985 7.64951 8.99985H2.34951Z" /><path d="M2.5 2.5V0.5L0.5 2.5H2.5Z" /></svg>',
                active: false,
                show: this.hasPermission('transport_document_type')
              },
              {
                path: this.setUrl(URLConstants.TRANSPORT_AREA),
                title: 'Area',
                type: 'link',
                svgPath: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 5C9 6.10457 8.10457 7 7 7C5.89543 7 5 6.10457 5 5C5 3.89543 5.89543 3 7 3C8.10457 3 9 3.89543 9 5Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14ZM6.96797 13C5.99754 11.6 3.94024 8.56 3.47443 7.6C2.69809 5.8 2.30992 1.96 6.96797 1C8.9088 1.4 12.3247 3.28 10.4614 7.6L6.96797 13Z" /></svg>',
                active: false,
                show: this.hasPermission('transport_area')
              },
              {
                path: this.setUrl(URLConstants.STOPS_LIST),
                title: 'Stops',
                type: 'link',
                svgPath: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 14C10.866 14 14 10.866 14 7C14 3.134 10.866 0 7 0C3.13403 0 0 3.134 0 7C0 10.866 3.13403 14 7 14ZM4.5 4C4.22388 4 4 4.22385 4 4.5V9.5C4 9.77615 4.22388 10 4.5 10H9.5C9.77612 10 10 9.77615 10 9.5V4.5C10 4.22385 9.77612 4 9.5 4H4.5Z" /></svg>',
                active: false,
                show: this.hasPermission('transport_stop')
              },
              {
                path: this.setUrl(URLConstants.ROUTE_LIST),
                title: 'Route',
                type: 'link',
                svgPath: '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.59998 2.47859V0.0285977L0.165836 2.24567C0.0642007 2.29649 0 2.40036 0 2.514V12.367C0 12.5841 0.223456 12.7293 0.421842 12.6411L4.37063 10.8861C4.45254 10.8497 4.54645 10.8518 4.62663 10.8919L8 12.5786V10.35C8 10.1567 8.1567 9.99997 8.35 9.99997C8.5433 9.99997 8.7 10.1567 8.7 10.35V12.7286L12.3342 10.9115C12.4358 10.8607 12.5 10.7568 12.5 10.6432V0.313996C12.5 0.0909811 12.2653 -0.0540676 12.0658 0.0456676L8.64361 1.75678C8.55389 1.80164 8.44769 1.79869 8.3606 1.74893L5.29998 0V2.47859C5.29998 2.67189 5.14328 2.82859 4.94998 2.82859C4.75668 2.82859 4.59998 2.67189 4.59998 2.47859ZM9.29938 4.2788C9.43543 4.25523 9.5266 4.12583 9.50303 3.98979C9.47945 3.85375 9.35006 3.76257 9.21402 3.78615C8.75616 3.86548 8.35117 4.0679 8.00772 4.32231C7.89677 4.40449 7.87345 4.56106 7.95564 4.67201C8.03782 4.78295 8.19439 4.80627 8.30533 4.72409C8.60071 4.50529 8.93451 4.34203 9.29938 4.2788ZM10.5383 3.91441C10.4085 3.86735 10.2651 3.93443 10.218 4.06423C10.171 4.19404 10.238 4.33741 10.3678 4.38447C10.5294 4.44304 10.6974 4.52269 10.8714 4.62711L11.1286 4.19836C10.929 4.0786 10.7321 3.98468 10.5383 3.91441ZM7.51831 5.53885C7.59849 5.42644 7.57235 5.27032 7.45994 5.19015C7.34753 5.10998 7.19141 5.13611 7.11124 5.24852C6.97475 5.4399 6.86238 5.62896 6.77639 5.80093L6.77052 5.81267L6.76592 5.82495C6.70383 5.99052 6.63796 6.1461 6.56882 6.29225C6.50977 6.41705 6.56308 6.5661 6.68788 6.62515C6.81269 6.6842 6.96174 6.63089 7.02078 6.50609C7.09432 6.35067 7.16396 6.18649 7.22933 6.01315C7.3027 5.86796 7.39959 5.70532 7.51831 5.53885ZM6.45037 7.45154C6.53443 7.342 6.51377 7.18506 6.40423 7.10101C6.29469 7.01695 6.13775 7.03761 6.0537 7.14715C5.83547 7.43155 5.60094 7.65827 5.35865 7.83744C5.24763 7.91953 5.22418 8.07608 5.30628 8.1871C5.38837 8.29811 5.54491 8.32156 5.65593 8.23946C5.93687 8.03172 6.20459 7.77184 6.45037 7.45154ZM1.90152 8.64252C2.05946 8.71021 2.24006 8.77197 2.43745 8.82202C2.57128 8.85595 2.70729 8.77497 2.74122 8.64113C2.77516 8.5073 2.69417 8.37129 2.56034 8.33736C2.38706 8.29342 2.23132 8.23988 2.09848 8.18295L1.90152 8.64252ZM4.65527 8.75933C4.78631 8.71584 4.85729 8.57435 4.8138 8.44331C4.77031 8.31227 4.62882 8.24129 4.49778 8.28478C4.17409 8.39221 3.8482 8.44103 3.5363 8.44813C3.39826 8.45127 3.28891 8.56572 3.29205 8.70375C3.29519 8.84179 3.40964 8.95114 3.54767 8.948C3.90355 8.9399 4.27926 8.88412 4.65527 8.75933Z" /></svg>',
                active: false,
                show: this.hasPermission('transport_route')
              },
              {
                path: this.setUrl(URLConstants.VEHICLE_LIST),
                title: 'Vehicle',
                type: 'link',
                svgPath: '<svg width="15" height="10" viewBox="0 0 15 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.46155 6.5769H2.92309V8.76921C2.92309 9.17281 2.59591 9.49998 2.19232 9.49998C1.78872 9.49998 1.46155 9.1728 1.46155 8.76921V6.5769Z" /><path d="M11.6923 6.5769H13.1538V8.76921C13.1538 9.17281 12.8266 9.49998 12.423 9.49998C12.0194 9.49998 11.6923 9.1728 11.6923 8.76921V6.5769Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M1.46155 4.65387C1.46155 4.10158 1.90926 3.65387 2.46155 3.65387H12.1539C12.7061 3.65387 13.1539 4.10158 13.1539 4.65387V7.89233H1.46155V4.65387ZM2.92312 5.70003C2.92312 5.37716 3.18487 5.11542 3.50774 5.11542H5.26159C5.58446 5.11542 5.8462 5.37716 5.8462 5.70003C5.8462 6.0229 5.58446 6.28465 5.26159 6.28465H3.50774C3.18486 6.28465 2.92312 6.0229 2.92312 5.70003ZM9.35389 5.11542C9.03102 5.11542 8.76928 5.37716 8.76928 5.70003C8.76928 6.0229 9.03102 6.28465 9.35389 6.28465H11.1077C11.4306 6.28465 11.6924 6.0229 11.6924 5.70003C11.6924 5.37716 11.4306 5.11542 11.1077 5.11542H9.35389Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M1.54924 4.12137L2.87744 0.136754C2.90466 0.0550858 2.98109 0 3.06718 0H11.5481C11.6342 0 11.7106 0.055086 11.7378 0.136754L13.066 4.12137C13.1092 4.25088 13.0128 4.38462 12.8763 4.38462H1.73897C1.60246 4.38462 1.50607 4.25088 1.54924 4.12137ZM2.92303 3.65385L4.01918 0.730769H10.5961L11.6923 3.65385H2.92303Z" /><path d="M0 2.6795C0 2.41044 0.218118 2.19232 0.48718 2.19232H2.26539C2.62862 2.19232 2.92308 2.48678 2.92308 2.85001C2.92308 3.21325 2.62862 3.50771 2.26538 3.50771H0.487179C0.218117 3.50771 0 3.28959 0 3.02053V2.6795Z" /><path d="M14.6154 2.6795C14.6154 2.41044 14.3972 2.19232 14.1282 2.19232H12.35C11.9867 2.19232 11.6923 2.48678 11.6923 2.85001C11.6923 3.21325 11.9867 3.50771 12.35 3.50771H14.1282C14.3972 3.50771 14.6154 3.28959 14.6154 3.02053V2.6795Z" /></svg>',
                active: false,
                show: this.hasPermission('transport_vehicle')
              },
              {
                path: this.setUrl(URLConstants.DRIVER_LIST),
                title: 'Driver',
                type: 'link',
                svgPath: '<svg width="13" height="16" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6.59998" cy="3" r="3" /><path fill-rule="evenodd" clip-rule="evenodd" d="M12.5052 10.0126C12.8319 10.8012 13 11.6464 13 12.5H10.7C10.7 11.4391 10.2785 10.4217 9.52838 9.67157C8.77823 8.92143 7.76082 8.5 6.69995 8.5C5.63909 8.5 4.62167 8.92143 3.87152 9.67157C3.12138 10.4217 2.69995 11.4391 2.69995 12.5L6.5 12.5L0 12.5C0 11.6464 0.168127 10.8012 0.494783 10.0126C0.821438 9.22394 1.30022 8.50739 1.90381 7.90381C2.50739 7.30023 3.22394 6.82144 4.01256 6.49478C4.80117 6.16813 5.64641 6 6.5 6C7.35359 6 8.19883 6.16813 8.98744 6.49478C9.77606 6.82144 10.4926 7.30023 11.0962 7.90381C11.6998 8.50739 12.1786 9.22394 12.5052 10.0126Z" /><path d="M9.69995 12.6C9.69995 12.206 9.62235 11.8159 9.47159 11.4519C9.32083 11.0879 9.09985 10.7572 8.82127 10.4787C8.5427 10.2001 8.21198 9.9791 7.848 9.82834C7.48402 9.67757 7.09392 9.59998 6.69995 9.59998C6.30599 9.59998 5.91588 9.67757 5.5519 9.82834C5.18792 9.9791 4.85721 10.2001 4.57863 10.4787C4.30005 10.7572 4.07908 11.0879 3.92831 11.4519C3.77755 11.8159 3.69995 12.206 3.69995 12.6H4.35969C4.35969 12.2926 4.42022 11.9883 4.53783 11.7044C4.65544 11.4205 4.82782 11.1625 5.04514 10.9452C5.26245 10.7278 5.52044 10.5555 5.80437 10.4379C6.0883 10.3202 6.39262 10.2597 6.69995 10.2597C7.00728 10.2597 7.3116 10.3202 7.59553 10.4379C7.87946 10.5555 8.13745 10.7278 8.35477 10.9452C8.57208 11.1625 8.74446 11.4205 8.86207 11.7044C8.97968 11.9883 9.04021 12.2926 9.04021 12.6H9.69995Z" /><path d="M7.59998 12.6C7.59998 12.4687 7.57411 12.3386 7.52386 12.2173C7.4736 12.096 7.39994 11.9857 7.30708 11.8929C7.21422 11.8 7.10398 11.7264 6.98266 11.6761C6.86133 11.6258 6.7313 11.6 6.59998 11.6C6.46865 11.6 6.33862 11.6258 6.21729 11.6761C6.09597 11.7264 5.98573 11.8 5.89287 11.8929C5.80001 11.9857 5.72635 12.096 5.6761 12.2173C5.62584 12.3386 5.59998 12.4687 5.59998 12.6L6.59998 12.6H7.59998Z" /><path d="M6.5 10V12H7V10H6.5Z" /><path d="M8.5 10.5L7 12L7.5 12.5L9 11L8.5 10.5Z" /><path d="M4.5 11.5L6 12.5L6.5 12L5 11L4.5 11.5Z" /></svg>',
                active: false,
                show: this.hasPermission('transport_driver')
              }
            ]
          },
          {
            path: this.setUrl(URLConstants.ASSIGN_TRANSPORT),
            title: 'Assign transport',
            type: 'link',
            svgPath: '<svg width="13" height="8" viewBox="0 0 13 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6.5C4 7.32843 3.32843 8 2.5 8C1.67157 8 1 7.32843 1 6.5C1 5.67157 1.67157 5 2.5 5C3.32843 5 4 5.67157 4 6.5ZM1.60157 6.5C1.60157 6.99619 2.00381 7.39843 2.5 7.39843C2.99619 7.39843 3.39843 6.99619 3.39843 6.5C3.39843 6.00381 2.99619 5.60157 2.5 5.60157C2.00381 5.60157 1.60157 6.00381 1.60157 6.5Z" /><path d="M12 6.5C12 7.32843 11.3284 8 10.5 8C9.67157 8 9 7.32843 9 6.5C9 5.67157 9.67157 5 10.5 5C11.3284 5 12 5.67157 12 6.5ZM9.60157 6.5C9.60157 6.99619 10.0038 7.39843 10.5 7.39843C10.9962 7.39843 11.3984 6.99619 11.3984 6.5C11.3984 6.00381 10.9962 5.60157 10.5 5.60157C10.0038 5.60157 9.60157 6.00381 9.60157 6.5Z" /><path d="M9 2V0C11 0 11.5 1.33333 11.5 2H9Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M8 0H0.5C0.223858 0 0 0.223858 0 0.5V2H1.6C1.82091 2 2 2.17909 2 2.4C2 2.62091 1.82091 2.8 1.6 2.8H0V4H3.6C3.82091 4 4 4.17909 4 4.4C4 4.62091 3.82091 4.8 3.6 4.8H0V6.5C0 6.77614 0.223858 7 0.5 7H1.08535C1.03008 6.84361 1 6.67532 1 6.5C1 5.67157 1.67157 5 2.5 5C3.32843 5 4 5.67157 4 6.5C4 6.67532 3.96992 6.84361 3.91465 7H9.08535C9.03008 6.84361 9 6.67532 9 6.5C9 5.67157 9.67157 5 10.5 5C11.3284 5 12 5.67157 12 6.5C12 6.67532 11.9699 6.84361 11.9146 7H12.5C12.7761 7 13 6.77614 13 6.5V3H8V0Z" /></svg>',
            active: false,
            show: this.hasPermission('transport_assign_transport')
          },
          {
            path: this.setUrl(URLConstants.TRANSPORT_TRANSFER),
            title: 'Student Transport Transfer',
            type: 'link',
            svgPath: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 11C9.20911 11 11 9.20914 11 7C11 4.79086 9.20911 3 7 3C4.79089 3 3 4.79086 3 7C3 9.20914 4.79089 11 7 11ZM6.98401 10C6.49878 9.29999 5.47009 7.78 5.23718 7.29999C4.849 6.39999 4.65491 4.48001 6.98401 4C7.95435 4.20001 9.66235 5.14001 8.73071 7.29999L6.98401 10Z" /><path d="M11 9C7.79999 13 4.66666 11 3.49999 9.5C3.09999 12.3 4.66666 13 5.49999 13H9.49999V14L14 11L11 9Z" /><path d="M3.00001 5C6.20001 1 9.33334 3 10.5 4.5C10.9 1.7 9.33334 1 8.50001 1H4.50001V0L5.72205e-06 3L3.00001 5Z" /><circle cx="7" cy="6" r="1" /></svg>',
            active: false,
            show: this.hasPermission('transport_assign_transport')
          },
          {
            path: this.setUrl(URLConstants.SEND_TRANSPORT_WHATSAPP_MESSAGE),
            title: 'Send Transport Message',
            type: 'link',
            svgPath: '<svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 5H13.7C13.8657 5 14 5.13431 14 5.29999V8.20001C14 8.36566 13.8657 8.5 13.7 8.5H12.937C12.9781 8.34021 13 8.17267 13 8C13 6.89542 12.1046 6 11 6C9.89539 6 9 6.89542 9 8C9 8.17267 9.02185 8.34021 9.06299 8.5H4.93701C4.97815 8.34021 5 8.17267 5 8C5 6.89542 4.10461 6 3 6C1.89539 6 1 6.89542 1 8C1 8.17267 1.02185 8.34021 1.06299 8.5H0.300049C0.134277 8.5 0 8.36566 0 8.20001V5Z" /><path d="M4.70005 7.99999C4.70005 8.93887 3.93893 9.69999 3.00005 9.69999C2.06116 9.69999 1.30005 8.93887 1.30005 7.99999C1.30005 7.0611 2.06116 6.29999 3.00005 6.29999C3.93893 6.29999 4.70005 7.0611 4.70005 7.99999ZM1.99499 7.99999C1.99499 8.55506 2.44497 9.00504 3.00005 9.00504C3.55513 9.00504 4.00511 8.55506 4.00511 7.99999C4.00511 7.44491 3.55513 6.99493 3.00005 6.99493C2.44497 6.99493 1.99499 7.44491 1.99499 7.99999Z" /><path d="M12.7 7.99999C12.7 8.93887 11.9389 9.69999 11 9.69999C10.0612 9.69999 9.30005 8.93887 9.30005 7.99999C9.30005 7.0611 10.0612 6.29999 11 6.29999C11.9389 6.29999 12.7 7.0611 12.7 7.99999ZM9.99499 7.99999C9.99499 8.55506 10.445 9.00504 11 9.00504C11.5551 9.00504 12.0051 8.55506 12.0051 7.99999C12.0051 7.44491 11.5551 6.99493 11 6.99493C10.445 6.99493 9.99499 7.44491 9.99499 7.99999Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M0 5V3.5L1.5 1H5V5H4V2H2L1 4V5H0Z" /><path d="M6 3.90001V0.694319C6 0.612981 6.09194 0.565669 6.15812 0.612945L9.4456 2.96114C9.47854 2.98466 9.5224 2.98602 9.55673 2.96456L13.347 0.595625C13.4136 0.553997 13.5 0.601881 13.5 0.680425V3.90001C13.5 3.95524 13.4553 4.00001 13.4 4.00001H6.1C6.04477 4.00001 6 3.95524 6 3.90001Z" /><path d="M12.5759 0H6.82405C6.62948 0 6.54947 0.249657 6.7078 0.362747L9.58372 2.41697C9.65326 2.46664 9.74668 2.46664 9.81622 2.41697L12.6921 0.362747C12.8505 0.249657 12.7705 0 12.5759 0Z" /></svg>',
            active: false,
            show: this.hasPermission('transport_send_transport_message')
          },
          {
            title: 'Setting',
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z" /><path class="cr-color" d="M8.57371 5.83684C8.57371 7.29312 7.39316 8.47367 5.93688 8.47367C4.4806 8.47367 3.30005 7.29312 3.30005 5.83684C3.30005 4.38056 4.4806 3.20001 5.93688 3.20001C7.39316 3.20001 8.57371 4.38056 8.57371 5.83684ZM4.30547 5.83684C4.30547 6.73785 5.03588 7.46825 5.93688 7.46825C6.83788 7.46825 7.56829 6.73785 7.56829 5.83684C7.56829 4.93584 6.83788 4.20543 5.93688 4.20543C5.03588 4.20543 4.30547 4.93584 4.30547 5.83684Z" fill="white"/><path class="cr-color" d="M5.20496 2.80001C5.20496 2.68955 5.2945 2.60001 5.40496 2.60001H6.32337C6.43383 2.60001 6.52337 2.68955 6.52337 2.80001V3.91842H5.20496V2.80001Z" fill="white"/><path class="cr-color" d="M3.24872 4.39732C3.16414 4.32627 3.15318 4.20012 3.22423 4.11554L3.81498 3.41234C3.88603 3.32776 4.01219 3.3168 4.09676 3.38785L4.9531 4.10725L4.10505 5.11672L3.24872 4.39732Z" fill="white"/><path class="cr-color" d="M8.57404 7.56004C8.65861 7.63109 8.66958 7.75725 8.59853 7.84182L8.00777 8.54503C7.93672 8.6296 7.81057 8.64057 7.72599 8.56952L6.76648 7.76344L7.61452 6.75397L8.57404 7.56004Z" fill="white"/><path class="cr-color" d="M7.94695 3.38114C8.0345 3.31379 8.16007 3.33016 8.22742 3.4177L8.78745 4.14562C8.8548 4.23316 8.83843 4.35873 8.75089 4.42609L7.86445 5.10806L7.06052 4.06312L7.94695 3.38114Z" fill="white"/><path class="cr-color" d="M5.20496 7.87366H6.52337V8.99207C6.52337 9.10253 6.43383 9.19207 6.32337 9.19207H5.40496C5.2945 9.19207 5.20496 9.10253 5.20496 8.99207V7.87366Z" fill="white"/><path class="cr-color" d="M7.8418 6.55521L7.84482 5.23679L8.96323 5.23936C9.07369 5.23961 9.16303 5.32936 9.16278 5.43982L9.16067 6.35823C9.16041 6.46869 9.07067 6.55803 8.96021 6.55777L7.8418 6.55521Z" fill="white"/><path class="cr-color" d="M4.02136 5.24139L4.01834 6.55981L2.89992 6.55724C2.78947 6.55699 2.70013 6.46724 2.70038 6.35678L2.70249 5.43837C2.70274 5.32791 2.79249 5.23857 2.90295 5.23883L4.02136 5.24139Z" fill="white"/><path class="cr-color" d="M4.31238 6.50336L5.19179 7.48563L4.09281 8.46953C4.01051 8.5432 3.88407 8.53622 3.8104 8.45392L3.19779 7.76967C3.12412 7.68737 3.1311 7.56093 3.2134 7.48725L4.31238 6.50336Z" fill="white"/></svg>',
            type: 'sub',
            active: false,
            show: this.hasModule('settings_transport_settings'),

            children:
              [
                {
                  path: this.setUrl(URLConstants.TRANSPORT_SETTING),
                  title: 'Transport Setting',
                  type: 'link',
                  active: false,
                  show: this.hasPermission('settings_transport_settings')
                }
              ]
          },
          {
            title: 'Notification',
            type: 'sub',
            show: (this.hasModule('settings_notification')  ),
            active: false,
            svgPath: '<svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.66321 0.416363C4.66321 0.186412 4.84962 0 5.07957 0C5.30952 0 5.49593 0.186412 5.49593 0.416363V0.832726H4.66321V0.416363Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.36683 0.949529C6.21808 0.901778 6.05909 0.86283 5.88923 0.834128C5.8838 0.83321 5.87815 0.832733 5.87265 0.832733H4.63185C3.79998 0.832733 2.05399 1.41445 1.71834 3.7401C1.71767 3.74478 1.71731 3.74965 1.71731 3.75438V5.82909C1.71731 6.37903 1.39045 7.63717 0.0891269 8.30834C0.0655556 8.3205 0.0469179 8.34132 0.0396388 8.36683C-0.0823034 8.79406 0.00956711 9.57635 1.30095 9.57635H9.58677C9.61329 9.57635 9.63883 9.56602 9.65682 9.54654C9.92994 9.2509 10.2692 8.5596 9.63531 7.91807C9.63069 7.91339 9.62567 7.90924 9.62021 7.90555C9.20129 7.6231 8.3791 6.82202 8.3791 5.82909V4.99585C8.36184 4.9962 8.34454 4.99638 8.32719 4.99638C6.94749 4.99638 5.82902 3.8779 5.82902 2.4982C5.82902 1.91324 6.03006 1.37524 6.36683 0.949529Z"/><circle cx="8.32732" cy="2.49818" r="1.66545"/><path d="M6.66184 9.99272C6.66184 10.4344 6.48637 10.858 6.17404 11.1704C5.8617 11.4827 5.43809 11.6582 4.99638 11.6582C4.55468 11.6582 4.13107 11.4827 3.81873 11.1704C3.5064 10.858 3.33093 10.4344 3.33093 9.99272L4.99638 9.99272H6.66184Z"/></svg>',
            children: [
              {
                title: 'Transport Notification',
                type: 'link',
                path: this.setUrl(URLConstants.NOTIFICATION_SETTING+"/9"),
                show: this.hasPermission('settings_notification'),
                active: false
              },
            ]
		      }
        ],
      },
      ...moduleName.find(item => item == 'online_exam') && {
        title: 'Online Exam',
        icon: 'desktop',
        type: 'sub',
        active: false,
        show: this.getInstituteModule('Online Exam')&&((this.hasModule('online_exam_chapter') || this.hasModule('online_exam_question') || this.hasModule('online_exam_result')
          || this.hasModule('online_exam_exam'))),
        children:
          [
            {
              path: this.setUrl(URLConstants.CHAPTER_LIST),
              title: 'Chapter',
              type: 'link',
              svgPath: '<svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 1C0 0.447693 0.447754 0 1 0H10C10.5522 0 11 0.447693 11 1V10.0854C10.8436 10.0301 10.6753 10 10.5 10C9.67163 10 9 10.6716 9 11.5C9 12.3284 9.67163 13 10.5 13C10.6753 13 10.8436 12.9699 11 12.9146V13C11 13.5523 10.5522 14 10 14H1C0.447754 14 0 13.5523 0 13V1ZM7.54312 10H1.49989C1.44057 10 1.38403 10.0258 1.34811 10.073C0.961076 10.5815 0.611388 11.5231 1.34968 12.8976C1.38374 12.961 1.45074 13 1.52271 13H7.54316C7.70298 13 7.80432 12.8179 7.73868 12.6722C7.48958 12.1192 7.30007 11.2166 7.73126 10.3245C7.8008 10.1806 7.70293 10 7.54312 10Z"/></svg>',
              active: false,
              show: this.hasPermission('online_exam_chapter')
            },
            {
              path: this.setUrl(URLConstants.QUESTION_LIST),
              title: 'Question',
              type: 'link',
              svgPath: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14ZM6.23295 9.49432V9.54545H7.25568V9.49432C7.26136 9.14205 7.2983 8.84801 7.36648 8.61222C7.43466 8.37642 7.54403 8.1733 7.6946 8.00284C7.84517 7.82955 8.04545 7.66477 8.29545 7.50852C8.54545 7.35511 8.75852 7.17898 8.93466 6.98011C9.11364 6.78125 9.25 6.5554 9.34375 6.30256C9.44034 6.04972 9.48864 5.76705 9.48864 5.45455C9.48864 5.01136 9.38636 4.61648 9.18182 4.26989C8.98011 3.9233 8.69318 3.65057 8.32102 3.4517C7.9517 3.25284 7.51705 3.15341 7.01705 3.15341C6.55682 3.15341 6.13778 3.24432 5.75994 3.42614C5.38494 3.60795 5.08239 3.87074 4.85227 4.21449C4.625 4.55824 4.5 4.97159 4.47727 5.45455H5.55114C5.57386 5.11932 5.65767 4.84801 5.80256 4.64062C5.94744 4.43324 6.12784 4.28125 6.34375 4.18466C6.55966 4.08807 6.78409 4.03977 7.01705 4.03977C7.28409 4.03977 7.52699 4.09517 7.74574 4.20597C7.96449 4.31676 8.1392 4.47443 8.26989 4.67898C8.40057 4.88352 8.46591 5.125 8.46591 5.40341C8.46591 5.62784 8.42614 5.83239 8.34659 6.01705C8.26989 6.2017 8.16477 6.36506 8.03125 6.5071C7.89773 6.64631 7.74716 6.76705 7.57955 6.86932C7.30114 7.03693 7.0625 7.22017 6.86364 7.41903C6.66477 7.6179 6.51136 7.87784 6.40341 8.19886C6.29545 8.51989 6.23864 8.9517 6.23295 9.49432ZM6.23722 11.8423C6.38778 11.9929 6.56818 12.0682 6.77841 12.0682C6.92045 12.0682 7.0483 12.0341 7.16193 11.9659C7.27841 11.8949 7.37074 11.8011 7.43892 11.6847C7.50994 11.5682 7.54545 11.4403 7.54545 11.3011C7.54545 11.0909 7.47017 10.9105 7.3196 10.7599C7.16903 10.6094 6.98864 10.5341 6.77841 10.5341C6.56818 10.5341 6.38778 10.6094 6.23722 10.7599C6.08665 10.9105 6.01136 11.0909 6.01136 11.3011C6.01136 11.5114 6.08665 11.6918 6.23722 11.8423Z" /></svg>',
              active: false,
              show: this.hasPermission('online_exam_question')
            },
            {
              path: this.setUrl(URLConstants.EXAM_LIST),
              title: 'Exam',
              type: 'link',
              svgPath: '<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.30005" y="0.200012" width="6.5" height="2.5" rx="1" /><path fill-rule="evenodd" clip-rule="evenodd" d="M2 0C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.895431 12 2 12H6.00017L6 12.0008L6.00668 12H9C10.1046 12 11 11.1046 11 10V2C11 0.895431 10.1046 0 9 0H8.1C8.59706 0 9 0.402944 9 0.9V2.1C9 2.59706 8.59706 3 8.1 3H2.9C2.40294 3 2 2.59706 2 2.1V0.9C2 0.402944 2.40294 0 2.9 0H2ZM6.00668 12L7.53149 11.8094L9.733 9.60789L8.48866 8.36356L6.28715 10.5651L6.00017 12H6.00668ZM2.5 5C2.22386 5 2 5.22386 2 5.5C2 5.77614 2.22386 6 2.5 6H7.5C7.77614 6 8 5.77614 8 5.5C8 5.22386 7.77614 5 7.5 5H2.5ZM2 7.5C2 7.22386 2.22386 7 2.5 7H5.5C5.77614 7 6 7.22386 6 7.5C6 7.77614 5.77614 8 5.5 8H2.5C2.22386 8 2 7.77614 2 7.5ZM9.3773 7.58209L8.94495 8.01294L10.1091 9.1812L10.5415 8.75035C10.8641 8.42887 10.865 7.90673 10.5435 7.58413C10.222 7.26152 9.69991 7.26061 9.3773 7.58209Z" /></svg>',
              active: false,
              show: this.hasPermission('online_exam_exam')
            },
            {
              path: this.setUrl(URLConstants.RESULT_LIST),
              title: 'Result',
              type: 'link',
              svgPath: '<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1 0C0.447715 0 0 0.447715 0 1V11C0 11.5523 0.447715 12 1 12H9V10H11V1C11 0.447715 10.5523 0 10 0H1ZM3.09517 5H3.75426L3.97006 4.33665H5.02042L5.2358 5H5.89489L4.89205 2.09091H4.09943L3.09517 5ZM4.86453 3.85653L4.5071 2.75568H4.48438L4.12625 3.85653H4.86453ZM6.10511 2.84233V2.09091H5.35369V1.58239H6.10511V0.830966H6.61364V1.58239H7.36506V2.09091H6.61364V2.84233H6.10511ZM1.4 6C1.17909 6 1 6.17909 1 6.4C1 6.62091 1.17909 6.8 1.4 6.8H9.6C9.82091 6.8 10 6.62091 10 6.4C10 6.17909 9.82091 6 9.6 6H1.4ZM1 8.4C1 8.17909 1.17909 8 1.4 8H9.6C9.82091 8 10 8.17909 10 8.4C10 8.62091 9.82091 8.8 9.6 8.8H1.4C1.17909 8.8 1 8.62091 1 8.4Z" /><path d="M9.5 10.5V12L11 10.5H9.5Z" /></svg>',
              active: false,
              show: this.hasPermission('online_exam_result')
            }
          ]
      },
      ...moduleName.find(item => item == 'inventory') && {
        title: 'Inventory',
        icon: 'ruler-pencil',
        type: 'sub',
        active: false,
        show: (this.getInstituteModule('Inventory') && (this.hasModule('inventory_vendor_list') || this.hasModule('inventory_inventory_item_list') || this.hasModule('inventory_requisition_list') || this.hasModule('inventory_inventory_setting')
          || this.hasModule('inventory_purchase_order_list') || this.hasModule('inventory_invoice_order_list') || this.hasModule('inventory_purchase_return_order_list') || this.hasModule('inventory_internal_issue_list') || this.hasModule('inventory_internal_issue_return_list')
          || this.hasModule('inventory_discard_item_list') || this.hasModule('inventory_kit_list') || this.hasModule('inventory_item_summary'))),
        children: [
          {
            title: 'Inventory Setup',
            type: 'sub',
            show: (this.hasModule('inventory_inventory_item_list')  ),
            active: false,
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z"/><path class="cr-color" d="M8.25325 5.84397C8.25325 7.12351 7.21598 8.16078 5.93644 8.16078C4.6569 8.16078 3.61963 7.12351 3.61963 5.84397C3.61963 4.56443 4.6569 3.52716 5.93644 3.52716C7.21598 3.52716 8.25325 4.56443 8.25325 5.84397ZM4.50303 5.84397C4.50303 6.63562 5.14479 7.27738 5.93644 7.27738C6.72809 7.27738 7.36985 6.63562 7.36985 5.84397C7.36985 5.05232 6.72809 4.41056 5.93644 4.41056C5.14479 4.41056 4.50303 5.05232 4.50303 5.84397Z" fill="white"/><path class="cr-color" d="M5.29346 3.2C5.29346 3.08954 5.383 3 5.49346 3H6.25186C6.36232 3 6.45186 3.08954 6.45186 3.2V4.15841H5.29346V3.2Z" fill="white"/><path class="cr-color" d="M3.59308 4.59483C3.5085 4.52378 3.49754 4.39763 3.56859 4.31305L4.05642 3.73236C4.12747 3.64779 4.25362 3.63683 4.3382 3.70787L5.07202 4.32435L4.3269 5.21131L3.59308 4.59483Z" fill="white"/><path class="cr-color" d="M8.23505 7.34242C8.31962 7.41347 8.33059 7.53963 8.25954 7.6242L7.77171 8.20489C7.70066 8.28947 7.5745 8.30043 7.48993 8.22938L6.66545 7.53675L7.41057 6.64979L8.23505 7.34242Z" fill="white"/><path class="cr-color" d="M7.68328 3.70112C7.77083 3.63376 7.8964 3.65013 7.96375 3.73768L8.4262 4.33877C8.49356 4.42632 8.47719 4.55189 8.38964 4.61924L7.63003 5.20365L6.92367 4.28552L7.68328 3.70112Z" fill="white"/><path class="cr-color" d="M5.29346 7.63367H6.45186V8.59207C6.45186 8.70253 6.36232 8.79207 6.25186 8.79207H5.49346C5.383 8.79207 5.29346 8.70253 5.29346 8.59207V7.63367Z" fill="white"/><path class="cr-color" d="M7.61011 6.47516L7.61277 5.31676L8.57117 5.31896C8.68162 5.31921 8.77096 5.40896 8.77071 5.51941L8.76897 6.27782C8.76872 6.38827 8.67897 6.47761 8.56851 6.47736L7.61011 6.47516Z" fill="white"/><path class="cr-color" d="M4.25342 5.3208L4.25076 6.4792L3.29236 6.477C3.1819 6.47675 3.09256 6.387 3.09282 6.27655L3.09456 5.51814C3.09481 5.40769 3.18456 5.31835 3.29502 5.3186L4.25342 5.3208Z" fill="white"/><path class="cr-color" d="M4.50903 6.42957L5.28171 7.29262L4.3342 8.14092C4.2519 8.2146 4.12546 8.20761 4.05178 8.12532L3.54591 7.56027C3.47223 7.47798 3.47922 7.35154 3.56152 7.27786L4.50903 6.42957Z" fill="white"/><mask id="path-11-inside-1_183_159" fill="white"><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z"/></mask><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-11-inside-1_183_159)"/><mask id="path-12-inside-2_183_159" fill="white"><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z"/></mask><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-12-inside-2_183_159)"/><path class="cr-color" d="M1.97291 4.91572L2.10774 3.75636L3.04436 4.4528L1.97291 4.91572Z" fill="white"/><path  d="M9.9355 7.02695L9.98777 8.19295L8.95184 7.65522L9.9355 7.02695Z" fill="white"/></svg>',
            children: [
              {
                title: 'Item Types',
                type: 'link',
                path: this.setUrl(URLConstants.ADD_INVENTORY_TYPE),
                show: this.hasPermission('inventory_inventory_item_list'),
                active: false
              },
              {
                title: 'Inventory Warehouse',
                type: 'link',
                path: this.setUrl(URLConstants.ADD_STORE_TYPE),
                show: this.hasPermission('inventory_inventory_item_list'),
                active: false
              }
            ]
          },
          { 
            path: this.setUrl(URLConstants.INVENTORY_LIST), 
            title: 'Inventory Item', 
            type: 'link', 
            svgPath:'<svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2C0 0.89543 0.895431 0 2 0H9C10.1046 0 11 0.895431 11 2V11C11 12.1046 10.1046 13 9 13H2C0.895431 13 0 12.1046 0 11V2ZM2 3.5C2 3.22386 2.22386 3 2.5 3H8.5C8.77614 3 9 3.22386 9 3.5C9 3.77614 8.77614 4 8.5 4H2.5C2.22386 4 2 3.77614 2 3.5ZM2.5 5C2.22386 5 2 5.22386 2 5.5C2 5.77614 2.22386 6 2.5 6H7.5C7.77614 6 8 5.77614 8 5.5C8 5.22386 7.77614 5 7.5 5H2.5ZM2 7.5C2 7.22386 2.22386 7 2.5 7H6.5C6.77614 7 7 7.22386 7 7.5C7 7.77614 6.77614 8 6.5 8H2.5C2.22386 8 2 7.77614 2 7.5ZM2.5 9C2.22386 9 2 9.22386 2 9.5C2 9.77614 2.22386 10 2.5 10H4.5C4.77614 10 5 9.77614 5 9.5C5 9.22386 4.77614 9 4.5 9H2.5Z"/></svg>',
            active: false, 
            show: this.hasPermission('inventory_inventory_item_list') 
          },
          {
            path: this.setUrl(URLConstants.VENDOR_LIST),
            title: 'Vendor List',
            type: 'link',
            svgPath: '<svg width="13" height="19" viewBox="0 0 13 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 12.5C13 11.6464 12.8319 10.8012 12.5052 10.0126C12.1786 9.22394 11.6998 8.50739 11.0962 7.90381C10.4926 7.30023 9.77606 6.82144 8.98744 6.49478C8.19883 6.16813 7.35359 6 6.5 6C5.64641 6 4.80117 6.16813 4.01256 6.49478C3.22394 6.82144 2.50739 7.30023 1.90381 7.90381C1.30022 8.50739 0.821438 9.22394 0.494783 10.0126C0.168127 10.8012 -7.46234e-08 11.6464 0 12.5L6.5 12.5H13Z"/><circle cx="6.59998" cy="3" r="3"/></svg>',
            active: false,
            show: this.hasPermission('inventory_vendor_list')
          },
          {
            path: this.setUrl(URLConstants.REQUISITION_LIST),
            title: 'Requisition List',
            type: 'link',
            svgPath: '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 0C2.89543 0 2 0.89543 2 2V5C3.10457 5 4 5.89543 4 7C4 8.10457 3.10457 9 2 9V11C2 12.1046 2.89543 13 4 13H11C12.1046 13 13 12.1046 13 11V2C13 0.895431 12.1046 0 11 0H4ZM5 3.5C5 3.22386 5.22386 3 5.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H5.5C5.22386 4 5 3.77614 5 3.5ZM8.5 5C8.22386 5 8 5.22386 8 5.5C8 5.77614 8.22386 6 8.5 6H11.5C11.7761 6 12 5.77614 12 5.5C12 5.22386 11.7761 5 11.5 5H8.5ZM9 7.5C9 7.22386 9.22386 7 9.5 7H11.5C11.7761 7 12 7.22386 12 7.5C12 7.77614 11.7761 8 11.5 8H9.5C9.22386 8 9 7.77614 9 7.5ZM11.5 9C11.2239 9 11 9.22386 11 9.5C11 9.77614 11.2239 10 11.5 10C11.7761 10 12 9.77614 12 9.5C12 9.22386 11.7761 9 11.5 9Z"/><path d="M4 7C4 8.10457 3.10457 9 2 9C0.895431 9 0 8.10457 0 7C0 5.89543 0.895431 5 2 5C3.10457 5 4 5.89543 4 7ZM0.578684 7C0.578684 7.78497 1.21503 8.42132 2 8.42132C2.78497 8.42132 3.42132 7.78497 3.42132 7C3.42132 6.21503 2.78497 5.57868 2 5.57868C1.21503 5.57868 0.578684 6.21503 0.578684 7Z"/><path d="M1 7L1.5 7.5L3 6.5" stroke="black" stroke-width="0.4" stroke-linecap="round"/></svg>',
            active: false,
            show: this.hasPermission('inventory_requisition_list') && this.is_admin
          },
          {
            path: this.setUrl(URLConstants.FACULTY_REQUISITION_LIST),
            title: 'Requisition List',
            type: 'link',
            svgPath: '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 0C2.89543 0 2 0.89543 2 2V5C3.10457 5 4 5.89543 4 7C4 8.10457 3.10457 9 2 9V11C2 12.1046 2.89543 13 4 13H11C12.1046 13 13 12.1046 13 11V2C13 0.895431 12.1046 0 11 0H4ZM5 3.5C5 3.22386 5.22386 3 5.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H5.5C5.22386 4 5 3.77614 5 3.5ZM8.5 5C8.22386 5 8 5.22386 8 5.5C8 5.77614 8.22386 6 8.5 6H11.5C11.7761 6 12 5.77614 12 5.5C12 5.22386 11.7761 5 11.5 5H8.5ZM9 7.5C9 7.22386 9.22386 7 9.5 7H11.5C11.7761 7 12 7.22386 12 7.5C12 7.77614 11.7761 8 11.5 8H9.5C9.22386 8 9 7.77614 9 7.5ZM11.5 9C11.2239 9 11 9.22386 11 9.5C11 9.77614 11.2239 10 11.5 10C11.7761 10 12 9.77614 12 9.5C12 9.22386 11.7761 9 11.5 9Z"/><path d="M4 7C4 8.10457 3.10457 9 2 9C0.895431 9 0 8.10457 0 7C0 5.89543 0.895431 5 2 5C3.10457 5 4 5.89543 4 7ZM0.578684 7C0.578684 7.78497 1.21503 8.42132 2 8.42132C2.78497 8.42132 3.42132 7.78497 3.42132 7C3.42132 6.21503 2.78497 5.57868 2 5.57868C1.21503 5.57868 0.578684 6.21503 0.578684 7Z"/><path d="M1 7L1.5 7.5L3 6.5" stroke="black" stroke-width="0.4" stroke-linecap="round"/></svg>',
            active: false,
            show: this.hasPermission('inventory_requisition_list') && !this.is_admin
          },
          {
            path: this.setUrl(URLConstants.PURCHASE_ORDER_LIST),
            title: 'Purchase Order',
            type: 'link',
            svgPath: '<svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.56116 3C9.56116 4.65685 8.21801 6 6.56116 6C4.9043 6 3.56116 4.65685 3.56116 3C3.56116 1.34315 4.9043 0 6.56116 0C8.21801 0 9.56116 1.34315 9.56116 3ZM4.42378 3C4.42378 4.18044 5.38072 5.13738 6.56116 5.13738C7.7416 5.13738 8.69853 4.18044 8.69853 3C8.69853 1.81956 7.7416 0.862623 6.56116 0.862623C5.38072 0.862623 4.42378 1.81956 4.42378 3Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M3.20068 3H9.92146C10.8748 3 11.6957 3.67292 11.8826 4.60777L13.0826 10.6078C13.3301 11.8453 12.3836 13 11.1215 13H2.00068C0.738587 13 -0.207999 11.8454 0.0395182 10.6078L1.23952 4.60777C1.42649 3.67292 2.24732 3 3.20068 3ZM3.57526 5.29154C3.55835 5.11832 3.70225 4.97794 3.87628 4.97928C4.05032 4.98062 4.18816 5.12341 4.2099 5.29609C4.27449 5.8091 4.50571 6.29015 4.87253 6.66267C5.3135 7.1105 5.91431 7.36481 6.54278 7.36967C7.17125 7.37452 7.77591 7.12951 8.22374 6.68854C8.59626 6.32172 8.83488 5.8443 8.90739 5.33235C8.9318 5.16003 9.07182 5.01939 9.24586 5.02073C9.41989 5.02207 9.5616 5.16466 9.54202 5.3376C9.4651 6.01705 9.15767 6.65345 8.66595 7.13764C8.09902 7.69589 7.33354 8.00606 6.53791 7.99992C5.74229 7.99377 4.98169 7.67182 4.42344 7.10489C3.93925 6.61317 3.64169 5.9721 3.57526 5.29154Z"/></svg>',
            active: false,
            show: this.hasPermission('inventory_purchase_order_list')
          },
          {
            path: this.setUrl(URLConstants.INVOICE_ORDER_LIST),
            title: 'Invoice Verification',
            type: 'link',
            svgPath: '<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 2.5V0.5L2.5 2.5H4.5Z"/><path d="M4 7C4 8.10457 3.10457 9 2 9C0.895431 9 0 8.10457 0 7C0 5.89543 0.895431 5 2 5C3.10457 5 4 5.89543 4 7ZM0.578684 7C0.578684 7.78497 1.21503 8.42132 2 8.42132C2.78497 8.42132 3.42132 7.78497 3.42132 7C3.42132 6.21503 2.78497 5.57868 2 5.57868C1.21503 5.57868 0.578684 6.21503 0.578684 7Z"/><path d="M1 7L1.5 7.5L3 6.5" stroke="black" stroke-width="0.4" stroke-linecap="round"/><path fill-rule="evenodd" clip-rule="evenodd" d="M4.59961 2.99988H2V5C3.10461 5 4 5.89545 4 7C4 8.10455 3.10461 9 2 9V12.4C2 12.7314 2.26868 13 2.59998 13H11.4C11.7313 13 12 12.7314 12 12.4V0.599976C12 0.268616 11.7313 0 11.4 0H4.99951V2.59985C4.99951 2.8208 4.82043 2.99988 4.59961 2.99988ZM5.34998 5C5.15674 5 5 5.15668 5 5.34998C5 5.54327 5.15674 5.70001 5.34998 5.70001H10.65C10.8433 5.70001 11 5.54327 11 5.34998C11 5.15668 10.8433 5 10.65 5H5.34998ZM7 7.19995C7 7.00665 7.15674 6.84998 7.34998 6.84998H10.65C10.8433 6.84998 11 7.00665 11 7.19995C11 7.39325 10.8433 7.54999 10.65 7.54999H7.34998C7.15674 7.54999 7 7.39325 7 7.19995ZM8.34998 9.00012C8.15674 9.00012 8 9.1568 8 9.3501C8 9.5434 8.15674 9.70013 8.34998 9.70013H10.65C10.8433 9.70013 11 9.5434 11 9.3501C11 9.1568 10.8433 9.00012 10.65 9.00012H8.34998Z"/></svg>',
            active: false,
            show: this.hasPermission('inventory_invoice_order_list')
          },
          {
            path: this.setUrl(URLConstants.PURCHASE_RETURN_LIST),
            title: 'Purchase Return Order List',
            type: 'link',
            svgPath: '<svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 3C7 2.73478 6.84196 2.48043 6.56066 2.29289C6.27936 2.10536 5.89782 2 5.5 2C5.10218 2 4.72064 2.10536 4.43934 2.29289C4.15804 2.48043 4 2.73478 4 3L4.58568 3C4.58568 2.83834 4.68201 2.6833 4.85348 2.56899C5.02495 2.45468 5.25751 2.39046 5.5 2.39046C5.74249 2.39046 5.97505 2.45468 6.14652 2.56899C6.31799 2.6833 6.41432 2.83834 6.41432 3H7Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2 0C0.895386 0 0 0.895447 0 2V11C0 12.1046 0.895386 13 2 13H9C10.1046 13 11 12.1046 11 11V2C11 0.895447 10.1046 0 9 0H2ZM3.78076 3H7.21924C7.6781 3 8.07812 3.31232 8.18933 3.75745L8.68933 5.75745C8.84717 6.38861 8.36975 7 7.71924 7H3.28076C2.63025 7 2.15283 6.38861 2.31067 5.75745L2.81067 3.75745C2.92188 3.31232 3.3219 3 3.78076 3ZM2 8.5C2 8.22388 2.22388 8 2.5 8H8.5C8.77612 8 9 8.22388 9 8.5C9 8.77612 8.77612 9 8.5 9H2.5C2.22388 9 2 8.77612 2 8.5ZM2.5 10C2.22388 10 2 10.2239 2 10.5C2 10.7761 2.22388 11 2.5 11H7.5C7.77612 11 8 10.7761 8 10.5C8 10.2239 7.77612 10 7.5 10H2.5Z"/><path d="M7 3C7 2.73478 6.84196 2.48043 6.56066 2.29289C6.27936 2.10536 5.89782 2 5.5 2C5.10218 2 4.72064 2.10536 4.43934 2.29289C4.15804 2.48043 4 2.73478 4 3L4.43131 3C4.43131 2.81104 4.54391 2.62983 4.74432 2.49622C4.94474 2.3626 5.21657 2.28754 5.5 2.28754C5.78343 2.28754 6.05526 2.3626 6.25568 2.49622C6.45609 2.62983 6.56869 2.81104 6.56869 3H7Z"/></svg>',
            active: false,
            show: this.hasPermission('inventory_purchase_return_order_list')
          },
          {
            path: this.setUrl(URLConstants.KIT_LIST),
            title: 'Kit List',
            type: 'link',
            svgPath: '<svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2C0 0.89543 0.895431 0 2 0H9C10.1046 0 11 0.895431 11 2V11C11 12.1046 10.1046 13 9 13H2C0.895431 13 0 12.1046 0 11V2ZM2 3.5C2 3.22386 2.22386 3 2.5 3H8.5C8.77614 3 9 3.22386 9 3.5C9 3.77614 8.77614 4 8.5 4H2.5C2.22386 4 2 3.77614 2 3.5ZM2.5 5C2.22386 5 2 5.22386 2 5.5C2 5.77614 2.22386 6 2.5 6H7.5C7.77614 6 8 5.77614 8 5.5C8 5.22386 7.77614 5 7.5 5H2.5ZM2 7.5C2 7.22386 2.22386 7 2.5 7H6.5C6.77614 7 7 7.22386 7 7.5C7 7.77614 6.77614 8 6.5 8H2.5C2.22386 8 2 7.77614 2 7.5ZM2.5 9C2.22386 9 2 9.22386 2 9.5C2 9.77614 2.22386 10 2.5 10H4.5C4.77614 10 5 9.77614 5 9.5C5 9.22386 4.77614 9 4.5 9H2.5Z"/></svg>',
            active: false,
            show: this.hasPermission('inventory_kit_list')
          },
          {
            path: this.setUrl(URLConstants.INTERNAL_ISSUE_LIST),
            title: 'Items Issue List',
            type: 'link',
            svgPath: '<svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2C0 0.89543 0.895431 0 2 0H9C10.1046 0 11 0.895431 11 2V11C11 12.1046 10.1046 13 9 13H2C0.895431 13 0 12.1046 0 11V2ZM2 3.5C2 3.22386 2.22386 3 2.5 3H8.5C8.77614 3 9 3.22386 9 3.5C9 3.77614 8.77614 4 8.5 4H2.5C2.22386 4 2 3.77614 2 3.5ZM2.5 5C2.22386 5 2 5.22386 2 5.5C2 5.77614 2.22386 6 2.5 6H8.5C8.77614 6 9 5.77614 9 5.5C9 5.22386 8.77614 5 8.5 5H2.5ZM2 7.5C2 7.22386 2.22386 7 2.5 7H8.5C8.77614 7 9 7.22386 9 7.5C9 7.77614 8.77614 8 8.5 8H2.5C2.22386 8 2 7.77614 2 7.5ZM2.5 9C2.22386 9 2 9.22386 2 9.5C2 9.77614 2.22386 10 2.5 10H8.5C8.77614 10 9 9.77614 9 9.5C9 9.22386 8.77614 9 8.5 9H2.5Z"/></svg>',
            active: false,
            show: this.hasPermission('inventory_internal_issue_list')
          },
          {
            path: this.setUrl(URLConstants.INTERNAL_ISSUE_RETURN_LIST),
            title: 'Item Issue Return List',
            type: 'link',
            svgPath: '<svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 0C0.895386 0 0 0.895447 0 2V11C0 12.1046 0.895386 13 2 13H9C9.10352 13 9.20532 12.9921 9.30469 12.977C9.37085 12.9669 9.43604 12.9535 9.5 12.937C8.63733 12.715 8 11.9319 8 11C8 9.89545 8.89539 9 10 9C10.3643 9 10.7058 9.09741 11 9.26758V2C11 0.895447 10.1046 0 9 0H2ZM1.5 4C1.22388 4 1 4.22388 1 4.5C1 4.77612 1.22388 5 1.5 5H6.5C6.77612 5 7 4.77612 7 4.5C7 4.22388 6.77612 4 6.5 4H1.5ZM1 6.5C1 6.22388 1.22388 6 1.5 6H5.5C5.77612 6 6 6.22388 6 6.5C6 6.77612 5.77612 7 5.5 7H1.5C1.22388 7 1 6.77612 1 6.5ZM1.5 8C1.22388 8 1 8.22388 1 8.5C1 8.77612 1.22388 9 1.5 9H4.5C4.77612 9 5 8.77612 5 8.5C5 8.22388 4.77612 8 4.5 8H1.5Z"/><path d="M12 11C12 12.1046 11.1046 13 10 13C8.89543 13 8 12.1046 8 11C8 9.89543 8.89543 9 10 9C11.1046 9 12 9.89543 12 11ZM8.57471 11C8.57471 11.7872 9.21283 12.4253 10 12.4253C10.7872 12.4253 11.4253 11.7872 11.4253 11C11.4253 10.2128 10.7872 9.57471 10 9.57471C9.21283 9.57471 8.57471 10.2128 8.57471 11Z"/><path d="M9 10.5H10.5" stroke="black" stroke-width="0.2" stroke-linecap="round"/><path d="M11.0144 11.5143H9.5144" stroke="black" stroke-width="0.2" stroke-linecap="round"/><path d="M11.0042 10.4942L10.2631 10.9423L10.2456 10.0765L11.0042 10.4942Z"/><path d="M9.01016 11.5201L9.75126 11.072L9.76876 11.9379L9.01016 11.5201Z"/></svg>',
            active: false,
            show: this.hasPermission('inventory_internal_issue_return_list')
          },
          {
            path: this.setUrl(URLConstants.DISCARD_ITEM_LIST),
            title: 'Discard Item List',
            type: 'link',
            svgPath: '<svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 0C0.895431 0 0 0.89543 0 2V11C0 12.1046 0.895431 13 2 13H9C10.1046 13 11 12.1046 11 11V2C11 0.895431 10.1046 0 9 0H2ZM6.5 3H7.5V3.1H3.5V3H4.5V2.9H5.04999C5.0956 2.96072 5.16822 3 5.25 3H5.75C5.83178 3 5.9044 2.96072 5.95001 2.9H6.5V3ZM6.5 2.9V2.29999C6.5 2.13434 6.36572 2 6.19995 2H4.80005C4.63428 2 4.5 2.13434 4.5 2.29999V2.9H3C2.94477 2.9 2.9 2.94477 2.9 3C2.9 3.05523 2.94477 3.1 3 3.1H3.5V7C3.5 7.55228 3.94772 8 4.5 8H6.5C7.05228 8 7.5 7.55228 7.5 7V3.1H8C8.05523 3.1 8.1 3.05523 8.1 3C8.1 2.94477 8.05523 2.9 8 2.9H6.5ZM5.95001 2.9H5.04999C5.0186 2.85822 5 2.80628 5 2.75C5 2.61194 5.11194 2.5 5.25 2.5H5.75C5.88806 2.5 6 2.61194 6 2.75C6 2.80628 5.9814 2.85822 5.95001 2.9ZM5.19995 4.2C5.19995 4.08954 5.28949 4 5.39995 4C5.51041 4 5.59995 4.08954 5.59995 4.2V5.8C5.59995 5.91046 5.51041 6 5.39995 6C5.28949 6 5.19995 5.91046 5.19995 5.8V4.2ZM6.10002 5C5.98957 5 5.90002 5.08954 5.90002 5.2V5.8C5.90002 5.91046 5.98957 6 6.10002 6C6.21048 6 6.30002 5.91046 6.30002 5.8V5.2C6.30002 5.08954 6.21048 5 6.10002 5ZM4.5 5.2C4.5 5.08954 4.58954 5 4.7 5C4.81046 5 4.9 5.08954 4.9 5.2V5.8C4.9 5.91046 4.81046 6 4.7 6C4.58954 6 4.5 5.91046 4.5 5.8V5.2Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2.34998 9C2.15674 9 2 9.15668 2 9.34998C2 9.54327 2.15674 9.70001 2.34998 9.70001H8.65002C8.84326 9.70001 9 9.54327 9 9.34998C9 9.15668 8.84326 9 8.65002 9H2.34998ZM3.34998 10C3.15674 10 3 10.1567 3 10.35C3 10.5433 3.15674 10.7 3.34998 10.7H7.65002C7.84326 10.7 8 10.5433 8 10.35C8 10.1567 7.84326 10 7.65002 10H3.34998Z"/></svg>',
            active: false,
            show: this.hasPermission('inventory_discard_item_list')
          },
          {
            path: this.setUrl(URLConstants.ITEM_SUMMARY),
            title: 'Item Summary',
            type: 'link',
            svgPath: '<svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2C0 0.89543 0.895431 0 2 0H9C10.1046 0 11 0.895431 11 2V11C11 12.1046 10.1046 13 9 13H2C0.895431 13 0 12.1046 0 11V2ZM2 3.5C2 3.22386 2.22386 3 2.5 3H8.5C8.77614 3 9 3.22386 9 3.5C9 3.77614 8.77614 4 8.5 4H2.5C2.22386 4 2 3.77614 2 3.5ZM3.5 5C3.22386 5 3 5.22386 3 5.5C3 5.77614 3.22386 6 3.5 6H7.5C7.77614 6 8 5.77614 8 5.5C8 5.22386 7.77614 5 7.5 5H3.5ZM2 7.5C2 7.22386 2.22386 7 2.5 7H8.5C8.77614 7 9 7.22386 9 7.5C9 7.77614 8.77614 8 8.5 8H2.5C2.22386 8 2 7.77614 2 7.5ZM3.5 9C3.22386 9 3 9.22386 3 9.5C3 9.77614 3.22386 10 3.5 10H7.5C7.77614 10 8 9.77614 8 9.5C8 9.22386 7.77614 9 7.5 9H3.5Z"/></svg>',
            active: false,
            show: this.hasPermission('inventory_item_summary')
          },
        ]
      },
      ...moduleName.find(item => item == 'hra') && {
        title: 'HRA',
        icon: 'id-badge',
        type: 'sub',
        active: false,
        show: ((this.getInstituteModule('HRA')) && (this.hasModule('hra_role_list') || this.hasModule('hra_leave_type') || this.hasModule('hra_access_list'))),
        children: [
          {
            path: this.setUrl(URLConstants.ROLE_LIST),
            title: 'Role List',
            type: 'link',
            svgPath: '<svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2C0 0.895431 0.895431 0 2 0H8C9.10457 0 10 0.895431 10 2V10C10 11.1046 9.10457 12 8 12H2C0.89543 12 0 11.1046 0 10V2ZM1.5 2.5C1.5 2.22386 1.72386 2 2 2H3C3.27614 2 3.5 2.22386 3.5 2.5V3.5C3.5 3.77614 3.27614 4 3 4H2C1.72386 4 1.5 3.77614 1.5 3.5V2.5ZM2 5C1.72386 5 1.5 5.22386 1.5 5.5V6.5C1.5 6.77614 1.72386 7 2 7H3C3.27614 7 3.5 6.77614 3.5 6.5V5.5C3.5 5.22386 3.27614 5 3 5H2ZM1.5 8.5C1.5 8.22386 1.72386 8 2 8H3C3.27614 8 3.5 8.22386 3.5 8.5V9.5C3.5 9.77614 3.27614 10 3 10H2C1.72386 10 1.5 9.77614 1.5 9.5V8.5ZM4.85 2.60001C4.6567 2.60001 4.5 2.75671 4.5 2.95001C4.5 3.14331 4.6567 3.30001 4.85 3.30001H8.15C8.3433 3.30001 8.5 3.14331 8.5 2.95001C8.5 2.75671 8.3433 2.60001 8.15 2.60001H4.85ZM4.5 5.95001C4.5 5.75671 4.6567 5.60001 4.85 5.60001H8.15C8.3433 5.60001 8.5 5.75671 8.5 5.95001C8.5 6.14331 8.3433 6.30001 8.15 6.30001H4.85C4.6567 6.30001 4.5 6.14331 4.5 5.95001ZM4.85 8.60001C4.6567 8.60001 4.5 8.75671 4.5 8.95001C4.5 9.14331 4.6567 9.30001 4.85 9.30001H8.15C8.3433 9.30001 8.5 9.14331 8.5 8.95001C8.5 8.75671 8.3433 8.60001 8.15 8.60001H4.85Z" /></svg>',
            active: false,
            show: this.hasPermission('hra_role_list')
          },
          { 
            path: this.setUrl(URLConstants.ADD_ROLE),
            title:'Add Role',
            type:'link',
            svgPath: '<svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 0C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.89543 12 2 12H5.76389C5.28885 11.4692 5 10.7684 5 10C5 8.34315 6.34315 7 8 7C8.76835 7 9.46924 7.28885 10 7.76389V2C10 0.895431 9.10457 0 8 0H2ZM1 2.5C1 2.22386 1.22386 2 1.5 2H2.5C2.77614 2 3 2.22386 3 2.5V3.5C3 3.77614 2.77614 4 2.5 4H1.5C1.22386 4 1 3.77614 1 3.5V2.5ZM1.5 5C1.22386 5 1 5.22386 1 5.5V6.5C1 6.77614 1.22386 7 1.5 7H2.5C2.77614 7 3 6.77614 3 6.5V5.5C3 5.22386 2.77614 5 2.5 5H1.5ZM4 2.94998C4 2.75668 4.1567 2.59998 4.35 2.59998H7.65C7.8433 2.59998 8 2.75668 8 2.94998C8 3.14328 7.8433 3.29998 7.65 3.29998H4.35C4.1567 3.29998 4 3.14328 4 2.94998ZM4.35 5.59998C4.1567 5.59998 4 5.75668 4 5.94998C4 6.14328 4.1567 6.29998 4.35 6.29998H7.65C7.8433 6.29998 8 6.14328 8 5.94998C8 5.75668 7.8433 5.59998 7.65 5.59998H4.35Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M8 12C9.10457 12 10 11.1046 10 10C10 8.89543 9.10457 8 8 8C6.89543 8 6 8.89543 6 10C6 11.1046 6.89543 12 8 12ZM7.85904 10.0227V10.8011H8.17722V10.0227H8.95563V9.70455H8.17722V8.92614H7.85904V9.70455H7.08063V10.0227H7.85904Z"/></svg>',
            show:this.hasPermission('hra_role_list','has_create'),
            active:false
          },
          {
            path: this.setUrl(URLConstants.ROLE_ACCESS_LIST),
            title: 'Access List',
            type: 'link',
            svgPath: '<svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2C0 0.895431 0.895431 0 2 0H8C9.10457 0 10 0.895431 10 2V10C10 11.1046 9.10457 12 8 12H2C0.89543 12 0 11.1046 0 10V2ZM1.5 3C1.5 2.44772 1.94772 2 2.5 2C3.05228 2 3.5 2.44772 3.5 3C3.5 3.55228 3.05228 4 2.5 4C1.94772 4 1.5 3.55228 1.5 3ZM2.5 5C1.94772 5 1.5 5.44772 1.5 6C1.5 6.55228 1.94772 7 2.5 7C3.05228 7 3.5 6.55228 3.5 6C3.5 5.44772 3.05228 5 2.5 5ZM1.5 9C1.5 8.44771 1.94772 8 2.5 8C3.05228 8 3.5 8.44771 3.5 9C3.5 9.55229 3.05228 10 2.5 10C1.94772 10 1.5 9.55229 1.5 9ZM4.85 2.60001C4.6567 2.60001 4.5 2.75671 4.5 2.95001C4.5 3.14331 4.6567 3.30001 4.85 3.30001H8.15C8.3433 3.30001 8.5 3.14331 8.5 2.95001C8.5 2.75671 8.3433 2.60001 8.15 2.60001H4.85ZM4.5 5.95001C4.5 5.75671 4.6567 5.60001 4.85 5.60001H8.15C8.3433 5.60001 8.5 5.75671 8.5 5.95001C8.5 6.14331 8.3433 6.30001 8.15 6.30001H4.85C4.6567 6.30001 4.5 6.14331 4.5 5.95001ZM4.85 8.60001C4.6567 8.60001 4.5 8.75671 4.5 8.95001C4.5 9.14331 4.6567 9.30001 4.85 9.30001H8.15C8.3433 9.30001 8.5 9.14331 8.5 8.95001C8.5 8.75671 8.3433 8.60001 8.15 8.60001H4.85Z" /></svg>',
            active: false,
            show: (this.is_staff || this.is_admin || this.hasPermission('hra_access_list'))
          },
          {
            path: this.setUrl(URLConstants.LEAVE_TYPE_LIST),
            title: 'Leave Type',
            type: 'link',
            svgPath: '<svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 0C0.895386 0 0 0.895447 0 2V10C0 11.1046 0.895386 12 2 12H6C7.10461 12 8 11.1046 8 10V8H6C4.89539 8 4 7.10455 4 6C4 4.89545 4.89539 4 6 4H8V2C8 0.895447 7.10461 0 6 0H2Z"/><path d="M13.8536 6.35355C14.0488 6.15829 14.0488 5.84171 13.8536 5.64645L10.6716 2.46447C10.4763 2.2692 10.1597 2.2692 9.96447 2.46447C9.7692 2.65973 9.7692 2.97631 9.96447 3.17157L12.7929 6L9.96447 8.82843C9.7692 9.02369 9.7692 9.34027 9.96447 9.53553C10.1597 9.7308 10.4763 9.7308 10.6716 9.53553L13.8536 6.35355ZM5.5 6.5H13.5V5.5H5.5V6.5Z"/></svg>',
            active: false,
            show: this.hasPermission('hra_leave_type')
          }
        ]
      },
      ...moduleName.find(item => item == 'hostel') && {
        title: 'Hostel',
        icon: 'home',
        type: 'sub',
        active: false,
        show: ((this.getInstituteModule('Hostel management') || (this.getInstituteModule('Finance')) )&& (this.hasModule('hostel_management_warden') || this.hasModule('hostel_management_hostel') || this.hasModule('hostel_management_room')
          || this.hasModule('hostel_management_wings') || this.hasModule('hostel_management_room_type') || this.hasModule('hostel_management_hostel_student_transfer') || this.hasModule('finance_wallets')||this.hasModule('hostel_management_hostel_room_report'))),
        children: [
          {
            title: 'Hostel Setup',
            type: 'sub',
            active: false,
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z"/><path class="cr-color" d="M8.25325 5.84397C8.25325 7.12351 7.21598 8.16078 5.93644 8.16078C4.6569 8.16078 3.61963 7.12351 3.61963 5.84397C3.61963 4.56443 4.6569 3.52716 5.93644 3.52716C7.21598 3.52716 8.25325 4.56443 8.25325 5.84397ZM4.50303 5.84397C4.50303 6.63562 5.14479 7.27738 5.93644 7.27738C6.72809 7.27738 7.36985 6.63562 7.36985 5.84397C7.36985 5.05232 6.72809 4.41056 5.93644 4.41056C5.14479 4.41056 4.50303 5.05232 4.50303 5.84397Z" fill="white"/><path class="cr-color" d="M5.29346 3.2C5.29346 3.08954 5.383 3 5.49346 3H6.25186C6.36232 3 6.45186 3.08954 6.45186 3.2V4.15841H5.29346V3.2Z" fill="white"/><path class="cr-color" d="M3.59308 4.59483C3.5085 4.52378 3.49754 4.39763 3.56859 4.31305L4.05642 3.73236C4.12747 3.64779 4.25362 3.63683 4.3382 3.70787L5.07202 4.32435L4.3269 5.21131L3.59308 4.59483Z" fill="white"/><path class="cr-color" d="M8.23505 7.34242C8.31962 7.41347 8.33059 7.53963 8.25954 7.6242L7.77171 8.20489C7.70066 8.28947 7.5745 8.30043 7.48993 8.22938L6.66545 7.53675L7.41057 6.64979L8.23505 7.34242Z" fill="white"/><path class="cr-color" d="M7.68328 3.70112C7.77083 3.63376 7.8964 3.65013 7.96375 3.73768L8.4262 4.33877C8.49356 4.42632 8.47719 4.55189 8.38964 4.61924L7.63003 5.20365L6.92367 4.28552L7.68328 3.70112Z" fill="white"/><path class="cr-color" d="M5.29346 7.63367H6.45186V8.59207C6.45186 8.70253 6.36232 8.79207 6.25186 8.79207H5.49346C5.383 8.79207 5.29346 8.70253 5.29346 8.59207V7.63367Z" fill="white"/><path class="cr-color" d="M7.61011 6.47516L7.61277 5.31676L8.57117 5.31896C8.68162 5.31921 8.77096 5.40896 8.77071 5.51941L8.76897 6.27782C8.76872 6.38827 8.67897 6.47761 8.56851 6.47736L7.61011 6.47516Z" fill="white"/><path class="cr-color" d="M4.25342 5.3208L4.25076 6.4792L3.29236 6.477C3.1819 6.47675 3.09256 6.387 3.09282 6.27655L3.09456 5.51814C3.09481 5.40769 3.18456 5.31835 3.29502 5.3186L4.25342 5.3208Z" fill="white"/><path class="cr-color" d="M4.50903 6.42957L5.28171 7.29262L4.3342 8.14092C4.2519 8.2146 4.12546 8.20761 4.05178 8.12532L3.54591 7.56027C3.47223 7.47798 3.47922 7.35154 3.56152 7.27786L4.50903 6.42957Z" fill="white"/><mask id="path-11-inside-1_183_159" fill="white"><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z"/></mask><path class="cr-color" d="M9.82491 6.69375C9.88622 6.70487 9.9451 6.66418 9.95449 6.60259C10.093 5.69368 9.91427 4.76344 9.44635 3.96935C8.95932 3.14281 8.19145 2.51885 7.28276 2.21123C6.37406 1.9036 5.38507 1.93282 4.49612 2.29354C3.64206 2.6401 2.935 3.27047 2.49292 4.07661C2.46296 4.13125 2.48502 4.19934 2.54048 4.22774C2.59594 4.25615 2.66378 4.23412 2.69383 4.17953C3.11117 3.42154 3.77705 2.82884 4.58096 2.50263C5.41977 2.16225 6.35297 2.13469 7.2104 2.42496C8.06784 2.71522 8.79239 3.30399 9.25195 4.0839C9.69239 4.83136 9.8613 5.70667 9.73238 6.5623C9.72309 6.62391 9.7636 6.68263 9.82491 6.69375Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-11-inside-1_183_159)"/><mask id="path-12-inside-2_183_159" fill="white"><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z"/></mask><path class="cr-color" d="M2.14823 5.43834C2.08946 5.42977 2.03472 5.47047 2.02773 5.52945C1.92105 6.42985 2.12342 7.34106 2.60345 8.11277C3.10244 8.91496 3.86926 9.51464 4.76806 9.8056C5.66687 10.0965 6.63964 10.06 7.51407 9.70238C8.35527 9.35836 9.05322 8.7386 9.49443 7.94648C9.52333 7.89459 9.50282 7.82954 9.45018 7.80204C9.39753 7.77455 9.3327 7.79503 9.30372 7.84687C8.88609 8.59399 8.22685 9.17852 7.43266 9.50331C6.60525 9.84169 5.68478 9.87629 4.8343 9.60098C3.98382 9.32567 3.25823 8.75823 2.78607 7.99917C2.33287 7.27059 2.14123 6.41062 2.24063 5.56049C2.24753 5.50151 2.207 5.44691 2.14823 5.43834Z" fill="#D9D9D9" stroke="white" stroke-width="2" mask="url(#path-12-inside-2_183_159)"/><path class="cr-color" d="M1.97291 4.91572L2.10774 3.75636L3.04436 4.4528L1.97291 4.91572Z" fill="white"/><path  d="M9.9355 7.02695L9.98777 8.19295L8.95184 7.65522L9.9355 7.02695Z" fill="white"/></svg>',
            show:(this.hasModule('hostel_management_warden'))|| this.hasModule('hostel_management_room_type')|| this.hasModule('hostel_management_wings'),
            children:[
              {
                path: this.setUrl(URLConstants.WARDEN_LIST),
                title: 'Warden',
                type: 'link',
                svgPath: '<svg width="13" height="13" viewBox="0 0 13 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 12.5C13 11.6464 12.8319 10.8012 12.5052 10.0126C12.1786 9.22394 11.6998 8.50739 11.0962 7.90381C10.4926 7.30023 9.77606 6.82144 8.98744 6.49478C8.19883 6.16813 7.35359 6 6.5 6C5.64641 6 4.80117 6.16813 4.01256 6.49478C3.22394 6.82144 2.50739 7.30023 1.90381 7.90381C1.30022 8.50739 0.821438 9.22394 0.494783 10.0126C0.168127 10.8012 -7.46234e-08 11.6464 0 12.5L6.5 12.5H13Z"/><circle cx="6.59998" cy="3" r="3"/></svg>',
                active: false,
                show: this.hasPermission('hostel_management_warden')
              },
              {
                path: this.setUrl(URLConstants.WING_LIST),
                title: 'Wings',
                type: 'link',
                svgPath: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14 7C14 10.866 10.866 14 7 14C3.13403 14 0 10.866 0 7C0 3.13403 3.13403 0 7 0C10.866 0 14 3.13403 14 7ZM10 10C10 9.60602 9.92236 9.21594 9.77161 8.85193C9.62085 8.48798 9.3999 8.15723 9.12134 7.87866C8.84277 7.6001 8.51208 7.37915 8.14807 7.22833C7.78406 7.07758 7.39392 7 7 7C7.82837 7 8.5 6.32843 8.5 5.5C8.5 4.67157 7.82837 4 7 4C6.17163 4 5.5 4.67157 5.5 5.5C5.5 6.32843 6.17163 7 7 7C6.60608 7 6.21594 7.07758 5.85193 7.22833C5.48792 7.37915 5.15723 7.6001 4.87866 7.87866C4.6001 8.15723 4.37915 8.48798 4.22839 8.85193C4.07764 9.21594 4 9.60602 4 10H7H10Z" /></svg>',
                active: false,
                show: this.hasPermission('hostel_management_wings')
              },
              {
                path: this.setUrl(URLConstants.ROOM_TYPE_LIST),
                title: 'Room Type',
                type: 'link',
                svgPath: '<svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.37503 2.17008C5.48776 2.07246 5.65509 2.07246 5.76782 2.17008L7.19008 3.40179C7.40005 3.58363 7.27145 3.92857 6.99368 3.92857H4.14917C3.87141 3.92857 3.74281 3.58363 3.95278 3.40179L5.37503 2.17008Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M6.85707 3.92859H4.28564V4.8143C4.28564 5.03522 4.46473 5.2143 4.68564 5.2143H5.14284V4.57144C5.14284 4.33474 5.33472 4.14287 5.57141 4.14287C5.8081 4.14287 5.99998 4.33474 5.99998 4.57144V5.2143H6.45707C6.67799 5.2143 6.85707 5.03522 6.85707 4.8143V3.92859Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M2 0C0.895431 0 0 0.89543 0 2V11C0 12.1046 0.895431 13 2 13H9C10.1046 13 11 12.1046 11 11V2C11 0.895431 10.1046 0 9 0H2ZM5.5 7C7.433 7 9 5.65685 9 4C9 2.34315 7.433 1 5.5 1C3.567 1 2 2.34315 2 4C2 5.65685 3.567 7 5.5 7ZM1.5 9C1.5 8.72386 1.72386 8.5 2 8.5H9C9.27614 8.5 9.5 8.72386 9.5 9C9.5 9.27614 9.27614 9.5 9 9.5H2C1.72386 9.5 1.5 9.27614 1.5 9ZM1.5 11C1.5 10.7239 1.72386 10.5 2 10.5H9C9.27614 10.5 9.5 10.7239 9.5 11C9.5 11.2761 9.27614 11.5 9 11.5H2C1.72386 11.5 1.5 11.2761 1.5 11Z" /></svg>',
                active: false,
                show: this.hasPermission('hostel_management_room_type')
              }
            ]
          },
          {
            path: this.setUrl(URLConstants.HOSTEL_LIST),
            title: 'Hostel',
            type: 'link',
            svgPath: '<svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.5 0V9.5" stroke="black"/><rect y="4.5" width="14" height="3" /><path d="M13.5 4.5V9.5" stroke="black"/><circle cx="2.5" cy="3" r="1.5" /><path d="M4.40002 2.5C4.40002 1.94772 4.84774 1.5 5.40002 1.5H12.4C12.9523 1.5 13.4 1.94772 13.4 2.5V4.5H4.40002V2.5Z" /></svg>',
            active: false,
            show: this.hasPermission('hostel_management_hostel')
          },          
          {
            path: this.setUrl(URLConstants.ROOM_LIST),
            title: 'Room',
            type: 'link',
            svgPath: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14 7C14 10.866 10.866 14 7 14C3.13401 14 0 10.866 0 7C0 3.13401 3.13401 0 7 0C10.866 0 14 3.13401 14 7ZM7.45826 3.39686L10.7768 6.27085C11.2668 6.69514 10.9667 7.5 10.3186 7.5H10V9.9C10 10.2314 9.73137 10.5 9.4 10.5H8V9C8 8.44772 7.55228 8 7 8C6.44772 8 6 8.44772 6 9V10.5H4.6C4.26863 10.5 4 10.2314 4 9.9V7.5H3.68141C3.03329 7.5 2.73322 6.69514 3.22315 6.27085L6.54174 3.39686C6.80478 3.16906 7.19522 3.16906 7.45826 3.39686Z" /></svg>',
            active: false,
            show: this.hasPermission('hostel_management_room')
          },
          {
            path: this.setUrl(URLConstants.HOSTEL_STUDENT_TRANSFER),
            title: 'Hostel Student Transfer',
            type: 'link',
            svgPath: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 7C11 9.20914 9.20914 11 7 11C4.79086 11 3 9.20914 3 7C3 4.79086 4.79086 3 7 3C9.20914 3 11 4.79086 11 7ZM3.77915 7C3.77915 8.77882 5.22118 10.2208 7 10.2208C8.77882 10.2208 10.2208 8.77882 10.2208 7C10.2208 5.22118 8.77882 3.77915 7 3.77915C5.22118 3.77915 3.77915 5.22118 3.77915 7Z" /><path d="M11 9C7.79999 13 4.66666 11 3.49999 9.5C3.09999 12.3 4.66666 13 5.49999 13H9.49999V14L14 11L11 9Z" /><path d="M3.00001 5C6.20001 1 9.33334 3 10.5 4.5C10.9 1.7 9.33334 1 8.50001 1H4.50001V0L5.72205e-06 3L3.00001 5Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 7.125H5.5V8.025C5.5 8.35637 5.76863 8.625 6.1 8.625H6.5V7.875C6.5 7.59886 6.72386 7.375 7 7.375C7.27614 7.375 7.5 7.59886 7.5 7.875V8.625H7.9C8.23137 8.625 8.5 8.35637 8.5 8.025V7.125Z" /><path d="M6.8036 5.17008C6.91634 5.07246 7.08366 5.07246 7.1964 5.17008L8.9898 6.72322C9.19977 6.90506 9.07117 7.25 8.79341 7.25H5.20659C4.92883 7.25 4.80022 6.90506 5.0102 6.72322L6.8036 5.17008Z" /></svg>',
            active: false,
            show: this.hasPermission('hostel_management_hostel_student_transfer')
          },
          { 
            path: this.setUrl(URLConstants.WALLETS), 
            title: 'Wallets', 
            type: 'link', 
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2C0 0.895431 0.895431 0 2 0H10C11.0076 0 11.8411 0.74505 11.9797 1.71427H3.04762C2.78463 1.71427 2.57143 1.92747 2.57143 2.19046C2.57143 2.40085 2.74199 2.57141 2.95238 2.57141H12V9.14286C12 10.2474 11.1046 11.1429 10 11.1429H2C0.895431 11.1429 0 10.2474 0 9.14286V2ZM10.2857 6.85714C10.7591 6.85714 11.1429 6.47339 11.1429 6C11.1429 5.52661 10.7591 5.14286 10.2857 5.14286C9.81233 5.14286 9.42857 5.52661 9.42857 6C9.42857 6.47339 9.81233 6.85714 10.2857 6.85714Z"/></svg>',
            active: false , 
            show: this.hasPermission('finance_wallets')
          },
          {
            title:'Report',
            active:false,
            type:'sub',
            svgPath:'<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 0H2C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.89543 12 2 12H8C9.10457 12 10 11.1046 10 10V3H8C7.44772 3 7 2.55228 7 2V0ZM2.69995 3.5C2.69995 3.22386 2.92381 3 3.19995 3C3.47609 3 3.69995 3.22386 3.69995 3.5V9.5C3.69995 9.77614 3.47609 10 3.19995 10C2.92381 10 2.69995 9.77614 2.69995 9.5V3.5ZM5.19995 5C4.92381 5 4.69995 5.22386 4.69995 5.5V9.5C4.69995 9.77614 4.92381 10 5.19995 10C5.47609 10 5.69995 9.77614 5.69995 9.5V5.5C5.69995 5.22386 5.47609 5 5.19995 5ZM6.69995 7.5C6.69995 7.22386 6.92381 7 7.19995 7C7.47609 7 7.69995 7.22386 7.69995 7.5V9.5C7.69995 9.77614 7.47609 10 7.19995 10C6.92381 10 6.69995 9.77614 6.69995 9.5V7.5Z" /><path d="M9.92927 2.32929L7.77069 0.170711C7.70769 0.107714 7.59998 0.152331 7.59998 0.241421V2.4C7.59998 2.45523 7.64475 2.5 7.69998 2.5H9.85855C9.94764 2.5 9.99226 2.39229 9.92927 2.32929Z" /></svg>',
            show: this.hasModule('hostel_management_hostel_room_report') ,
            children:
            [
              { 
                path: this.setUrl(URLConstants.WALLET_DAILY_REPORT),
                title: 'Wallet Daily Report',
                type: 'link',
                show:true,
                active:false
              },
              {
                path: this.setUrl(URLConstants.HOSTEL_REPORT),
                title: 'Hostel Room Report',
                type: 'link',
                svgPath: '<svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 0H2C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.89543 12 2 12H8C9.10457 12 10 11.1046 10 10V3H8C7.44772 3 7 2.55228 7 2V0ZM2.69995 3.5C2.69995 3.22386 2.92381 3 3.19995 3C3.47609 3 3.69995 3.22386 3.69995 3.5V9.5C3.69995 9.77614 3.47609 10 3.19995 10C2.92381 10 2.69995 9.77614 2.69995 9.5V3.5ZM5.19995 5C4.92381 5 4.69995 5.22386 4.69995 5.5V9.5C4.69995 9.77614 4.92381 10 5.19995 10C5.47609 10 5.69995 9.77614 5.69995 9.5V5.5C5.69995 5.22386 5.47609 5 5.19995 5ZM6.69995 7.5C6.69995 7.22386 6.92381 7 7.19995 7C7.47609 7 7.69995 7.22386 7.69995 7.5V9.5C7.69995 9.77614 7.47609 10 7.19995 10C6.92381 10 6.69995 9.77614 6.69995 9.5V7.5Z"/><path d="M9.92927 2.32929L7.77069 0.170711C7.70769 0.107714 7.59998 0.152331 7.59998 0.241421V2.4C7.59998 2.45523 7.64475 2.5 7.69998 2.5H9.85855C9.94764 2.5 9.99226 2.39229 9.92927 2.32929Z"/></svg>',
                active: false,
                show: this.hasPermission('hostel_management_hostel_room_report')
              },
            ]
          },          
        ]
      },
      ...moduleName.find(item => item == 'settings') && {
        title: 'Settings',
        icon: 'settings',
        type: 'sub',
        active: false,
        show: this.getInstituteModule('Settings') && (this.hasModule('settings_batch') || this.hasModule('inquiry_custom_field_list')),
        children: [
          {
            path: this.setUrl(URLConstants.ACADEMIC_YEAR_LIST),
            title: 'Academic Year',
            type: 'link',
            svgPath: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.16663 3.5C5.16663 3.22386 5.39048 3 5.66663 3C5.94277 3 6.16663 3.22386 6.16663 3.5V5H5.16663V3.5Z" fill="#818181"/><path d="M7.16663 3.5C7.16663 3.22386 7.39048 3 7.66663 3C7.94277 3 8.16663 3.22386 8.16663 3.5V5H7.16663V3.5Z" fill="#818181"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14ZM3 6C3 4.89543 3.89543 4 5 4H8.33333C9.4379 4 10.3333 4.89543 10.3333 6V8.66667C10.3333 9.77124 9.4379 10.6667 8.33333 10.6667H5C3.89543 10.6667 3 9.77124 3 8.66667V6.66669H10.3333V6.00002H3V6Z"/></svg>',
            active: false,
            show: this.hasPermission('settings_academic_year')
          },
          {
            path: this.setUrl(URLConstants.LIST_SCHOOL),
            title: 'School Name',
            type: 'link',
            active: false,
            svgPath: '<svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.46453 0.635978C6.74423 0.303781 7.25577 0.303781 7.53547 0.635978L12.0932 6.04915C12.4765 6.50442 12.1529 7.2 11.5577 7.2H2.44228C1.84713 7.2 1.52348 6.50442 1.9068 6.04915L6.46453 0.635978Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.5 7.20001H3.5V11.4C3.5 11.7314 3.76863 12 4.1 12H5.83342V9C5.83342 8.44772 6.28114 8 6.83342 8H7.16675C7.71904 8 8.16675 8.44772 8.16675 9V12H9.9C10.2314 12 10.5 11.7314 10.5 11.4V7.20001Z"/></svg>',
            show: this.hasPermission('settings_school_name')
          },
          {
            path: this.setUrl(URLConstants.SECTION_LIST),
            title: 'Section',
            type: 'link',
            svgPath: '<svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="5" height="11" rx="0.4"/><rect x="6" width="6" height="2" rx="0.5"/><rect x="6" y="4.5" width="6" height="2" rx="0.5"/><rect x="6" y="9" width="6" height="2" rx="0.5"/></svg>',
            active: false,
            show: this.hasPermission('settings_section')
          },
          {
            path: this.setUrl(URLConstants.BATCH),
            title: 'Batch',
            type: 'link',
            svgPath: '<svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="5" height="11" rx="0.4" transform="matrix(-1 0 0 1 12 0)"/><rect width="6" height="2" rx="0.5" transform="matrix(-1 0 0 1 6 0)"/><rect width="6" height="2" rx="0.5" transform="matrix(-1 0 0 1 6 4.5)"/><rect width="6" height="2" rx="0.5" transform="matrix(-1 0 0 1 6 9)"/></svg>',
            active: false,
            show: this.hasPermission('settings_batch')
          },
          {
            path: this.setUrl(URLConstants.COURSE_LIST),
            title: 'Course',
            type: 'link',
            svgPath: '<svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.20574 8.93652L0.573462 5.25192C0.311685 5.10649 0.296671 4.73555 0.545838 4.56944L7.17812 0.14792C7.31248 0.0583469 7.48752 0.0583464 7.62188 0.14792L14.2542 4.56944C14.5033 4.73555 14.4883 5.10649 14.2265 5.25192L7.59426 8.93652C7.47345 9.00364 7.32655 9.00364 7.20574 8.93652Z"/><path d="M7.40001 9.86666L2.46667 7.39999V9.86666L7.40001 12.3333L12.3333 9.86666V7.39999L7.40001 9.86666Z"/><path d="M13.9779 5.75562L13.1556 6.57784V9.86673H13.9779V5.75562Z"/><circle cx="13.649" cy="10.5244" r="0.822222"/></svg>',
            active: false,
            show: this.hasPermission('settings_course')
          },
          {
            path: this.setUrl(URLConstants.SUBJECT_LIST),
            title: 'Subject',
            type: 'link',
            svgPath: '<svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 1C0 0.447716 0.447715 0 1 0H10C10.5523 0 11 0.447715 11 1V10.0854C10.8436 10.0301 10.6753 10 10.5 10C9.67157 10 9 10.6716 9 11.5C9 12.3284 9.67157 13 10.5 13C10.6753 13 10.8436 12.9699 11 12.9146V13C11 13.5523 10.5523 14 10 14H1C0.447715 14 0 13.5523 0 13V1ZM7.54312 10H1.49989C1.44057 10 1.38403 10.0258 1.34811 10.073C0.961076 10.5815 0.611388 11.5231 1.34968 12.8976C1.38374 12.961 1.45074 13 1.52271 13H7.54316C7.70298 13 7.80432 12.8179 7.73868 12.6722C7.48958 12.1192 7.30007 11.2166 7.73126 10.3245C7.8008 10.1806 7.70293 10 7.54312 10Z"/></svg>',
            active: false,
            show: this.hasPermission('settings_subject')
          },
          {
            path: this.setUrl(URLConstants.CUSTOM_FIELD),
            title: 'Custom Fields',
            type: 'link',
            svgPath: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2C0 0.895416 0.895386 0 2 0H10C11.1046 0 12 0.895416 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895386 12 0 11.1046 0 10V2ZM1 3C1 2.72385 1.22388 2.5 1.5 2.5H7.13379C7.30676 2.20111 7.62988 2 8 2C8.37012 2 8.69324 2.20111 8.86621 2.5H10.5C10.7761 2.5 11 2.72385 11 3C11 3.27615 10.7761 3.5 10.5 3.5H8.86621C8.69324 3.79889 8.37012 4 8 4C7.62988 4 7.30676 3.79889 7.13379 3.5H1.5C1.22388 3.5 1 3.27615 1 3ZM1.5 5.5C1.22388 5.5 1 5.72385 1 6C1 6.27615 1.22388 6.5 1.5 6.5H2.13379C2.30676 6.79889 2.62988 7 3 7C3.37012 7 3.69324 6.79889 3.86621 6.5H10.5C10.7761 6.5 11 6.27615 11 6C11 5.72385 10.7761 5.5 10.5 5.5H3.86621C3.69324 5.20111 3.37012 5 3 5C2.62988 5 2.30676 5.20111 2.13379 5.5H1.5ZM1 9C1 8.72385 1.22388 8.5 1.5 8.5H7.13379C7.30676 8.20111 7.62988 8 8 8C8.37012 8 8.69324 8.20111 8.86621 8.5H10.5C10.7761 8.5 11 8.72385 11 9C11 9.27615 10.7761 9.5 10.5 9.5H8.86621C8.69324 9.79889 8.37012 10 8 10C7.62988 10 7.30676 9.79889 7.13379 9.5H1.5C1.22388 9.5 1 9.27615 1 9Z" /></svg>',
            active: false,
            show: this.hasPermission('inquiry_custom_field_list')
          },
          {
            path: this.setUrl(URLConstants.TRUST_LIST),
            title: 'Trust Detail',
            type: 'link',
            svgPath: '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 5C11.5 7.76142 9.26142 10 6.5 10C3.73858 10 1.5 7.76142 1.5 5C1.5 2.23858 3.73858 0 6.5 0C9.26142 0 11.5 2.23858 11.5 5ZM2.20447 5C2.20447 7.37236 4.12764 9.29553 6.5 9.29553C8.87236 9.29553 10.7955 7.37236 10.7955 5C10.7955 2.62764 8.87236 0.704467 6.5 0.704467C4.12764 0.704467 2.20447 2.62764 2.20447 5Z"/><path d="M5 10C3.4 10 2.33333 8.66667 2 8L0 9.5L2.5 10L3 12L5 10Z"/><path d="M10.8839 7.58903C10.4127 9.11806 8.82432 9.74471 8.08905 9.86691L8.93347 12.22L10.1476 9.97814L12.2062 10.0894L10.8839 7.58903Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 8C8.15685 8 9.5 6.65685 9.5 5C9.5 3.34315 8.15685 2 6.5 2C4.84315 2 3.5 3.34315 3.5 5C3.5 6.65685 4.84315 8 6.5 8ZM8.62494 4.15617C8.71119 4.08717 8.72518 3.96131 8.65617 3.87506C8.58717 3.78881 8.46131 3.77482 8.37506 3.84383L5.98926 5.75247L4.61094 4.83359C4.51903 4.77232 4.39486 4.79715 4.33359 4.88906C4.27232 4.98097 4.29715 5.10514 4.38906 5.16641L5.88906 6.16641L6.01074 6.24753L6.12494 6.15617L8.62494 4.15617Z"/></svg>',
            active: false,
            show: this.hasPermission('settings_trust_details')
          },
          { 
            path: this.setUrl(URLConstants.SYSTEM_SETTING), 
            title: 'System Setting', 
            type: 'link', 
            svgPath:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2C0 0.895431 0.895431 0 2 0H10C11.1046 0 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 0 11.1046 0 10V2Z" /><path class="cr-color" d="M8.57371 5.83684C8.57371 7.29312 7.39316 8.47367 5.93688 8.47367C4.4806 8.47367 3.30005 7.29312 3.30005 5.83684C3.30005 4.38056 4.4806 3.20001 5.93688 3.20001C7.39316 3.20001 8.57371 4.38056 8.57371 5.83684ZM4.30547 5.83684C4.30547 6.73785 5.03588 7.46825 5.93688 7.46825C6.83788 7.46825 7.56829 6.73785 7.56829 5.83684C7.56829 4.93584 6.83788 4.20543 5.93688 4.20543C5.03588 4.20543 4.30547 4.93584 4.30547 5.83684Z" fill="white"/><path class="cr-color" d="M5.20496 2.80001C5.20496 2.68955 5.2945 2.60001 5.40496 2.60001H6.32337C6.43383 2.60001 6.52337 2.68955 6.52337 2.80001V3.91842H5.20496V2.80001Z" fill="white"/><path class="cr-color" d="M3.24872 4.39732C3.16414 4.32627 3.15318 4.20012 3.22423 4.11554L3.81498 3.41234C3.88603 3.32776 4.01219 3.3168 4.09676 3.38785L4.9531 4.10725L4.10505 5.11672L3.24872 4.39732Z" fill="white"/><path class="cr-color" d="M8.57404 7.56004C8.65861 7.63109 8.66958 7.75725 8.59853 7.84182L8.00777 8.54503C7.93672 8.6296 7.81057 8.64057 7.72599 8.56952L6.76648 7.76344L7.61452 6.75397L8.57404 7.56004Z" fill="white"/><path class="cr-color" d="M7.94695 3.38114C8.0345 3.31379 8.16007 3.33016 8.22742 3.4177L8.78745 4.14562C8.8548 4.23316 8.83843 4.35873 8.75089 4.42609L7.86445 5.10806L7.06052 4.06312L7.94695 3.38114Z" fill="white"/><path class="cr-color" d="M5.20496 7.87366H6.52337V8.99207C6.52337 9.10253 6.43383 9.19207 6.32337 9.19207H5.40496C5.2945 9.19207 5.20496 9.10253 5.20496 8.99207V7.87366Z" fill="white"/><path class="cr-color" d="M7.8418 6.55521L7.84482 5.23679L8.96323 5.23936C9.07369 5.23961 9.16303 5.32936 9.16278 5.43982L9.16067 6.35823C9.16041 6.46869 9.07067 6.55803 8.96021 6.55777L7.8418 6.55521Z" fill="white"/><path class="cr-color" d="M4.02136 5.24139L4.01834 6.55981L2.89992 6.55724C2.78947 6.55699 2.70013 6.46724 2.70038 6.35678L2.70249 5.43837C2.70274 5.32791 2.79249 5.23857 2.90295 5.23883L4.02136 5.24139Z" fill="white"/><path class="cr-color" d="M4.31238 6.50336L5.19179 7.48563L4.09281 8.46953C4.01051 8.5432 3.88407 8.53622 3.8104 8.45392L3.19779 7.76967C3.12412 7.68737 3.1311 7.56093 3.2134 7.48725L4.31238 6.50336Z" fill="white"/></svg>',
            active: false , 
            show: this.hasPermission('settings_system_setting')
          },
          { 
            path: this.setUrl(URLConstants.NOTIFICATION_SETTING), 
            title: 'Notifications Setting', 
            type: 'link', 
            svgPath:'<svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.66321 0.416363C4.66321 0.186412 4.84962 0 5.07957 0C5.30952 0 5.49593 0.186412 5.49593 0.416363V0.832726H4.66321V0.416363Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.36683 0.949529C6.21808 0.901778 6.05909 0.86283 5.88923 0.834128C5.8838 0.83321 5.87815 0.832733 5.87265 0.832733H4.63185C3.79998 0.832733 2.05399 1.41445 1.71834 3.7401C1.71767 3.74478 1.71731 3.74965 1.71731 3.75438V5.82909C1.71731 6.37903 1.39045 7.63717 0.0891269 8.30834C0.0655556 8.3205 0.0469179 8.34132 0.0396388 8.36683C-0.0823034 8.79406 0.00956711 9.57635 1.30095 9.57635H9.58677C9.61329 9.57635 9.63883 9.56602 9.65682 9.54654C9.92994 9.2509 10.2692 8.5596 9.63531 7.91807C9.63069 7.91339 9.62567 7.90924 9.62021 7.90555C9.20129 7.6231 8.3791 6.82202 8.3791 5.82909V4.99585C8.36184 4.9962 8.34454 4.99638 8.32719 4.99638C6.94749 4.99638 5.82902 3.8779 5.82902 2.4982C5.82902 1.91324 6.03006 1.37524 6.36683 0.949529Z"/><circle cx="8.32732" cy="2.49818" r="1.66545"/><path d="M6.66184 9.99272C6.66184 10.4344 6.48637 10.858 6.17404 11.1704C5.8617 11.4827 5.43809 11.6582 4.99638 11.6582C4.55468 11.6582 4.13107 11.4827 3.81873 11.1704C3.5064 10.858 3.33093 10.4344 3.33093 9.99272L4.99638 9.99272H6.66184Z"/></svg>',
            active: false , 
            show: this.hasPermission('settings_notification')
          },
          {
            title: 'Security & Logs',
            type: 'sub',
            svgPath: '<svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.465154 2.41918L6.2158 0.0230775C6.28265 -0.00478038 6.35733 -0.00750901 6.42605 0.0153956L12.1592 1.92646C12.2587 1.95962 12.3334 2.03977 12.3553 2.14232C13.1494 5.86227 13.0209 13.2777 6.34596 14.4752C6.32876 14.4782 6.31121 14.4799 6.29373 14.4798C3.49737 14.4532 -1.20999 10.1173 0.287299 2.63661C0.306687 2.53974 0.373964 2.45717 0.465154 2.41918ZM11.8536 5.33343C12.0489 5.13817 12.0489 4.82158 11.8536 4.62632C11.6583 4.43106 11.3417 4.43106 11.1465 4.62632L5.545 10.2278L2.8932 6.85278C2.72259 6.63565 2.40826 6.59793 2.19113 6.76853C1.97399 6.93914 1.93627 7.25347 2.10688 7.4706L5.10688 11.2888L5.45508 11.7319L5.85359 11.3334L11.8536 5.33343Z"/></svg>',
            active: false,
            show: this.getInstituteModule('Settings'),
            children:
              [
                {
                  path: this.setUrl(URLConstants.OPT_LOG),
                  title: 'OTP Logs',
                  type: 'link',
                  active: false,
                  show: this.otp_generate
                }
              ]
          }
        ],
      }
    }
  }
}
