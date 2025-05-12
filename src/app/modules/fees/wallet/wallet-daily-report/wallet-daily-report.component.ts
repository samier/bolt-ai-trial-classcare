import { Component, OnInit } from '@angular/core';
import {URLConstants} from 'src/app/shared/constants/routerLink-constants';
import {Toastr} from 'src/app/core/services/toastr';
import {IDropdownSettings} from 'ng-multiselect-dropdown';
import {CommonService} from 'src/app/core/services/common.service';
import { WalletService } from '../wallet.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import dayjs from 'dayjs';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-wallet-daily-report',
  templateUrl: './wallet-daily-report.component.html',
  styleUrls: ['./wallet-daily-report.component.scss']
})
export class WalletDailyReportComponent {

  ranges: any = {
    'Today': [dayjs(), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')]
  };
  tbody: any;
  constructor(
    private toastr: Toastr,
    public commonService: CommonService,
    private walletService: WalletService,
    private _dateFormateService : DateFormatService
  ) {
    this.form = new FormGroup({            
      section: new FormControl('',[Validators.required]),     
      transactionType: new FormControl(''),
      date: new FormControl(''),
      payment_mode: new FormControl(''),
      user: new FormControl(''),
    });
  }
  form: FormGroup;
  URLConstants = URLConstants;
  sectionDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    enableCheckAll: true
  }
  collectorDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'full_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    enableCheckAll: true
  }
  selectedSection = [];
  sectionList = [{id: '', name: 'All'}];
  startDate: any;
  endDate: any;
  dateConfig: any = {
    applyLabel: 'Apply',
    format: 'YYYY-MM-DD',
    displayFormat: this._dateFormateService.getFormat(),
    cancelLabel: 'Cancel',
    clearLabel: 'Clear'
  }
  modes=[{id: '', name: 'All'}]
  selectedMode = '';
  selectedType = '';
  users:any = [];
  selectedUser:any = null;
  selectedRange: any =  null;
  htmlContent: any;
  transactionType = [
    { id: '', name: 'All' },
    { id: 'cr', name: 'Credit' },
    { id: 'dr', name: 'Debit' },   
  ];
  getReport = false;
  pdf = false;

  ngOnInit(): void {
    this.getSectionList();    
    this.getUserList();
    this.getPaymentModes();
  }

  getSectionList() {
    this.walletService.sectionList().subscribe((resp: any) => {
      if (resp.status) {
        this.sectionList = resp.data;
      }
    })
  }

  datesUpdated(event) {
    if (event.startDate) {
      this.startDate = event.startDate.format('YYYY-MM-DD')
    }
    if (event.endDate) {
      this.endDate = event.endDate.format('YYYY-MM-DD')
    }
    if(event.endDate?.$d == 'Invalid Date') {
      this.selectedRange= {
          startDate: event.startDate,
          endDate: event.startDate
        };
        this.endDate = event.startDate ? event.startDate.format('YYYY-MM-DD') : null
    } else {
      this.endDate = event.endDate ?event.endDate.format('YYYY-MM-DD') : null
    }
    // this.getUserList();
  }

  getPaymentModes(){
    this.walletService.getPaymentModes().subscribe((resp:any) => {
      if(resp.status){
        this.modes = [{ id: '', name: 'All' }, ...resp.data];
      }
    })
  }

  getUserList(){
    let data = [];
    if (this.startDate && this.endDate) {
      data['dates'] = [this.startDate ?? '', this.endDate ?? ''];
    }
    data['sectionIds'] = this.selectedSection.map(item => {
      return item['id']
    });
    this.walletService.userList(data).subscribe((resp:any) => {
      this.users = resp.data;
    })
  }

  onItemSelect(event) {
    console.log('onItemSelect', event);
    console.log('selectedSection', this.selectedSection);
    // this.getUserList();
  }

  onSelectAll(event) {
    console.log('onSelectAll', event);
    console.log('selectedSection', this.selectedSection);
    // this.getUserList();
  }

  getWalletHistoryDayWiseReport()
  {
    this.getReport = true;
    let data = [];
    if (this.startDate && this.endDate) {
      data['dates'] = [this.startDate ?? '', this.endDate ?? ''];
    }
    data['section_id'] = this.selectedSection.map(item => {
      return item['id']
    });
    data['transaction_type'] = this.form.value.transactionType;
    data['collector'] = this.form.value.user;
    data['mode'] = this.form.value.payment_mode;    
    this.walletService.getWalletHistoryDayWiseReport(data).subscribe((resp: any) => {
      console.log('resp_data',resp);      
      this.htmlContent = resp.html;
      this.getReport = false;
    })
  }

  downloadPdf(type:any)
  {
    this.pdf = true;
    let data = [];
    if (this.startDate && this.endDate) {
      data['dates'] = [this.startDate ?? '', this.endDate ?? ''];
    }
    data['section_id'] = this.selectedSection.map(item => {
      return item['id']
    });
    data['transaction_type'] = this.form.value.transactionType;
    data['collector'] = this.selectedUser;
    data['mode'] = this.selectedMode; 
    this.walletService.getWalletHistoryDayWiseReportPdf(data).subscribe((resp: any) => {
      this.downloadFile(resp,'Fees-receipt-report', type);
    })
  }

  downloadFile(res: any,file: any, format:any)
  {
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
    this.pdf = false;
  }

  clear(){
    this.selectedSection = [];
    this.selectedRange = null;    
    this.selectedUser = [];        
    this.htmlContent = null;
    this.startDate = '';
    this.endDate = '';
    this.selectedMode = '';
    this.selectedType = '';
  }
  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

}
