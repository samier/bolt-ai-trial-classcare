import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { McqManagementService } from '../mcq-management.service';
import { DataTableDirective } from 'angular-datatables';
import { TransportService } from '../../transport-management/transport.service';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-chapter-list',
  templateUrl: './chapter-list.component.html',
  styleUrls: ['./chapter-list.component.scss']
})
export class ChapterListComponent {

  //#region Public | Private Variables

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  filterCount: any = 0;
  isResetLoading: boolean = false;
  filter: boolean = true;
  chepterFilterForm :FormGroup = new FormGroup({});
  URLConstants = URLConstants;
  chapters: any = [];
  classes: any = [];
  subjects: any = [];
  selectedClass: any = null;
  selectedSubject: any = null;
  classListDP : any[] = []
  subjectListDP : any[] = []


   //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    private mcqService: McqManagementService,
    private transportService: TransportService,
    public CommonService: CommonService,
    private formBuilder: FormBuilder,
    public activatedRouteService: ActivatedRoute,
    private toastr: Toastr,
  ) {}


  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------


  
  isOpenByClick: boolean = true

  ngOnInit(): void {
    this.initForm()
    this.classList();
    // this.transportService.getClassesList().subscribe((res:any) => {
    //   this.classes = res.data;
    //   if(this.selectedClass){
    //     this.mcqService.getSubjectList(this.selectedClass).subscribe((res:any) => {
    //       this.subjects = res.data.subject;
    //     });
    //   }
    // }); 
    const that= this
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
          class   : that.selectedClass,
          subject : that.selectedSubject,
        })
        localStorage.setItem('DataTables_' + URLConstants.CHAPTER_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.CHAPTER_LIST)
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
        { data: 'chapter_name' },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

   //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  classList(){
    this.mcqService.getClass({}).subscribe((res:any)=>{
      this.classListDP = res.data
    })
  }

  getSubjectList(){
    this.subjectListDP=[]
    this.chepterFilterForm.controls['subjectFC'].patchValue(null)

    this.mcqService.getSubjectList(this.chepterFilterForm.value.classFC ).subscribe((res:any)=>{
      if(res.status){
        this.subjectListDP = res.data.subject;
      }
    })
  }

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.chepterFilterForm.value).forEach((item:any)=>{
      if(this.chepterFilterForm.value[item] != '' && this.chepterFilterForm.value[item] != null){
        this.filterCount++;
      }
    })  
    if(this.chepterFilterForm.value?.date && this.chepterFilterForm.value?.date?.startDate == null){
      this.filterCount--;
    }  
  }
  clearAll() {
  this.isResetLoading = true;
   this.chepterFilterForm.reset();
   this.filterCount = 0;
  //  this.chepterFilterForm.controls['classFC'].patchValue( null )
  //  this.chepterFilterForm.controls['subjectFC'].patchValue( null )
  this.reloadData();
   this.isResetLoading = false;
  }

  setFormState(state:any) {
    this.selectedClass    = state?.class
    this.selectedSubject  = state?.subject
  }

  getlist(dataTablesParameters?: any, callback?:any ){
    const payload = {
      class :  this.chepterFilterForm.value.classFC || '' ,
      subject : this.chepterFilterForm.value.subjectFC || ''
    }
    // Object.assign(dataTablesParameters,{class:this.selectedClass});
    // Object.assign(dataTablesParameters,{subject:this.selectedSubject});
    this.mcqService.getChapterList({ ...payload ,...dataTablesParameters}).subscribe((resp:any) => {
      this.chapters = resp.data;
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
  //   if(confirm('are you sure you want to delete this chapter ?')){
  //     this.mcqService.deleteChapter(id).subscribe((res) => {
  //       this.reloadData();
  //     });
  //   }
  // }

  remove(id: number) {
    const isDelete = confirm("Are you sure you want to delete this chapter ?");
    if (isDelete) {
      this.mcqService.deleteChapter(id).subscribe((res: any) => {
        if (res?.status) {
          this.toastr.showSuccess(res?.message);
          this.reloadData();
        } else {
          this.toastr.showError(res?.message);
        }
      });
      (err: any) => {
        if (err.message) {
          this.toastr.showError(err?.error?.message);
        } 
       }
    }
  }
  
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  changeClass(class_id:any){
    this.selectedSubject = null;
    this.mcqService.getSubjectList(class_id).subscribe((res:any) => {
      this.subjects = res.data.subject;
    });
    this.reloadData();
  }

   //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.chepterFilterForm = this.formBuilder.group({
      classFC: [null],
      subjectFC: [null]
    });
  }
}
