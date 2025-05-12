import { Component, OnInit, ViewChild, Pipe } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { SchoolNameService } from '../../school-name/school-name.service';
import { CommonService } from 'src/app/core/services/common.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import dayjs from 'dayjs';
import { ReportService } from '../report.service';
import { C } from '@angular/cdk/keycodes';
import { DomSanitizer } from '@angular/platform-browser';
import { Toastr } from 'src/app/core/services/toastr';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-master-fees-report',
  templateUrl: './master-fees-report.component.html',
  styleUrls: ['./master-fees-report.component.scss']
})
export class masterFeesReportComponent {
  @Pipe({ name: 'safeHtml' })
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  tbody:any;
  branch:any;
  constructor(private schoolNameService:SchoolNameService, public CommonService: CommonService, private ReportService: ReportService, private sanitizer: DomSanitizer, private toastr: Toastr, private _dateFormateService:DateFormatService) { }
  transform(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  html:any
  params:any = {
    start_date: null,
    end_date: null,
    branches: [],
    academic_year_id: [],
    section_id: [],
    class_id: [],
    batch_id : [],
    trust_id: [],
    fees_collector_id: [],
    category_id: [],
    months: [],
    payment_mode_id: [],
    student_status: 'all',
    rte: '',
    old_new: '',
    refund: '',
    with_discount: '',
    order_type: false,
    cancel_receipt: false,
    delete_receipt: false,
    pending_cheque: false,
    limit: 10,
    page: 1,
    offset: 0,
    date_toggle : false,
    column_data: [],
    payment_note: '',
  }
  data = [];
  template_name = '';
  record = 10;
  templateList:any = [];
  selectedTemplate:any

  branchDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'branchName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  academicDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'year',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  sectionDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  classDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  batchDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  trustDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  feesCategoryDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'type_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  modeDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  collectorNameDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'full_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  monthDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'full_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  columnDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'name',
    textField: 'column',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  branches:any = [];
  academic_years:any = [];
  sections:any = [];
  classes:any = [];
  batches:any = [];
  trusts:any = [];
  fees_categories:any = []
  months:any = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  payment_modes:any = [];
  collector_name:any = [];

  pages:any = [];
  lastPage = 0
  getDataLoading = false;
  pdfLoading = false
  excelLoading = false;
  isSubmitTemplate:boolean = false

  ranges: any = {
    'Today': [dayjs(), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')]
  };

  columns = [
    {column: 'Unique Id', name: "unique_id"},
    {column: 'Phone Number', name: "phone_number"},
    {column: 'Father Number', name: "father_number"},
    {column: 'Mother Number', name: "mother_number"},
    {column : 'Payment Mode', name : "mode"},
    {column : 'Bank Name', name : "bank_name"},
    {column : 'Bank Details', name : "bank_details"},
    {column : 'Category Name', name : "category_name"},
    {column : 'Payment Note', name : "payment_note"},
    {column : 'User Status', name : "user_status"},
    {column : 'Collector', name : "collector"}
  ];
  selectedRange: any =  null;
  dateConfig: any = {
    applyLabel: 'Apply',
    format: 'YYYY-MM-DD',
    displayFormat: this._dateFormateService.getFormat(),
    cancelLabel: 'Cancel',
    clearLabel: 'Clear'
  }

  all_quarters:any;
  is_quarter_wise_fees:boolean = false;
  is_quarter_wise_fees_setting:any;

  ngOnInit(): void {
    this.getTemplateList();
    this.getBranchList();
    this.getFeesCategories();
    this.getPaymentMode();
    this.getFeesCollector();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'name' },
        { data: 'location'},
        { data: 'contactNo'},
        { data: 'secondContactNo' },
        { data: 'address' },
        { data: 'city' },
        { data: 'udiseNo' },
        { data: 'sscIndexNo' },
        { data: 'hscIndexNo' },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  pagination(){
    if(this.params.limit != 'all'){
      let pages = Math.ceil(this.record/this.params.limit)
      let pagination:any = [];
      this.lastPage = pages

      if (pages <= 5) {
          // If there are 5 or fewer pages, just show them all
          for (let index = 0; index < pages; index++) {
              pagination.push(index + 1);
          }
      } else {
          if (this.params.page <= 3) {
              // Show the first 5 pages and '...' if the current page is 1, 2, or 3
              for (let index = 0; index < 5; index++) {
                  pagination.push(index + 1);
              }
              pagination.push('...');
              pagination.push(this.lastPage);
          } else if (this.params.page > 3 && this.params.page < pages - 2) {
              // Show '...' before and after the current page if it's between 4 and (total pages - 3)
              pagination.push(1);
              pagination.push('...');
              for (let index = this.params.page - 1; index <= this.params.page + 1; index++) {
                  pagination.push(index);
              }
              pagination.push('...');
              pagination.push(this.lastPage);
          } else {
              // Show '...' before the last 5 pages if the current page is near the end
              pagination.push(1);
              pagination.push('...');
              for (let index = pages - 5; index < pages; index++) {
                  pagination.push(index + 1);
              }
          }
      }

      this.pages = pagination;
      this.params.offset = (this.params.page - 1) * this.params.limit
    }else{
      this.pages = [1];
      this.params.offset = 0
      this.lastPage = 1
    }
  }

  handleLimitChange(){
    this.params.page = 1;
    this.pagination()
    this.getReport();
  }

  getReport(type?:any){
    if(!type){
      this.params.page = 1;
      this.params.offset = 0;
    }
    this.getDataLoading = true;
    if(this.params.branches.length == 0){
      this.getDataLoading = false;
      return this.toastr.showInfo('Please select branch.', 'INFO');
    }
    if(this.params.section_id.length == 0){
      this.getDataLoading = false;
      return this.toastr.showInfo('Please select section.', 'INFO');
    }
    let data = {
      start_date : this.params.start_date,
      end_date : this.params.end_date,
      branch : this.params.branches.map((x:any) => x.id),
      academic_year_id : this.params.academic_year_id.map((x:any) => x.id),
      section_id : this.params.section_id.map((x:any) => x.id),
      class_id : this.params.class_id.map((x:any) => x.id),
      batch_id : this.params.batch_id.map((x:any) => x.id),
      payment_mode_id : this.params.payment_mode_id.map((x:any) => x.id),
      student_status : this.params.student_status,
      rte : this.params.rte,
      old_new : this.params.old_new,
      fees_collector_id : this.params.fees_collector_id.map((x:any) => x.id),
      category_id : this.params.category_id.map((x:any) => x.id),
      is_cancelled : this.params.cancel_receipt == false ? 0 : 1,
      is_deleted : this.params.delete_receipt == false ? 0 : 1,
      cheque_status : this.params.pending_cheque,
      order_by : 'receipt_no',
      order_type : this.params.order_type == false ? 'ASC' : 'DESC',
      trust_id : this.params.trust_id.map((x:any) => x.id),
      is_discount : this.params.with_discount,
      month : this.params.months,
      refund : this.params.refund,
      offset : this.params.offset,
      limit: this.params.limit == this.record ? this.record : this.params.limit,
      date_toggle: this.params.date_toggle,
      column_data: this.params.column_data.map((x:any) => x.name),
      payment_note: this.params.payment_note,
      page: this.params.page,
      last_page: this.lastPage,
    }
    if(this.is_quarter_wise_fees){
      data.month = this.CommonService.getMonthsFromQuarter(this.all_quarters,this.params?.quarter??[]);
    }
    this.ReportService.getMasterFeesReport(data).subscribe((resp:any)=>{
      this.html = this.sanitizer.bypassSecurityTrustHtml(resp.html);
      this.record = resp.totalRecord
      if(this.params.limit == this.record || (this.params.limit > 100 && this.params.limit != this.record)){
        this.params.limit = this.record
      }
      this.pagination();
      this.getDataLoading = false;
    },(err:any)=>{
      console.log(err);
      this.getDataLoading = false;
    });
  }

  downloadReport(type:any){
    if(type == 'pdf'){
      this.pdfLoading = true;
    }
    if(type == 'excel'){
      this.excelLoading = true;
    }
    if(this.params.branches.length == 0){
      this.pdfLoading = false;
      this.excelLoading = false;
      return this.toastr.showInfo('Please select branch.', 'INFO');
    }
    if(this.params.section_id.length == 0){
      this.pdfLoading = false;
      this.excelLoading = false;
      return this.toastr.showInfo('Please select section.', 'INFO');
    }
    let data = {
      start_date : this.params.start_date,
      end_date : this.params.end_date,
      branch : this.params.branches.map((x:any) => x.id),
      academic_year_id : this.params.academic_year_id.map((x:any) => x.id),
      section_id : this.params.section_id.map((x:any) => x.id),
      class_id : this.params.class_id.map((x:any) => x.id),
      batch_id : this.params.batch_id.map((x:any) => x.id),
      payment_mode_id : this.params.payment_mode_id.map((x:any) => x.id),
      student_status : this.params.student_status,
      rte : this.params.rte,
      old_new : this.params.old_new,
      fees_collector_id : this.params.fees_collector_id.map((x:any) => x.id),
      category_id : this.params.category_id.map((x:any) => x.id),
      is_cancelled : this.params.cancel_receipt == false ? 0 : 1,
      is_deleted : this.params.delete_receipt == false ? 0 : 1,
      cheque_status : this.params.pending_cheque,
      order_by : 'receipt_no',
      order_type : this.params.order_type == false ? 'ASC' : 'DESC',
      trust_id : this.params.trust_id.map((x:any) => x.id),
      is_discount : this.params.with_discount,
      month : this.params.months,
      refund : this.params.refund,
      offset : this.params.offset,
      limit : this.params.limit,
      date_toggle: this.params.date_toggle,
      column_data: this.params.column_data.map((x:any) => x.name),
      payment_note: this.params.payment_note,
      page: this.params.page,
      last_page: this.lastPage,
    }

    this.ReportService.downloadMasterFeesReport(data, type).subscribe((resp:any)=>{
      this.downloadFile(resp, 'fees-report', type)
      this.pdfLoading = false;
      this.excelLoading = false;
    },(err:any)=>{
      console.log(err);
      this.pdfLoading = false;
      this.excelLoading = false;
    });
  }

  downloadFile(res: any,file: any, format:any) {
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if(format == 'pdf'){
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      setTimeout(function(){
        iframe.contentWindow?.print();
      },200)

    }else{
      let a = document.createElement('a');
      a.download = fileName;
      a.href =  pdfSrc
      a.click();
    }
  }

  saveTemplate(){
    this.isSubmitTemplate = true;
    if (this.template_name == '' || this.template_name == null) {
      return;
    }
    let data = {
      template_name: this.template_name,
      template_data: this.params,
      type: 1,
    }
    if (this.selectedTemplate) {
      this.ReportService.updateTemplate(this.selectedTemplate, data).subscribe(
        (resp: any) => {
          this.isSubmitTemplate = false;
          if (resp.status) {
            this.toastr.showSuccess(resp.message);
          }
          // this.template_name = '';
          // this.selectedTemplate = null;
          this.getTemplateList();
        }
      );
    } else {
      this.ReportService.storeMasterTemplate(data).subscribe((resp: any) => {
        this.isSubmitTemplate = false;
        if (resp.status) {
          this.toastr.showSuccess(resp.message);
        }
        // this.template_name = '';
        // this.selectedTemplate = null;
        this.getTemplateList();
      });
    }
  }

  getTemplateList(){
    const data: any = {
      type: 1,
    };
    this.ReportService.getTemplateList(data).subscribe((resp:any) => {
      if(resp.status){
        this.templateList = resp.data
      }
    })
  }

  templateChange(){
    let template = this.templateList.find((x:any) => x.id == this.selectedTemplate);
    this.template_name = template.template_name
    this.params = template.template_fields
    this.params.refund = template.template_fields.refund??""
    this.params.with_discount = template.template_fields.with_discount??""
    this.params.payment_note = template.template_fields.payment_note??""
    this.params.delete_receipt = template.template_fields.delete_receipt?? 0
    this.params.rte = template.template_fields.rte??""
    this.params.old_new = template.template_fields.old_new??""
    if(template.template_fields.start_date != null && template.template_fields.end_date != null){
      this.selectedRange = {startDate:  dayjs(template.template_fields.start_date), endDate: dayjs(template.template_fields.end_date)};
    }

    this.handleBranchChange(this.params.branches, 'all','template');
    this.handleChangeSection(this.params.section_id, 'all', 'template');
    this.handleChangeClass(this.params.class_id, 'all', 'template');
    this.getFeesCollector()
  }

  datesUpdated(event) {
    if (event.startDate) {
      this.params.start_date = event.startDate.format('YYYY-MM-DD')
    }
    else{
      this.params.start_date = null;
    }
    if (event.endDate) {
      this.params.end_date = event.endDate.format('YYYY-MM-DD')
    }else{
      this.params.end_date = null;
    }
    if(event.endDate?.$d == 'Invalid Date') {
      this.selectedRange= {
        startDate: event.startDate,
        endDate: event.startDate
      };
      this.params.end_date = event.startDate.format('YYYY-MM-DD')
    } else {
      this.params.end_date  = event.endDate ?event.endDate.format('YYYY-MM-DD') : null
    }
    // this.getUserList();
  }

  URLConstants=URLConstants;

  loadData(dataTablesParameters?: any, callback?:any ){
    dataTablesParameters = {
      ...dataTablesParameters,
    };

    this.schoolNameService.schoolList(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;

      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
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

  getBranchList(){
    this.ReportService.getBranchList().subscribe((resp:any) => {
      this.branches = resp.data;
    })
  }

  checkSettings(ids: number[]) {
      if (ids.length === 0) {
        return true;
      }
      const firstSetting = this.is_quarter_wise_fees_setting[ids[0]];
      const allSame = ids.every(id => this.is_quarter_wise_fees_setting[id] === firstSetting);
      if(!allSame){
        this.toastr.showError('Selected branches fees type is different');
        return true;
      }
      this.is_quarter_wise_fees = firstSetting == 1 ? true : false;
      console.log(this.is_quarter_wise_fees);
      return firstSetting;
  }

  handleBranchChange(event:any, selectType:any, type?:any){
    if(type != 'template'){
      this.params.section_id = []
      this.sections = [];
      this.params.academic_year_id = []
      this.academic_years = [];
      this.params.class_id = []
      this.classes = [];
      this.params.batch_id = []
      this.batches = [];
    }
    this.params.branches = selectType == 'all' ? event : this.params.branches

    let data = {
      branches : this.params.branches.map((x:any) => x.id)
    }

    if(this.checkSettings(data.branches) === true){
      data.branches = [];
      this.params.branches = [];
      if(selectType == 'all'){
        setTimeout(()=>{
          this.params.branches = [];
        },50)
      }
    }

    this.ReportService.getAcademicYar(data).subscribe((resp:any) => {
      this.academic_years = resp.data.sort(function(a:any, b:any) {
        return - ( b.branch_id - a.branch_id );
      });
    })

    this.getSections();
    if(type != 'template'){
      this.getFeesCollector()
    }
  }

  getSections(){
    let data = {
      branches : this.params.branches.map((x:any) => x.id)
    }
    this.ReportService.getSections(data).subscribe((res: any) => {
      if (res.status) {
        this.sections = res.data;
      }
    });
  }

  handleChangeSection(event:any, selectType:any, type?:any){
    if(type != 'template'){
      this.params.class_id = [];
      this.classes = [];
      this.params.batch_id = [];
      this.batches = [];
    }
    // this.classChange()
    this.params.section_id = selectType == 'all' ? event : this.params.section_id;
    let branch = this.params.branches.map((x:any) => x.id)
    let academic = this.params.academic_year_id.length > 0 ? this.params.academic_year_id.map((x:any) => x.id) : this.academic_years.map((x:any) => x.id)
    let sections = this.params.section_id.map((x:any) => x.id)
    this.ReportService.getClassListForMaster(sections, branch, academic).subscribe((res: any) => {
      if (res.status) {
        this.classes = res.data;
      }
    });
    if(type != 'template'){
      this.getFeesCollector()
    }
  }

  handleChangeClass(event:any, selectType:any, type?:any){
    if(type != 'template'){
      this.params.batch_id = []
      this.batches = [];
    }
    this.params.class_id = selectType == 'all' ? event : this.params.class_id
    let data = this.params.class_id.map((x:any) => x.id)
    this.ReportService.getBatchesByClass(data).subscribe(
      (res: any) => {
        this.batches = res.data;
      }
    );
    if(type != 'template'){
      this.getFeesCollector()
    }
  }

  getFeesCategories(){
    let data = {
      branch : this.params.branches.map((x:any) => x.id)
    }
    this.ReportService.getFeesCategories(data).subscribe((resp:any) => {
      if(resp.status){
        this.trusts = resp.data.trusts
        this.fees_categories = resp.data.feesCategories
        this.all_quarters = resp?.data?.quarters;
        this.is_quarter_wise_fees_setting = resp?.data?.is_quarter_wise_fees;
      }else{
        this.toastr.showError(resp.message);
      }
    })
  }

  getPaymentMode(){
    this.ReportService.getPaymentMode().subscribe((resp:any) => {
      this.payment_modes = resp.data
    })
  }

  getFeesCollector(){
    this.ReportService.getFeesCollector(this.params).subscribe((resp:any) => {
      this.collector_name = resp.data
    })
  }

  handleYeaSection(event:any, selectType:any){
    this.params.section_id = [];
    this.params.class_id = []
    this.classes = [];
    this.params.batch_id = []
    this.batches = [];

    this.params.academic_year_id = selectType == 'all' ? event : this.params.academic_year_id
    // let academic = this.params.academic_year_id.map((x:any) => x.id)[0]
    // this.ReportService.getClassListForMaster(this.params.section_id, this.params.branches, academic).subscribe((res: any) => {
    //   if (res.status) {
    //     this.classes = res.data;
    //   }
    // });
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  prev(){
    this.params.page = this.params.page - 1;
    this.pagination()
    this.getReport('page');
  }

  next(){
    this.params.page = this.params.page + 1;
    this.pagination()
    this.getReport('page');

  }

  jumpToPage(page:any){
    this.params.page = page;
    this.pagination()
    this.getReport('page');
  }

  clear(){
      this.selectedRange = null,
      this.params.start_date = null;
      this.params.end_date = null;
      this.params.branches = [];
      this.params.academic_year_id = [];
      this.academic_years = [];
      this.params.section_id = [];
      this.sections = [];
      this.params.class_id = [];
      this.classes = [];
      this.params.batch_id  = [];
      this.batches = [];
      this.params.trust_id = [];
      this.params.fees_collector_id = [];
      this.params.category_id = [];
      this.params.months = [];
      this.params.payment_mode_id = [];
      this.params.student_status = 'all';
      this.params.rte = '';
      this.params.old_new = '';
      this.params.refund = '';
      this.params.with_discount = '';
      this.params.cancel_receipt = false;
      this.params.delete_receipt = false;
      this.params.pending_cheque = false;
      this.params.limit = 10;
      this.params.page = 1;
      this.params.offset = 0;
      this.params.date_toggle = false
      this.html = null;
      this.selectedTemplate = null
      this.params.column_data = [];
      this.params.order_type = false;
      this.params.payment_note = ''
      this.template_name = ''
      this.params.quarter = []
      this.getBranchList();
      this.getTemplateList();
      this.getFeesCollector();
  }

  deleteTemplate() {
    if (this.selectedTemplate) {
      this.ReportService.deleteTemplateList(this.selectedTemplate).subscribe(
        (res: any) => {
          if (res.status) {
            this.toastr.showSuccess(res.message);
            this.getTemplateList();
            this.clear()
          }
        }
      );
    }
  }

  // resetTemplateData() {
  //   this.selectedTemplate = null;
  //   this.template_name = '';

  //   this.classes = []
  //   this.batches = []
  //   this.params = {
  //     start_date: null,
  //     end_date: null,
  //     branches: [],
  //     academic_year_id: [],
  //     section_id: [],
  //     class_id: [],
  //     batch_id : [],
  //     trust_id: [],
  //     fees_collector_id: [],
  //     category_id: [],
  //     months: [],
  //     payment_mode_id: [],
  //     student_status: 'all',
  //     refund: '',
  //     with_discount: '',
  //     order_type: false,
  //     cancel_receipt: false,
  //     pending_cheque: false,
  //     limit: 10,
  //     page: 1,
  //     offset: 0,
  //     date_toggle : false,
  //     column_data: [],
  //     payment_note: '',
  //   }
  //   this.tbody = []
  //   this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
  //     dtInstance.destroy();
  //   });
  // }
}
