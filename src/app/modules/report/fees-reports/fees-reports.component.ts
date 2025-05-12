import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { ReportService } from '../report.service';
import { Toastr } from 'src/app/core/services/toastr';
import { LatLongDirective } from '../../transport-management/stops-form/latlong.directive';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CommonService } from 'src/app/core/services/common.service';
import { param } from 'jquery';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-fees-reports',
  templateUrl: './fees-reports.component.html',
  styleUrls: ['./fees-reports.component.scss'],
})
export class FeesReportsComponent implements OnInit {
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
  constructor(private ReportService: ReportService, private toastr: Toastr, public CommonService: CommonService) {}
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
  dtTrigger: Subject<any> = new Subject<any>();
  branchDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'branchName',
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

  months = [];
  schools = [{ id: '', name: 'All' }];  
  branches = [{ id: null, branchName: 'All' }];  
  selectedMonths = [];
  sections = [{ id: '', name: 'All' }];
  trusts:any = []
  status = [{ id: 'paid', name: 'Paid' },{ id: 'unpaid', name: 'Unpaid' }]
  fees:any;
  modes = [
    { id: '', name: 'All' },
    { id: 'Cheque', name: 'Cheque' },
    { id: 'Cash', name: 'Cash' },
    { id: 'card', name: 'card' },
    { id: 'NEFT', name: 'NEFT' },
    { id: 'UPI', name: 'UPI' },
  ];
  loading = true;
  checked:any = false;
  recordsTotal = 0;

  params:any = {
    branch: [],
    from_date: null,
    to_date: null,
    section: [],
    school: 0,
    class: [],
    batch: [],
    fees_type: [],
    month: null,
    payment_mode: null,
    status : 'paid',
    gender: null,
    trust: null,
    type: 1,
    student_field:[],
    rte:[],
  };
  amount  = 0;
  isApplied = false
  isRadio: boolean = false
  tableType: number = 1;

