import { Component, OnInit } from '@angular/core';
import { TimetableService } from '../timetable.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-assign-subject',
  templateUrl: './assign-subject.component.html',
  styleUrls: ['./assign-subject.component.scss']
})
export class AssignSubjectComponent implements OnInit {
  URLConstants = URLConstants;

  constructor(
    private TimetableService: TimetableService,
    private toastr: Toastr,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    private router: Router,
  ) { }

  showLoading = false;
  submitLoading = false;
  sections:any = [];
  classes:any = [];
  batches: any = [];

  users:any = [];
  subjects:any = [];
  assigned_subject:any = [];

  params: any = {
    section: null,
    class: null,
    batch: null,
  };

  errors:any = [];

  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
  };

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  ngOnInit(): void {
    this.getSections();
    this.getClasses();
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

  handleSectionChange(){
   this.params.class = null
   this.params.batch = null
   this.subjects = [];
   this.users = [];
   this.getClasses();
 }

 handleClassChange(){
   this.params.batch = null
   this.subjects = [];
   this.users = [];
   this.getBatches();
 }

 handleBatchChange(){
   this.subjects = [];
   this.users = [];
 }

 show(){
  let status = true;
    this.errors['section'] = this.params.section == null ? 'Please select section' : null
    this.errors['class'] = this.params.class == null ? 'Please select class' : null
    this.errors['batch'] = this.params.batch == null ? 'Please select batch' : null

    status = this.params.section == null || this.params.class == null || this.params.batch == null ? false :  true
    if(status){
      this.showLoading =  true;
      this.TimetableService.getUsers(this.params).subscribe((resp:any) => {
        if(resp.status){
          this.users = resp.data.users;
          this.subjects = resp.data.subjects;
        }
        else{
          this.toastr.showError(resp.message)
        }
        this.showLoading =  false;
      }, (error:any) => {
        console.log(error);
        this.showLoading = false;
      })
    }
 }

 save(){
  this.submitLoading = true;
  this.params.users = this.users;
  this.TimetableService.assignSubjectToUsers(this.params).subscribe((resp:any) => {
      if(resp.status){
        this.toastr.showSuccess(resp.message)
        // this.clearForm();
      }else{
        this.toastr.showError(resp.message)
        this.show()
      }
      this.submitLoading = false;
  }, (error:any) => {
      console.log(error);
      this.submitLoading = false;
  })
 }

  clearForm(){
    this.params.section = null;
    this.params.class = null;
    this.params.batch = null
    this.users = [];
    this.subjects = [];

    this.errors['section'] =  null
    this.errors['class'] = null
    this.errors['batch'] = null
  }
  
}
