import {Component, ElementRef, OnInit, Pipe, ViewChild} from '@angular/core';
import {URLConstants} from 'src/app/shared/constants/routerLink-constants';
import {DataTableDirective} from 'angular-datatables';
import {ReportService} from '../report.service';
import {Toastr} from 'src/app/core/services/toastr';
import {IDropdownSettings} from 'ng-multiselect-dropdown';
import {CommonService} from 'src/app/core/services/common.service';
import {FeesService} from "../../fees/fees.service";
import dayjs from 'dayjs';
import moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-fees-receipt-day-wise-report',
  templateUrl: './fees-receipt-day-wise-report.component.html',
  styleUrls: ['./fees-receipt-day-wise-report.component.scss']
})
export class FeesReceiptDayWiseReportComponent implements OnInit {
  @Pipe({ name: 'safeHtml' })
  dropdownList = [];
  selectedItems = [];
  dtRendered = false;
  list: any = [];
  tbody: any;
  ranges: any = {
    'Today': [dayjs(), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')]
  };
  selectedRange: any =  null;
  htmlContent: any;
  formSubmitted: boolean = false
  columns = [
    {column: 'Phone Number', name: "phone_number"},
    {column: 'Father Number', name: "father_number"},
    {column: 'Mother Number', name: "mother_number"},
  ];
  selectedRTE:any = '';
  selectedOldNew:any = '';
  categoryWiseFeesCalculation:any = false;

  constructor(
    private ReportService: ReportService,
    private toastr: Toastr,
    public commonService: CommonService,
    private feesService: FeesService,
    private sanitizer: DomSanitizer,
    private _dateFormateService : DateFormatService
  ) {
  }
  transform(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  URLConstants = URLConstants;
  sectionDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    enableCheckAll: true,
    itemsShowLimit: 3
  }
  collectorDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'full_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    enableCheckAll: true,
    itemsShowLimit: 3
  }
  categoryDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'type_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    enableCheckAll: true,
    itemsShowLimit: 3
  }

  columnDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'name',
    textField: 'column',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  classes = [];
  selectedSection = [];
  sectionList = [{id: '', name: 'All'}];
  batches = [];
  selectedBatch = [];

  public isSchool: any = ('; ' + document.cookie)?.split(`; ISSCHOOL=`)?.pop()?.split(';')[0];

  months = [];
  schools = [{id: '', name: 'All'}];
  sections = [{id: '', name: 'All'}];
  trusts: any = []
  selectedTrust:any = 'all';
  users:any = [];
  selectedUser:any = null;
  status = [{id: 'paid', name: 'Paid'}, {id: 'unpaid', name: 'Unpaid'}]
  fees: any;
  loading = true;
  checked: any = false;
  recordsTotal = 0;
  amount = 0;
  startDate: any;
  endDate: any;
  column:any = [];
  dateConfig: any = {
    applyLabel: 'Apply',
    format: 'YYYY-MM-DD',
    displayFormat: this._dateFormateService.getFormat(),
    cancelLabel: 'Cancel',
    clearLabel: 'Clear',
    parentEl:"body"
  }
  selectedReceiptOrder:any = 'asc';
  selectedStudentStatus:any = 'all';

  modes=[{id: '', name: 'All'}]
  selectedMode = '';

  categories = [{id: '', type_name: 'All'}];
  selectedCategory:any = [];

  ngOnInit() {
    this.getSectionList();
    this.getFeesCategories();
    this.getUserList();
    this.getPaymentModes();
  }

  datesUpdated(event) {
    this.startDate = event.startDate ? event.startDate.format('YYYY-MM-DD') : null
    // this.endDate = event.endDate ?event.endDate.format('YYYY-MM-DD') : null
    if(event.endDate?.$d == 'Invalid Date') {
      this.selectedRange= {
          startDate: event.startDate,
          endDate: event.startDate
        };
        this.endDate = event.startDate ? event.startDate.format('YYYY-MM-DD') : null
    } else {
      this.endDate  = event.endDate ?event.endDate.format('YYYY-MM-DD') : null
    }
    if(this.startDate && this.endDate) {
      this.getUserList();
    }
  }

  getSectionList() {
    let data = {
      branches : this.ReportService.getBranch()
    }
    this.ReportService.getSections(data).subscribe((resp: any) => {
      if (resp.status) {
        this.sectionList = resp.data;
      }
    })
  }

  getFeesCategories() {
    this.ReportService.getFeesCategories([]).subscribe((resp: any) => {
      if (resp.status) {
        this.categories = [{id:'school_fees', type_name:'School Fees'}].concat(resp.data.feesCategories);
        if(resp.data.trusts != false){
          this.trusts = [{ id: 'all', name: 'All' }, ...resp.data.trusts];
        }
        else{
          this.trusts = resp.data.trusts
        }
        console.log(this.trusts);
        
      }else{
        this.toastr.showError(resp.message);
      }
      
    });
  }

  getPaymentModes(){
    this.ReportService.getPaymentModes().subscribe((resp:any) => {
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
    this.ReportService.userList(data).subscribe((resp:any) => {
      this.users = resp.data;
      console.log(this.users);
      
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

  fetchReceiptDayWiseReport(): void {
    this.formSubmitted = true;
    if(!this.selectedSection.length || !this.startDate || !this.endDate) {
      return
    }
    let data = [];
    if (this.startDate && this.endDate) {
      data['dates'] = [this.startDate ?? '', this.endDate ?? ''];
    }
    data['sectionIds'] = this.selectedSection.map(item => {
      return item['id']
    });
    data['trust'] = this.selectedTrust;
    data['collector'] = this.selectedUser;
    data['order'] = this.selectedReceiptOrder;
    data['student_status'] = this.selectedStudentStatus;
    data['mode'] = this.selectedMode;
    data['fees_category'] = this.selectedCategory.map((x:any) => x.id);
    data['column'] = this.column  ;
    data['rte'] = this.selectedRTE;
    data['old_new'] = this.selectedOldNew;
    data['categoryWiseFeesCalculation'] = this.categoryWiseFeesCalculation;
    this.feesService.getFeesReceiptDayWiseReport(data).subscribe((resp: any) => {
      this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(resp.html);
    })
  }

  downloadPdf(type:any){
    this.formSubmitted = true;
    if(!this.selectedSection.length || !this.startDate || !this.endDate) {
      return
    }
    let data = [];
    if (this.startDate && this.endDate) {
      data['dates'] = [this.startDate ?? '', this.endDate ?? ''];
    }
    data['sectionIds'] = this.selectedSection.map(item => {
      return item['id']
    });
    data['trust'] = this.selectedTrust;
    data['collector'] = this.selectedUser;
    data['order'] = this.selectedReceiptOrder;
    data['student_status'] = this.selectedStudentStatus;
    data['mode'] = this.selectedMode;
    data['fees_category'] = this.selectedCategory.map((x:any) => x.id);
    data['column'] = this.column;
    data['rte'] = this.selectedRTE;
    data['old_new'] = this.selectedOldNew;
    data['categoryWiseFeesCalculation'] = this.categoryWiseFeesCalculation;
    this.feesService.getFeesReceiptDayWiseReportPdf(data).subscribe((resp: any) => {
      this.downloadFile(resp,'Fees-receipt-report', type);
    })
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

  cancel(){
    this.selectedSection = [];
    this.selectedRange = null;
    this.selectedTrust = 'all';
    this.selectedUser = [];
    this.selectedStudentStatus = 'all';
    this.selectedReceiptOrder = 'asc'
    this.htmlContent = null;
    this.startDate = null;
    this.endDate = null;
    this.selectedMode = '';
    this.selectedCategory = [];
    this.selectedRTE = '';
    this.selectedOldNew = '';
    this.categoryWiseFeesCalculation = false;
  }
}
