import { Component } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { TimetableService } from '../timetable.service';
import { Toastr } from 'src/app/core/services/toastr';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-download-timetable',
  templateUrl: './download-timetable.component.html',
  styleUrls: ['./download-timetable.component.scss']
})
export class downloadTimetableComponent {
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
  slots:any = [];

  type:any = 'student';
  ClassNames: any = [];
  class_id:any = null;
  batches: any = [];
  batch_id: any = null;

  lecture_timing: any = [];

  submit = false;

  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }

  ngOnInit() {
    if(this.type == 'student'){
      this.getClassList();
    }else{
      this.getFaultyList();
    }
  }

  handleTypeChange(type:any){
    this.faculty = null;
    this.submit = false;
    this.week_days = []
    this.timings = []
    this.timetable = []

    this.lecture_timing = [];
    this.class_id = null
    this.batch_id = null

    this.type = type;
    if(type == 'faculty'){
      this.getFaultyList();
    }else{
      this.getClassList();
    }
  }

  getClassList() {
    this.TimetableService.getClassList().subscribe((resp: any) => {
      this.ClassNames = resp.data;
    });
  }

  handleClassChange() {
    this.batch_id = null
    this.lecture_timing = [];
    this.week_days = [];
    this.TimetableService.getBatches({classes_id : this.class_id}).subscribe((resp: any) => {
      this.batches = resp.data
    });
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
    if(this.type == 'faculty'){
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
          this.slots = resp.data.slots
        }else{
          this.toastr.showError(resp.message)
          this.week_days = []
          this.timings = []
          this.timetable = []
          this.slots = []
        }
        this.showLoading = false;
      }, (error:any) => {
        console.log(error);
        this.week_days = []
          this.timings = []
          this.timetable = []
          this.slots = []
        this.toastr.showError(error.error.message)
        this.showLoading = false;         
      })
    }

    if(this.type == 'student'){
      if(this.class_id == null || this.batch_id == null){
        this.showLoading = false;
        return;
      }
      let data = {
        class_id: this.class_id,
        batch_id: this.batch_id,
        download: true
      }

      this.TimetableService.downloadStudent(data).subscribe((resp:any) => {
        if(resp.status){
          this.week_days = resp.data.week_days
          this.lecture_timing = resp.data.timetable
        }else{
          this.toastr.showError(resp.message)
        }
        this.showLoading = false;
      }, (error:any) => {
        console.log(error);
        this.toastr.showError(error.error.message)
        this.showLoading = false;      
      })
      
    }
    this.submit = false;
  }

  clearForm(){
    this.faculty = null;
    this.submit = false;
    this.week_days = []
    this.timings = []
    this.timetable = []
    this.slots = []
    
    this.type = 'student'
    this.lecture_timing = [];
    this.class_id = null
    this.batch_id = null
  }

  

  downloadTeachersTimetable(format:any){
   

    this.submit = true;
    if(this.type == 'faculty'){
      let data = {
        user_id: this.faculty,
      }
      if(this.faculty == null || this.faculty == ''){
        return;
      }
      this.TimetableService.downloadFacultyTimetable(data, format).subscribe((response: any) => {
        this.downloadFile(response, 'teachers-timetable', format)
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

    if(this.type == 'student'){
      if(this.class_id == null || this.batch_id == null){
        return;
      }
      const data = {
        class_id: this.class_id,
        batch_id: this.batch_id,
        download: true

      };
      this.TimetableService.download(data, format).subscribe(
        (resp: any) => {
          this.downloadFile(resp, 'class-timetable', format);
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
        }
      );
    }
  }


  downloadFile(res: any,file: any, format:any) {
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if(format == 'pdf'){
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
    }else{
      let a = document.createElement('a');
      a.download = fileName;
      a.href =  pdfSrc
      a.click();
    }
  }

  optionalSubjects(timetable:any){
    if(timetable.optional){
      let subject = '';
      timetable.optional.forEach((element:any) => {
        subject += '/ '+element.subject.name
      });
      return subject;
    }else{
      return  
    }
  }

  optionalFaculty(timetable:any){
    if(timetable.optional){
      let faculty = '';
      timetable.optional.forEach((element:any) => {
        faculty += '/ '+element.user.full_name
      });
      return faculty;
    }else{
      return  
    }
  }

  optionalRoom(timetable:any){
    if(timetable.optional){
      let room = '';
      timetable.optional.forEach((element:any) => {
        room += '/ '+element.room.room.name
      });
      return room;
    }else{
      return  
    }
  }

}
