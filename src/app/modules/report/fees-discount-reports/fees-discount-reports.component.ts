import { Component, ElementRef, OnInit, Pipe, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ReportService } from '../report.service';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import moment from 'moment';
import { ViewAttachmentsComponent } from 'src/app/modules/academics/view-attachments/view-attachments.component';
import { FeesService } from '../../fees/fees.service';
import { status } from 'src/app/common-config/static-value';


@Component({
  selector: 'app-fees-discount-reports',
  templateUrl: './fees-discount-reports.component.html',
  styleUrls: ['./fees-discount-reports.component.scss'],
})
export class FeesDiscountReportsComponent implements OnInit {

   //#region Public | Private Variables
   dtOptions: DataTables.Settings = {};
   @ViewChild(DataTableDirective, {static: false})
   datatableElement: DataTableDirective | null = null;
   filterCount: any = 0;
   
   filter:any = true;
   allChecked:any = false;
   selectedStudentIds:any = []

   feesDiscount: FormGroup | any;
   modalForm: FormGroup | any;

    branch_id: any = window.localStorage.getItem('branch');
    branchList:any = []
    academicList:any = []
    sectionList: any = []
    classList  : any = []
    batchList  : any = []
    FeesTypeList:any = []

    is_form : boolean = false
    is_modalShow : boolean = false
    is_generate : boolean = false
    printing:boolean = false;
    pdf_loading : boolean = false
    excel_loading : boolean = false

    last_date : any 
    tbody: any = [];

    is_show : boolean = false
    is_loading : boolean = false

    status_list = status
    currentDate: string;
    settings:any;
    
    receiptIds:any = []
    receipts:any = [];
    categoryFess:any = [];

    
  isOpenByClick: boolean = true
  //#endregion Public | Private Variables

  constructor(
    private ReportService: ReportService,
    private formBuilder: FormBuilder,
    private toaster:Toastr,
    public commonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    public sanitizer: DomSanitizer,
    private modalService: NgbModal,
    private validationService: FormValidationService,
    private feesService: FeesService,
  ) { 
    const today = new Date();
    this.currentDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.formInit()
    this.getBranchList()
    this.initDatatable()
    this.getFeesCategories()
    this.countFilters();
  }

