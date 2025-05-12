import { Component } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { TimetableService } from '../timetable.service';
import { Toastr } from 'src/app/core/services/toastr';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-teachers-timetable',
  templateUrl: './teachers-timetable.component.html',
  styleUrls: ['./teachers-timetable.component.scss']
})
export class TeachersTimetableComponent {
  constructor(
    private TimetableService: TimetableService,
    private toastr: Toastr,
    private http: HttpClient,
    public CommonService: CommonService
  ) {}

  URLConstants = URLConstants;
  showLoading = false;
  pdfLoading = false;
  excelLoading = false;
  faculties:any = [];
  faculty:any = null;

  week_days:any = []
  timings:any = []
  timetable:any = []

  submit = false;

  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }

  ngOnInit() {
    this.getFaultyList();
  }

  getFaultyList(){
    this.TimetableService.getFacultyList().subscribe((resp:any) => {
      if(resp.status){
        this.faculties = resp.data
      }
    })
  }

  handleChange(){

  }

  getSubject(day: string, time: string): string {
    if (this.timetable[day] && this.timetable[day][time]) {
      
      return this.timetable[day][time].map((classData: any) => classData.subject.name).join(', ');
    }
    return '-';
  }

  show(){
    this.showLoading = true;
    this.submit = true;
    let data = {
      user_id: this.faculty,
    }
    if(this.faculty == null || this.faculty == ''){
      this.showLoading = false;
      return;
    }
    this.TimetableService.facultyTimetable(data).subscribe((resp:any) => {
      if(resp.status){
        this.week_days = resp.data.week_days;
        this.timings = resp.data.timings;
        this.timetable = resp.data.timetable;
      }else{
        this.toastr.showError(resp.message)
        this.week_days = []
        this.timings = []
        this.timetable = []
      }
      this.showLoading = false;
    }, (error:any) => {
      console.log(error);
      this.showLoading = false;      
    })
  }

  clearForm(){
    this.faculty = null;
    this.submit = false;
    this.week_days = []
    this.timings = []
    this.timetable = []
  }

  

  downloadTeachersTimetable(format:any){
    let data = {
      user_id: this.faculty,
    }

    this.submit = true;
    if(this.faculty == null || this.faculty == ''){
      return;
    }
    this.TimetableService.downloadFacultyTimetable(data, format).subscribe((response: any) => {
     let blob:Blob = response.body as Blob;
     if(format == 'pdf'){
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = window.URL.createObjectURL(blob);
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
     } else {
      let a = document.createElement('a');
      a.download = 'faculty-timetable';
      let pdfSrc = window.URL.createObjectURL(blob)
      a.href =  pdfSrc
      a.click();
      }
     
    }) 
  }

}
