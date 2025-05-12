import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { LessonPlanningService } from '../lesson-planning.service';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { event } from 'jquery';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-lesson-list',
  templateUrl: './lesson-list.component.html',
  styleUrls: ['./lesson-list.component.scss']
})
export class LessonListComponent {


  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  tbody:any;
  login_id:any=4;
  p: number = 1;
  sections = [{ id: "", name: 'All' }];
  selectedSection=""
  Faculties = [];
  selectedFaculty=""
  Batches = [];
  selectedBatch:any ="";
  
  isOpenByClick: boolean = true

  Subjects = [];
  selectedSubject:any = "";

  ClassNames = [];
  selectedClass:any = "";
  public selected_id="";
  public selected_faculty_id="";
  classDropdownSettings: IDropdownSettings = {};
  params = {
    section: "",
  };

  constructor(private lessonPlanningSerivce:LessonPlanningService, public CommonService: CommonService,public activatedRouteService: ActivatedRoute){
  }
  URLConstants=URLConstants;

  ngOnInit(): void {

    this.lessonPlanningSerivce.getSectionList(this.sections).subscribe((res: any) => {
      if (res.status) {
        this.sections = this.sections.concat(res.data);
      }
    });

    this.getAllFaculty();

    this.classDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'date' },
        { data: 'section_name'},
        { data: 'class_name'},
        { data: 'batch_name' },
        { data: 'subject' },
        { data: 'created_by' },
        { data: 'topic' },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.params,
      class:this.selected_id,
      batch:this.selectedBatch,
      subject:this.selectedSubject,
      creator:this.selected_faculty_id,
    };

    this.lessonPlanningSerivce.getLessonList(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }


  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  delete(id:number){
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.lessonPlanningSerivce.deleteLesson(id).subscribe((res:any) => {
        console.log(res);
        this.reloadData();
      });
    }
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  changeFn(val:any){
    this.selected_id =val;
    this.getSubjectAndBatchListByClassId(val);
    this.selectedSubject="";
    this.selectedBatch="";
    this.reloadData();
  }

  changeFaculty(event:any){
    this.selected_faculty_id = event.id;
    this.getClassList(event);
    this.reloadData();
  }

  sectionChange()
    {
        this.lessonPlanningSerivce.getFacultyBySection(this.params.section).subscribe((res: any) => {
          this.Faculties=res;
          this.selected_faculty_id = "";
          this.reloadData();
      });
    }


    getAllFaculty(){
      this.lessonPlanningSerivce.getAllFaculty().subscribe((res:any) => {
       this.Faculties=res.data;
       this.selectedFaculty = res.data[0].id;
       this.selected_id== res.data[0].id;
       this.getClassList(res.data[0].id);
      //  this.reloadData();
      });
    }

    getClassList(res:any){
      let param = {user_id:res.id};
      this.lessonPlanningSerivce.getClassListForAdmin(param).subscribe((res:any) => {
          this.ClassNames = res.data;
          // this.reloadData();
          // this.getSubjectAndBatchListByClassId(this.selectedClass);
      });
    }

    getSubjectAndBatchListByClassId(val:any){
      let param = {user_id:this.selected_faculty_id};
      this.lessonPlanningSerivce.getSubjectAndBatchListByClassId(param,val.id).subscribe((res:any) => {
          this.Batches = res.data.batch;
          this.Subjects = res.data.subject;
      });
    }

    onBatchSelect(event:any)
  {
    this.selectedBatch = event;
    this.reloadData();
  }

  onSubjectSelect(event:any)
  {
    this.selectedSubject = event;
    this.reloadData();
  }


}
