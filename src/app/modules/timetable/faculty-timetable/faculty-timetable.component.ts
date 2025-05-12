import { Component } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { TimetableService } from '../timetable.service';
import { Toastr } from 'src/app/core/services/toastr';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-faculty-timetable',
  templateUrl: './faculty-timetable.component.html',
  styleUrls: ['./faculty-timetable.component.scss']
})
export class FacultyTimetableComponent {
  dtOptions: DataTables.Settings = {};
  datatableElement: DataTableDirective | null = null;
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
  slots:any = []

  submit = false;

  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }
  
  ngOnInit() {
      this.faculty = localStorage.getItem('user_id');
      this.show();
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
    this.TimetableService.facultyTimetable(data).subscribe((resp:any) => {
      if(resp.status){
        this.week_days = resp.data.week_days;
          this.timings = resp.data.timings;
          this.timetable = resp.data.timetable;
          this.slots = resp.data.slots
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
    },(error:any) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result as string);
          this.toastr.showError(json.message)
        } catch (parseError) {
          console.error("Failed to parse JSON from error blob:", parseError);
        }
      };
      reader.onerror = () => console.error("Error reading blob:", reader.error);
      
      if (error.error instanceof Blob) {
        reader.readAsText(error.error);  // Convert Blob to text
      } else {
        console.error("Unexpected error format:", error);
      }
    }) 
  }
  

}