  selected:any = []
  ngOnInit() {
    this.getBranchList();
    this.getFeesCategories();
    this.ReportService.getClassList(this.params.section).subscribe((res: any) => {
      if (res.status) {
        this.classes = res.data;
      }
    });
    this.getFeesTableAllFieldList();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,      
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
        { data: 'check',orderable:false,searchable:false},
        { data: 'roll_no' },
        { data: 'section_name' },
        { data: 'class_name' },
        { data: 'student_name' },
        { data: 'gender' },
        { data: 'fees_type' },
        { data: 'month' },
        { data: 'amount' },
        { data: 'discount' },
        { data: 'date' },
        { data: 'receipt_no' },
        { data: 'payment_mode' },
      ],
    };
    
    
  }

  apply(){
    this.isApplied = true;
    if(this.params.branch.length > 0 && this.params.section.length > 0){
      if(this.selectedItems.length > 0) {
        this.onItemSelect(null)
      } else {
        this.onItemDeSelect(null)
      }
    } else {
      this.toastr.showError("please select branch and section");
    }
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
    // this.reloadData();
  }


  onItemDeSelect(event:any)
  {
      this.dtRendered=false;
      this.dtRendered2=false;
      let data_array:any=[];
      let data_array2:any=[];
      this.selectedItems.forEach(function(value:any){
        data_array.push({"data":value});
        data_array2.push(value.replace(' ','_').toLowerCase());
      });
      
      this.field_list=data_array2;
      if(data_array2.length > 0){
      this.setDatatable(data_array);
      setTimeout(() => {
        this.dtRendered=true;
      }, 100);
      this.params.student_field = this.selectedItems;
      // this.reloadData();
    }else{
      setTimeout(() => {
        this.dtRendered2=true;
      }, 100);
      this.setDatatable(null);
      // this.reloadData();
    }
  }

  onItemSelect(event:any)
  {
    this.dtRendered=false;
    this.dtRendered2=false;
    let data_array:any=[];
    let data_array2:any=[];
    this.selectedItems.forEach(function(value:any){      
      data_array.push({"data":value});
      data_array2.push(value.replace(' ','_').toLowerCase());
    });

    this.field_list=data_array2;    
    
    this.setDatatable(data_array);
    setTimeout(() => {
      this.dtRendered=true;
    }, 100);
    this.params.student_field = this.selectedItems; 
    // this.reloadData();    
  }

  field_list_for_html=[];  
  default_list=[ 
    { data: 'check'},
    { data: 'roll_no' },
    { data: 'section_name' },
    { data: 'class_name' },
    { data: 'student_name' },
    { data: 'gender' },
    { data: 'fees_type' },
    { data: 'month' },
    { data: 'amount' },
    { data: 'discount' },
    { data: 'date' },
    { data: 'receipt_no' },
    { data: 'payment_mode' },
  ];
  default_list1=[
    { data: 'check'},
    { data: 'roll_no' },
    { data: 'section_name' },
    { data: 'class_name' },
    { data: 'student_name' },
    { data: 'gender' },
    { data: 'amount' },
    { data: 'discount' },
    { data: 'date' },
    { data: 'receipt_no' },
    { data: 'payment_mode' },
  ];

  setDatatable(fields:any=null){   
    
    if(this.tableType == 1)
    {
      if(fields==null){
        fields=this.default_list;        
      }
      this.field_list_for_html=fields;
      
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
          columns: fields
        };  
    }else
    {
      if(fields==null){
        fields=this.default_list1;                
      }
      this.field_list_for_html=fields;     
      // fields.filter(function(n){
      //   return (n != "Fees Type")        
      // });      
        this.dtOptionsType2 = {
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
          columns: fields
        };  
    }
  }

  getFeesCategories() {
    this.ReportService.getFeesCategories({branch: this.params.branch}).subscribe((resp: any) => {
      if (resp.status) {
        // let cat = resp.data.feesCategories.map((el:any) => {
        //   return {id: el.type_name.toLowerCase().replace(' ', '_'), name:el.type_name, cat_id: el.id}
        // })
        // this.fees_types = cat;
        if(resp.data.trusts != false){
          this.trusts = [{ id: '', name: 'Please Select' }, ...resp.data.trusts];
        }
        else{
          this.trusts = resp.data.trusts
        }
        this.sections = resp.data.sections
      }
      
    });
  }
  loadData(dataTablesParameters?: any, callback?: any) {
    this.isApplied = false;
    if(!this.params.branch.length && !this.params.section.length){
      callback({
        recordsTotal: 0,
        recordsFiltered: 0,
        data: [],
      });
    } else {
      this.params.type = this.tableType
        dataTablesParameters = {
          ...dataTablesParameters,
          ...this.params,
        };
        this.ReportService.getFeesReport(
          dataTablesParameters
        ).subscribe((resp: any) => {     
          this.tbody = resp?.record?.original?.data;
          this.fees = resp.record.original.fees
          this.recordsTotal = resp.record.original.recordsTotal     
          this.amount = resp.record.original.amount
          this.list = resp?.studentField;
          if(this.params.type == 1){
            let cat = resp.record.original.fees_type.map((el:any) => {
              return {id: el, name: (el[0].toUpperCase() + el.slice(1)).replaceAll('_',' ')}
            })
            this.fees_types = cat;
          }
          this.loading = true;
          let months = resp.record.original.months.map((el:any) => {
            return {id: el, name:el}
          })
          this.months = months;
          
          callback({
            recordsTotal: resp.record.original.recordsTotal,
            recordsFiltered: resp.record.original.recordsFiltered,
            data: [],
          });
          setTimeout(() => {
            this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.columns.adjust();
            });
          }, 100);
        });
      }
  }

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

  handleChangeSection(){
    this.selectedClass = [];
    this.selectedBatch = [];
    this.params.fees_type = null;
    this.params.month = null;
    this.selectedMonths = [];
    // this.classChange()
    this.ReportService.getClassList(this.params.section, this.params.branch).subscribe((res: any) => {
      if (res.status) {
        this.classes = res.data;
      }
    });
    // this.reloadData();
  }
  
  classChange() {
    this.params.class = this.selectedClass.map((x:any) => x.id)
    this.params.batch = null;
    this.ReportService.getBatchesByClass(this.params.class).subscribe(
      (res: any) => {
        this.params.batch = null;
        this.batches = res.data;
      }
    );
    // this.reloadData();
  }

  handleBatch(){
    this.params.batch = this.selectedBatch.map((x:any) => x.id)
    // this.reloadData();
  }

  handleTrustChange(){
    this.selectedFeesType = [];
    this.params.fees_type = null;
    this.params.month = null;
    this.selectedMonths = [];
    // this.reloadData();
  }

  handleFeesType(){
    this.params.fees_type = this.selectedFeesType.map((x:any) => x.id)
    // this.reloadData();
  }

  handleDeselectFeesType(){
    this.params.fees_type = this.selectedFeesType.map((x:any) => x.id)
    this.params.month = null
    this.selectedMonths = []
    // this.reloadData();
  }

  handleMonthChange(){
    this.params.month = this.selectedMonths.map((x:any) => x.id);
    // this.reloadData();
  }

  handleStatusChange(){
    this.params.from_date = null;
    this.from_date ? this.from_date.nativeElement.value = '' : ''
    this.params.to_date = null;
    this.to_date ? this.to_date.nativeElement.value = '' : ''
    // this.reloadData();
  }

  handleType(type:any){
    // this.params.type = type;
    this.tableType = type
    this.selected = [];
    return
    if(type == 2){
        this.dtOptionsType2 = {
          pagingType: 'full_numbers',
          pageLength: 10,
          serverSide: true,
          processing: true,
          searching: true,
          scrollX: true,
          scrollCollapse: true,
          ajax: (dataTablesParameters: any, callback) => {
            this.loadData(dataTablesParameters, callback);
          },
          columns: [
            { data: 'check',orderable:false,searchable:false },
            { data: 'roll_no' },
            { data: 'section_name' },
            { data: 'class_name' },
            { data: 'student_name' },
            { data: 'gender' },
            { data: 'amount' },
            { data: 'discount' },
            { data: 'date' },
            { data: 'receipt_no' },
            { data: 'payment_mode' },
          ],
        }; 
        this.selectedItems = [];
        this.dtRendered2 = true;
        this.dtRendered = false;
        this.getFeesTableAllFieldList(); 
    }
    else if(type == 3)  {
      this.dtOptionsType2 = {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: true,
        searching: true,
        scrollX: true,
        scrollCollapse: true,
        ajax: (dataTablesParameters: any, callback) => {
          this.loadData(dataTablesParameters, callback);
        },
        columns: [
          { data: 'check',orderable:false,searchable:false },
          { data: 'roll_no' },
          { data: 'section_name' },
          { data: 'class_name' },
          { data: 'student_name' },
          { data: 'gender' },
          { data: 'month' },
          { data: 'amount' },
          { data: 'date' },
          { data: 'receipt_no' },
          { data: 'payment_mode' },
        ],
      }; 
      this.selectedItems = [];
      this.dtRendered2 = true;
      this.dtRendered = false;
      this.getFeesTableAllFieldList(); 
    }else{
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: true,
        searching: true,
        scrollX: true,
        scrollCollapse: true,      
        ajax: (dataTablesParameters: any, callback) => {
          this.loadData(dataTablesParameters, callback);
        },
        columns: [
          { data: 'check',orderable:false,searchable:false},
          { data: 'roll_no' },
          { data: 'section_name' },
          { data: 'class_name' },
          { data: 'student_name' },
          { data: 'gender' },
          { data: 'fees_type' },
          { data: 'month' },
          { data: 'amount' },
          { data: 'discount' },
          { data: 'date' },
          { data: 'receipt_no' },
          { data: 'payment_mode' },
        ],
      };
      this.selectedItems = [];
      this.dtRendered2 = true;
      this.dtRendered = false;
      this.getFeesTableAllFieldList();   
      
    }
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

  sendSms(){
    if(this.selected.length == 0){
      return this.toastr.showInfo('Please select at least one student', 'Info')
    }
    let data = {
      status : this.params.status,
      type: this.params.type,
      students: this.selected,
      token: window.localStorage.getItem('token'),
    }
    this.ReportService.sendFeesSms(data).subscribe((resp: any) => {
      if (resp.status) {
        this.toastr.showSuccess(resp.message);  
      }else{
        this.toastr.showError(resp.message);
      }
      this.selected = [];
      this.checked = false;
    });
  }

  downloadFile(res: any,file: any, format:any) {
    if(this.tbody.length == 0){
      return this.toastr.showInfo('There is no records','INFO');
    }
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
    // this.reloadData();
  }

  handleChangeBranch(){
    this.getFeesCategories();
    this.handleChangeSection()
    // this.reloadData();
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

  clear(){
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
    this.reloadData();
  }

  onCheckboxChange(event:any)
  {
    const checkboxElement = event.target;
    const isChecked = checkboxElement.checked;    
    
    if (isChecked) {
      this.params.rte = isChecked;
      // this.reloadData();
    } else {      
      this.params.rte = isChecked;      
      // this.reloadData();
    }
  }
  
  changeStatus()
  {
    if(this.params.type == 1)
    {
      this.selectedItems = []; 
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: true,
        searching: true,
        scrollX: true,
        scrollCollapse: true,
        ajax: (dataTablesParameters: any, callback) => {
          this.loadData(dataTablesParameters, callback);
        },
        columns: [
          { data: 'check',orderable:false,searchable:false},
        { data: 'roll_no' },
        { data: 'section_name' },
        { data: 'class_name' },
        { data: 'student_name' },
        { data: 'gender' },
        { data: 'fees_type' },
        { data: 'month' },
        { data: 'amount' },
        { data: 'date' },
        { data: 'receipt_no' },
        { data: 'payment_mode' },
        ],
      };
      this.dtRendered2 = true;
      this.dtRendered = false;  
      // this.reloadData();
    }else
    {      
      this.selectedItems = []; 
      this.dtOptionsType2 = {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: true,
        searching: true,
        scrollX: true,
        scrollCollapse: true,
        ajax: (dataTablesParameters: any, callback) => {
          this.loadData(dataTablesParameters, callback);
        },
        columns: [
          { data: 'check',orderable:false,searchable:false },
          { data: 'roll_no' },
          { data: 'section_name' },
          { data: 'class_name' },
          { data: 'student_name' },
          { data: 'gender' },
          { data: 'amount' },
          { data: 'date' },
          { data: 'receipt_no' },
          { data: 'payment_mode' },
        ],
      };
      this.dtRendered2 = true;
      this.dtRendered = false;  
      // this.reloadData();
    }    
  }
}
