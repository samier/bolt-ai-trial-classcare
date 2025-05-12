import { Component, OnInit, ViewChild, ChangeDetectorRef} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentRemarkService } from '../student-remark.service';
import { ReportService } from "../../report/report.service";
import { DateFormatService } from 'src/app/service/date-format.service';
import { remarkType } from 'src/app/common-config/static-value';
import { LeaveManagmentService } from '../../leave-management/leave-managment.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-student-remark-list',
  templateUrl: './student-remark-list.component.html',
  styleUrls: ['./student-remark-list.component.scss']
})
export class StudentRemarkListComponent implements OnInit {
  //#region Public | Private Variables
    URLConstants = URLConstants;
    dtOptions: DataTables.Settings = {};
    @ViewChild(DataTableDirective, {static: false})
    datatableElement: DataTableDirective | null = null;
    tbody: any;
    sectionList: any = [];
    classes: any = [];
    batches: any = [];
    filterCount: any = 0;
    filter:any = false;
    isPdfLoading: boolean = false;
    isExcelLoading: boolean = false;
    remarkFilterForm: FormGroup | any;
    remarkType: any = remarkType;
    remarkTitle: any = null;
    title: any;
    custom: boolean = false;
    students:any = [];
    searchText:any;
    pageSize = 50;
    currentPage = 0;
    student:any = [];
    studentIds:any = [];
    selectedStudent: any = [];
    dropdownSettings:IDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      itemsShowLimit: 3,
    };

    //#endregion Public | Private Variables

    // --------------------------------------------------------------------------------------------------------------
    // #region constructor
    // --------------------------------------------------------------------------------------------------------------

  constructor(
    private formBuilder: FormBuilder,
    private toaster:Toastr,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    public studentRemarkService: StudentRemarkService,
    public reportService: ReportService,
    public dateFormatService: DateFormatService,
    public leaveManagmentService : LeaveManagmentService,
    private cdr: ChangeDetectorRef,
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.initDatatable();
    this.getAllStudent();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  initDatatable(){
    const that = this
    this.dtOptions = {      
      pagingType: 'full_numbers',
      lengthMenu:[50,100,200],
      pageLength: 50,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      order: [[0, 'desc']],
      stateSave: true,
      stateSaveCallback: function(settings,data) {
        Object.assign(data,{
          date : that.remarkFilterForm.value.date ,
          remarkType   : that.remarkFilterForm.value.remarkType ,
          remarkTitle   : that.remarkFilterForm.value.remarkTitle ,
          student   : that.remarkFilterForm.value.student ,
        })
        localStorage.setItem('DataTables_' + URLConstants.STUDENT_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.STUDENT_LIST)
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
        this.loadData(dataTablesParameters, callback)
      },
      columns: [        
        {data: 'updated_at'},
        {data: 'student.first_name'},
        {data: 'remark.remark_type'},
        {data: 'comment'},
        {data: 'user.first_name'},
        {data: 'action', orderable: false, searchable: false},
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.countFilters();
    this.studentIds = this.selectedStudent ? this.selectedStudent.map(student => student.id) : this.selectedStudent;
    this.remarkFilterForm.value.student = this.studentIds;
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.remarkFilterForm.value
    };
    dataTablesParameters.start_date = dataTablesParameters?.date?.startDate ? dataTablesParameters?.date.startDate.format('DD-MM-YYYY') : null
    dataTablesParameters.end_date = dataTablesParameters?.date?.endDate ? dataTablesParameters?.date.endDate.format('DD-MM-YYYY') : null    
    this.studentRemarkService.getStudentRemarkList(dataTablesParameters).subscribe((resp: any) => {      
      this.tbody = resp?.data;
      callback({
        recordsTotal: resp?.recordsTotal,
        recordsFiltered: resp?.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  clearAll(event:any){
    if(event){
      event.stopPropagation();
    }
    this.remarkFilterForm.reset();
    this.remarkTitle = null;
    this.reloadData();
  }

  deleteRemark(id:any){
    let confirm = window.confirm('Are you sure you want to delete?')
    if(confirm){
      this.studentRemarkService.deleteRemark(id,{studentId: id}).subscribe((res: any) => {
        if(res.status){
          this.reloadData();
          this.toaster.showSuccess(res.message);
        }else{
          this.toaster.showError(res.message);
        }
      });
    }
  }  

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.remarkFilterForm.value).forEach((item:any)=>{
      if((this.remarkFilterForm.value[item] != '' && this.remarkFilterForm.value[item] != null) || item == 'status'){
        this.filterCount++;
      }
    })
    if(this.remarkFilterForm.value?.date && this.remarkFilterForm.value?.date?.startDate == null){
      this.filterCount--;
    }
  }

  changeRemarkType(item:any)
  {
    this.studentRemarkService.getRemarkTitle({remark_type:item?.id}).subscribe((res:any) => {
      this.title = res?.data;
      this.remarkTitle = this.title.map((ele) => {
        return { id: ele?.id, name: ele?.remark }
      })        
    });
  }

  changeFn(val:any){    
    this.searchText = '';
    this.cdr.detectChanges();
    // this.searchFilter();    
  }

  resetScroll(){
    this.pageSize = 50; 
    this.currentPage = 0;
    this.students = [];
  }
  
  loadItems() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    var newItems;    
    if(this.searchText){
      newItems = this.student.filter((item:any)=>item?.name?.toLowerCase().includes(this.searchText?.toLowerCase()) );
      newItems = newItems?.slice(startIndex, endIndex);
    }else{
      newItems = this.student.slice(startIndex, endIndex);
    }      
    this.students = [...this.students, ...newItems];
    this.currentPage++;
  }

  onScroll(event:any) {
    var Faculty_length = 0;
    if(this.searchText){
      Faculty_length = this.student.filter((item:any)=>item?.name?.toLowerCase().includes(this.searchText?.toLowerCase()) ).length; 
    }else{
      Faculty_length = this.student?.length;
    }
    if(Faculty_length > 0 && this.students?.length > 0 && this.students?.length < Faculty_length && event.end == this.students?.length){
      this.loadItems();
    }
  }

  searchFilter(){
    this.resetScroll();
    this.loadItems();
  }

  getAllStudent(){
    this.resetScroll();
    this.searchText = '';
    this.leaveManagmentService.getAllStudent().subscribe((res:any) => {
     this.students=res.data;
     this.loadItems();
     if(res.data != undefined){
      // this.selectedStudent = res.data[0]?.id;
     }
    }); 
  }
  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.remarkFilterForm = this.formBuilder.group({
      date: [null],
      remarkType: [null],
      remarkTitle: [null],
      student: [null],
    });
  }

  setFormState(state) {
    this.remarkFilterForm.controls['date'].patchValue(state?.date || null )
    this.remarkFilterForm.controls['remarkType'].patchValue(state?.remarkType || null )
    this.remarkFilterForm.controls['remarkTitle'].patchValue(state?.remarkTitle || null )
    this.remarkFilterForm.controls['student'].patchValue(state?.student || null )
  }

  //#endregion Private methods
}