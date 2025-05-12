import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WalletService } from '../wallet.service';
import { DataTableDirective } from 'angular-datatables';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { DeleteOrCancelReasonComponent } from 'src/app/modules/fees/delete-or-cancel-reason/delete-or-cancel-reason.component';
import moment from 'moment';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-wallet-history',
  templateUrl: './wallet-history.component.html',
  styleUrls: ['./wallet-history.component.scss']
})
export class WalletHistoryComponent implements OnInit {

  @Input() from: any = true  // TODO: To indentify the parent renderer components
  @Input() u_id : any = null; // TODO: Student unique id

  URLConstants = URLConstants;
  balance:Number = 0;
  totalAmount: any;
  creditedAmount: any;
  debitedAmount: any;
  startDate: string | null = null;
  endDate  : string | null = null;
  student_unique_id: any = null;
  students: any = [];
  dtOptions: DataTables.Settings = {};
  @ViewChild('walletMdl') walletMdl: ElementRef | undefined;

  permanentData:any ;
  sdate: any = "";
  edate: any = "";
  listParams = {
    section_id: null,
    class_id: null,
    student_id: [],
    type: null,
    status: null,
    batch_id: null
  };
  tbody: any;
  wallet: any;
  exporting: boolean = false;

  oneTime : any = false
  branch_id : any = localStorage.getItem("branch")
  currentYear_id:any = Number(('; '+document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]);

  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  constructor(
    private route: ActivatedRoute,
    private WalletService: WalletService,
    private modalService: NgbModal,
    public commonService: CommonService,
    private toastr: Toastr,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    public  dateFormateService : DateFormatService,
  ) {}

  ngOnChanges(changes: any): void {
    if(this.from === 'student' && changes?.u_id.currentValue != changes?.u_id.previousValue) {
      this.student_unique_id = changes.u_id.currentValue;
    }
    this.reloadData();
  }

  ngOnInit(): void {
    if(this.from !='student' && !this.u_id) {
      this.student_unique_id = this.route.snapshot.paramMap.get('id');
    }else
    {
      this.student_unique_id = this.route.snapshot.paramMap.get('unique_id') 
    }    
    this.renderDatatables()
  }
  
  renderDatatables() {
    const that= this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu:[50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      stateSave: true,
      stateSaveCallback: function(settings,data) {
        localStorage.setItem('DataTables_' + URLConstants.WALLET_HISTORY, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.WALLET_HISTORY)
          let dataTableState = JSON.parse(state)
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
        { data: 'id' },
        { data: 'receipt_no' },
        { data: 'date' },
        { data: 'type' },
        { data: 'type' },
        { data: 'amount' },
        { data: 'note' },
        { data: 'action', searchable:false, orderable:false },
      ],
      responsive:true,
    };
  }

  // fetching the data for table
  getlist(dataTablesParameters?: any, callback?: any) {

    Object.assign(dataTablesParameters, {
      start_date: this.sdate,
      end_date: this.edate,
      student_unique_id: this.student_unique_id,
    });

    this.WalletService.getWalletHistory(dataTablesParameters).subscribe(
      (resp: any) => {
        this.wallet = resp;
        this.permanentData = resp.data.original.data;
        this.tbody = resp.data.original.data;
        this.creditedAmount = resp.creditedAmount;
        this.debitedAmount = resp.debitedAmount;
        this.totalAmount = this.creditedAmount - this.debitedAmount;
        callback ? callback({
          recordsTotal: resp.data.original.recordsTotal,
          recordsFiltered: resp.data.original.recordsFiltered,
          data: [],
        }) : null;
        setTimeout(() => {
          this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.columns.adjust();
          });
        }, 10);
      }
    );
  }

  reloadData(event:any = null) {
    if(event?.receipt_no){
      this.walletReceipt(event);
    }
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  startDateChange(e:any){
    this.reloadData()
    this.sdate=e.target.value
    if (this.sdate) {
      let filteredData = this.tbody.filter(item => item.date === this.sdate);
      this.tbody = filteredData;
    }
  }

  endDateChange(e:any){
    this.reloadData()
    this.edate=e.target.value
    if (this.edate) {
      let filteredData = this.tbody.filter(item => item.date === this.edate);
      this.tbody = filteredData;
    }
  }

  clear(){
    this.startDate = null;
    this.endDate = null;
    this.sdate=''
    this.edate=''
    this.reloadData()
  }

  openWalletMdl(walletMdl) {
    this.modalService.open(walletMdl);
    this.WalletService.getAllStudent().subscribe(
      (resp: any) => {
        this.students = resp.data;
      }
    );
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
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

  cancelWalletReceipt(wallet){
    const modalRef = this.modalService.open(DeleteOrCancelReasonComponent,{
      size: 'lg',
      centered: true
    });
    wallet.student_name = this.wallet?.student_name;
    modalRef.componentInstance.wallet = wallet;
    modalRef.componentInstance.receipt_no = wallet?.receipt_no;
    modalRef.componentInstance.is_cancelled = true;
    modalRef.result?.then((response:any) => {
      if(response && response.status){
        const params = {
          reason   : response.reason,
          wallet_history_id : wallet.id,
        }
        this.WalletService.cancelWalletReceipt(params).subscribe((response:any)=>{
          if(response.status){
            this.toastr.showSuccess(response.message);
            this.reloadData();
          }else{
            this.toastr.showError(response.message);
          }
        },(error:any)=>{
            this.toastr.showError(error.error.message);
        });
      }
    });

  }

  walletPDF(format:string){
    this.exporting = true
    const params = {
      start_date: this.sdate || "",
      end_date: this.edate || "",
      student_unique_id: this.student_unique_id,
    }
  
    this.WalletService.walletPDF(params,format).subscribe((res: any) => {
      if(res.ok){
        this.commonService.downloadFile(res,'wallet-History', format);
        this.exporting = false
      }else{
        this.exporting = false
        this.toastr.showError(res?.message)
      }
    }, (error)=> {
      if(error.status == 422){
      this.toastr.showError("No Data Found")
      }
      else{
        this.toastr.showError(error?.error?.message ?? error?.message)
      }
      this.exporting = false
    });   
  }
}
