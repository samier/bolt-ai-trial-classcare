import { Component } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { RouterModule, Routes,Router} from '@angular/router';
import { enviroment } from '../../../../environments/environment.staging';
import { HttpClient } from '@angular/common/http';
import { LeaveManagmentService } from 'src/app/modules/leave-management/leave-managment.service';
import { SharedUserService } from 'src/app/shared/componets/header/shared-user.service';

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.scss']
})
export class StudentDetailsComponent {
  URLConstants = URLConstants;
  symfonyHost = enviroment.symfonyHost;
  private API_URL = enviroment.apiUrl;
  public studentDetails = ('; '+document.cookie)?.split(`; studentDetails=`)?.pop()?.split(';')[0].split('%7C');
  public studentDetail:any = {};
  public institute_modules:any = [];
  public profile_image:any = null;
  public page_name: any = null;
  constructor(public router: Router,private httpRequest: HttpClient,private leaveManagementSerivce:LeaveManagmentService,  public SharedUserService: SharedUserService, ){
    this.studentDetails?.map(row=>{
      const key = row.split('%3D')[0];
      const value = row.split('%3D')[1];
      Object.assign(this.studentDetail, {[key] : value}); 
    });
    this.httpRequest.get(this.API_URL+'api/get-institute-modules').subscribe((res:any) => {
      this.institute_modules = res.data;
    });
    this.leaveManagementSerivce.getStudentProfileDetail(this.studentDetail['studentid']??0).subscribe((resp:any) => {          
      if(resp.status == false){
        return location.replace(this.setsymfonyUrlAdmin('students'));
      }   
      this.profile_image = resp.image;
      this.SharedUserService.user = resp
      localStorage.setItem('user_id', resp.id)
    });
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  getPageName(){
    if(this.router.url == URLConstants.STUDENT_EXAM_LIST){
      this.page_name = 'Student Online Exam';
    }
    if(this.router.url == URLConstants.STUDENT_LEAVE_LIST){
      this.page_name = 'Student Leave';
    }
    if(this.router.url == URLConstants.STUDENT_REMARK_LIST){
      this.page_name = 'Student Remarks';
    }
    return this.page_name;
  }

  getStudent(key:string){
    return this.studentDetail[key]??"-";
  }

  getInstituteModule(module_name:string){
    return this.institute_modules.includes(module_name);
  }

  stringDecode(string:string){
    return string.replace(/\+/gi, " ");
  }
  
  getProfile(){
    // let c = this.stringDecode(this.studentDetail['profile']);
    // c = decodeURIComponent(c);
    // return this.symfonyHost.replace(/\/app_dev.php\//gi, "")+c;
    this.profile_image = this.profile_image.replace("\\", "");
    return this.profile_image;
  }
  decodeURL(text:any){
    return decodeURI(text);
  }

  setsymfonyUrlAdmin(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  } 
  
  setsymfonyUrl(url:string) {
    return this.symfonyHost+url;
  }
}
