import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { McqManagementService } from '../mcq-management.service';
import { DataTableDirective } from 'angular-datatables';
import { TransportService } from '../../transport-management/transport.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReportService } from "../../report/report.service";


@Component({
  selector: 'app-exam-list',
  templateUrl: './exam-list.component.html',
  styleUrls: ['./exam-list.component.scss']
})
export class ExamListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  constructor(
    private mcqService: McqManagementService,
    private transportService: TransportService,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    private toastr: Toastr,
    private formBuilder: FormBuilder,
    private ReportService: ReportService,

  ) {}

  URLConstants = URLConstants;
  exams: any = [];
  classes: any = [];
  subjects: any = [];
  chapters: any = [];
  batches: any = [];
  selectedClass: any = null;
  selectedSubject: any = null;
  selectedChapter: any = [];
  selectedBatches: any = [];
  classListDP : any[] =[];
  subjectListDP : any[] = [];
  chapterDP : any[] = [];
  batchDP : any[] = []
  filterCount: any = 0;
  filter: boolean = true;
  questionFilterForm :FormGroup = new FormGroup({});
  isResetLoading: boolean = false;
  batchDropdownSettings: IDropdownSettings = {};
  chapterDropdownSettings: IDropdownSettings = {};

  
  isOpenByClick: boolean = true

  ngOnInit(): void {
    this. classList();
    this. initForm();
    // this.transportService.getClassesList().subscribe((res:any) => {
    //   this.classes = res.data;

    //   if(this.selectedClass){
    //     this.mcqService.getSubjectList(this.selectedClass).subscribe((res:any) => {
    //       this.subjects = res.data.subject;
    //       this.batches = res.data.batch;
    //     });
    //   }

    //   if( this.selectedSubject ){
    //     this.mcqService.getChapters(this.selectedSubject).subscribe((res:any) => {
    //       this.chapters = res.data;
    //     });
    //   }

    // });
    this.batchDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.chapterDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'chapter_name',
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
      stateSave: true,
      // scrollX: true,
      stateSaveCallback: function(settings,data) {
        Object.assign(data,{
          class   : that.selectedClass ,
          subject : that.selectedSubject ,
          chapter : that.selectedChapter ,
          batch   : that.selectedBatches ,
        })
        localStorage.setItem('DataTables_' + URLConstants.EXAM_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.EXAM_LIST)
          let dataTableState = JSON.parse(state)
          that.setFormState(dataTableState)
          return dataTableState
        } else {
          that.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.state.clear();
          });
          return null;
        }
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.getlist(dataTablesParameters,callback)
      },
     columns: [
        { data: 'id' },
        { data: 'exam_name' },
        { data: 'start_time' },
        { data: 'end_time' },
        { data: 'exam_duration' },
        { data: 'result_date' },
        { data: 'total_question' },
        { data: 'total_mark' },
        { data: 'passing_mark' },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }
  setFormState(state:any) {
    this.selectedClass   = state?.class
    this.selectedSubject = state?.subject
    this.selectedChapter = state?.chapter
    this.selectedBatches = state?.batch
  }

  getlist(dataTablesParameters?: any, callback?:any ){
    // Object.assign(dataTablesParameters,
      // {class:this.selectedClass,subject:this.selectedSubject,chapter:this.selectedChapter,batches:this.selectedBatches});
      const payload = {
        class :  this.questionFilterForm.value.classFC || '' ,
        subject : this.questionFilterForm.value.subjectFC || '',
        chapter : this.questionFilterForm.value.chapterFC || '',
        batches : this.questionFilterForm.value.batch|| '',
      }
    this.mcqService.getExamList({ ...payload ,...dataTablesParameters}).subscribe((resp:any) => {
      this.exams = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }

  reloadData() {
    this.countFilters();
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  // remove(id:any): void{
  //   if(confirm('are you sure you want to delete this exam ?')){
  //     this.mcqService.deleteExam(id).subscribe((res) => {
  //       this.reloadData();
  //     });
  //   }
  // }

  remove(id: any) {
    const isDelete = confirm("are you sure you want to delete this exam ?");
    if (isDelete) {
      this.mcqService.deleteExam(id).subscribe(
        (res: any) => {
        if (res?.status) {
          this.toastr.showSuccess(res?.message);
          this.reloadData();
        } else {
          this.toastr.showError(res?.message);
        }
      }
    );
    (err) => {
      const errorMsg = err?.error?.error || 'Something went wrong';
      this.toastr.showError(errorMsg);
    };
    }
  }
  

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  changeClass(class_id:any){
    this.selectedSubject = this.selectedChapter = this.selectedBatches = null;
    this.subjects = this.chapters = this.batches = [];
    this.mcqService.getSubjectList(class_id).subscribe((res:any) => {
      this.subjects = res.data.subject;
      this.batches = res.data.batch;
    });
    this.reloadData();
  }

  changeSubject(subject_id:any){
    this.selectedChapter = null;
    this.chapters = [];
    this.mcqService.getChapters(subject_id).subscribe((res:any) => {
      this.chapters = res.data;
    });
    this.reloadData();
  }

  getSubjectList(){
    this.questionFilterForm.get('chapterFC')?.setValue(null);
    this.subjectListDP=[]
    this.questionFilterForm.controls['subjectFC'].patchValue(null)

    this.mcqService.getSubjectList(this.questionFilterForm.value.classFC ).subscribe((res:any)=>{
      if(res.status){
        this.subjectListDP = res.data.subject;
      }
    })
  }

  getChapterList(){
    // this.questionFilterForm.controls['chapterFC'].patchValue(null)
    this.chapterDP=[]
    this.mcqService.getChapters(this.questionFilterForm.value.subjectFC ).subscribe((res:any)=>{
      if(res.status){  
        this.chapterDP = res.data.map((ele: any) => {
          return {
            id: ele.id,
            name: ele.chapter_name
          }
        })
      }
    }) 
  }

  classList(){
    this.batchDP=[]
      // this.questionFilterForm.get('batch').setValue(null);
    this.questionFilterForm.get('batch')?.setValue(null);
    this.questionFilterForm.get('subjectFC')?.setValue(null);
    this.questionFilterForm.get('chapterFC')?.setValue(null);
    this.subjectListDP=[]
    this.chapterDP=[]
    this.mcqService.getClass({}).subscribe((res:any)=>{
      this.classListDP = res.data
    })
  }
  
  getBatchList(){
    // this.batches = [];
    // this.questionFilterForm.get('batch').setValue(null);
    this.questionFilterForm.get('subjectFC')?.setValue(null);
    this.questionFilterForm.get('chapterFC')?.setValue(null);
    let payload = 0
    this.subjectListDP=[]
    this.chapterDP=[]
    if(!this.questionFilterForm.value.classFC){
      payload =  this.classes.map(ele => ele.id)
    } else {
      payload = this.questionFilterForm.value.classFC
    }
    
    this.ReportService.getBatchesByClass(payload).subscribe((res: any) => {
      this.batchDP= res?.data;
    });
  }

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.questionFilterForm.value).forEach((item:any)=>{
      if(this.questionFilterForm.value[item] != '' && this.questionFilterForm.value[item] != null){
        this.filterCount++;
      }
    })  
    if(this.questionFilterForm.value?.date && this.questionFilterForm.value?.date?.startDate == null){
      this.filterCount--;
    }  
  }

  clearAll() {
    this.isResetLoading = true;
     this.questionFilterForm.reset();
     this.filterCount = 0;
    //  this.chepterFilterForm.controls['classFC'].patchValue( null )
    //  this.chepterFilterForm.controls['subjectFC'].patchValue( null )
    this.reloadData();
     this.isResetLoading = false;
    }

    initForm() {
      this.questionFilterForm = this.formBuilder.group({
        classFC: [null],
        subjectFC: [null],
        chapterFC: [null],
        batch: [null],
      });
    }
}
