import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ReportService } from "../../report/report.service";
import { FeesService } from "src/app/modules/fees/fees.service";
import { Toastr } from 'src/app/core/services/toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonService } from 'src/app/core/services/common.service';
import * as moment from 'moment';
import { status } from 'src/app/common-config/static-value';

@Component({
  selector: 'app-discount-student-list',
  templateUrl: './discount-student-list.component.html',
  styleUrls: ['./discount-student-list.component.scss']
})
export class DiscountStudentListComponent implements OnInit {
  //#region Public | Private Variables
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  tbody: any;
  sectionList: any;
  generating:any = false;
  filter:any = false;
  allChecked:any = false;
  classes: any = [];
  batches: any = [];
  selectedStudentIds:any = []
  filterCount: any = 0;
  permissions: any;
  // formGroup!:FormGroup
  studentFilterForm: FormGroup | any;
  StudentStatus:any = status

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    private commonService: CommonService,
    private reportService: ReportService,
    private formBuilder: FormBuilder,
    private feesService:FeesService,
    private toaster:Toastr,
  ) {  }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this.initDatatable();
    this.getSectionList();
    this.getClassesList();
    this.getPermissionsList();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  initDatatable(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      lengthMenu:[50,100,200],
      pageLength: 50,
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      order: [[1, 'asc']],
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        {data: 'checkbox', orderable: false, searchable: false},
        {data: 'class.section.name', name : 'class.section.name'},
        {data: 'class.name', name : 'class.name'},
        {data: 'batch_detail.name', name : 'batch_detail.name'},
        {data: 'first_name', name: 'first_name'},
      ]
    };
  }

  initForm() {
    this.studentFilterForm = this.formBuilder.group({
      section: [],
      classes: [],
      batches: [],
      status: [2],
      date: []
    });
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.countFilters();
    const customSearchData = {
      section: this.studentFilterForm.value?.section,
      classes: this.studentFilterForm.value?.classes?.map((item: any) => item.id),
      batches: this.studentFilterForm.value?.batches?.map((item: any) => item.id),
      status: this.studentFilterForm.value?.status,
    };
    this.feesService.discountApplicableStudentList(Object.assign(dataTablesParameters,customSearchData)).subscribe((resp: any) => {
      this.tbody = resp?.data;
      this.allChecked = false;
      this.selectedStudentIds = [];
      callback({
        recordsTotal: resp?.recordsFiltered,
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

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.studentFilterForm.value).forEach((item:any)=>{
      if(this.studentFilterForm.value[item] != '' && this.studentFilterForm.value[item] != null && item != 'date'){
        this.filterCount++;
      }
    })
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getSectionList() {
    this.reportService.getSectionList({school:""}).subscribe((res: any) => {
      if (res.status) {
        this.sectionList = res.data;
      }
    });
  }

  getClassesList(){
    this.classes = [];
    this.batches = [];
    this.studentFilterForm.get('classes').setValue(null);
    this.studentFilterForm.get('batches').setValue(null);
    this.reportService.getStudentClassList(this.studentFilterForm.value.section).subscribe((res: any) => {
      this.classes = res?.data;
    });
  }

  getBatchList(){
    this.batches = [];
    this.studentFilterForm.get('batches').setValue(null);
    let ids = this.studentFilterForm?.value?.classes?.map((item: any) => item.id);
    this.reportService.getBatchesList({ classes: ids }).subscribe((res: any) => {
      this.batches = res?.data;
    });
  }

  checkRecordsSelected() {
    return this.selectedStudentIds.length > 0
  }

  /**
   * Handle select all
   * @param event
   */
  handleSelectAll(event: any) {
    const checked = event.target.checked;
    this.tbody.forEach(student => {
      student.selected = checked;
      if (checked) {
        this.selectedStudentIds.push(student.id);
      } else {
        const index: number = this.selectedStudentIds.indexOf(student.id);
        if (index !== -1) {
          this.selectedStudentIds.splice(index, 1);
        }
      }
    });
  }

  /**
   * Handle single select
   * @param event
   * @param id
   */
  handleSelect(event: any, id: any) {
    if (event.target.checked) {
      this.selectedStudentIds.push(id);
    } else {
      const index: number = this.selectedStudentIds.indexOf(id);
      if (index !== -1) {
        this.selectedStudentIds.splice(index, 1);
      }
    }
    this.allChecked = this.selectedStudentIds.length == this.tbody?.length;
  }

  clearAll(event:any){
    event.stopPropagation();
    this.studentFilterForm.reset();
    this.getClassesList();
    this.reloadData();
  }

  generate(){
    if(!this.studentFilterForm.value.date){
      this.toaster.showError('Please select receipt date');
      return;
    }
    const date = moment(this.studentFilterForm.value.date).format('DD-MM-yyyy');
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure ?',
      text: 'You want to generate the discount fee receipt for this date '+date+' ?',
      showCancelButton: true,
      confirmButtonColor: '#f28726',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    })
    .then((result) => {
      if (result.isConfirmed) {
        this.generateDiscountReceipt();
      }
    })
  }

  generateDiscountReceipt(){
    this.generating = true;
    const params = {
      students : this.selectedStudentIds,
      payment_date: this.studentFilterForm.value.date
    };
    this.feesService.generateDiscountReceipt(params).subscribe((response:any)=>{
      if(response.status){
        this.toaster.showSuccess(response.message);
        this.reloadData();
      }else{
        this.toaster.showError(response.message);
      }
      this.generating = false;
    },(error:any)=>{
      this.generating = false;
      this.toaster.showError(error.error.message);
    });
  }

  getPermissionsList(){
    this.feesService.getPermissionsList({permission:true}).subscribe((response:any) => {
      this.permissions = response.data;
    });
  }

  changePaymentDate(event){
    const today = new Date();
    const date = new Date(event.target.value);
    const today_string = this.commonService.changeDateFormat(new Date());
    if (today.getTime() < date.getTime()) {
      event.target.value = today_string;
      this.studentFilterForm.get('date').setValue(today_string);
      this.toaster.showError('Future Date Not Allowed');
    }else if(this.permissions?.back_date != 1 && today.getTime() > date.getTime()){
      event.target.value = today_string;
      this.studentFilterForm.get('date').setValue(today_string);
      this.toaster.showError('Past Date Not Allowed');
    }
  }


  //#endregion Public methods
}

