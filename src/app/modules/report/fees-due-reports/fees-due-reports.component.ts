import { Component, ElementRef, OnInit, Pipe, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { ReportService } from '../report.service';
import { Toastr } from 'src/app/core/services/toastr';
import { LatLongDirective } from '../../transport-management/stops-form/latlong.directive';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CommonService } from 'src/app/core/services/common.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-fees-reports',
  templateUrl: './fees-due-reports.component.html',
  styleUrls: ['./fees-due-reports.component.scss'],
})
export class FeesDueReportsComponent implements OnInit {
  @Pipe({ name: 'safeHtml' })
  dtOptions: DataTables.Settings = {};
  dtOptionsType2: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  @ViewChild('from_date', { static: false }) from_date: ElementRef | undefined;
  @ViewChild('to_date', { static: false }) to_date: ElementRef | undefined;

  commonDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
    limitSelection:6,
  };
  dropdownList = [];
  selectedItems = [];
  dtRendered=false;
  dtRendered2=true;
  field_list:any=[];
  list:any = [];
  student_field_list: any = [];
  tbody: any;
  paginateData:any;
  lastPage:any;
  pages:any;
  constructor(private ReportService: ReportService, private toastr: Toastr, public commonService: CommonService, private sanitizer: DomSanitizer) {}
  transform(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  URLConstants = URLConstants;
  dropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

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

  typeDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    // idField: 'id',
    textField: 'type_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  columnDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  routeDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  classes = [];
  selectedClass = [];

  batches = [];
  selectedBatch = [];

  fees_types:any = [];
  selectedFeesType = [];
  public isSchool:any = ('; '+document.cookie)?.split(`; ISSCHOOL=`)?.pop()?.split(';')[0];

  // months:any = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  months:any = [];
  schools = [{ id: '', name: 'All' }];
  branches = [{ id: null, branchName: 'All' }];
  selectedMonths = [];
  sections = [{ id: '', name: 'All' }];
  trusts:any = []
  status = [{ id: '1', name: 'Fully Paid' },{ id: '3', name: 'Fully Unpaid' }, { id: '2', name: 'Partially Paid' }]
  fees:any;
  academic_years:any = [];

  getDataLoading = false;
  pdfLoading = false;
  excelLoading = false;
  checked:any = false;
  recordsTotal = 0;

  params:any = {
    branch: [],
    section: [],
    class: [],
    batch: [],
    fees_type: [],
    month: null,
    pay_type: [],
    student_field:[],
    type: 1,
    report: false,
    academic_year: [],
    report_type: '1',
    columns: [],
    routes: [],
    transport_mode: null,
    student_status: '1',
    student_transport_status: 'all',
    student_hostel_status: 'all',
    student_meal_status: '1',
    category_wise_due: false,
    category_wise_paid: false,
    student_rte_status: '',
    student_old_new: '',
    limit: 50,
    page: 1,
    filter: 'all',
    amount: 0,
  };
  amount  = 0;

  selected:any = []
  columns:any = [];
  routes:any = []
  fees_type_status = [];

  templateList = []
  selectedTemplate
  templateName = ''
  isSubmitTemplate : boolean = false
  selectedTemplateData

  html:any;
  all_quarters:any;
  quarters:any;
  is_quarter_wise_fees:boolean = false;
  is_quarter_wise_fees_setting:any;
  system_setting_fees_due_amount:any

  ngOnInit() {
    this.getTemplateList()
    this.getStudentCustomColumns()
    this.getBranchList();
    this.getFeesCategories();
    this.ReportService.getClassList(this.params.section).subscribe((res: any) => {
      if (res.status) {
        this.classes = res.data;
      }
    });
    this.getFeesTableAllFieldList();
    // this.loadData();

    // this.dtOptions = {
    //   pagingType: 'full_numbers',
    //   pageLength: 10,
    //   serverSide: true,
    //   processing: true,
    //   searching: true,
    //   scrollX: true,
    //   scrollCollapse: true,
    //   ajax: (dataTablesParameters: any, callback) => {
    //     this.loadData(dataTablesParameters, callback);
    //   },
    //   columns: [
    //     { data: 'check',orderable:false,searchable:false},
    //     { data: 'roll_no' },
    //     { data: 'student_name' },
    //     { data: 'gr_number' },
    //     { data: 'unique_id' },
    //     { data: 'class' },
    //     { data: 'batch' },
    //     { data: 'payment_status' },
    //     { data: 'payable_amount' },
    //     { data: 'discount_amount' },
    //     { data: 'paid_amount' },
    //     { data: 'current_due' },
    //     { data: 'total_due' },
    //   ],
    // };
  }

  getReport(type?:any){
    if(!type){
      this.params.page = 1;
      this.params.offset = 0;
    }
    if(this.params.branch.length == 0){
      this.getDataLoading = false;
      return this.toastr.showInfo('Please select Branch', 'INFO');
    }
    this.getDataLoading = true;
    this.params.report = true;
    this.loadData().then((res:any)=>{
      this.getDataLoading = false;
    }).catch((err:any) => {
      console.log(err);
      this.getDataLoading = false;
    });
  }

  handleAmount(event){
  const inputElement = event.target as HTMLInputElement;
  const sanitizedValue = inputElement.value.replace(/[^\d]/g, ''); // Keep only digits
  inputElement.value = sanitizedValue;
  this.params.amount = sanitizedValue;
  }

  getFeesTableAllFieldList()
  {
    this.ReportService.getFeesTableAllFieldList(this.params.type,this.params.status).subscribe((res: any) => {
      this.dropdownList = res?.data?.static_field;
      this.list = res?.data?.dynamic_field;
    });
  }

  onSelectAll(event:any)
  {
    this.params.student_field = [];
    this.params.student_field = this.student_field_list;
    this.reloadData();
  }


  getFeesCategories() {
    this.ReportService.getFeesCategories({branch: this.params.branch}).subscribe((resp: any) => {
      if (resp.status) {
        if(resp.data.trusts != false){
          this.trusts = [{ id: '', name: 'Please Select' }, ...resp.data.trusts];
        }
        else{
          this.trusts = resp.data.trusts
        }
        this.system_setting_fees_due_amount = resp?.data?.fees_due_report_amount_filter
        this.fees_types = resp.data.feesCategories;
        this.all_quarters = resp?.data?.quarters;
        this.is_quarter_wise_fees_setting = resp?.data?.is_quarter_wise_fees;
        if(this.selectedTemplateData) {
          this.params.fees_type = this.selectedTemplateData.fees_type
        }
      }else{
        this.toastr.showError(resp.message);
      }
    });
  }

  loadData(format?:any){
    return new Promise((resolve, reject) => {
      if(this.is_quarter_wise_fees){
        this.params.month = this.commonService.getMonthsFromQuarter(this.all_quarters,this.params?.quarter??[]);
      }
      const payload = {
        ...this.params
      }

      if( payload?.batch && typeof payload?.batch[0] !== 'number'){
        payload.batch = payload.batch.map(ele => ele.id);
      }

      this.ReportService.getFeesDueReport(payload).subscribe((resp: any) => {
        this.params.report = false;
          if(resp.html){
            this.html = this.sanitizer.bypassSecurityTrustHtml(resp.html);
            this.paginateData = resp.data
            this.pagination();
          }else{
            this.quarters = this.all_quarters.filter(item=> resp.months.some(month => item.months.includes(month)) );
            this.months = resp.months
          }
          // else{
          //   if(this.params.type == 1){
          //     let cat = resp.fees_type.map((el:any) => {
          //       return {id: el, name: (el[0].toUpperCase() + el.slice(1)).replaceAll('_',' ')}
          //     })
          //     this.fees_types = cat;
          //   }
          //   let months = resp.months.map((el:any) => {
          //     return {id: el, name:el}
          //   })
          //   this.months = months;
          // }
            resolve(true)
          }, (error:any) => {
            reject(error.message);
          });
    })
  }

  downloadReport(format:any){
    if(this.params.branch.length == 0){
      this.params.report = false;
      this.pdfLoading = false;
      return this.toastr.showInfo('Please select Branch', 'INFO');
    }
    if(format == 'pdf'){
      this.pdfLoading = true;
    }
    if(format == 'excel'){
      this.excelLoading = true;
    }
    this.params.report = true;
    return new Promise((resolve, reject) => {
      const payload = {
        ...this.params
      }
      if(payload?.batch && typeof payload?.batch[0] !== 'number'){
        payload.batch = payload.batch.map(ele => ele.id);
      }

      this.ReportService.downloadFeesDueReport(payload, format).subscribe((resp: any) => {
        this.params.report = false;
        this.pdfLoading = false;
        this.excelLoading = false;
            this.downloadFile(resp, 'fees-due-report', format)
            resolve(true)
          }, (error:any) => {
            reject(error.message);
          });
    })
  }

  // loadData(dataTablesParameters?: any, callback?: any) {
  //   dataTablesParameters = {
  //     ...dataTablesParameters,
  //     ...this.params,
  //   };
  //   this.ReportService.getFeesDueReport(
  //     dataTablesParameters
  //   ).subscribe((resp: any) => {
  //     this.tbody = resp?.data;
  //     this.fees = resp.fees
  //     this.recordsTotal = resp.recordsTotal
  //     this.amount = resp.amount
  //     this.list = resp?.studentField;
  //     if(this.params.type == 1){
  //       let cat = resp.fees_type.map((el:any) => {
  //         return {id: el, name: (el[0].toUpperCase() + el.slice(1)).replaceAll('_',' ')}
  //       })
  //       this.fees_types = cat;
  //     }
  //     this.loading = true;
  //     let months = resp.months.map((el:any) => {
  //       return {id: el, name:el}
  //     })
  //     this.months = months;

  //     callback({
  //       recordsTotal: resp.recordsTotal,
  //       recordsFiltered: resp.recordsFiltered,
  //       data: [],
  //     });
  //     setTimeout(() => {
  //       this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
  //         dtInstance.columns.adjust();
  //       });
  //     }, 100);
  //   });
  // }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
      this.selected = [];
      this.checked = false;
      this.getFeesTableAllFieldList();
    });
  }

  fromDateChange(e: any) {
    this.params.from_date = e.target.value;
    this.params.from_date && this.params.to_date ? this.reloadData() : ''
  }

  toDateChange(e: any) {
    this.params.to_date = e.target.value;
    this.params.from_date && this.params.to_date ? this.reloadData() : ''
  }

  handleChangeSection(event:any, type:any){
    this.selectedClass = [];
    this.selectedBatch = [];
    this.params.class = [];
    this.params.batch = [];
    let academic = this.params.academic_year.length > 0 ? this.params.academic_year.map((x:any) => x.id) : this.academic_years.map((x:any) => x.id)
    let section = type == 'all' ? event.map((x:any) => x.id) : this.params.section.map((x:any) => x.id)
    let branch = this.params.branch.map((x:any) => x.id)
    if (academic && section && branch) {
      this.ReportService.getClassListForMaster(section, branch, academic).subscribe((res: any) => {
        if (res.status) {
          this.classes = res.data;
          if(this.selectedTemplateData){
            this.params.class = this.selectedTemplateData.class
            this.selectedClass = this.selectedTemplateData.class
            this.classChange(this.selectedTemplateData.class,'all');
          }

        }
      });
    }
    // this.loadData();
  }

  classChange(event:any, type:any) {
    this.params.class = type == 'all' ? event.map((x:any) => x.id) : this.selectedClass.map((x:any) => x.id)
    this.params.batch = null;
    this.selectedBatch = [];

    this.ReportService.getBatchesByClass(this.params.class).subscribe(
      (res: any) => {
        this.params.batch = null;
        this.batches = res.data;
        if(this.selectedTemplateData){
          this.params.batch = this.selectedTemplateData.batch
          this.selectedBatch = this.selectedTemplateData.batch
        }
      }
    );
    // this.loadData();
  }

  handleBatch(event:any, type:any){
    if(type=='all'){
      this.params.batch = event.map((x:any) => x.id)
    }else{
      this.params.batch = this.selectedBatch.map((x:any) => x.id)
    }
    // this.loadData();
  }

  handleTrustChange(){
    this.selectedFeesType = [];
    this.params.fees_type = null;
    this.params.month = null;
    this.selectedMonths = [];
    this.reloadData();
  }

  handleFeesType(){
    this.params.fees_type = this.selectedFeesType.map((x:any) => x.id)
    this.reloadData();
  }

  handleDeselectFeesType(){
    this.params.fees_type = this.selectedFeesType.map((x:any) => x.id)
    this.params.month = null
    this.selectedMonths = []
    this.reloadData();
  }

  handleMonthChange(){
    this.params.month = this.selectedMonths.map((x:any) => x.id);
    this.reloadData();
  }

  handleStatusChange(){
    this.params.from_date = null;
    this.from_date ? this.from_date.nativeElement.value = '' : ''
    this.params.to_date = null;
    this.to_date ? this.to_date.nativeElement.value = '' : ''
    this.reloadData();
  }

  handleSelectAll(event:any){
    let data:any;
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      data = {
        ...dtInstance.ajax.params(),
        ...this.params,
      };
      data['length'] = -1;
      if(event.target.checked){
        this.ReportService.getStudentIds(data).subscribe((resp: any) => {
          if (resp.status) {
            this.selected = resp.data
          }
        });
      }else{
        this.selected = [];
      }
    });

  }

  handleSelect(event:any,id:any, amount:any,name:any, month?:any, fees_type?:any){
    if(event.target.checked){
      if(this.params.type == 1){
        this.selected.push({student_id : id,amount:amount, name:name, month: month, fees_type : fees_type})
      }else if(this.params.type == 2){
        this.selected.push({student_id : id,amount:amount, name:name,})
      }
    }else{
      let index:any;
      if(this.params.type == 1){
        index = this.selected.findIndex((obj:any) => obj.student_id == id && obj.month == month && obj.fees_type == fees_type);
      }else if(this.params.type == 2){
        index = this.selected.findIndex((obj:any) => obj.student_id == id && obj.amount == amount );
      }
      if (index !== -1) {
        this.selected.splice(index, 1);
      }
    }
  }

  checkedStudent(id:any, amount:any, month?:any, fees_type?:any){
    let index:any;
    if(this.params.type == 1){
        index = this.selected.findIndex((obj:any) => obj.student_id == id && obj.month == month && obj.fees_type == fees_type);
      }else if(this.params.type == 2){
        index = this.selected.findIndex((obj:any) => obj.student_id == id && obj.amount == amount );
      }else{
        index = this.selected.findIndex((obj:any) => obj.student_id == id && obj.amount == amount );

      }

      if(this.selected.length < this.recordsTotal){
        this.checked = false;
      }else if(this.selected.length == this.recordsTotal){
        this.checked = true;
      }
      if (index !== -1) {
      return true;
    } else {
      return false;
    }
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

  downloadPdf(format:string){
    if(this.params.branch.length == 0){
      return this.toastr.showInfo('Please select Branch.', 'INFO');
    }
    if(this.params.branch.length > 1){
      return this.toastr.showInfo('Please select only one branch for '+format, 'INFO');
    }
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      let params  = {
        ...dtInstance.ajax.params(),
        ...this.params,
      };
      params['length'] = -1;
      this.ReportService.downloadFeesReport(params, format).subscribe((res: any) => {
          this.downloadFile(res,'Fees-report', format);
        });
    });

  }

  downloadRemainingFeesReport(){
    if(this.params.branch.length == 0){
      return this.toastr.showInfo('Please select Branch.', 'INFO');
    }
    if(this.params.branch.length > 1){
      return this.toastr.showInfo('Please select only one branch for remaining fees', 'INFO');
    }

    if(this.params.class.length == 0){
      return this.toastr.showInfo('Please Select Class', 'INFO');
    }
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      let params  = {
        ...dtInstance.ajax.params(),
        ...this.params,
      };
      params['length'] = -1;
      params['status'] = 'unpaid';
      params['type'] = 1;
      params['search']['value'] = null;
      this.ReportService.downloadRemainingFeesReport(params).subscribe((res: any) => {
            this.downloadFile(res,'Remaining-fees-report', 'pdf');
        });
    });
  }

  schoolChange(){
    this.getSectionList();
    this.reloadData();
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
      return firstSetting;
  }

  handleChangeBranch(event:any, type:any){
    this.params.section = [];
    this.academic_years = [];
    this.params.academic_year = [];
    this.params.class = []
    this.classes = [];
    this.selectedClass = [];
    this.params.batch = []
    this.batches = [];
    this.selectedBatch = [];
    this.params.routes = [];
    this.routes = [];
    this.params.fees_type = []
    this.params.month = []
    this.params.quarter = []

    let data = {
      branches : type == 'all' ? event.map((x:any) => x.id) : this.params.branch.map((x:any) => x.id)
    }

    if(this.checkSettings(data.branches) === true){
      data.branches = [];
      this.params.branch = [];
      if(type == 'all'){
        setTimeout(()=>{
          this.params.branch = [];
        },50)
      }
    }

    this.ReportService.getAcademicYar(data).subscribe((resp:any) => {
      this.academic_years = resp.data.sort(function(a:any, b:any) {
        return - ( b.branch_id - a.branch_id );
      });
      if(this.selectedTemplateData){
        this.params.academic_year = this.selectedTemplateData.academic_year
      }
    })
    this.getSections(data);
    this.getFeesCategories();
    this.getRouteList();
  }

  getSections(data:any){
    this.ReportService.getSections(data).subscribe((res: any) => {
      if (res.status) {
        this.sections = res.data;
        if(this.selectedTemplateData){
          this.params.section = this.selectedTemplateData.section
          this.handleChangeSection(this.selectedTemplateData.section,'all')
        }
      }
    });
  }

  getSectionList(){
    this.ReportService.getSectionList({branch:this.params.branch}).subscribe((res: any) => {
      if (res.status) {
        this.sections = res.data;
      }
    });
  }

  getBranchList(){
    this.params.section = []
    this.params.class = []
    this.params.batch = []
    this.ReportService.getBranchList().subscribe((resp:any) => {
      this.branches = resp.data;
    })

  }

  handleYeaSection(event:any, type:any){
    this.params.section = [];
    this.params.class = []
    this.classes = [];
    this.selectedClass = [];
    this.params.batch = []
    this.batches = [];
    this.selectedBatch = [];
    this.params.routes = [];
    this.routes = [];
    this.getRouteList();
    
  }

  clear(){
    this.selectedTemplate = null
    this.templateName = ''
    this.params.from_date = null;
    this.from_date ? this.from_date.nativeElement.value = '' : ''
    this.params.to_date = null;
    this.to_date ? this.to_date.nativeElement.value = '' : ''
    this.params.section = [];
    this.params.branch = [];
    this.params.class = [];
    this.selectedClass = [];
    this.selectedBatch = [];
    this.selectedFeesType = [];
    this.selectedMonths = [];
    this.params.batch = [];
    this.params.fees_type = [];
    this.params.month = null;
    this.params.payment_mode = null;
    this.params.status  = 'paid';
    this.params.gender = null;
    this.params.trust = null;
    this.params.type = 1;
    this.amount = 0;
    this.selectedItems = [];
    this.params.school = 0;
    this.dtRendered2 = true;
    this.dtRendered = false;
    this.batches = [];
    this.html = null;
    this.academic_years = [];
    this.params.academic_year = [];
    this.params.pay_type = [];
    this.params.report_type = '1';
    this.params.columns = [];
    this.params.transport_mode = null;
    this.params.student_status = '1';
    this.params.student_transport_status = 'all',
    this.params.student_hostel_status = 'all',
    this.params.student_meal_status = '1',
    this.params.routes = [];
    this.fees_type_status = [];
    this.selectedTemplateData = null
    this.params.category_wise_due = false;
    this.params.category_wise_paid = false;
    this.params.limit = 50;
    this.params.page = 1;
    this.params.quarter = []
    this.params.student_old_new = '';
    this.params.student_rte_status = '';
    this.params.filter = 'all';
    this.params.amount = 0;
    this.paginateData = null
    this.reloadData();
    this.ReportService.getClassList(this.params.section, this.params.branch).subscribe((res: any) => {
      if (res.status) {
        this.classes = res.data;
      }
    });
  }

  onCheckboxChange(event:any)
  {
    const checkboxElement = event.target;
    const isChecked = checkboxElement.checked;

    if (isChecked) {
      this.params.rte = isChecked;
      this.reloadData();
    } else {
      this.params.rte = isChecked;
      this.reloadData();
    }
  }

  getTemplateList(){
    const data: any = {
      type: 3,
    };
    this.ReportService.getTemplateList(data).subscribe((resp:any) => {
      if(resp.status){
        this.templateList = resp.data
      }
    })
  }

  templateChange() {
    this.selectedTemplateData = this.templateList.find((ele:any) => ele.id == this.selectedTemplate);
    if (this.selectedTemplateData) {
      this.templateName = this.selectedTemplateData.template_name
      this.selectedTemplateData = this.selectedTemplateData.template_fields
      this.params.month = this.selectedTemplateData.month
      this.params.pay_type = this.selectedTemplateData.pay_type
      this.params.report_type = this.selectedTemplateData.report_type
      this.params.columns = this.selectedTemplateData.columns
      this.params.fees_type = this.selectedTemplateData.fees_type
      this.params.branch = this.selectedTemplateData.branch
      this.handleChangeBranch(this.selectedTemplateData.branch,'all')
    }
  }

  saveTemplate() {
    this.isSubmitTemplate = true;
    if (this.templateName == '' || this.templateName == null) {
      return;
    }
    let data = {
      template_name: this.templateName,
      template_data: this.params,
      type: 3,
    }
    data.template_data.class = this.selectedClass
    data.template_data.batch = this.selectedBatch
    if (this.selectedTemplate) {
      this.ReportService.updateTemplate(this.selectedTemplate, data).subscribe(
        (resp: any) => {
          this.isSubmitTemplate = false;
          if (resp.status) {
            this.toastr.showSuccess(resp.message);
          }
          // this.templateName = '';
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
        // this.templateName = '';
        // this.selectedTemplate = null;
        this.getTemplateList();
      });
    }
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

  handleFeesTypeChange(event:any, type:any){
    this.months = [];
    this.quarters = [];
    this.params.month = [];
    this.params.quarter = [];
    this.loadData();
    this.fees_type_status = type == 'all' ? event : this.params.fees_type ?? [];
    if(this.fees_type_status.length == 1 && this.fees_type_status[0]['type_name'] == 'Transport Fees'){
      this.params.transport_mode = '0';
    }
    if(this.fees_type_status.length == 0 || this.fees_type_status.length > 1){
      this.params.routes = [];
      this.params.transport_mode = null;
    }
  }

  handleReportTypeChange(){
    // if(this.params.report_type == 2){
    //   this.params.routes = [];
    //   this.params.transport_mode = null;
    // }
  }

  getStudentCustomColumns(){
    this.ReportService.getStudentCustomColumns().subscribe((resp:any) => {
      if(resp.status){
        this.columns = resp.data
      }
    })
  }

  getRouteList(){
    let data = {
      branch : this.params.branch.map((x:any) => x.id),
      academic_year : this.params.academic_year.map((x:any) => x.id),
    }
    this.ReportService.getRouteList(data).subscribe((resp:any) => {
      if(resp.status){
        this.routes = resp.data
      }
    })
  }

  pagination(){
    console.log(this.paginateData);
    
    let pages = Math.ceil(this.paginateData.total/this.params.limit)
    let pagination:any = [];
    this.lastPage = this.paginateData.last_page

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

  handleLimitChange(){
    this.params.page = 1;
    this.pagination()
    this.getReport();
  }
}