  formInit(){
    this.feesDiscount = this.formBuilder.group({ 
      branch: [[],Validators.required],
      academic_year: [[],Validators.required],
      date: [],
      section : [],
      classes : [],
      batches : [],
      fees_type: [],
      status : [2],
    })
  }
  initDatatable(){
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      lengthMenu:[
        [50,100,200],
        ['Show 50 entries','Show 100 entries','Show 200 entries']
      ],
      language: {
        lengthMenu: "_MENU_"
      },
      pageLength: 50,
      serverSide: true,
      processing: false,
      searching: true,
      order: [[3, 'asc']],

      lengthChange: true,
      stateSave: true,
      // scrollX: true,

      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        {data:'id',searchable:false,orderable:false},
        {data: 'class', name:'course.class.name' ,searchable:true,orderable:true },
        // {data: 'batch', name:'batch.name'  ,searchable:true,orderable:true },
        {data: 'batch', name:'student.batches_name'  ,searchable:true,orderable:true },
        {data: 'full_name' ,searchable:true,orderable:true},
        {data: 'gr_number' ,searchable:true,orderable:true},
        {data: 'category_names' ,searchable:true,orderable:true},
        {data: 'discount_amount' ,searchable:true,orderable:true},
        {data: 'discount_reason' ,searchable:false,orderable:false},
        {data: 'discount_remark' ,searchable:false,orderable:false},
        {data: 'discount_apply_date', name:'created_at' ,searchable:true,orderable:true},
        {data: 'discount_apply_by' ,searchable:true,orderable:true},
        {data: 'status', searchable:false,orderable:false},
        {data: 'action', orderable: false, searchable: false},
      ]
    };
  }

  show(){
    this.is_loading = true;
    this.reloadData();
  }


  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  loadData(dataTablesParameters?: any, callback?: any) {
    this.countFilters();
    dataTablesParameters = {
      ...dataTablesParameters, ...this.feesDiscount.value
    }
    
    this.ReportService.feeDiscountReport(dataTablesParameters).subscribe(
      (resp: any) => {
        this.is_loading = false
        this.receipts = resp?.data;
        this.tbody = resp?.data;
        this.categoryFess = resp?.categoryFess;
        callback({
          recordsTotal: resp?.recordsTotal,
          recordsFiltered: resp?.recordsFiltered,
          data: [],
        });
        setTimeout(() => {
          this.datatableElement?.dtInstance.then(
            (dtInstance: DataTables.Api) => {
              dtInstance.columns.adjust();
            }
          );
        }, 10);
      }
    );
  }
  countFilters(){
    this.filterCount = 0;
    Object.keys(this.feesDiscount.value).forEach((item:any)=>{
      if((this.feesDiscount.value[item] != '' && this.feesDiscount.value[item] != null) || item == 'status'){
        this.filterCount++;
      }
    })
  }

  downloadReport(format:any){
    if(format == 'pdf'){
      this.pdf_loading = true
    }
    if(format == 'excel'){
      this.excel_loading = true
    }
    let data = {
      ...this.feesDiscount.value, length: -1
    }
    this.ReportService.feeDiscountReportDownload(data, format).subscribe((resp: any) => {
      this.commonService.downloadFile(resp, 'Fee Discount Report', format)
      if(format == 'excel'){
        this.ReportService.feeDiscountReportAttachmentsDownload().subscribe((resp: any) => {
          this.commonService.downloadFile(resp, 'attachments', format)
        },(error:any)=>{
          console.log(error);
        });
      }
      this.pdf_loading = false
      this.excel_loading = false
    },(error:any)=>{
      console.log(error);
      this.pdf_loading = false
      this.excel_loading = false
    })
  }

  handleSelectAll(event: any) {
    this.selectedStudentIds = []
    const checked = event.target.checked;
    this.tbody.forEach(product => {
      product.selected = checked;
      if (checked) {
        if(product.date == null){
          product.date = this.last_date
        }
        this.selectedStudentIds.push(product.id);
      } else {
        product.date = null
        const index: number = this.selectedStudentIds.indexOf(product.id);
        if (index !== -1) {
          this.selectedStudentIds.splice(index, 1);
        }
      }
    });
  }

  handleSelect(event: any, id: any) {
    if (event.target.checked) {
      this.selectedStudentIds.push(id);
      this.updateStudentDate(id,this.last_date)
    } else {
      const index: number = this.selectedStudentIds.indexOf(id);
      if (index !== -1) {
        this.selectedStudentIds.splice(index, 1);
        this.updateStudentDate(id,null)
      }
    }
    this.allChecked = this.selectedStudentIds.length == this.tbody?.length;
  }

  updateStudentDate(id: any, newDate: any ) {
    const student = this.tbody.find(item => item.id === id);
    if (student) {
      student.date = newDate;
    }
  }

  clearAll(){
    this.feesDiscount.reset();
    this.feesDiscount.get('branch').setValue([]);
    this.feesDiscount.get('academic_year').setValue([]);
    this.feesDiscount.controls['academic_year'].markAsPristine();
    this.feesDiscount.controls['academic_year'].markAsUntouched();
    this.feesDiscount.get('section').setValue([]);
    this.feesDiscount.get('classes').setValue([]);
    this.feesDiscount.get('batches').setValue([]);
    this.feesDiscount.get('fees_type').setValue([]);
    this.feesDiscount.get('status').setValue(2);

    this.categoryFess = [];
    this.tbody = []
    this.allChecked = false
    this.last_date = null
    this.reloadData();                         
  }

  getBranchList(){
    this.countFilters();
    this.feesDiscount.controls['academic_year'].patchValue([])
    this.feesDiscount.controls['section'].patchValue([])
    this.feesDiscount.controls['classes'].patchValue([])
    this.feesDiscount.controls['batches'].patchValue([])
    this.ReportService.getBranchList().subscribe((resp:any) => {
      this.branchList = resp.data.map((el:any) => {
        return {id: el.id, name: el.branchName}
      });
    })

  }

  handleBranch(){
    this.countFilters();
    this.feesDiscount.controls['academic_year'].patchValue([])
    this.feesDiscount.controls['academic_year'].markAsPristine();
    this.feesDiscount.controls['academic_year'].markAsUntouched();
    this.feesDiscount.controls['section'].patchValue([])
    this.feesDiscount.controls['classes'].patchValue([])
    this.feesDiscount.controls['batches'].patchValue([])
    
    let data = {
      branches: [this.feesDiscount.value.branch]
    }
    this.ReportService.getAcademicYar(data).subscribe((resp:any) => {
      this.academicList = resp.data.sort(function(a:any, b:any) {
        return - ( b.branch_id - a.branch_id );
      }).map((el:any) => {
        return {id: el.id, name: el.year}
      });
    })

    this.getSections(data)
  }

  handleAcademicYear(){
    this.countFilters();
    this.feesDiscount.controls['section'].patchValue([])
    this.feesDiscount.controls['classes'].patchValue([])
    this.feesDiscount.controls['batches'].patchValue([])
  }

  handleSection(){
    this.countFilters();
    this.classList = []
    this.batchList = []
    this.feesDiscount.controls['classes'].patchValue([])
    this.feesDiscount.controls['batches'].patchValue([])
    
    this.getClassesList()
  }

  handleClass(){
    this.countFilters();
    this.batchList = [] 
    this.feesDiscount.controls['batches'].patchValue([])

    this.getBatchList()
  }

  getSections(data:any){
    this.ReportService.getSections(data).subscribe((res: any) => {
      if (res.status) {
        this.sectionList = res.data;
      }
    });
  }

  getClassesList(){
    let branch = [this.feesDiscount.value.branch]
    let academic = this.feesDiscount.value.academic_year.map((x:any) => x.id)
    let sections = this.feesDiscount.value.section.map((x:any) => x.id)
    this.ReportService.getClassListForMaster(sections, branch, academic).subscribe((res: any) => {
      if (res.status) {
        this.classList = res.data;
      }
    });
   
  }

  getBatchList(){
    let classes = this.feesDiscount.value.classes.map((x:any) => x.id)
    this.ReportService.getBatchesByClass(classes).subscribe(
      (res: any) => {
        this.batchList = res.data;
      }
    );
  }

  getFeesCategories(){
    this.ReportService.getFeesCategories({branch: this.feesDiscount.value.branch}).subscribe((res: any) => {
      this.FeesTypeList = res.data.feesCategories.map((el:any) => {
        return {id: el.id, name: el.type_name}
      });
    });
  }

  getID(data: any) {
    if (data == null || data?.length == 0) {
      return []
    }
    return data?.map(item => item?.id)
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }


  handleCategoryWiseReminder(){
    this.feesDiscount.get('categories').setValue([]);
    this.feesDiscount.get('month').setValue([]);
    this.feesDiscount.get('quarter').setValue([]);
    this.feesDiscount.get('discount').setValue(false);
    this.feesDiscount.get('paid_fees').setValue(false);
  }

  bulkReceipt(event:any){
    event.stopPropagation();
    if(this.selectedStudentIds?.length == 0){
      this.toaster.showError('Please select receipt');
      return;
    }
    this.printing = true;
    var receipts:any = {};
    var is_refund = false;
    this.receipts.forEach((receipt:any)=>{
      if(this.selectedStudentIds.includes(receipt?.id)){
        if(!receipts[receipt?.group_id]){
          receipts[receipt?.group_id] = [];
        }
        receipts[receipt?.group_id].push(receipt?.receipt_no);
        receipt.selected = false;
        is_refund = receipt?.is_refund??false;
      }
    })
    this.feesReceipt({
      receipt_no      : receipts,
      group_id        : null,
      is_refund       : is_refund,
    });
    this.allChecked = false;
    this.selectedStudentIds = [];
  }

  feesReceipt(row){
    const params = {
      receipt_no      : row.receipt_no,
      group_id        : row.group_id,
      is_refund       : row.is_refund,
      refund_id       : row.refund_id,
    }
    this.feesService.feesReceipt(params).subscribe((response:any)=>{
      this.commonService.downloadFile(response,'Fees Receipt','pdf');
      this.printing = false;
    },(error:any)=>{
      this.toaster.showError(error.error.message);
      this.printing = false;
    });
  }

   viewAttachment(row){
      const modalRef = this.modalService.open(ViewAttachmentsComponent,{
        size: 'lg',
        centered: true,
      });
      modalRef.componentInstance.scf = row;
    }

}
