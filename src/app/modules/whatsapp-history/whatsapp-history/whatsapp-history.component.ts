import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import dayjs from 'dayjs';
import * as moment from 'moment';
import { WhatsappHistoryService } from '../whatsapp-history.service';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-whatsapp-history',
  templateUrl: './whatsapp-history.component.html',
  styleUrls: ['./whatsapp-history.component.scss']
})
export class WhatsappHistoryComponent implements OnInit {

  searchForm:any;
  message_status:any;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  constructor(
    private whatsAppHistoryService: WhatsappHistoryService,
    public dateFormateService : DateFormatService
  ) {
    this.searchForm = new FormGroup({
      search_number: new FormControl(''),
      start_date: new FormControl(''),
      end_date: new FormControl(''),      
    });
  }

  total_sent: any = 0;
  success_sent: any = 0;
  failed_sent: any = 0;
  moment: any = moment;
  search_number:any;
  start_date:any;
  end_date:any;
  tbody:any;  

  params:any = {
    start_date: null,
    end_date: null,
    status: 'all'
  }
  selectedRange: any =  null;
  dateConfig: any = {
    applyLabel: 'Apply',
    format: 'YYYY-MM-DD',
    displayFormat: 'YYYY-MM-DD',
    cancelLabel: 'Cancel',
    clearLabel: 'Clear'
  }
  ranges: any = {
    'Today': [dayjs(), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')]
  };

  ngOnInit(): void {
    this.whatsAppHistoryService.getWhatsAppMsgCountList().subscribe((res:any) => {  
      this.total_sent = res?.data?.total_sent;
      this.success_sent = res?.data?.success_sent;
      this.failed_sent = res?.data?.failed_sent;
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200] ,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
      columns: [
        { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
        { data: 'Date', name: 'date' },
        { data: 'Name' },
        { data: 'Number' },
        { data: 'massage' },
        { data: 'status' },
      ],
    };
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  loadData(dataTablesParameters?: any, callback?: any){
    dataTablesParameters  = {...dataTablesParameters, ...this.params}
    this.whatsAppHistoryService.getWhatsAppList(dataTablesParameters).subscribe((res:any) => {
      this.tbody=res.data;   
      callback({
        recordsTotal: res.recordsTotal,
        recordsFiltered: res.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 100);
    }); 
  }  

  handleChange(){
    this.reloadData()
  }

  paginatedRecords(url:any): void{
    let param = this.getData();
    this.whatsAppHistoryService.paginatedRecords(url,param).subscribe((res:any) => {  
      this.tbody = res.data;  
    });
  }
  onSubmit(type:any){
    this.message_status=type;
    console.log('called');
    console.log(type);
    this.loadData();
    console.log(this.searchForm.value);
  }

  getData(){
    return {number:this.search_number,start_date:this.start_date,end_date:this.end_date,message_status:this.message_status};
  }

  search(){
    this.reloadData()
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
    this.reloadData();
  }

  clear(){
    this.selectedRange = null,
    this.params.start_date = null
    this.params.end_date = null
    this.params.status = 'all'
  }
}
