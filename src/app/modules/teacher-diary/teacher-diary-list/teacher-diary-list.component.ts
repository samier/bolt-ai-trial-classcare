import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TeacherDiaryService } from '../teacher-diary.service';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-teacher-diary-list',
  templateUrl: './teacher-diary-list.component.html',
  styleUrls: ['./teacher-diary-list.component.scss']
})
export class TeacherDiaryListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  public branch_id = window.localStorage?.getItem("branch");
  tbody:any;
  login_id:any=4;
  p: number = 1;
  sections = [{ id: '', name: 'All' }];
  params = {
    section: null,        
  };
  Batches = [];
  selectedBatch:any ='';

  Subjects = [];
  selectedSubject:any = '';

  ClassNames = [];
  selectedClass:any = '';
  public selected_id='';
  constructor(private teacherDiarySerivce:TeacherDiaryService, public CommonService: CommonService){
  }
  URLConstants=URLConstants;
  ngOnInit(): void {

    this.teacherDiarySerivce.getSection(this.branch_id).subscribe((res: any) => {                         
      if (res.status) {
        this.sections = this.sections.concat(res.data);
      }
  });

  this.getClassList();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
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

  delete(id:number){
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.teacherDiarySerivce.deleteRecord(id).subscribe((res:any) => {      
        console.log(res); 
        this.reloadData();
      });             
    }
  }

  sectionChange()
    {
      this.teacherDiarySerivce.getClassListBySection(this.params.section).subscribe((res: any) => {
      this.ClassNames=res;        
      this.selectedClass = '';
      this.selectedBatch = '';
      this.selectedSubject = '';
      this.reloadData();        
      });
    }

  changeFn(val:any){
    this.selected_id =val.id;
    this.getSubjectAndBatchListByClassId(val.id);
    this.reloadData();
  }

  getClassList(){     
    this.teacherDiarySerivce.getClassList(this.branch_id).subscribe((res:any) => {           
      this.ClassNames = res.data;      
      this.getSubjectAndBatchListByClassId(res.data[0].id);     
      this.selectedBatch = '';
      this.selectedSubject = ''; 
    });         
  }

  getSubjectAndBatchListByClassId(id:any){
    let param = {user_id:0};
    this.teacherDiarySerivce.getSubjectAndBatchListByClassId(param,id).subscribe((res:any) => {
      console.log(res);     
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
