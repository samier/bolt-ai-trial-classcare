import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ReportService } from "../../report/report.service";
import { FeesService } from "src/app/modules/fees/fees.service";
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ViewAttachmentsComponent } from 'src/app/modules/academics/view-attachments/view-attachments.component';
import { DateFormatService } from 'src/app/service/date-format.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-student-bulk-discount-log',
  templateUrl: './student-bulk-discount-log.component.html',
  styleUrls: ['./student-bulk-discount-log.component.scss']
})
export class studentBulkDiscountLogComponent implements OnInit {
  //#region Public | Private Variables
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  tbody: any;
  sectionList: any = [];
  loading:any = false;
  filter:any = false;
  allChecked:any = false;
  classes: any = [];
  batches: any = [];
  fees_types:any = [];
  months:any = [];
  selectedStudentIds:any = []
  filterCount: any = 0;
  form: FormGroup | any;

  
  isOpenByClick: boolean = true

  amount_filters:any = [
    {id: '=', name: '='},
    {id: '>=', name: '>='},
    {id: '<=', name: '<='}
  ]

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public CommonService: CommonService,
    private reportService: ReportService,
    private formBuilder: FormBuilder,
    private feesService:FeesService,
    private router: Router,
    public  dateFormateService : DateFormatService,
    private modalService: NgbModal
  ) {  }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    let savedState = sessionStorage.getItem('student-bulk-discount-state');
    if(savedState){
      try{
        savedState = JSON.parse(savedState);
      }catch(error){
        savedState = null;
        sessionStorage.removeItem('student-bulk-discount-state')
      }
    }
    sessionStorage.removeItem('student-bulk-discount-state')
    this.initForm(savedState);
    this.countFilters();
    this.initDatatable();
    this.getSectionList();
    this.getFeesCategory(false);
    if(savedState){
      this.getClassesList(false);
      this.getBatchList(false);
      this.getCategoryFeesMonths(false);
    }
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
      order: [[0, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        {data: 'created_at', name : 'created_at'},
        {data: 'gr_number', name : 'studentCategoryFees.student.studentId'},
        {data: 'student_name', name : 'student_name'},
        {data: 'section_name' , name : 'section_name'},
        {data: 'class', name : 'studentCategoryFees.student.class.name'},
        // {data: 'batch', name : 'studentCategoryFees.student.batch_detail.name'},
        {data: 'batch', name : 'studentCategoryFees.student.batches_name'},
        {data: 'fees_category', name:'studentCategoryFees.category.type_name'},
        {data: 'month', name:'studentCategoryFees.month'},
        {data: 'amount', name:'studentCategoryFees.amount'},
        {data: 'paid_amount', name:'studentCategoryFees.paid_amount'},
        {data: 'discount_amount'},
        {data: 'remaining_fees'},
        {data: 'remark'},
        {data: 'createdBy.first_name'},
        {data: 'id' , orderable : false, searchable : false},
      ]
    };
  }

  initForm(savedState) {
    this.form = this.formBuilder.group({
      section: [savedState?.section || null],
      class: [savedState?.class || null],
      batch: [savedState?.batch || null],
      gender: [savedState?.gender || 'both'],
      fees_type: [savedState?.fees_type || null],
      month: [savedState?.month || null],
      date: [null],
      amount_filter: ['='],
      amount: [null],
    });
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.countFilters();
    this.loading = true;
    const payload = {
      section : this.CommonService.getID(this.form.value.section) ,
      class : this.form.value.class?.map((item:any)=>{return item.id}) || [],
      batch : this.form.value.batch?.map((item:any)=>{return item.id}) || [],
      fees_type : this.form.value.fees_type?.map((item:any)=>{return item.id}) || [],
      month : this.form.value.month || [],
      date : this.form.value.date,
      amount_filter : this.form.value.amount_filter || '=',
      amount : this.form.value.amount,
      gender : this.form.value.gender
    }
    dataTablesParameters = {...dataTablesParameters, filter : payload}
    this.feesService.getAppliedDiscounts(dataTablesParameters).subscribe((resp: any) => {
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
      this.loading = false;
    });
  }

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.form.value).forEach((item:any)=>{
      if(this.form.value[item] != '' && this.form.value[item] != null && item != 'amount_filter'){
        this.filterCount++;
      }
    })
    if(this.form.value?.date && this.form.value?.date?.startDate == null){
      this.filterCount--;
    }
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getSectionList() {
    this.countFilters();
    this.reportService.getSectionList({school:""}).subscribe((res: any) => {
      if (res.status) {
        this.sectionList = res.data;
      }
    });
  }

  getClassesList(reset = true){
    if(reset){
      this.countFilters();
      this.classes = [];
      this.batches = [];
      this.fees_types = [];
      this.months = [];
      this.form.get('class').setValue(null);
      this.form.get('batch').setValue(null);
      this.form.get('fees_type').setValue(null);
      this.form.get('month').setValue(null);
    }
    const payload = {
      section:  this.CommonService.getID(this.form.value.section)
    };
    this.reportService.getClassByMultipleSection(payload).subscribe((res: any) => { 
      this.classes = res?.data;
    });
  }

  getBatchList(reset = true){
    if(reset){
      this.countFilters();
      this.batches = [];
      this.fees_types = [];
      this.months = [];
      this.form.get('batch').setValue(null);
      this.form.get('fees_type').setValue(null);
      this.form.get('month').setValue(null);
      this.getFeesCategory();
    }
    let ids = this.form?.value?.class?.map((item: any) => {return item.id})
    this.reportService.getBatchesList({ classes: ids }).subscribe((res: any) => {
      this.batches = res?.data;
    });
  }

  getFeesCategory(reset = true){
    if(reset){
      this.countFilters();
      this.fees_types = [];
      this.months = []
      this.form.get('month').setValue(null);
    }
    let ids = this.form?.value?.class?.map((item: any) => {return item.id}) || [];
    this.feesService.getFeesCategories({class : ids}).subscribe((resp:any) => {
      this.fees_types = resp.data;
    })
  }

  getCategoryFeesMonths(reset = true){
    if(reset){
      this.countFilters();
      this.months = []
      this.form.get('month').setValue(null);
    }
    const payload = {
      class : this.form.value.class ? this.form?.value?.class?.map((item: any) => {return item.id}) : [],
      fees_type : this.form.value.fees_type ? this.form?.value?.fees_type?.map((item: any) => {return item.id}) : []
    }
    this.feesService.getFeesCategoryMonths(payload).subscribe((resp:any) => {
      this.months = resp.data;

    })
  }

  clearAll(){
    this.countFilters();
    this.form.reset();
    this.classes = [];
    this.batches = [];
    this.fees_types = [];
    this.months = [];
    this.reloadData();
    this.getFeesCategory();
    this.form.get('amount_filter').setValue('=');
    this.form.get('gender').setValue('both');
  }

  open(scf:any){
    this.router.navigate([this.setUrl(URLConstants.ACADEMICS),scf.student_category_fees?.student?.unique_id]);
  }

  viewAttachment(row){
    const modalRef = this.modalService.open(ViewAttachmentsComponent,{
      size: 'lg',
      centered: true,
    });
    modalRef.componentInstance.scf = row;
  }

  //#endregion Public methods
}

