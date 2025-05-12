import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { McqManagementService } from '../mcq-management.service';
import { DataTableDirective } from 'angular-datatables';
import { TransportService } from '../../transport-management/transport.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss']
})
export class QuestionListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  classFC: any;
  subjectFC: any;
  chapterFC: any;

  constructor(
    private mcqService: McqManagementService,
    private transportService: TransportService,
    public commonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    private toastr: Toastr,
    private formBuilder: FormBuilder,

  ) {}

  URLConstants = URLConstants;
  questions: any = [];
  filterCount: any = 0;
  classes: any = [];
  subjects: any = [];
  chapters: any = [];
  classListDP : any[] = []
  subjectListDP : any[] = []
  chapterDP : any[]=[]
  selectedClass: any = null;
  selectedSubject: any = null;
  selectedChapter: any = null;
  isResetLoading: boolean = false;
  filter: boolean = true;
  questionFilterForm :FormGroup = new FormGroup({});

  
  isOpenByClick: boolean = true

  ngOnInit(): void {
    this. initForm();
    this.classList();
    // this.transportService.getClassesList().subscribe((res:any) => {
    //   this.classes = res.data;

    //   if(this.selectedClass){
    //     this.mcqService.getSubjectList(this.selectedClass).subscribe((res:any) => {
    //       this.subjects = res?.data?.subject;
    //     });
    //   }
    //   if(this.selectedSubject){
    //     this.mcqService.getChapters(this.selectedSubject).subscribe((res:any) => {
    //       this.chapters = res?.data;
    //     });
    //   }

    // });
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      // scrollX: true,
      stateSaveCallback: function(settings,data) {
        Object.assign(data,{
          class   : that.selectedClass,
          subject : that.selectedSubject,
          chapter : that.selectedChapter,
        })
        localStorage.setItem('DataTables_' + URLConstants.QUESTION_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.commonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.QUESTION_LIST)
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
        { data: 'class' },
        { data: 'subject' },
        { data: 'chapter' },
        { data: 'question' },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }
  setFormState(state:any) {
    this.selectedClass   = state?.classFC
    this.selectedSubject = state?.subjectFC
    this.selectedChapter = state?.chapterFC
  }

   getlist(dataTablesParameters?: any, callback?:any ){
    // Object.assign(dataTablesParameters,
    //   { class: this.classFC, subject: this.subjectFC, chapter: this.chapterFC });
    const payload = {
      class :  this.questionFilterForm.value.classFC || '' ,
      subject : this.questionFilterForm.value.subjectFC || '',
      chapter : this.questionFilterForm.value.chapterFC || ''

    }
    this.mcqService.getQuestionList({...payload,...dataTablesParameters}).subscribe((resp:any) => {
      this.questions = resp.data;
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
  //   if(confirm('are you sure you want to delete this question ?')){
  //     this.mcqService.deleteQuestion(id).subscribe((res) => {
  //       this.reloadData();
  //     });
  //   }
  // }

  remove(id: number) {
    const isDelete = confirm("Are you sure you want to delete this chapter ?");
    if (isDelete) {
      this.mcqService.deleteQuestion(id).subscribe((res: any) => {
        if (res?.status) {
          this.toastr.showSuccess(res?.message);
          this.reloadData();
        } else {
          this.toastr.showError(res?.message);
        }
      });
      (err: any) => {
          this.toastr.showError(err?.error?.error);
       }
    }
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  changeClass(class_id:any){
    this.selectedSubject = null;
    this.selectedChapter = null;
    this.mcqService.getSubjectList(class_id).subscribe((res:any) => {
      this.subjects = res.data.subject;
    });
    this.reloadData();
  }

  changeSubject(subject_id:any){
    this.selectedChapter = null;
    this.mcqService.getChapters(subject_id).subscribe((res:any) => {
      this.chapters = res.data;
    });
    this.reloadData();
  }

  clearAll() {
    this.isResetLoading = true;
     this.questionFilterForm.reset();
     this.filterCount = 0;
    //  this.chepterFilterForm.controls['classFC'].patchValue( null )
    //  this.chepterFilterForm.controls['subjectFC'].patchValue( null )
     this.isResetLoading = false;
     this.reloadData()
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

    classList(){
      this.mcqService.getClass({}).subscribe((res:any)=>{
        this.classListDP = res.data
      })
    }

    getSubjectList(){
      this.subjectListDP=[]
      this.questionFilterForm.controls['subjectFC'].patchValue(null)
  
      this.mcqService.getSubjectList(this.questionFilterForm.value.classFC ).subscribe((res:any)=>{
        if(res.status){
        
          this.subjectListDP = res.data.subject;
        }
      })
    }

    getChapterList(){
      this.questionFilterForm.controls['chapterFC'].patchValue(null)
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

    initForm() {
      this.questionFilterForm = this.formBuilder.group({
        classFC: [null],
        subjectFC: [null],
        chapterFC : [null]
      });
    }
}
