import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TimetableService } from '../timetable.service';
import { Toastr } from 'src/app/core/services/toastr';
import moment from 'moment';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-add-extra-lecture',
  templateUrl: './add-extra-lecture.component.html',
  styleUrls: ['./add-extra-lecture.component.scss']
})
export class AddExtraLectureComponent implements OnInit, OnDestroy {
  //#region Public | Private Variables
  AddExtraLecture: FormGroup;
  URLConstants = URLConstants;
  private $destroy: Subject<void> = new Subject<void>();
  //#endregion Public | Private Variables
  
  // #region constructor
  constructor(
    public CommonService: CommonService,
    private _fb: FormBuilder,
    private TimetableService: TimetableService,
    private toastr: Toastr,
  ) {
    this.AddExtraLecture = this._fb.group({
      section_id: [null, Validators.required],
      class_id: [null, Validators.required],
      batch_id: [null, Validators.required],
      date: [null, Validators.required],
      extra_lecture: ['0', Validators.required], // or [0] if you prefer
    });
  }

  showLoading = false;
  submitLoading = false;
  sections:any = [];
  classes:any = [];
  batches: any = [];

  
  subjects:any = [];
  rooms:any = [];
  timetable:any = [];

  timetableUpdate:any = [];
  
  //#endregion constructor
  
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  // #region Lifecycle hooks
  ngOnInit(): void {
    this.getSections();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks
  
  // #region Public methods
  // Add public methods if needed

  getSections(){
    this.TimetableService.getSectionList(this.sections).subscribe((res: any) => {
      if (res.status) {
        this.sections = res.data;
      }
    });
  }

  getClasses(){
    this.TimetableService.getClasses(this.AddExtraLecture.value.section_id).subscribe((resp: any) => {
      this.classes = resp.data
    });
  }

  getBatches(){
    this.TimetableService.getBatches({classes_id : this.AddExtraLecture.value.class_id}).subscribe((resp: any) => {
      this.batches = resp.data
    });
  }

  handleSectionChange(){
    this.AddExtraLecture.controls['class_id'].patchValue(null);
    this.AddExtraLecture.controls['batch_id'].patchValue(null);
    this.subjects = [];
    this.getClasses();
  }
 
  handleClassChange(){
    this.AddExtraLecture.controls['batch_id'].patchValue(null);
    this.subjects = [];
    this.getBatches();
  }
 
  handleBatchChange(){
    this.subjects = [];
  }

  handleLectureChange(){
    if(this.AddExtraLecture.value.extra_lecture  == 1){
      this.AddExtraLecture.controls['date'].patchValue(null);
      this.AddExtraLecture.controls['date'].clearValidators();
    }else{
      this.AddExtraLecture.controls['date'].setValidators([Validators.required]);
    }
    this.AddExtraLecture.controls['date'].updateValueAndValidity();
  }


  show(){
    this.showLoading = true;
    this.TimetableService.getExtraLectureTimetable(this.AddExtraLecture.value).subscribe((resp:any) => {
      if(resp.status){
        this.subjects = resp.data.subjects
        this.rooms = resp.data.rooms.map((el: any) => {
          return { id: el.id, name: el.room.name };
        });
        this.timetable = resp.data.timetable
      }else{
        this.toastr.showError(resp.message)
      }
      this.showLoading = false;
    }, (error:any)=>{
      console.log(error);
      this.showLoading = false;
    })
  }

  handleSubjectChange(subject_id: any, i: any, j: any, optional:any) {
      let lecture = this.timetable[i].timings[j];
      lecture.user_id = null
      lecture.lecturers = []
      const data = {
        class_id: this.AddExtraLecture.value.class_id,
        subject_id: subject_id,
        batch_id: this.AddExtraLecture.value.batch_id,
        lecture_time_id: lecture.id,
        week_day: lecture.week_day,
      };
     this.TimetableService.getSubjectFaculties(data).subscribe((resp:any) => {
        this.timetable.filter((lac: any) =>
          lac.timings.filter((sub: any) => (delete(sub.available)))
        );
        if(resp.status){
          if(resp.message == 'available'){
            lecture.disable = false;
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
          }
          else{
            this.toastr.showError(resp.message)
            delete(lecture.subject_id);
            delete(lecture.room_id);
            delete(lecture.user_id);
            delete(lecture.lecturers);
            this.manageTimeTable(resp, i, j)
          }
        }
        else{
          this.toastr.showError(resp.message)
          delete(lecture.subject_id)
        }
     })
  }

  handleOptionalSubjectChange(i:any, j:any, optional:any){
    let lecture = this.timetable[i].timings[j];
      optional.user_id = null
      optional.lecturers = []
      const data = {
        class_id: this.AddExtraLecture.value.class_id,
        subject_id: optional.subject_id,
        batch_id: this.AddExtraLecture.value.batch_id,
        lecture_time_id: lecture.id,
        week_day: lecture.week_day,
      };
     this.TimetableService.getSubjectFaculties(data).subscribe((resp:any) => {
        this.timetable.filter((lac: any) =>
          lac.timings.filter((sub: any) => (delete(sub.available)))
        );
        if(resp.status){
          if(resp.message == 'available'){
            optional.lecturers = resp.data
              if(resp.data.length == 1){
                optional.user_id = resp.data[0].id
              }
          }
          else{
            this.toastr.showError(resp.message)
            optional.subject_id = null;
            optional.room_id = null;
            optional.user_id = null;
            optional.lecturers = [];
            this.manageTimeTable(resp, i, j)
          }
        }
        else{
          this.toastr.showError(resp.message)
          optional.subject_id = null
        }
     })
  }


  handleLecturerChange(i: any, j: any) {
    let lecture = this.timetable[i].timings[j];
    const data = {
      class_id: this.AddExtraLecture.value.class_id,
      batch_id: this.AddExtraLecture.value.batch_id,
      subject_id: lecture.subject_id,
      lecture_time_id: lecture.id,
      week_day: lecture.week_day,
      user_id: lecture.user_id
    };
    this.TimetableService.getFacultyAvailability(data).subscribe((resp:any)=>{
      if(resp.status){
        if(resp.message == 'available'){
          lecture.disable = false;
          this.timetable.filter((lac: any) =>
            lac.timings.filter((sub: any) => (delete(sub.available)))
          );
        }else {
          this.toastr.showError(resp.message)
          delete(lecture.user_id);
          this.manageTimeTable(resp, i, j)
        } 

      }else{
        this.toastr.showError(resp.message)
      }
    })
  }

  handleOptionalLecturerChange(i: any, j: any, optional:any){
    let lecture = this.timetable[i].timings[j];
    const data = {
      class_id: this.AddExtraLecture.value.class_id,
      batch_id: this.AddExtraLecture.value.batch_id,
      subject_id: optional.subject_id,
      lecture_time_id: lecture.id,
      week_day: lecture.week_day,
      user_id: optional.user_id
    };
    this.TimetableService.getFacultyAvailability(data).subscribe((resp:any)=>{
      if(resp.status){
        if(resp.message == 'available'){
          this.timetable.filter((lac: any) =>
            lac.timings.filter((sub: any) => (delete(sub.available)))
          );
        }else{
          this.toastr.showError(resp.message)
          optional.user_id = null;
          this.manageTimeTable(resp, i, j)
        }

      }else{
        this.toastr.showError(resp.message)
      }
    })
  }

  manageTimeTable(resp: any, i: any, j: any) {
    this.timetable.filter((lac: any) =>
      lac.timings.filter((sub: any) => (sub.available = true))
    );

    resp.data.forEach((x:any) => {
        let subject = this.timetable.find((el:any) => el.day == x.week_day)
        subject = subject.timings.find((lec:any) => lec.id == x.lecture_timing_id);
        if (subject) {
          subject.available = false;
        }
    })
  }

  handleRoomChange(i: any, j: any) {
    let lecture = this.timetable[i].timings[j];
    const data = {
      class_id: this.AddExtraLecture.value.class_id,
      batch_id: this.AddExtraLecture.value.batch_id,
      subject_id: lecture.subject_id,
      lecture_time_id: lecture.id,
      week_day: lecture.week_day,
      room_id: lecture.room_id
    };
    this.TimetableService.getRoomAvailability(data).subscribe((resp:any) => {
      if(resp.status){
        if(resp.message == 'not_available'){
          lecture.room_id = null
          this.toastr.showError(
            'This room is already assigned in some other class or batch.'
          );
        }else{
          lecture.disable = false;
        }
      }else{
        this.toastr.showError(resp.message)
      }
    })
  }

  handleOptionalRoomChange(i: any, j: any, optional:any){
    let lecture = this.timetable[i].timings[j];
    const data = {
      class_id: this.AddExtraLecture.value.class_id,
      batch_id: this.AddExtraLecture.value.batch_id,
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

  save(i:any, j:any){

    let lecture = this.timetable[i].timings[j];
    lecture.save = true;
    if(lecture.from_time != null && lecture.to_time != null && lecture.subject_id != null && lecture.user_id != null && lecture.room_id != null){
      if(!this.getOptionalStatus(lecture)){
        this.submitLoading = true;
        delete(lecture.save)
        let data = this.AddExtraLecture.value

        data = {...lecture, ...data, ...{timings: this.timetable[i].timings.filter((el:any, key:any) => key != j ), }}
        this.TimetableService.saveExtraLecture(data).subscribe((resp:any) => {
          if(resp.status){
            this.toastr.showSuccess(resp.message)
            // delete(lecture.manual)
            lecture.disable = true
            lecture.extra_lecture_id = resp.data
            this.show();
          }else{
            this.toastr.showError(resp.message)
          }
          this.submitLoading = false;
        }, (error:any) =>{
          console.log(error);
          this.submitLoading = false;
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

  clearLecture(i:any, j:any){
    let lecture = this.timetable[i].timings[j];

    let data = this.AddExtraLecture.value
    data = {...lecture, ...data}

    if(!data.extra_lecture_id && data.manual == true){
      this.timetable[i].timings.splice(j, 1);
    }else if (data.extra_lecture_id && data.manual == true){
      this.TimetableService.clearExtraLecture(data).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
          this.timetable[i].timings[j].disable = true
          this.timetable[i].timings.splice(j, 1);
        }else{
          this.toastr.showError(resp.message)
        }
      }, (error:any) =>{
        console.log(error);
        this.submitLoading = false;
      })
    }else{
      this.TimetableService.clearExtraLecture(data).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
          this.timetable[i].timings[j].disable = true
          this.show();
        }else{
          this.toastr.showError(resp.message)
        }
      }, (error:any) =>{
        console.log(error);
        this.submitLoading = false;
      })
    }
    
  }

  addExtraLecture(){
    this.timetable.forEach((element:any) => {
      element.timings.push({
        from_time: null,
        to_time: null,
        subject_id: null,
        user_id: null,
        room_id: null,
        lecturers: null,
        optional: null,
        week_day: element.day,
        manual: true,
        is_break: 0,
      })
    });
  }

  timeFormat(time:any){
    return moment(time, "HH:mm:ss").format("hh:mm A");
  }

  clear(){
    this.AddExtraLecture.reset()
    this.AddExtraLecture.controls['extra_lecture'].patchValue('0');
    this.subjects = [];
    this.rooms = [];
    this.timetable = [];
  }

  //#endregion Public methods
  
  // #region Private methods
  // Add private methods if needed
  //#endregion Private methods
}
