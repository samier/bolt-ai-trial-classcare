import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { McqManagementService } from '../mcq-management.service';
import { DataTableDirective } from 'angular-datatables';
import { TransportService } from '../../transport-management/transport.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.scss']
})
export class ResultListComponent {

  dtOptions: DataTables.Settings = {};
  batchdtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  constructor(
    private mcqService: McqManagementService,
    private transportService: TransportService,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
  ) {}

  URLConstants = URLConstants;
  results: any = [];
  batchresults: any = [];
  classes: any = [];
  subjects: any = [];
  batches: any = [];
  selectedClass: any = null;
  selectedSubject: any = null;
  for:string = "student";
  selectedBatches: any = [];
  batchDropdownSettings: IDropdownSettings = {};

  ngOnInit(): void {
    this.transportService.getClassesList().subscribe((res:any) => {
      this.classes = res.data;

      if(this.selectedClass){
        this.mcqService.getSubjectList(this.selectedClass).subscribe((res:any) => {
          this.subjects = res.data.subject;
          this.batches = res.data.batch;
        });
      }
    });
    this.batchDropdownSettings = {
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
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      scrollX: true,
      stateSaveCallback: function(settings,data) {
        Object.assign(data,{
          class   : that.selectedClass,
          batch   : that.selectedBatches,
          subject : that.selectedSubject ,
        })
        localStorage.setItem('DataTables_' + URLConstants.RESULT_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.RESULT_LIST)
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
        { data: 'student' },
        { data: 'batch' },
        { data: 'exam' },
        { data: 'appear_date' },
        { data: 'total_marks' },
        { data: 'obtain_marks' }
      ]
    };
    this.batchdtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      stateSaveCallback: function(settings,data) {
        Object.assign(data,{
          class   : that.selectedClass,
          batch   : that.selectedBatches,
          subject : that.selectedSubject ,
        })
        localStorage.setItem('DataTables_' + URLConstants.RESULT_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.RESULT_LIST)
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
        this.getBatchResultList(dataTablesParameters,callback)
      },
     columns: [
        { data: 'class' },
        { data: 'batch' },
        { data: 'subject' },
        { data: 'exam' },
        { data: 'duration' },
        { data: 'total_student' },
        { data: 'passed_student' }
      ]
    };
  }

  setFormState(state:any) {
    this.selectedClass   = state?.class
    this.selectedBatches = state?.batch
    this.selectedSubject = state?.subject
  }

  getlist(dataTablesParameters?: any, callback?:any ){
    Object.assign(dataTablesParameters,{class:this.selectedClass,subject:this.selectedSubject,batches:this.selectedBatches});
    this.mcqService.getResultList(dataTablesParameters).subscribe((resp:any) => {
      this.results = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }

  getBatchResultList(dataTablesParameters?: any, callback?:any ){
    const currentYear = document.getElementById('currentYear');
    Object.assign(dataTablesParameters,{class:this.selectedClass,batches:this.selectedBatches,subject:this.selectedSubject,academicYear:currentYear});
    this.mcqService.getBatchResultList(dataTablesParameters).subscribe((resp:any) => {
      this.batchresults = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }

  get_for(t_for:any){
    this.for = t_for;
    this.reloadData();
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  changeClass(class_id:any){
    this.selectedSubject = this.selectedBatches = null;
    this.subjects = this.batches = [];
    this.mcqService.getSubjectList(class_id).subscribe((res:any) => {
      this.subjects = res.data.subject;
      this.batches = res.data.batch;
    });
    this.reloadData();
  }

}
