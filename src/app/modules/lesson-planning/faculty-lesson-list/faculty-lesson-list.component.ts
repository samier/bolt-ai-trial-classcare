import { Component,ViewChild  } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { LessonPlanningService } from '../lesson-planning.service';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-faculty-lesson-list',
  templateUrl: './faculty-lesson-list.component.html',
  styleUrls: ['./faculty-lesson-list.component.scss']
})
export class FacultyLessonListComponent {

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
  constructor(private lessonPlanningSerivce:LessonPlanningService, public CommonService: CommonService){
  }
  URLConstants=URLConstants;
  ngOnInit(): void {
    this.lessonPlanningSerivce.getSection(this.branch_id).subscribe((res: any) => {                         
      if (res.status) {
        this.sections = this.sections.concat(res.data);
      }
  });

  this.getClassList();
    // this.lessonPlanningSerivce.getClassBySection(this.params.section).subscribe((res: any) => {
    //   if (res.status) {
    //     this.ClassNames = res.data;
    //   }
    // });

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
      { data: 'topic' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };     
  }

  // loadData(){
  //   this.lessonPlanningSerivce.getLessonListByCreatorId(this.login_id).subscribe((res:any) => {
  //     this.tbody=res;   
  //     console.log(res.data); 
  //   }); 
  // }

  loadData(dataTablesParameters?: any, callback?:any ){    
    Object.assign(dataTablesParameters,{'creator_id':this.login_id,section:this.params.section,class:this.selected_id,batch:this.selectedBatch,subject:this.selectedSubject});
    this.lessonPlanningSerivce.getLessonListByCreatorId(dataTablesParameters).subscribe((resp:any) => {
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
      this.lessonPlanningSerivce.deleteLesson(id).subscribe((res:any) => {      
        console.log(res); 
        this.reloadData();
      });             
    }
  } 
  
  sectionChange()
    {
      this.lessonPlanningSerivce.getClassListBySection(this.params.section).subscribe((res: any) => {
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
    this.lessonPlanningSerivce.getClassList(this.branch_id).subscribe((res:any) => {           
      this.ClassNames = res.data;      
      this.getSubjectAndBatchListByClassId(res.data[0].id);     
      this.selectedBatch = '';
      this.selectedSubject = ''; 
    });         
  }

  getSubjectAndBatchListByClassId(id:any){
    let param = {user_id:0};
    this.lessonPlanningSerivce.getSubjectAndBatchListByClassId(param,id).subscribe((res:any) => {
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
