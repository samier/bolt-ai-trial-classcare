import { Component, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { HraService } from 'src/app/modules/hra/hra.service';
import { DataTableDirective } from 'angular-datatables';
import { TimetableService } from '../timetable.service';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-subject-lecture',
  templateUrl: './subject-lecture.component.html',
  styleUrls: ['./subject-lecture.component.scss'],
})
export class SubjectLectureComponent implements OnInit {
  URLConstants = URLConstants;

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody: any;
  lecture_id:any;
  constructor(
    private TimetableService: TimetableService,
    private toastr: Toastr,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    private router: Router,
  ) {}

  showLoading = false;
  saveLoading = false;
  sections:any = [];
  classes:any = [];
  batches: any = [];
  subjects:any = [];
  week_days:any = [];
  lecture_count:any = 0

  section_name:any = null;
  class_name:any = null;
  batch_name:any = null;

  params: any = {
    section: null,
    class: null,
    batch: null,
    subjects: [],
  };

  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
  };

  errors:any = [];



  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  ngOnInit() {
    this.lecture_id = this.activatedRouteService.snapshot.params['id'];
    if(this.lecture_id){
      this.getSubjectLecture();
    }else{
      this.getSections();
      this.getClasses();
    }
  }

  getSubjectLecture(){
    this.TimetableService.getSubjectLectures(this.lecture_id).subscribe((resp:any) => {
      if(resp.status){
        this.params.subjects = resp.data?.subject_lecture.subjects.map((el:any) => {
          let days:any = []
          resp.data?.week_days.forEach((x:any) => {
            let day:any = null
            if(el.days != null){
              day = el.days.find((day:any) => x == day.day)
            }
            days.push({day: x, number_of_lecture: day!= undefined ? day?.number_of_lecture : null}); 
          });
          return {subject_lecture_id: el.id,id:el.subject_id, name: el.name, total_lecture: el.total_lecture, week_days: el.week_days, days: days, group_id:el.group_id  }
        })
        

        this.section_name = resp.data.subject_lecture.section.name;
        this.class_name = resp.data.subject_lecture.class.name;
        this.batch_name = resp.data.subject_lecture.batch.name;
        this.params.section = resp.data.subject_lecture.section_id
        this.params.class = resp.data.subject_lecture.class_id
        this.params.batch = resp.data.subject_lecture.batch_id
        this.week_days = resp.data?.week_days
        this.lecture_count = resp.data?.lecture_count
        
      }else{
        this.toastr.showError(resp.status);
      }
    })
  }

  getSections(){
    this.TimetableService.getSectionList(this.sections).subscribe((res: any) => {
      if (res.status) {
        this.sections = res.data;
      }
    });
  }

  getClasses(){
    this.TimetableService.getClasses(this.params.section).subscribe((resp: any) => {
      this.classes = resp.data
    });
  }

  getBatches(){
    this.TimetableService.getBatches({classes_id : this.params.class}).subscribe((resp: any) => {
      this.batches = resp.data
    });
  }

  getSubjects(){
    this.showLoading = true;
    this.TimetableService.getSubjects({class : this.params.class}).subscribe((resp: any) => {
      if(resp.status){
        this.params.subjects = resp.data?.subjects.map((el:any) => {
          let days:any = []
          resp.data?.week_days.forEach((x:any) => {
            days.push({day: x, number_of_lecture: null});
          });
          return {...el, total_lecture: null, week_days: [], days: days}
        })
        
        this.week_days = resp.data?.week_days
        this.lecture_count = resp.data?.lecture_count
      }else{
        this.params.subjects = [];
        this.week_days = [];
        this.toastr.showError(resp.message);
      }
      this.showLoading = false;
    });
  }


  handleSectionChange(){
     this.errors['section'] = ''
    this.params.class = null
    this.params.batch = null
    this.params.subjects = [];
    this.getClasses();
  }

  handleClassChange(){
    this.errors['class'] = ''
    this.params.batch = null
    this.params.subjects = [];
    this.getBatches();
  }

  handleBatchChange(){
    this.params.subjects = [];
    this.errors['batch'] = ''

  }

  show(){
    let status = true;
    this.errors['section'] = this.params.section == null ? 'Please select section' : null
    this.errors['class'] = this.params.class == null ? 'Please select class' : null
    this.errors['batch'] = this.params.batch == null ? 'Please select batch' : null

    status = this.params.section == null || this.params.class == null || this.params.batch == null ? false :  true
    if(status){
      this.getSubjects();
    }
  }

  onWeekChange(index:any, event:any){
    if(typeof(event) == 'string'){
      this.params.subjects[index].days.find((el:any) => el.day == event).number_of_lecture = null;
    }else{
      this.params.subjects[index].days.forEach((el:any) => {
        el.number_of_lecture = null;
      })
    }    
  }

  handleNoOfLectures(i:any, j:any){
    this.errors['subjects.'+i+'.days.'+j+'.number_of_lecture'] = ''
    // let total = this.params.subjects[index]?.total_lecture ?? 0;
    // let no_of_lecture = 0 
    // this.params.subjects[index].days.forEach((el:any) => {
    //   no_of_lecture += el.number_of_lecture
    // })
    // if(no_of_lecture > total){

    //   return this.toastr.showError('Day wise lectures total can not be greater then total lecture per week.')

    // }

    // console.log(total, no_of_lecture);
    


  }


  submit(){
    let total = 0
    this.params.subjects.forEach((el:any) => {
      total += parseInt(el.total_lecture)
    });


    if(total < this.lecture_count){
      return this.toastr.showError('Total Lecture per week count must be greater then or equal to '+ this.lecture_count)
    }

    if(this.lecture_id){
      this.saveLoading = true;
      this.TimetableService.updateSubjectLectures(this.params, this.lecture_id).subscribe((resp:any) => {
        this.errors = [];
        if(resp.status){
          this.toastr.showSuccess(resp.message)
          this.clearForm();
          this.router.navigate([this.setUrl(URLConstants.ASSIGN_LECTURE)]);
        }else{
          this.toastr.showSuccess(resp.message)
        }
        this.saveLoading = false;
      }, (error:any) => {
        this.saveLoading = false;
        this.errors = error.error.errors
        if(this.errors['day_wise_total']){
          this.toastr.showError(this.errors['day_wise_total']);
        }
      })
    }else{
      this.saveLoading = true;
      this.TimetableService.createSubjectLectures(this.params).subscribe((resp:any) => {
        this.errors = [];
        if(resp.status){
          this.toastr.showSuccess(resp.message)
          this.clearForm();
          this.router.navigate([this.setUrl(URLConstants.ASSIGN_LECTURE)]);
        }else{
          this.toastr.showSuccess(resp.message)
        }
        this.saveLoading = false;
      }, (error:any) => {
        this.saveLoading = false;
        this.errors = error.error.errors
        if(this.errors['day_wise_total']){
          this.toastr.showError(this.errors['day_wise_total']);
        }
      })
    }
    
  }

  clearForm(){
    this.params.section = null;
    this.params.class = null;
    this.params.batch = null
    this.batches = []
    this.params.subjects = []
    this.subjects = []

    this.errors['section'] = ''
    this.errors['class'] = ''
    this.errors['batch'] = ''
  }
}
