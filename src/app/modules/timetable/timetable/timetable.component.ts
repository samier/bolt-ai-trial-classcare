import { Component, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { TimetableService } from '../timetable.service';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import moment from 'moment';
import { map } from 'rxjs';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.scss'],
})
export class TimetableComponent {
  constructor(
    private TimetableService: TimetableService,
    private toastr: Toastr,
    private modalService: NgbModal,
    public CommonService: CommonService
  ) {}

  URLConstants = URLConstants;
  subjectSelect = false;
  ClassNames: any = [];
  subjects: any = [];
  filteredSubjects: any = [];
  rooms: any = [];
  class_id: any = null;
  class_name: any = null;

  week_days:any = [];

  lecture: any = {
    start_date: null,
    end_date: null,
  };

  batches: any = [];
  batch_id: any = null;

  lecture_timing: any = [];
  lectures: any = [];
  generate = false;
  clearAllLecture = false;
  clearLectureCheck = true;

  priority: any = {};
  subjectCount: any = [];
  allLectures:any = [];
  priorityLectures = [{id: null, lecture_name : 'Select Lecture'}];

  isPdfLoading = false;
  isExcelLoading = false;

  subject_faculties:any = [];

  lecturesCount:any = [];

  autoLoading=false;

  timetable_setting:any = [];
  subject_one_day_one_time = false;

  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }

  ngOnInit() {
    // this.show();
    this.getClassList();
    this.getTimetableSetting().subscribe(); // Subscribe to complete the observable
  }

  getClassList() {
    this.TimetableService.getClassList().subscribe((resp: any) => {
      this.ClassNames = resp.data;
    });
  }

  cleatPriority() {
    this.lecturesCount.forEach((element:any) => {
      element.subject_priority_1 = null
      element.subject_priority_2 = null
      element.subject_priority_3 = null
    });
  }

  handleClassChange() {
    this.batch_id = null
    this.lecture_timing = [];
    this.week_days = [];
    this.lecturesCount = [];
    this.TimetableService.getBatches({classes_id : this.class_id}).subscribe((resp: any) => {
      this.batches = resp.data
    });
  }

  handleBatchChange(){
    this.lecture_timing = [];
    this.week_days = [];
    this.lecturesCount = [];
    this.class_name = this.batches.find(
      (x: any) => x.id === this.batch_id
    )?.name;
  }

  show() {
    this.generate = true;
    if(this.class_id == null || this.batch_id == null){
      // this.generate = false;
      return 
    }
    let data = {
      'class_id' :  this.class_id,
      'batch_id' : this.batch_id,
    };
    this.TimetableService.getTimeTable(data).subscribe((resp:any) => {
      if(resp.status){
        this.subjects = resp.data.subjects
        this.rooms = resp.data.rooms.map((el: any) => {
          return { id: el.id, name: el.room.name };
        });
        this.week_days = resp.data.week_days
        this.lecture_timing = resp.data.lecture_timings
        this.getSubjectCount()
      }else{
        this.toastr.showError(resp.message)
      }
      this.generate = false;
    })
  }

  handleSubjectChange(subject_id: any, i: any, j: any, optional:any) {
    let status = this.getSubjectCount(i, j, subject_id);
    if(status){
      let lecture = this.lecture_timing[i].timings[j];
      lecture.user_id = null
      lecture.lecturers = []
      const data = {
        class_id: this.class_id,
        subject_id: subject_id,
        batch_id: this.batch_id,
        lecture_time_id: lecture.id,
        week_day: lecture.week_day,
      };
     this.TimetableService.getSubjectFaculties(data).subscribe((resp:any) => {
        this.lecture_timing.filter((lac: any) =>
          lac.timings.filter((sub: any) => (delete(sub.available)))
        );
        if(resp.status){
          if(resp.message == 'available'){
              lecture.lecturers = resp.data
              if(resp.data.length == 1){
                lecture.user_id = resp.data[0].id
              }
              if(this.rooms.length == 1){
                lecture.room_id = this.rooms[0].id
                this.handleRoomChange(i,j)
              }
              let subject = this.subjects.find((el:any) => el.id == subject_id)
              if(subject.group_id){
                let subjects = this.subjects.filter((el:any) => {
                  return el.group_id == subject.group_id && el.id != subject_id
                })

                let array:any = []
                subjects.forEach((subject:any) => { 
                  array.push({subject_id: null, user_id: null, room_id: null, lecturers: [], subjects: [subject]});
                });
                lecture.optional = array
              }else{
                delete(lecture.optional)
              }
              delete(lecture.lecture_not_set)
          }
          else{
            this.toastr.showError(resp.message)
            delete(lecture.subject_id);
            delete(lecture.room_id);
            delete(lecture.user_id);
            delete(lecture.lecturers);
            this.manageTimeTable(resp, i, j)
            this.getSubjectCount(i, j, lecture.subject_id);
          }
        }
        else{
          this.toastr.showError(resp.message)
          delete(lecture.subject_id)
        }
     })
    }
  }

  handleOptionalSubjectChange(i:any, j:any, optional:any){
    let status = this.getSubjectCount(i, j, optional.subject_id);
    let lecture = this.lecture_timing[i].timings[j];
    if(status){
      optional.user_id = null
      optional.lecturers = []
      const data = {
        class_id: this.class_id,
        subject_id: optional.subject_id,
        batch_id: this.batch_id,
        lecture_time_id: lecture.id,
        week_day: lecture.week_day,
      };
     this.TimetableService.getSubjectFaculties(data).subscribe((resp:any) => {
        this.lecture_timing.filter((lac: any) =>
          lac.timings.filter((sub: any) => (delete(sub.available)))
        );
        if(resp.status){
          if(resp.message == 'available'){
            optional.lecturers = resp.data
              if(resp.data.length == 1){
                optional.user_id = resp.data[0].id
              }
              delete(lecture.lecture_not_set)

          }
          else{
            this.toastr.showError(resp.message)
            optional.subject_id = null;
            optional.room_id = null;
            optional.user_id = null;
            optional.lecturers = [];
            this.manageTimeTable(resp, i, j)
            this.getSubjectCount(i, j, optional.subject_id);
          }
        }
        else{
          this.toastr.showError(resp.message)
          optional.subject_id = null
        }
     })
    }else{
      lecture.user_id = null
      lecture.room_id = null
      lecture.lecturers = []
      delete(lecture.optional)
    }
  }


  handleLecturerChange(i: any, j: any) {
    let lecture = this.lecture_timing[i].timings[j];
    const data = {
      class_id: this.class_id,
      batch_id: this.batch_id,
      subject_id: lecture.subject_id,
      lecture_time_id: lecture.id,
      week_day: lecture.week_day,
      user_id: lecture.user_id
    };
    this.TimetableService.getFacultyAvailability(data).subscribe((resp:any)=>{
      if(resp.status){
        if (resp.message == 'available'){
          this.lecture_timing.filter((lac: any) =>
            lac.timings.filter((sub: any) => (delete(sub.available)))
          );
          delete(lecture.lecture_not_set)
        } else{
          this.toastr.showError(resp.message)
          delete(lecture.user_id);
          this.manageTimeTable(resp, i, j)
          this.getSubjectCount(i, j, lecture.subject_id);
        }

      }else{
        this.toastr.showError(resp.message)
      }
    })
  }

  handleOptionalLecturerChange(i: any, j: any, optional:any){
    let lecture = this.lecture_timing[i].timings[j];
    if(optional.user_id == lecture.user_id){
      this.toastr.showError(
        'Can not assign same faculty for optional subject.'
      );
      setTimeout(() => {
        optional.user_id = null
      }, 10);
    }
    const data = {
      class_id: this.class_id,
      batch_id: this.batch_id,
      subject_id: optional.subject_id,
      lecture_time_id: lecture.id,
      week_day: lecture.week_day,
      user_id: optional.user_id
    };
    this.TimetableService.getFacultyAvailability(data).subscribe((resp:any)=>{
      if(resp.status){
        if(resp.message == 'available'){
          this.lecture_timing.filter((lac: any) =>
            lac.timings.filter((sub: any) => (delete(sub.available)))
          );
          delete(lecture.lecture_not_set)
        }
        else{
          this.toastr.showError(resp.message)
          optional.user_id = null;
          this.manageTimeTable(resp, i, j)
          this.getSubjectCount(i, j, optional.subject_id);
        } 

      }else{
        this.toastr.showError(resp.message)
      }
    })
  }

  manageTimeTable(resp: any, i?: any, j?: any) {
    this.lecture_timing.filter((lac: any) =>
      lac.timings.filter((sub: any) => (sub.available = false))
    );
    

    resp.data.forEach((x:any) => {
        let subject = this.lecture_timing.find((el:any) => el.day == x.week_day)
        subject = subject.timings.find((lec:any) => lec.id == x.id);
        
        if (subject) {
          subject.available = true;
        }
    })
  }

  handleRoomChange(i: any, j: any) {
    let lecture = this.lecture_timing[i].timings[j];
    const data = {
      class_id: this.class_id,
      batch_id: this.batch_id,
      subject_id: lecture.subject_id,
      lecture_time_id: lecture.id,
      week_day: lecture.week_day,
      room_id: lecture.room_id
    };
    this.TimetableService.getRoomAvailability(data).subscribe((resp:any) => {
      if(resp.status){
        if(resp.message == 'not_available'){
          lecture.room_id = null
          let rec = resp.data.find((el:any) => el.week_day == lecture.week_day && el.lecture_timing_id == lecture.id);
          this.toastr.showError(
            'This room is already assigned in s'+rec.class.name+' class '+rec.batch.name+' batch.'
          );
        }
      }else{
        this.toastr.showError(resp.message)
      }
    })
  }

  handleOptionalRoomChange(i: any, j: any, optional:any){
    let lecture = this.lecture_timing[i].timings[j];
    if(optional.room_id == lecture.room_id){
      this.toastr.showError(
        'Can not assign same room for optional subject.'
      );
      setTimeout(() => {
        optional.room_id = null
      }, 10);
    }
    
    const data = {
      class_id: this.class_id,
      batch_id: this.batch_id,
      subject_id: optional.subject_id,
      lecture_time_id: lecture.id,
      week_day: lecture.week_day,
      room_id: optional.room_id
    };
    this.TimetableService.getRoomAvailability(data).subscribe((resp:any) => {
      if(resp.status){
        if(resp.message == 'not_available'){
          optional.room_id = null
          this.toastr.showError(
            'This room is already assigned in some other class or batch.'
          );
        }
      }else{
        this.toastr.showError(resp.message)
      }
    })
  }

  save(i: any, j: any) {
    let lecture = this.lecture_timing[i].timings[j];
    lecture.save = true;
    if(lecture.subject_id != null && lecture.user_id != null && lecture.room_id != null){
      if(!this.getOptionalStatus(lecture)){
        delete(lecture.save)
        let data = {
          class_id: this.class_id,
          batch_id: this.batch_id,
          subject_id: lecture.subject_id,
          user_id: lecture.user_id,
          room_id: lecture.room_id,
          lecture_timing_id: lecture.id,
          week_day: lecture.week_day,
          optional: lecture?.optional && lecture?.optional.length > 0 ? lecture.optional : null
        }

        this.TimetableService.saveTimeTableLecture(data).subscribe((resp:any) =>{
          if(resp.status){
            this.toastr.showSuccess(resp.message)
          }else{
            this.toastr.showError(resp.message)
          }
        })
      }else{
        this.toastr.showError('Please select optional subject as well.')
      }
    }
  }

  getOptionalStatus(lecture:any){
    if(lecture?.optional && lecture?.optional.length > 0){
      return lecture?.optional.some((el:any) => el.subject_id == null || el.user_id == null || el.room_id == null)
    }else{
      return false
    }
    
  }

  saveAllLectures(){
    let data = {
      class_id: this.class_id,
      batch_id: this.batch_id,
      lectures: this.lecture_timing
    }

    this.TimetableService.saveAllTimeTableLecture(data).subscribe((resp:any) => {
      if(resp.status){
        this.toastr.showSuccess(resp.message)
      }else{
        this.toastr.showError(resp.message)
      }
    })
  }

  open(content: any) {
    if(this.class_id == null || this.class_id == ""){
      return this.toastr.showError('Please select class');
    }
    if(this.batch_id == null || this.batch_id == ""){
      return this.toastr.showError('Please select batch');
    }
    let data = {
      class_id : this.class_id,
      batch_id: this.batch_id,
    }
    this.TimetableService.getLectures(data).subscribe((resp:any) =>{
      if(resp.status){
        this.lecturesCount = this.lecturesCount.length > 0  ? this.lecturesCount : resp.data.lectures;
        this.subjects = resp.data.subjects
        this.modalService
        .open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl', centered:true })
        .result.then((result) => {
          if (result == 'save') {
            this.TimetableService.saveLecture(data).subscribe((resp: any) => {
              if (resp.status) {
                this.toastr.showSuccess(resp.message);
              } else {
                this.toastr.showError(resp.message);
              }
              this.lecture.start_date = null;
              this.lecture.end_date = null;
            });
          }
        });
      }
    })
    
  }

  timeFormat(time:any){
    return moment(time, "HH:mm:ss").format("hh:mm A");
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

  download(format: any) {
    if (this.class_id) {
      if(format == 'pdf'){
        this.isPdfLoading = true;
      }
      if(format == 'excel'){
        this.isExcelLoading = true;
      }
      const data = {
        class_id: this.class_id,
        batch_id: this.batch_id,
      };
      this.TimetableService.download(data, format).subscribe(
        (resp: any) => {
          this.downloadFile(resp, 'class-timetable', format);
          this.isPdfLoading = false;
          this.isExcelLoading = false;
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
      
          this.isPdfLoading = false;
          this.isExcelLoading = false;
        }
      );
    } else {
      this.generate = true;
    }
  }

  clear() {
    this.class_id = null;
    this.batch_id = null;
    this.subjects = []
    this.rooms = []
    this.week_days = []
    this.lecture_timing = []
    this.subjectSelect = false;
    this.generate = false;
    this.lecturesCount = [];
  }

  clearLecture(i: any, j: any) {
    const data = this.lecture_timing[i].timings[j];
    data.lecture_timing_id = data.id;
    data.class_id = this.class_id;
    data.batch_id = this.batch_id;
    delete(data.save)
    if (data.subject_id || data.user_id || data.room_id) {
      this.TimetableService.deleteTimeTableLecture(data).subscribe((resp: any) => {
        if (resp.status) {
          this.toastr.showSuccess(resp.message);
          data.lecturers = [];
          data.subject_id = null;
          data.user_id = null;
          data.room_id = null;
          data.subjects = [];
          if(data?.optional && data?.optional.length > 0){
            delete(data.optional)
          }
          this.lecture_timing.filter((lac: any) =>
            lac.timings.filter((sub: any) => (delete(sub.available)))
          );
          this.getSubjectCount();
        } else {
          this.toastr.showError(resp.status);
        }
      });
    }
  }

  getTime(item: any) {
    const time =
      item.substring(0, 2) <= 12
        ? item.substring(0, 5)
        : item.substring(0, 2) - 12 + item.substring(2, 5);

    const ampm = item.substring(0, 2) < 12 ? 'AM' : 'PM';

    return time + ' ' + ampm;
  }

  autoGenerate() {
    if(this.class_id == null || this.class_id == ""){
      return this.toastr.showError('Please select class');
    }
    if(this.batch_id == null || this.batch_id == ""){
      return this.toastr.showError('Please select batch');
    }
    let data = {
      class_id : this.class_id,
      batch_id: this.batch_id,
      priority: this.lecturesCount
    }
    this.autoLoading = true;
    this.TimetableService.timetableAutoGenerate(data).subscribe((resp:any) => {
      if(resp.status){
        this.subjects = resp.data.subjects
        this.rooms = resp.data.rooms.map((el: any) => {
          return { id: el.id, name: el.room.name };
        });
        this.week_days = resp.data.week_days
        this.lecture_timing = resp.data.lecture_timings
        if(resp.data.rest_time_table.length > 0){
          this.toastr.showInfo('Some of the lecture failed to generate!', 'INFO')
          resp.data.rest_time_table.forEach((x:any) => {
            let lecture = this.lecture_timing.find((el:any) => el.day == x.week_day)
              lecture = lecture.timings.find((lec:any) => lec.id == x.id);
              
              if (lecture) {
                lecture.lecture_not_set = true;
              }
          })
        }
        this.getSubjectCount();
        
      }else{
        this.toastr.showError(resp.message)
      }
      this.autoLoading = false;
      this.generate = false;
    },(error:any) => {
      this.autoLoading = false;
    })
  }


  clearAllLectures(){
    let data = {
      class_id : this.class_id,
      batch_id: this.batch_id,
    }

    this.TimetableService.deleteAllTimeTableLecture(data).subscribe((resp:any) => {
      if(resp.status){
        this.toastr.showSuccess(resp.message)
        this.show();
      }else{
        this.toastr.showError(resp.message)
      }
    })
  }

  getSubjectCount(i?: any, j?: any, subject_id?: any) {
    let status = true;
    const subjectCount: any = {};
    
    this.lecture_timing.forEach((lecture: any) => {
      lecture.timings.forEach((subject: any) => {
        const subjectId = subject?.subject_id;
        if (subjectId !== null && subjectCount.hasOwnProperty(subjectId)) {
          subjectCount[subjectId]++;
        } else {
          subjectCount[subjectId] = 1;
        }

        if(subject?.optional && subject?.optional.length > 0){
          subject?.optional.forEach((optional: any) => {
            const subject_id = optional?.subject_id;
            if (subject_id !== null && subjectCount.hasOwnProperty(subject_id)) {
              subjectCount[subject_id]++;
            } else {
              subjectCount[subject_id] = 1;
            }
          });
        }
      });
    });
    this.subjectCount = subjectCount;

    if(subject_id){
      let lectureCount = this.subjects.find((x: any) => x.id == subject_id);
  
      if(this.subjectCount[subject_id] > lectureCount.subject_lectures.total_lecture){
        status = false;
        this.toastr.showError(
          'You can not assign more then ' +
          lectureCount.subject_lectures.total_lecture +
            ' lecture for ' +
            lectureCount.name
        );
        subjectCount[subject_id]--;
        setTimeout(() => {
            this.lecture_timing[i].timings[j].subject_id = null
        }, 20);
      }
    }
    this.filteredSubjects = this.subjects.filter((subject: any) => {
      const subjectLectureCount = subject.subject_lectures.total_lecture;
      const actualLectureCount = this.subjectCount[subject.id] || 0;
      return actualLectureCount != subjectLectureCount;
    });

    let selectedSubjects = this.subjects.find((el:any) => el.id == subject_id)
    let filteredSubjects:any = []
    this.lecture_timing = this.lecture_timing.map((el:any) => {
      if(this.subject_one_day_one_time){
        const selectedSubjectIds = el.timings
          .filter((timing: any) => timing.subject_id)
          .map((timing: any) => timing.subject_id);
        
          
        filteredSubjects = this.filteredSubjects.filter(
          (subject: any) => !selectedSubjectIds.includes(subject.id)
        );
      }else{
        filteredSubjects = this.filteredSubjects
      }
      return {...el, timings: el.timings.map((lec:any) => {
        return {
          ...lec,
          new_subjects: [...lec.subjects, ...filteredSubjects].filter((subject, index, self) =>
            index === self.findIndex((s) => s.id === subject.id)
          )
        }
        })
      }
    })
    if(selectedSubjects){
      this.lecture_timing[i].timings[j].subjects = [selectedSubjects]
      this.lecture_timing[i].timings[j].new_subjects = [...this.lecture_timing[i].timings[j].new_subjects, ...filteredSubjects, ...[selectedSubjects]].filter((subject, index, self) =>
        index === self.findIndex((s) => s.id === subject.id)
      )
    }else{
        if(i != undefined && j != undefined){
          this.lecture_timing[i].timings[j].subjects = []
          this.lecture_timing[i].timings[j].new_subjects = [...this.lecture_timing[i].timings[j].new_subjects, ...filteredSubjects].filter((subject, index, self) =>
            index === self.findIndex((s) => s.id === subject.id)
          )
        }
    }
    return status
  }

  openModal(content: any) {
  }

  getBackgroundColor(subject_id:any){
    if(subject_id){
      let subject = this.subjects.find((el:any) => el.id == subject_id);
      if(subject){
        return subject.color == '#000000' ? '' : subject.color
      }else{
        return '';
      }
    }else{
      return '';
    }
  }

  openSetting(content: any) {
    this.getTimetableSetting().subscribe((resp:any) => {
      if(resp){
        this.modalService
        .open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl', centered:true })
        .result.then((result) => {
          this.getSubjectCount()
        });
      }
    })
  }

  getTimetableSetting(){
    return this.TimetableService.getTimetableSettings().pipe(
      map((resp: any) => {
        if (resp.status) {
          this.timetable_setting = Object.entries(resp.data.value).map(([key, value]) => ({
            key,
            value,
          }));
          this.subject_one_day_one_time = this.timetable_setting.find((el:any) => el.key == 'subject_one_day_one_time')?.value
          return true;
        }
        return false;
      })
    );
  }

  saveSetting(){
    let data = {
      settings : this.timetable_setting.map(setting => {
        if(setting.key === 'subject_one_day_one_time') {
          return {...setting, value: this.subject_one_day_one_time};
        }
        return setting;
      })
    }

    this.TimetableService.saveTimetableSettings(data).subscribe((resp:any) => {
      if(resp.status == true){
        this.toastr.showSuccess(resp.message)
        this.modalService.dismissAll();
      }else{
        this.toastr.showError(resp.message)
      }
    })
  }

  replaceString(value:any){
    if (typeof value !== 'string') {
      return value; // Return the value as-is if it's not a string
    }
    return value
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
  }
}
