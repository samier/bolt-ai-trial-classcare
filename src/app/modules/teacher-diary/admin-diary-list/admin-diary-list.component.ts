import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TeacherDiaryService } from '../teacher-diary.service';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-diary-list',
  templateUrl: './admin-diary-list.component.html',
  styleUrls: ['./admin-diary-list.component.scss']
})
export class AdminDiaryListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;


  tbody:any;
  login_id:any=4;
  p: number = 1;
  sections = [{ id: '', name: 'All' }];
  selectedSection=''
  Faculties = [];
  selectedFaculty=''
  Batches = [];
  selectedBatch:any ='';

  
  isOpenByClick: boolean = true

  Subjects = [];
  selectedSubject:any = '';

  ClassNames = [];
  selectedClass:any = '';
  public selected_id='';
  public selected_faculty_id='';
  classDropdownSettings: IDropdownSettings = {};
  params = {
    section: null,
  };
  constructor(private teacherDiarySerivce:TeacherDiaryService,public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute
  ){
  }
  URLConstants=URLConstants;
  ngOnInit(): void {
    this.teacherDiarySerivce.getSectionList(this.sections).subscribe((res: any) => {
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
        { data: 'topic'},
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
    this.teacherDiarySerivce.getRecordList(dataTablesParameters).subscribe((resp:any) => {
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

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  changeFn(val:any){
    this.selected_id =val;
    this.getSubjectAndBatchListByClassId(val);
    this.selectedSubject='';
    this.selectedBatch='';
    this.reloadData();
  }

  changeFaculty(event:any){
    this.selected_faculty_id = event.id;
    this.getClassList(event);
    this.reloadData();
  }

  sectionChange()
    {
        this.teacherDiarySerivce.getFacultyBySection(this.params.section).subscribe((res: any) => {
          this.Faculties=res;
          this.selectedFaculty = '';
          this.reloadData();
      });
    }


    getAllFaculty(){
      this.teacherDiarySerivce.getAllFaculty().subscribe((res:any) => {
       this.Faculties=res.data;
       this.selectedFaculty = res.data[0].id;
       this.selected_id== res.data[0].id;
       this.getClassList(res.data[0].id);
      //  this.reloadData();
      });
    }

    getClassList(res:any){
      let param = {user_id:res.id};
      this.teacherDiarySerivce.getClassListForAdmin(param).subscribe((res:any) => {
          this.ClassNames = res.data;
          // this.reloadData();
          // this.getSubjectAndBatchListByClassId(this.selectedClass);
      });
    }

    getSubjectAndBatchListByClassId(val:any){
      let param = {user_id:this.selected_faculty_id};
      this.teacherDiarySerivce.getSubjectAndBatchListByClassId(param,val.id).subscribe((res:any) => {
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

  delete(id:number){
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.teacherDiarySerivce.deleteRecord(id).subscribe((res:any) => {
        console.log(res);
        this.reloadData();
      });
    }
  }
}
