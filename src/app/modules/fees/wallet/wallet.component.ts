import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { WalletService } from './wallet.service';
import { Subject } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import moment from 'moment';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  URLConstants = URLConstants;
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};

  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  @ViewChild('walletMdl') walletMdl: ElementRef | undefined;
  @ViewChild('filterMdl') filterMdl: ElementRef | undefined;

  constructor(
    private WalletService: WalletService,
    private toastr: Toastr,
    private modalService: NgbModal,
    public commonService: CommonService,
    public activatedRouteService: ActivatedRoute
  ) { }

  tbody: any;
  students: any = [];
  studentList: any = [];
  sections: any = [];
  classes: any = [];
  batches: any = [];
  activeWallets: Number = 0;
  creditedAmount: Number = 0;
  debitedAmount: Number = 0;
  totalAmount: Number = 0;
  statusList: any = [
    {
      "id": 1,
      "name": "Active"
    },
    {
      "id": 0,
      "name": "Inactive",
    }
  ];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 4,
    allowSearchFilter: true,
  };
  params = {
    student_id: null,
    amount: null,
    type: null,
    note: null,
    date: moment().format('YYYY-MM-DD')
  };

  name_search = "";
  class_search = "";
  listParams = {
    section_id: null,
    class_id: null,
    student_id: [],
    type: null,
    status: null,
    batch_id: null
  };
  validationError: any = [];

  isOpenByClick: boolean = true

  oneTime:any = false
  branch_id : any = localStorage.getItem("branch")
  currentYear_id:any = Number(('; '+document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]);

  ngOnInit(): void {
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      stateSave: true,
      stateSaveCallback: function(settings,data) {
        Object.assign(data,{
          section : that.listParams.section_id,
          class :   that.listParams.class_id,
          batch :   that.listParams.batch_id,
          student : that.listParams.student_id,
          status :  that.listParams.status, 
        })
        localStorage.setItem('DataTables_' + URLConstants.WALLETS, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.commonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.WALLETS)
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
        { data: 'student_unique_id'},
        { data: 'student_name' },
        { data: 'class_name'},
        { data: 'credited_amount', searchable: false },
        { data: 'debited_amount', searchable: false },
        { data: 'amount', searchable: false },
        { data: 'status', orderable: false,  },
        { data: 'action', orderable: false, searchable: false },
      ],
    };
  }
  setFormState(state:any) {
    this.listParams.section_id  = state?.section
    this.listParams.class_id    = state?.class
    this.listParams.batch_id    = state?.batch
    this.listParams.student_id  = state?.student
    this.listParams.status      = state?.status
  }

  // ngAfterViewInit(): void {
  //   this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
  //     dtInstance.columns().every(function () {
  //       const that = this;
  //       $('input', this.footer()).on('keyup change', function () {

  //         if (that.search() !== this['value']) {
  //           that
  //             .search(this['value'])
  //             .draw();
  //         }
  //       });
  //     });
  //   });
  // }

  reloadData(event:any = null) {
    if(event?.receipt_no){
      this.walletReceipt(event);
    }
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  walletReceipt(wallet){
    const params = {
      receipt_no      : wallet.receipt_no,
      wallet_history_id : wallet.id,
    }
    this.WalletService.walletReceipt(params).subscribe((response:any)=>{
      this.commonService.downloadFile(response,'Wallet Receipt','pdf');
    },(error:any)=>{
        this.toastr.showError(error.error.message);
    });
  }

  applyFilter() {
    this.reloadData()
    this.modalService.dismissAll();
  }
  
  reset(){
    this.listParams = {
      section_id: null,
      class_id: null,
      batch_id: null,
      student_id: [],
      status: null,
      type: null,
    };
    this.reloadData()
    this.modalService.dismissAll();
  }

  onClassSelect() {
    this.listParams.batch_id = null;
    this.listParams.student_id = [];

    this.WalletService.getBatchesList({ 'classes': [this.listParams.class_id] }).subscribe((res: any) => {
      this.batches = res.data;
    });
  }

  onBatchSelect() {
    this.listParams.student_id = [];
    this.WalletService.getStudentList(this.listParams.batch_id).subscribe((resp: any) => {
      this.studentList = resp.data
    })
  }

  loadData(dataTablesParameters?: any, callback?: any) {

    let student_ids = this.listParams.student_id.map((item: any) => item.id);

    Object.assign(dataTablesParameters, {
      section_id: this.listParams.section_id,
      class_id: this.listParams.class_id,
      batch_id: this.listParams.batch_id,
      student_id: student_ids,
      status: this.listParams.status,
      
    });
    dataTablesParameters.search.value = this.name_search != "" ? this.name_search : (this.class_search != "" ? this.class_search :dataTablesParameters.search.value)
    this.WalletService.getWalletList(dataTablesParameters).subscribe(
      (resp: any) => {

        this.tbody = resp.data;
        callback ? callback({
          recordsTotal: resp.ecordsTotal,
          recordsFiltered: resp.recordsFiltered,
          data: [],
        }) : null;
        this.activeWallets = resp.activeWallets;
        this.creditedAmount = resp.creditedAmount;
        this.debitedAmount = resp.debitedAmount;
        this.totalAmount = resp.totalAmount;
        setTimeout(() => {
          this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.columns.adjust();
          });
        }, 10);
      }
    );
  }

  openWalletMdl(walletMdl) {
    this.modalService.open(walletMdl,{
      backdrop: 'static',
      windowClass: 'duplicate-modal-section',
      backdropClass: 'duplicate-modal-backdrop'
    });
    this.WalletService.getAllStudent().subscribe(
      (resp: any) => {
        this.students = resp.data;
      }
    );
  }
  
  openVerticallyCentered(filterMdl: TemplateRef<any>) {
    this.modalService.open(filterMdl, { centered: true, windowClass: "filter-modal" });
    this.WalletService.getSectionList([]).subscribe(
      (resp: any) => {
        this.sections = resp.data;
      }
    );
    this.WalletService.getClasses().subscribe(
      (resp: any) => {
        this.classes = resp.data;
      }
    );
  }

  deleteWallet(id: any) {
    var result = confirm('Are you sure you want delete this record?');
    if (result == true) {
      this.WalletService.deleteWallet(id).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.toastr.showSuccess(resp.message);
            this.reloadData();
          } else {
            this.toastr.showError(resp.message)
          }
        }
      );
    }
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  changeStatus(event:any, wallet:any){
    const params = {
      status : event?.target?.value
    };
    wallet.status = event?.target?.value.toString();
    wallet.statusEdit = false;
    this.WalletService.updateWallet(params,wallet?.id).subscribe(
      (resp: any) => {
        if (resp.status) {
          this.toastr.showSuccess(resp.message);
          this.reloadData();
        } else {
          this.toastr.showError(resp.message)
        }
      }
    );
  }

  downloadFile(format:any){
    let student_ids = this.listParams.student_id.map((item: any) => item.id);

    let data = {
      section_id: this.listParams.section_id,
      class_id: this.listParams.class_id,
      batch_id: this.listParams.batch_id,
      student_id: student_ids,
      status: this.listParams.status,
      length: -1
    };
    this.WalletService.downloadWallet(data, format).subscribe(
      (resp: any) => {
        this.download(resp, 'wallet', format)
      }
    );
  }

  download(res: any,file: any, format:any) {
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

  walletPDF(format:string, unique_id:any, index: number){
    this.tbody[index].loading = true;
    const params = {
      start_date: "",
      end_date: "",
      student_unique_id: unique_id,
    }
  
    this.WalletService.walletPDF(params,format).subscribe((res: any) => {
      if(res.ok){
        this.commonService.downloadFile(res,'wallet-History', format);
        this.tbody[index].loading = false
      }
      else{
        this.tbody[index].loading = false
      }
    });   
  }

}
