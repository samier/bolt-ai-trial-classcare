import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ReportService } from "../../report/report.service";
import { enviroment } from 'src/environments/environment.staging';
import { Toastr } from 'src/app/core/services/toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FeesService } from '../fees.service';
import { CommonService } from 'src/app/core/services/common.service';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-fees-receipts',
  templateUrl: './fees-receipts.component.html',
  styleUrls: ['./fees-receipts.component.scss']
})
export class FeesReceiptsComponent implements OnInit {
  //#region Public | Private Variables
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  filterCount: any = 0;
  filter:any = false;
  allChecked:any = false;
  printing:any = false;
  sectionList: any = [];
  classes: any = [];
  batches: any = [];
  payment_modes: any = [];
  receivers: any = [];
  receiptIds:any = []
  receipts:any = [];
  receipt_types:any = [
    { id:1, name: 'Paid Receipt' }, 
    { id:2, name: 'Discount Receipt'} , 
    { id:3, name: 'Fees Cancel Receipt'},
    { id:4, name: 'Refund Receipt'},
    { id:5, name: 'Refund Cancel Receipt'},
  ];
  student_status = [
    { id: '', name: 'All' },
    { id: '1', name: 'Active' },
    { id: '0', name: 'InActive' },
  ];
  // formGroup!:FormGroup
  receiptFilterForm: FormGroup | any;

  isOpenByClick: boolean = true
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    private feesService: FeesService,
    private reportService: ReportService,
    private formBuilder: FormBuilder,
    private toastr:Toastr,
    public commonService: CommonService,
    public  dateFormateService : DateFormatService,
  ) { }
  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this.initDatatable();
    this.getSectionList();
    this.getClassesList();
    this.getPaymentMode();
    this.getUsers();
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
      // scrollX: true,
      order: [[7, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        {data: 'checkbox', orderable: false, searchable: false},
        {data: 'studentId', name : 'studentId'},
        {data: 'rollno', name : 'rollno'},
        {data: 'full_name', name: 'full_name'},
        {data: 'total', name: 'total', searchable: false},
        {data: 'paid', name: 'paid', searchable: false},
        {data: 'discount', name: 'discount', searchable: false},
        {data: 'payment_date', name: 'payment_date', searchable: false},
        {data: 'receipt_no', name: 'receipt_no'},
        {data: 'print', name: 'print', orderable: false, searchable: false},
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.countFilters();
    const customSearchData = {
      custom_search: this.receiptFilterForm.value
    };
    
    this.feesService.feesReceiptList(Object.assign(dataTablesParameters,customSearchData)).subscribe((resp: any) => {
      this.receipts = resp?.data;;
      this.allChecked = false;
      this.receiptIds = [];
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

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getSectionList() {
    this.reportService.getSectionList({school:""}).subscribe((res: any) => {
      if (res.status) {
        this.sectionList = [{ id: '', name: 'All Section' }].concat(res?.data);
      }
    });
  }

  getClassesList(){
    this.classes = [];
    this.batches = [];
    this.receiptFilterForm.get('class').setValue(null);
    this.receiptFilterForm.get('batch').setValue(null);
    this.reportService.getStudentClassList(this.receiptFilterForm.value.section).subscribe((res: any) => {
      this.classes = [{ id: '', name: 'All Class' }].concat(res?.data);
      this.getBatchList();
    });
  }

  getBatchList(){
    this.batches = [];
    var payload = 0
    this.receiptFilterForm.get('batch').setValue(null);
    if(!this.receiptFilterForm.value.class){
      payload =  this.classes.map(ele => ele.id)
    } else {
      payload = this.receiptFilterForm.value.class
    }
    this.reportService.getBatchesByClass(payload).subscribe((res: any) => {
      this.batches = [{ id: '', name: 'All Batch' }].concat(res?.data);
    });
  }

  getPaymentMode(){
    this.reportService.getPaymentMode().subscribe((res: any) => {
      this.payment_modes = [{ id: '', name: 'All Payment Mode' }].concat(res?.data);
    });
  }

  getUsers(){
    this.feesService.getUsers().subscribe((response:any)=>{
      this.receivers = [{ id: '', name: 'All Receiver' }].concat(response.data?.map((user:any)=>{
        user.name = user.full_name;
        return user;
      }));
    })
  }

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.receiptFilterForm.value).forEach((item:any)=>{
      if(this.receiptFilterForm.value[item] != '' && this.receiptFilterForm.value[item] != null){
        this.filterCount++;
      }
    })
    if(this.receiptFilterForm.value?.payment_date && this.receiptFilterForm.value?.payment_date?.startDate == null){
      this.filterCount--;
    }
  }

  /**
   * Handle select all
   * @param event
   */
  handleSelectAll(event: any) {
    const checked = event.target.checked;
    this.receipts.forEach(receipt => {
      receipt.selected = checked;
      if (checked) {
        this.receiptIds.push(receipt.id);
      } else {
        const index: number = this.receiptIds.indexOf(receipt.id);
        if (index !== -1) {
          this.receiptIds.splice(index, 1);
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
      this.receiptIds.push(id);
    } else {
      const index: number = this.receiptIds.indexOf(id);
      if (index !== -1) {
        this.receiptIds.splice(index, 1);
      }
    }
    this.allChecked = this.receiptIds.length == this.receipts?.length;
  }

  clearAll(event:any = null){
    if(event){
      event.stopPropagation();
    }
    this.receiptFilterForm.reset();
    this.receiptFilterForm.get('receipt_type').setValue(1);
    this.receiptFilterForm.get('status').setValue('');
    this.receiptFilterForm.get('rte').setValue('');
    this.receiptFilterForm.get('old_new').setValue('');
    this.getClassesList();
    this.reloadData();
  }

  initForm() {
    this.receiptFilterForm = this.formBuilder.group({
      section: [],
      class: [],
      batch: [],
      payment_mode: [],
      payment_date: [],
      receiver: [],
      receipt_type: [1],
      status: [''],
      rte: [""],
      old_new: [""],
    });
  }

  setsymfonyUrl(url:string) {
    return enviroment.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }

  feesReceipt(row){
    const params = {
      receipt_no      : row.receipt_no,
      group_id        : row.group_id,
      is_refund       : row.is_refund,
      refund_id       : row.refund_id,
    }
    this.feesService.feesReceipt(params).subscribe((response:any)=>{
      this.printing = false;
      this.commonService.downloadFile(response,'Fees Receipt','pdf');
    },(error:any)=>{
      this.printing = false;
      this.toastr.showError(error.error.message);
    });
  }

  bulkReceipt(event:any){
    event.stopPropagation();
    if(this.receiptIds?.length == 0){
      this.toastr.showError('Please select receipt');
      return;
    }
    this.printing = true;
    var receipts:any = {};
    var is_refund = false;
    this.receipts.forEach((receipt:any)=>{
      if(this.receiptIds.includes(receipt?.id)){
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
    this.receiptIds = [];
  }

  //#endregion Public methods
}
