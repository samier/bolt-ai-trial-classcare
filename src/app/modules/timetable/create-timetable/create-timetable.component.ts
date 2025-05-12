import { Component, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { TimetableService } from '../timetable.service';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-create-timetable',
  templateUrl: './create-timetable.component.html',
  styleUrls: ['./create-timetable.component.scss'],
})
export class CreateTimetableComponent {
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
  rooms: any = [];
  class_id: any = null;
  class_name: any = null;

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

  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }

  ngOnInit() {
    this.getClassList();
  }

  getClassList() {
    this.TimetableService.getClassList().subscribe((resp: any) => {
      this.ClassNames = resp.data;
    });
  }

  setPriority() {
    this.subjects.forEach((element: any, key: any) => {
      return (this.priority[element.id] = { p1: null, p2: null, p3: null });
    });
  }

  handleClassChange() {
    this.class_name = this.ClassNames.find(
      (x: any) => x.id === this.class_id
    )?.name;

    this.TimetableService.getLecturesByClass(this.class_id).subscribe(
      (resp: any) => {
        if (resp.status) {
          this.lecture_timing = resp.data.lectureTimings;
          this.lectures = resp.data.lectureTimings.filter(
            (x: any) => x.is_break == false
          );
          this.lecture_timing.forEach((x: any) => {
            x.subjects = [];
            x.weeks.forEach((week: any, i: any) => {
              // if (week.status == true) {
                x.subjects.push({
                  week_day: i + 1,
                  subject_id: null,
                  user_id: null,
                  room_id: null,
                  lecturers: [],
                  available: false,
                  save: false,
                  status: week.status,
                });
              // }
            });
          });
          this.subjects = resp.data.subjects;
          this.batches = resp.data.batches;
          this.setPriority();
          this.batch_id = null;
        } else {
          this.toastr.showError(resp.message);
          this.lecture_timing = [];
          this.class_id = null;
        }
      }
    );
  }

  handleSubjectChange(subject_id: any, i: any, j: any, auto?: any) {
    // if (this.getSubjectCount(i, j, subject_id) == false) {
    //   return false;
    // }
    return new Promise((resolve) => {
      this.subjectSelect = true;
      if (this.batch_id) {
        const params = {
          class_id: this.class_id,
          subject_id: subject_id,
          batch_id: this.batch_id,
          week_day: this.lecture_timing[i].subjects[j].week_day,
          lecture_id: this.lecture_timing[i].id,
        };

        this.TimetableService.getLecturers(params).subscribe((resp: any) => {
          this.lecture_timing.filter((lec: any) =>
            lec.subjects.filter((sub: any) => (sub.available = false))
          );
          let flag = false;
          if (resp.status) {
            if (resp.message == 'faculty') {
              this.lecture_timing[i].subjects[j].user_id = null;
              this.lecture_timing[i].subjects[j].lecturers = resp.data;
              if (resp.data?.length == 1) {
                this.lecture_timing[i].subjects[j].user_id = resp.data[0].id;
                resolve(true);
              }
              resolve(true);
            } else if (resp.message == 'availability') {
              this.toastr.showError('Lecturer is not available');
              this.lecture_timing[i].subjects[j].subject_id = null;
              this.lecture_timing[i].subjects[j].lecturers = [];
              this.lecture_timing[i].subjects[j].user_id = null;
              this.manageTimeTable(resp, i, j);
              this.getSubjectCount()
              resolve(false);
            }
          } else {
            this.toastr.showError(resp.message);
            this.lecture_timing[i].subjects[j].lecturers = [];
            resolve(false);
          }
        });
      } else {
        this.lecture_timing[i].subjects[j].subject_id = null;
        resolve(false);
      }
    });
  }

  async handleBatchChange() {
    this.clearAllLecture = false;
    this.generate = false;
    const data = {
      class_id: this.class_id,
      batch_id: this.batch_id,
    };

    this.TimetableService.getTimetable(data).subscribe((resp: any) => {
      this.lecture_timing.forEach((x: any) => {
        x.subjects = [];
        x.weeks.forEach((week: any, i: any) => {
          // if (week.status == true) {
            x.subjects.push({
              week_day: i + 1,
              subject_id: null,
              user_id: null,
              room_id: null,
              lecturers: [],
              available: false,
              save: false,
              status: week.status,
            });
          // }
        });
      });
      if (resp.data.rooms?.length > 0) {
        this.rooms = resp.data.rooms.map((el: any) => {
          return { id: el.id, name: el.room.name };
        });
      }
      if (resp.data.timetable?.length > 0) {
        this.clearAllLecture = true;
        resp.data.timetable.forEach((el: any) => {
          this.lecture_timing.filter((x: any, i: any) => {
            if (el.lecture_timing_id == x.id) {
              let index = x.subjects.findIndex(
                (item: any) => item.week_day == el.week_day
              );
              x.subjects[index].lecturers = el.lecturers;
              x.subjects[index].user_id = el.user_id;
              x.subjects[index].subject_id = el.subject_id;
              x.subjects[index].room_id = el.room_id;
            }
          });
        });
      }
      this.getSubjectCount();
      this.setPriority();
    });
  }

  handleLecturerChange(i: any, j: any) {
    const params = {
      class_id: this.class_id,
      batch_id: this.batch_id,
      lecture_id: this.lecture_timing[i].id,
      ...this.lecture_timing[i].subjects[j],
    };
    this.TimetableService.handleLecturerChange(params).subscribe(
      (resp: any) => {
        if (resp.status) {
          if (resp.message == 'availability') {
            this.toastr.showError('Lecturer is not available');
            this.lecture_timing[i].subjects[j].user_id = null;
            this.manageTimeTable(resp, i, j);
          } else {
            this.lecture_timing.filter((lec: any) =>
              lec.subjects.filter((sub: any) => (sub.available = false))
            );
          }
        }
      }
    );
  }

  handleRoomChange(i: any, j: any) {
    const params = {
      class_id: this.class_id,
      batch_id: this.batch_id,
      lecture_id: this.lecture_timing[i].id,
      ...this.lecture_timing[i].subjects[j],
    };
    this.TimetableService.handleRoomChange(params).subscribe((resp: any) => {
      if (resp.status) {
        if (resp.data > 0) {
          this.toastr.showError(
            'This room is already assigned in some other class or batch.'
          );
          this.lecture_timing[i].subjects[j].room_id = null;
        }
      } else {
        this.toastr.showError(resp.message);
      }
    });
  }

  manageTimeTable(resp: any, i: any, j: any) {
    this.lecture_timing.filter((lac: any) =>
      lac.subjects.filter((sub: any) => (sub.available = true))
    );
    resp.data.forEach((x: any) => {
      const subject = this.lecture_timing
        .find((lec: any) => lec.id === x.lecture_timing_id)
        ?.subjects.find((sub: any) => sub.week_day == x.week_day);
      if (subject) {
        subject.available = false;
      }
    });
  }

  save(i: any, j: any) {
    this.lecture_timing[i].subjects[j].save = true;
    const data = this.lecture_timing[i].subjects[j];
    data.lecture_timing_id = this.lecture_timing[i].id;
    data.class_id = this.class_id;
    data.batch_id = this.batch_id;
    // delete data.lecturers;
    // delete data.available;
    if (Object.values(data).every((value) => value !== null)) {
      delete data.save;
      this.TimetableService.storeTimetable(data).subscribe((resp: any) => {
        if (resp.status) {
          this.getSubjectCount()
          this.toastr.showSuccess(resp.message);
        } else {
          this.toastr.showError(resp.message);
          this.lecture_timing[i].subjects[j].lecturers = [];
          this.lecture_timing[i].subjects[j].subject_id = null;
          this.lecture_timing[i].subjects[j].user_id = null;
          this.lecture_timing[i].subjects[j].room_id = null;
          this.handleBatchChange()
        }
      });
    }
  }

  open(content: any) {
    if (this.batch_id == null) {
      return this.toastr.showError('Please select class and batch');
    }
    let data: any = {
      class_id: this.class_id,
      batch_id: this.batch_id,
    };
    this.TimetableService.getLecture(data).subscribe((resp: any) => {
      if (resp.status) {
        this.lecture.start_date = resp.data.start_date;
        this.lecture.end_date = resp.data.end_date;
      }
    });
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title',  size: 'xl' ,centered:true })
      .result.then((result) => {
        if (result == 'save') {
          (data.start_date = this.lecture.start_date),
            (data.end_date = this.lecture.end_date);

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
      const data = {
        class_id: this.class_id,
        batch_id: this.batch_id,
      };
      this.TimetableService.downloadTimetable(data, format).subscribe(
        (resp: any) => {
          this.downloadFile(resp, 'class-timetable', format);
        }
      );
    } else {
      this.generate = true;
    }
  }

  clear() {
    this.handleBatchChange();
    this.subjectSelect = false;
    this.generate = false;
  }

  clearLecture(i: any, j: any) {
    const data = this.lecture_timing[i].subjects[j];
    data.lecture_timing_id = this.lecture_timing[i].id;
    data.class_id = this.class_id;
    data.batch_id = this.batch_id;
    if (data.subject_id || data.user_id || data.room_id) {
      this.TimetableService.clearLecture(data).subscribe((resp: any) => {
        if (resp.status) {
          this.toastr.showSuccess(resp.message);
          this.lecture_timing[i].subjects[j].lecturers = [];
          this.lecture_timing[i].subjects[j].subject_id = null;
          this.lecture_timing[i].subjects[j].user_id = null;
          this.lecture_timing[i].subjects[j].room_id = null;
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
    let result = true;
    if(this.clearAllLecture && this.clearLectureCheck){
      result = confirm('By auto generating timetable, current timetable data will loose. Are you sure you want to continue?')
    }
    if(result == true){
      this.subjectSelect = true;
      this.clearAllLecture = true;
      let subject: any = {};
      for (let i = 1; i < 4; i++) {
        for (const key in this.priority) {
          const innerObj = this.priority[key];
          const value = innerObj['p' + i];
          if (value !== null) {
            if (!subject[value]) {
              subject[value] = [];
            }
            subject[value].push(parseInt(key));
          }
        }
      }
      if (this.class_id && this.batch_id) {
        let data = {
          class_id: this.class_id,
          batch_id: this.batch_id,
          clear_check: this.clearLectureCheck,
          priority: subject,
        };
        this.TimetableService.autoGenerateTimetable(data).subscribe(
          (resp: any) => {
            if (resp.status) {
              this.generate = true;
              this.allLectures = resp.data
              resp.data.forEach((el: any) => {
                this.lecture_timing.filter((x: any, i: any) => {
                  if (el.lecture_timing_id == x.id) {
                    let index = x.subjects.findIndex(
                      (item: any) => item.week_day == el.week_day
                    );
                    x.subjects[index].lecturers = el.lecturers;
                    x.subjects[index].user_id = el.user_id;
                    x.subjects[index].subject_id = el.subject_id;
                    x.subjects[index].room_id = el.room_id;
                  }
                });
              });
              this.getSubjectCount();
              this.setPriority();
            } else {
              this.toastr.showError(resp.message);
            }
          }
        );
      }
    }
  }

  saveAllLectures(){
    let data  = {
      class_id : this.class_id,
      batch_id : this.batch_id,
      lectures : this.allLectures
    } 
    this.TimetableService.saveAllLecture(data).subscribe((resp:any) => {
      if(resp.status){
        this.generate = false;
        this.toastr.showSuccess(resp.message);
      }
      else{
        this.toastr.showError(resp.message);
      }
    })
  }

  clearAllLectures(){
    let result = confirm('Are you sure you want to clear all lectures from current timetable?')
    if(result == true){
      let data = {
        class_id: this.class_id,
        batch_id: this.batch_id,
      }; 
      this.TimetableService.clearAllLecture(data).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message);
          this.handleBatchChange();
        }
        else{
          this.toastr.showError(resp.message);
        }
      })
    }
  }

  getSubjectCount(i?: any, j?: any, subject_id?: any) {
    const subjectCount: any = {};
    this.lecture_timing.forEach((lecture: any) => {
      lecture.subjects.forEach((subject: any) => {
        const subjectId = subject.subject_id;
        if (subjectId !== null && subjectCount.hasOwnProperty(subjectId)) {
          subjectCount[subjectId]++;
        } else {
          subjectCount[subjectId] = 1;
        }
      });
    });
    this.subjectCount = subjectCount;
    if ((i || i == 0) && (j || j == 0)) {
      let lectureCount = this.subjects.find((x: any) => x.id == subject_id);
      if (
        parseInt(this.subjectCount[subject_id]) >
        parseInt(lectureCount.no_of_lecture)
      ) {
        this.toastr.showError(
          'You can not assign more then ' +
            lectureCount.no_of_lecture +
            ' lecture for ' +
            lectureCount.name
        );
        this.handleBatchChange();
        return false;
      } else {
        return true;
      }
    }
    return true;
  }

  openModal(content: any) {
    this.priorityLectures = this.priorityLectures.concat(this.lectures)
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg', centered:true })
      .result.then((result) => {
        if (result == 'cancel') {
          this.setPriority();
        }
      });
  }
}
