import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { enviroment } from 'src/environments/environment.staging';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/core/services/common.service';
import { LeaveManagmentService } from '../../leave-management/leave-managment.service';
import { StudentService } from '../student.service';
import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { Toastr } from 'src/app/core/services/toastr';
import { filter } from 'rxjs/operators';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ReportService } from "../../report/report.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-student-layout',
  templateUrl: './student-layout.component.html',
  styleUrls: ['./student-layout.component.scss']
})
export class StudentLayoutComponent implements OnInit {
  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  $destroy: Subject<void> = new Subject<void>();

  branch_id: any = window.localStorage.getItem('branch');
  user_id: any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]);

  login_id: any = 4;
  student: any;
  title: any;

  URLConstants = URLConstants;
  symfonyHost = enviroment.symfonyHost;

  studentId!: any
  uniqueId!: any
  student_id!: any

  tittle: any = 'Profile'

  studentDetails: any = []

  public institute_modules: any = [];
  private API_URL = enviroment.apiUrl;

  searchText: string = '';

  isCollape : boolean = true
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef ;

  message : any = {
    is_father_message   : false ,
    is_mother_message   : false ,
    is_student_message  : false ,
  }
  is_admissionLoading : boolean = false

  tabs = [
    { label: 'Student Profile', url: URLConstants.STUDENT_PROFILE, permission: 'student_student', tittle: 'Profile', path: 'student-profile' , d1 : 'M15 15V13.3248C15 12.4362 14.6313 11.584 13.9749 10.9557C13.3185 10.3274 12.4283 9.97437 11.5 9.97437H4.5C3.57174 9.97437 2.6815 10.3274 2.02513 10.9557C1.36875 11.584 1 12.4362 1 13.3248V15' , d2 : "M8 7.4615C9.65685 7.4615 11 6.01505 11 4.23075C11 2.44646 9.65685 1 8 1C6.34315 1 5 2.44646 5 4.23075C5 6.01505 6.34315 7.4615 8 7.4615Z", d3 : "", d4 : "", d5 : "" },
    { label: 'Academics', url: URLConstants.ACADEMICS, permission: 'student_student', tittle: 'Academics', path: 'academics' , d1 : 'M1.00153 12.4218L1.59988 8.77581M1.00153 12.4218L1.59988 8.77581M1.00153 12.4218C0.997036 12.4492 0.997725 12.4753 1.00179 12.4978C1.00192 12.4985 1.00206 12.4993 1.0022 12.5M1.00153 12.4218L1.0022 12.5M1.59988 8.77581L2.19824 12.4218C2.20273 12.4492 2.20204 12.4753 2.19798 12.4978C2.19784 12.4985 2.1977 12.4993 2.19756 12.5H1.0022M1.59988 8.77581L1.0022 12.5M7.60721 0.580217L7.60732 0.580169C7.86404 0.473294 8.13574 0.473245 8.39285 0.580214L15.3663 3.48145C15.4088 3.49917 15.5 3.58717 15.5 3.79173C15.5 3.99628 15.4088 4.08429 15.3663 4.102L8.39265 7.00321C8.39264 7.00322 8.39262 7.00323 8.3926 7.00324C8.05121 7.1452 7.76349 7.06827 7.60676 7.00315L2.71771 4.96896L2.42056 4.84533L2.31387 4.94463L2.38273 4.82936L1.84918 4.60739L0.63343 4.10161L0.633387 4.1016C0.591241 4.08407 0.5 3.99631 0.5 3.79156C0.5 3.5868 0.591241 3.49905 0.633387 3.48152L0.633433 3.4815L7.60721 0.580217ZM1.51671 7.05176L1.6015 6.98595L1.68948 7.05881C1.7939 7.14528 1.89988 7.32624 1.89988 7.58337C1.89988 7.81875 1.80875 7.99345 1.70709 8.09106L1.59988 8.19399L1.49267 8.09106C1.39101 7.99345 1.29988 7.81875 1.29988 7.58337C1.29988 7.31608 1.41241 7.13272 1.51671 7.05176ZM9.01162 8.96215L9.01173 8.96211L12.01 7.71465L12.2995 10.852C12.2876 11.1316 12.0065 11.5404 11.1883 11.9097C10.3981 12.2664 9.27128 12.5 7.99991 12.5C6.72854 12.5 5.60171 12.2664 4.81147 11.9097C3.99326 11.5404 3.71226 11.1316 3.70029 10.852L3.98982 7.71495L6.98773 8.96206C6.98777 8.96208 6.98782 8.9621 6.98786 8.96212C7.37705 9.12413 8.13141 9.32813 9.01162 8.96215Z', d2 : '', d3 : "", d4 : "", d5 : ""},
    { label: 'Fees', url: URLConstants.STUDENT_COLLECT_FEES, permission: 'finance_fees', tittle: 'Fees', path: 'collect-fees' , d1: 'M11.775 6.2C11.8993 6.2 12 6.09926 12 5.975V5.225C12 5.10074 11.8993 5 11.775 5H6.225C6.10074 5 6 5.10074 6 5.225V6.06403C6 6.18828 6.10074 6.28903 6.225 6.28903H7.824C8.33602 6.28903 8.72889 6.47574 8.96719 6.8H6.225C6.10074 6.8 6 6.90074 6 7.025V7.775C6 7.89926 6.10074 8 6.225 8H9.20169C9.08513 8.67661 8.58368 9.09935 7.8 9.09935H6.225C6.10074 9.09935 6 9.20009 6 9.32435V10.3183C6 10.3811 6.02625 10.4411 6.07239 10.4837L9.16712 13.3403C9.20868 13.3787 9.26317 13.4 9.31973 13.4H10.8678C11.0726 13.4 11.1709 13.1486 11.0204 13.0097L8.19133 10.3982C9.62569 10.3544 10.6503 9.39708 10.7848 8H11.775C11.8993 8 12 7.89926 12 7.775V7.025C12 6.90074 11.8993 6.8 11.775 6.8H10.6746C10.6092 6.58361 10.5193 6.38289 10.4073 6.2H11.775Z', d2 : 'M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z', d3 : "", d4 : "", d5 : ""},
    { label: 'Refund', url: URLConstants.STUDENT_FEES_REFUND, permission: 'finance_fees_refund', tittle: 'Refund', path: 'refund-fees' , d1 : 'M11.2271 16.8759L11.4997 16.0208C11.6674 15.4945 11.3768 14.932 10.8506 14.7643L9.99545 14.4918', d2 : 'M13.4951 13.1577C13.6831 13.2993 13.9514 13.2622 14.0816 13.0661C14.9084 11.821 15.3292 10.3458 15.2795 8.84497C15.2251 7.20177 14.61 5.62667 13.5364 4.38148C12.4628 3.13628 10.9955 2.29598 9.37819 2.00024C7.90099 1.73011 6.37998 1.92916 5.02665 2.56361C4.81355 2.66351 4.73741 2.92348 4.84974 3.1303V3.1303C4.96207 3.33712 5.22028 3.4123 5.43417 3.31409C6.61578 2.77156 7.93915 2.60352 9.22488 2.83863C10.6507 3.09937 11.9444 3.84021 12.8909 4.93801C13.8374 6.03582 14.3797 7.42448 14.4277 8.87318C14.4709 10.1795 14.1099 11.4637 13.3993 12.5526C13.2707 12.7497 13.307 13.0161 13.4951 13.1577V13.1577Z', d3 : 'M2.50042 5.26899C2.29999 5.13208 2.02525 5.18295 1.90081 5.39136C1.12709 6.68721 0.778184 8.19725 0.909962 9.70818C1.0545 11.3654 1.76842 12.9215 2.93038 14.112C4.09235 15.3025 5.63068 16.0539 7.28395 16.2386C8.79124 16.4069 10.3093 16.0947 11.6235 15.3526C11.8349 15.2333 11.8924 14.9598 11.7604 14.7561V14.7561C11.6284 14.5524 11.3569 14.4958 11.1445 14.6134C10.0016 15.246 8.68695 15.5108 7.38152 15.365C5.93008 15.2029 4.57954 14.5432 3.55942 13.498C2.5393 12.4529 1.91254 11.0868 1.78564 9.63181C1.67151 8.32324 1.96806 7.01542 2.62822 5.88815C2.75088 5.67869 2.70085 5.4059 2.50042 5.26899V5.26899Z', d4 : 'M5.41272 1.17935L4.99762 1.97508C4.74218 2.46474 4.93206 3.06877 5.42172 3.32421L6.21745 3.73931', d5 : 'M9.97852 7.16626C10.0821 7.16626 10.166 7.08231 10.166 6.97876V6.35376C10.166 6.25021 10.0821 6.16626 9.97852 6.16626H5.35352C5.24997 6.16626 5.16602 6.25021 5.16602 6.35376V7.05295C5.16602 7.15649 5.24997 7.24045 5.35352 7.24045H6.68602C7.1127 7.24045 7.44009 7.39604 7.63867 7.66626H5.35352C5.24997 7.66626 5.16602 7.75021 5.16602 7.85376V8.47876C5.16602 8.58231 5.24997 8.66626 5.35352 8.66626H7.83409C7.73695 9.2301 7.31908 9.58238 6.66602 9.58238H5.35352C5.24997 9.58238 5.16602 9.66634 5.16602 9.76988V10.5982C5.16602 10.6505 5.18789 10.7005 5.22634 10.736L7.80528 13.1165C7.83992 13.1485 7.88532 13.1663 7.93245 13.1663H9.22248C9.39317 13.1663 9.47508 12.9568 9.34966 12.841L6.99213 10.6648C8.18742 10.6282 9.04125 9.83049 9.15334 8.66626H9.97852C10.0821 8.66626 10.166 8.58231 10.166 8.47876V7.85376C10.166 7.75021 10.0821 7.66626 9.97852 7.66626H9.06148C9.00702 7.48593 8.93211 7.31867 8.8388 7.16626H9.97852Z'},
    { label: 'Transport', url: URLConstants.STUDENT_TRANSPORT, permission: '', tittle: 'Transport', path: 'transport',d1 : 'M12.3645 1H1V12.6196H12.3645V1Z', d2 : 'M12.3662 5.46729H15.3972L17.6704 8.1491V12.6188H12.3662V5.46729Z', d3 : 'M4.40803 17.09C5.45425 17.09 6.30238 16.0895 6.30238 14.8552C6.30238 13.6209 5.45425 12.6204 4.40803 12.6204C3.3618 12.6204 2.51367 13.6209 2.51367 14.8552C2.51367 16.0895 3.3618 17.09 4.40803 17.09Z', d4 : 'M14.2606 17.09C15.3068 17.09 16.1549 16.0895 16.1549 14.8552C16.1549 13.6209 15.3068 12.6204 14.2606 12.6204C13.2143 12.6204 12.3662 13.6209 12.3662 14.8552C12.3662 16.0895 13.2143 17.09 14.2606 17.09Z', d5 : '', },
    { label: 'Hostel', url: URLConstants.STUDENT_HOSTEL, permission: '', tittle: 'Hostel', path: 'hostel', d1: 'M10.4158 15.4169V15.4156V11.9996C10.4158 11.743 10.3324 11.4821 10.1629 11.277C9.99121 11.0692 9.73556 10.9281 9.44357 10.9281H7.55483C7.26283 10.9281 7.00719 11.0692 6.83549 11.277C6.66604 11.4821 6.58264 11.743 6.58264 11.9996V15.4181C6.58264 15.4506 6.57484 15.4749 6.5675 15.4898L3.34856 15.4999C3.34127 15.4849 3.33356 15.4607 3.33356 15.4285V9.78221L8.50041 4.63173L13.666 9.77836V15.4285C13.666 15.4607 13.6583 15.4849 13.651 15.4999L10.4309 15.4891C10.4288 15.4849 10.4267 15.4799 10.4247 15.474C10.4192 15.4579 10.4157 15.4383 10.4158 15.4169ZM16.4978 8.17295L15.868 9.09962L9.07913 2.33226L9.07915 2.33224L9.0753 2.32847C8.92695 2.18375 8.72503 2.08996 8.50038 2.08996C8.27572 2.08996 8.07381 2.18375 7.92546 2.32847L7.92544 2.32845L7.92161 2.33227L1.13334 9.09935L0.502231 8.17077L7.95164 0.745383C7.95168 0.745335 7.95173 0.745287 7.95178 0.745239C8.12086 0.576907 8.31537 0.500505 8.4989 0.500505C8.68249 0.500505 8.87705 0.576951 9.04617 0.745383L9.0462 0.745416L11.6884 3.37642L12.5412 4.22562V3.02212V0.5H13.9021V5.37596V5.58341L14.049 5.72993L16.4978 8.17295ZM1.24741 9.2672L1.24738 9.26715L1.24741 9.2672Z', d2 : '', d3 : '', d4 : '', d5 : '', },
    { label: 'Optional Fees', url: URLConstants.STUDENT_OPTIONAL_FEES, permission: 'optional-fees', tittle: 'Fees', path: 'assign-optional-fees' , d1: 'M11.775 6.2C11.8993 6.2 12 6.09926 12 5.975V5.225C12 5.10074 11.8993 5 11.775 5H6.225C6.10074 5 6 5.10074 6 5.225V6.06403C6 6.18828 6.10074 6.28903 6.225 6.28903H7.824C8.33602 6.28903 8.72889 6.47574 8.96719 6.8H6.225C6.10074 6.8 6 6.90074 6 7.025V7.775C6 7.89926 6.10074 8 6.225 8H9.20169C9.08513 8.67661 8.58368 9.09935 7.8 9.09935H6.225C6.10074 9.09935 6 9.20009 6 9.32435V10.3183C6 10.3811 6.02625 10.4411 6.07239 10.4837L9.16712 13.3403C9.20868 13.3787 9.26317 13.4 9.31973 13.4H10.8678C11.0726 13.4 11.1709 13.1486 11.0204 13.0097L8.19133 10.3982C9.62569 10.3544 10.6503 9.39708 10.7848 8H11.775C11.8993 8 12 7.89926 12 7.775V7.025C12 6.90074 11.8993 6.8 11.775 6.8H10.6746C10.6092 6.58361 10.5193 6.38289 10.4073 6.2H11.775Z', d2 : 'M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z', d3 : "", d4 : "", d5 : ""},

    // { label: 'Optional Fees', url: URLConstants.STUDENT_FEES_REFUND, permission: 'finance_fees_refund', tittle: 'Refund', path: 'refund-fees' },
    { label: 'Wallet', url: URLConstants.STUDENT_WALLET_HISTORY, permission: 'finance_wallets', tittle: 'Wallet', path: 'fees', d1 : 'M15.5455 1H2.45455C1.65122 1 1 1.89543 1 3V15C1 16.1046 1.65122 17 2.45455 17H15.5455C16.3488 17 17 16.1046 17 15V3C17 1.89543 16.3488 1 15.5455 1Z', d2 : 'M1 7.00171H17', d3 : '', d4 : '', d5 : '', },
    { label: 'Online Exam', url: URLConstants.ADMIN_STUDENT_EXAM, permission: 'online_exam_exam', tittle: 'Online Exam', path: 'mcq', d1 : 'M15.4 1H2.6C1.71634 1 1 1.79594 1 2.77778V11.6667C1 12.6485 1.71634 13.4444 2.6 13.4444H15.4C16.2837 13.4444 17 12.6485 17 11.6667V2.77778C17 1.79594 16.2837 1 15.4 1Z', d2 : 'M5.80273 17.0002H12.2027', d3 : 'M9.00195 13.4443V16.9999', d4 : '', d5 : '', },
    { label: 'Event', url: URLConstants.STUDETN_EVENT, permission: 'administrator_event_gallary', tittle: 'Event', path: 'event', d1 : 'M15.4 1H2.6C1.71634 1 1 1.79594 1 2.77778V11.6667C1 12.6485 1.71634 13.4444 2.6 13.4444H15.4C16.2837 13.4444 17 12.6485 17 11.6667V2.77778C17 1.79594 16.2837 1 15.4 1Z', d2 : 'M5.80273 17.0002H12.2027', d3 : 'M9.00195 13.4443V16.9999', d4 : '', d5 : '', },
    { label: 'Bank Details', url: URLConstants.BANK_DETAILS, permission: '', tittle: 'Bank Details', path: 'bank-detail' ,d1 : 'M14.9333 4.08572H14.7333V4.28572V4.71429C14.7333 4.85373 14.631 4.94286 14.5333 4.94286H1.46667C1.369 4.94286 1.26667 4.85373 1.26667 4.71429V4.28572V4.08572H1.06667H0.266667C0.253612 4.08572 0.238052 4.08029 0.224316 4.06557C0.210144 4.05039 0.2 4.02702 0.2 4.00001V3.42858C0.2 3.40867 0.205571 3.39022 0.214653 3.37567C0.223154 3.36204 0.233786 3.3532 0.243948 3.34826L7.97333 0.207007L7.97337 0.2071L7.97914 0.204541C7.99279 0.198486 8.00721 0.198486 8.02086 0.204541L8.02082 0.204632L8.02667 0.207007L15.7561 3.34826C15.7662 3.3532 15.7768 3.36204 15.7853 3.37567C15.7944 3.39022 15.8 3.40867 15.8 3.42858V4.00001C15.8 4.02702 15.7899 4.05039 15.7757 4.06557C15.7619 4.08029 15.7464 4.08572 15.7333 4.08572H14.9333ZM2.66667 12.7714H2.86667V12.5714V5.91429H4.6V12.5714V12.7714H4.8H6.93333H7.13333V12.5714V5.91429H8.86667V12.5714V12.7714H9.06667H11.2H11.4V12.5714V5.91429H13.1333V12.5714V12.7714H13.3333H14.5333C14.631 12.7714 14.7333 12.8606 14.7333 13V13.5143H1.26667V13C1.26667 12.8606 1.369 12.7714 1.46667 12.7714H2.66667ZM0.8 14.4857H15.2C15.5186 14.4857 15.8 14.7667 15.8 15.1429V15.7143C15.8 15.7413 15.7899 15.7647 15.7757 15.7799C15.7619 15.7946 15.7464 15.8 15.7333 15.8H0.266667C0.253612 15.8 0.238052 15.7946 0.224316 15.7799C0.210144 15.7647 0.2 15.7413 0.2 15.7143V15.1429C0.2 14.7667 0.481396 14.4857 0.8 14.4857Z', d2 : '', d3 : '', d4 : '', d5 : '', },
    { label: 'Documents', url: URLConstants.STUDENT_DOCUMENT, permission: '', tittle: 'Documents', path: 'documents', d1 : 'M11 1H3C2.46957 1 1.96086 1.16857 1.58579 1.46863C1.21071 1.76869 1 2.17565 1 2.6V15.4C1 15.8243 1.21071 16.2313 1.58579 16.5314C1.96086 16.8314 2.46957 17 3 17H15C15.5304 17 16.0391 16.8314 16.4142 16.5314C16.7893 16.2313 17 15.8243 17 15.4V5.8L11 1Z', d2 : 'M11 1V5.8H17', d3 : 'M13 9.80005H5', d4 : 'M13 13H5', d5 : 'M7 6.6001H6H5', },
    { label: 'Leaves', url: URLConstants.ADMIN_STUDENT_TAB, permission: 'administrator_leave', tittle: 'Leaves', path: 'leaves', d1 : 'M9.89156 3H7.61173V0.753695L9.89156 3ZM0.666725 0.5H5.72276V3.71875C5.72276 4.36327 6.25414 4.875 6.88949 4.875H10.1676V7.375H10.1648H5.77828C5.26517 7.375 4.8338 7.7883 4.8338 8.3125V9.1875C4.8338 9.7117 5.26517 10.125 5.77828 10.125H10.1648H10.1676V13.3438C10.1676 13.4238 10.1017 13.5 10.0009 13.5H0.666725C0.565896 13.5 0.5 13.4238 0.5 13.3438V0.65625C0.5 0.576155 0.565897 0.5 0.666725 0.5ZM11.1676 9.125H11.1648V8.375H11.1676H12.4427H12.9427V7.875V6.23109L15.4833 8.75001L12.9427 11.2716V9.625V9.125H12.4427H11.1676Z', d2 : 'M11 1V7H17', d3 : 'M6 14H12', d4 : '', d5 : '', },
    { label: 'Remarks', url: URLConstants.REMARK_LIST, permission: 'administrator_remark', tittle: 'Remarks', path: 'remark', d1 : 'M6.11687 10.2714C5.8586 10.2182 5.58025 10.2197 5.31377 10.2877L5.10682 9.66684L5.10658 9.66612C4.94711 9.19015 4.50277 8.86913 3.99998 8.86913C3.49687 8.86913 3.05305 9.19066 2.8933 9.66554L2.89281 9.66703L2.43057 11.0555H2.22221C1.70052 11.0555 1.27777 11.4783 1.27777 11.9999C1.27777 12.5216 1.70052 12.9444 2.22221 12.9444H2.56638C3.13436 12.9444 3.65248 12.6632 3.96449 12.2127L3.99275 12.2975C3.99285 12.2977 3.99295 12.298 3.99304 12.2983C4.25671 13.0935 5.35714 13.1774 5.73386 12.4216L5.79692 12.2955C6.10973 12.6936 6.58589 12.9313 7.10147 12.9412L7.10147 12.9413L7.11065 12.9413L10.1666 12.944V13.5555C10.1666 13.6488 10.0933 13.7222 9.99996 13.7222H0.666664C0.573364 13.7222 0.5 13.6488 0.5 13.5555V0.666664C0.5 0.573363 0.573363 0.5 0.666664 0.5H5.7222V3.77776C5.7222 4.42057 6.24605 4.94443 6.88886 4.94443H10.1669V5.52932L6.75907 8.91292L6.61136 9.05958V9.26774V10.4509C6.45396 10.3659 6.2859 10.3062 6.11687 10.2714ZM9.90417 3.05554H7.61108V0.760103L9.90417 3.05554ZM15.4392 5.00159L15.4393 5.00177C15.5202 5.08257 15.5202 5.21377 15.4393 5.29458L15.4392 5.29476L15.0358 5.69814L13.8573 4.5197L14.2607 4.11631C14.3416 4.03547 14.473 4.03547 14.5539 4.11631L15.4392 5.00159ZM9.70825 11.0555H8.49997V9.8459L12.5206 5.85415L13.7015 7.03506L9.70825 11.0555Z', d2 : '', d3 : '', d4 : '', d5 : '', },
    { label: 'Notice History', url: URLConstants.STUDENT_NOTICE_HISTORY, permission: 'administrator_notice_history', tittle: 'Notice History', path: 'notice-history', d1 : 'M8.50035 11.5957L7.74366 4.61412C7.69399 4.15593 7.77848 3.66579 8.12169 3.35819C8.76917 2.77789 9.40794 2.99153 9.8636 3.37334C10.2169 3.66934 10.3064 4.15593 10.2568 4.61412L9.50005 11.5957C9.46398 11.9286 9.25147 12.3865 8.92243 12.3248C8.59339 12.263 8.53643 11.9286 8.50035 11.5957Z', d2 : 'M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z', d3 : 'M9 13.7949H9.01143', d4 : '', d5 : '', },
    { label: 'Monthly Report', url: URLConstants.STUDENT_MONTHLY_REPORT_PROFILE, permission: 'report_student_monthly_report', tittle: 'Monthly Report', path: 'monthly-report', d1 : 'M2 2 H14 L18 6 V20 H2 Z', d2 : 'M14 2 V6 H18', d3 : 'M4 15 L8 11 L11 13 L15 8', d4 : '', d5 : '', }
    // { label: 'Exams & Reports', url: 'students/report', permission: 'student_exam' },
    // { label: 'Events',          url: 'students/events', permission: 'administrator_event_gallary' },
    // { label: 'Transport',       url: 'students/transport', permission: 'transport_assign_transport' },
    // { label: 'Meal Menu',       url: 'students/meals', permission: 'administrator_meal' },
    // { label: 'Assignment',      url: 'attachment/assignment', permission: 'administrator_assignment' },
  ];

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public studentService: StudentService,
    private httpRequest: HttpClient,
    public CommonService: CommonService,
    private leaveManagementSerivce: LeaveManagmentService,
    private cdr: ChangeDetectorRef,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private toaster: Toastr,
    private router: Router,
    private ReportService: ReportService,
    private modalService:NgbModal,
  ) {
    this.instituteModules()
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    const childParams = this._activatedRoute.firstChild?.snapshot.params['unique_id'];
    this.uniqueId = this._activatedRoute.firstChild?.snapshot.params['id'] || this._activatedRoute.firstChild?.snapshot.params['unique_id'];

    this.setTittle(this._activatedRoute.firstChild?.snapshot.url[0]?.path);

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      const currentChildRoute = this._activatedRoute.firstChild?.snapshot.url[0]?.path;

      if (currentChildRoute) {
        this.setTittle(currentChildRoute)
      }
    });

    this.fetchStudentDetails()

    this.login_id = childParams

    this.getStudentDetails()
    // this.getStudentInfo();    
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------


  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  filteredTabs() {
    return this.tabs.filter(tab =>
      tab.label.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (tab.permission === '' || this.CommonService.hasPermission(tab.permission, 'has_access'))
    );
  }

  fetchStudentDetails() {
    const payload = {
      branch_id: this.branch_id,
      academic_year_id: this.currentYear_id,
      id: this.uniqueId
    }
    this.studentService.fetchStudentDetails(payload).subscribe((res: any) => {

      this.studentDetails = res
      this.profilePhotoSet(this.studentDetails)
      this.student_id = this.studentDetails?.id ? [this.studentDetails?.id] : []
      this.cdr.detectChanges();
    }, (error) => {
      this.toaster.showError(error?.error?.message ?? error?.message)
    }
    )
  }

  profilePhotoSet(studentDetail: any) {
    if (studentDetail?.image) {
      this.studentDetails['photo'] = 'https://' + enviroment?.symfonyDomain + studentDetail?.image
    }
    else {
      this.studentDetails['photo'] = 'https://' + enviroment?.symfonyDomain + studentDetail?.profile
    }
  }

  getStudentDetails() {
    this.studentService.getStudent().subscribe((response: any) => {
      if (response) {
        this.studentId = response?.id;
        this.title = response?.title;
        this.cdr.detectChanges();
      }
    });
  }

  studentIdGeneration(format: any, zip:boolean = false) {
    this.studentService.studentIdGeneration({students: this.student_id},zip).subscribe((res: any) => {
      this.CommonService.downloadFile(res, 'Student Id', zip ? 'zip' : format);
    });
  }


  deleteStudent()
  {
    this.studentService.bulkDelete({studentIds: this.student_id}).subscribe((res: any) => {
      if(res.status == true){
        this._router.navigate([this.setUrl(URLConstants.STUDENT_LIST)]);
        this.toaster.showSuccess(res.message);
      }else{
        this.toaster.showError(res.message);
      }
    });  
  }

  bonafiedCertificate(format:string)
  {
    this.ReportService.getBonafiedCertificate({student_ids:this.student_id.join(',')}).subscribe((res: any) => {
      this.CommonService.downloadFile(res,'Bonafied Certificate', format);
    });
  }

  printData(format)
  {
    this.studentService.printData({studentIds: this.student_id}, format).subscribe(
      (res: any) => {       
        this.CommonService.downloadFile(res, 'student-detail', format);
      },
      (error) => {        
      }
    );
  }

  sendAdmissionPopUp(modalName:any)
  {
    this.modalService.open( modalName );
  }

  sendAdmissionSms() {
      const payload = {
        studentIds: this.student_id,
        is_father_message: this.message.is_father_message ? 1 : 0,
        is_mother_message: this.message.is_mother_message ? 1 : 0,
        is_student_message: this.message.is_student_message ? 1 : 0,
      }
      this.studentService.sendAdmissionSms(payload).subscribe((res: any) => {
        if (res.status == true) {
          this.toaster.showSuccess(res.message);
          this.is_admissionLoading = false
          this.closeModel()
        } else {
          this.toaster.showError(res.message);
          this.is_admissionLoading = false
        }
      }, (error: any) => {
        this.is_admissionLoading = false
        this.toaster.showError(error?.error?.message ?? error?.message)
      });
    }

  closeModel(){

    this.is_admissionLoading = false
    
    this.message.is_father_message = false
    this.message.is_mother_message = false
    this.message.is_student_message = false

    this.modalService.dismissAll()
  }

  downloadStudentFullReport(id:any){
    const payload = {
      is_full_report: true
    };
    this.studentService.downloadStudentFullBasicReport(id,payload).subscribe((res: any) => {
      this.CommonService.downloadFile(res,'Student Full Report', 'pdf');
    });
  }

  downloadStudentBasicReport(id:any){
    const payload = {
      is_full_report: false
    };
    this.studentService.downloadStudentFullBasicReport(id,payload).subscribe((res: any) => {
      this.CommonService.downloadFile(res,'Student Basic Report', 'pdf');
    });
  }
  
  downloadPdfAndExcel(format)
  {
    this.studentService.getPdfAndExcel({studentIds : this.student_id}, format).subscribe(
      (res: any) => {        
        this.CommonService.downloadFile(res, 'student-detail', format);
      },
      (error) => {
        
      }
    );
  }    

  // getStudentInfo(){
  //   this.leaveManagementSerivce.getStudentProfileDetail(this.login_id ).subscribe((resp:any) => {
  //     if(resp.status == false && !resp.id){
  //       this._router.navigate([this.setUrl(URLConstants.STUDENT_LIST)]);
  //       return;
  //     }          
  //     this.student = resp
  //   }); 
  // }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }
  setsymfonyUrlAdmin(url: string) {
    return this.symfonyHost + window.localStorage.getItem("branch") + '/' + url;
  }
  setsymfonyUrl(url: string) {
    if (url == "students/addStudent") {
      return this.symfonyHost + window.localStorage.getItem("branch") + '/' + url + '/' + this.student?.id;
    } else {
      return this.symfonyHost + window.localStorage.getItem("branch") + '/' + url + '/' + this.login_id;
    }
  }

  onSearchIconClick(){
    this.isCollape = false;
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 0);
  }
  // --------------------------------------------------------------------------------------------------------------
  // #endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  setTittle(currentChildRoute: any) {
    this.tittle = this.tabs.find((obj: any) => obj.path.toLowerCase() == currentChildRoute.toLowerCase())?.tittle;
  }

  instituteModules() {
    this.httpRequest.get(this.API_URL + 'api/get-institute-modules').subscribe((res: any) => {
      this.institute_modules = res.data;
    });
  }

  getInstituteModule(module_name: string) {
    return this.institute_modules.includes(module_name);
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------
}
