import { Component } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { TimetableService } from '../timetable.service';
import { Toastr } from 'src/app/core/services/toastr';
import moment from 'moment';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-teachers-timetable',
  templateUrl: './proxy-teachers-timetable.component.html',
  styleUrls: ['./proxy-teachers-timetable.component.scss']
})
export class ProxyTeachersTimetableComponent {

  constructor(
    private TimetableService: TimetableService,
    private toastr: Toastr,
    public CommonService: CommonService,
  ) {
    
    // Get the current date
    const today = new Date();

    // Format the date as YYYY-MM-DD
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    this.currentDate = `${year}-${month}-${day}`;
  }

  submit = false;
  showLoading = false
  URLConstants = URLConstants;
  currentDate = '';
  checkDate = true;
  loading = false;

  lecture_timing:any = []
  timetable:any = [];

  users:any = [];

  subject_array: any = []
 
  errors:any = [];

  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }
  
  ngOnInit() {
   
  }

  getProxyTeachersTimetable(){
    this.submit = true;
    if(this.currentDate != null && this.currentDate != ''){
    this.showLoading = true;
    const date1 = new Date(this.currentDate);
    const date2 = new Date();

    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);

    // date1 >= date2 ? this.checkDate = true : this.checkDate = false 
    
    this.loading = true;
    let data = {
      date: this.currentDate
    }
    this.TimetableService.getProxyTimeTable(data).subscribe((resp:any) => {

      if(resp.status){
        // this.toastr.showSuccess(resp.message);
        if(resp.data.length > 0){
          this.users = resp.data
        }
        else{
          this.toastr.showError('There is no absent faculty on this date.');
        }
      }else{
        this.toastr.showError(resp.message);
      }

      this.showLoading = false;

    })
    }
  }

  show(){
    this.getProxyTeachersTimetable()
  }
  
  clear(){
    this.currentDate = '',
    this.users = [];
    this.subject_array = [];
    this.submit = false; 
  }

  handleFacultyChange(i:any , j:any){
    this.errors['users.'+i+'.timetable.'+j+'.proxy_teacher_id'] = null
  }

  save(){
    let data = {
      date: this.currentDate,
      users: this.users
    }
    this.TimetableService.saveProxyTimeTable(data).subscribe((resp:any) => {
      if(resp.status){
        this.toastr.showSuccess(resp.message);
      }
      else{
        this.toastr.showError(resp.message);
      }
    },(error:any) => {
      this.errors = error.error.errors
    })
  }
  
  handleProxyChange(i:any, j:any, proxy_id:any){
    this.timetable.forEach((el:any, index:any) => {
      if (i != index && el.timetable[j]) {
        el.timetable[j].lecturers.forEach((x:any) => {
          x.disabled = x.id == proxy_id;
        });
      }
    });
  }

  getTime(item: any) {
    const time =
      item.substring(0, 2) <= 12
        ? item.substring(0, 5)
        : item.substring(0, 2) - 12 + item.substring(2, 5);

    const ampm = item.substring(0, 2) < 12 ? 'AM' : 'PM';

    return time + ' ' + ampm;
  }

  timeFormat(time:any){
    return moment(time, "HH:mm:ss").format("hh:mm A");
  }
}
