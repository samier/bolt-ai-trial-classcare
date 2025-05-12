import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../transport.service';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import dayjs from 'dayjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IDropdown } from 'src/app/types/interfaces';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-transport-transfer-list',
  templateUrl: './transport-transfer-list.component.html',
  styleUrls: ['./transport-transfer-list.component.scss']
})
export class TransportTransferListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  
  constructor(
    private transportService: TransportService,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    private _fb:FormBuilder,
    private _dateFormateService : DateFormatService
  ) {}

  URLConstants = URLConstants;
  tbody: any = [];
  dateConfig: any = {
    applyLabel: 'Apply',
    format: 'YYYY-MM-DD',
    displayFormat: this._dateFormateService.getFormat(),
    cancelLabel: 'Cancel',
    clearLabel: 'Clear',
    parentEl:"body"
  }
  selectedDates:any = null;
  // params:any = {
  //   dates: null,
  //   from_route: null,
  //   from_stop: null,
  //   to_route: null,
  //   to_stop: null,
  //   status: ""
  // }

  params:FormGroup = new FormGroup({})

  routes:any =[]
  from_stops:any = [];
  pickup_stops:any = [];
  drop_stops:any = [];

  statusArray : IDropdown[] = [
    {
      id:'',
      name : 'All'
    },
    {
      id:'Queue',
      name : 'Queue'
    },{
      id:'In Progress',
      name : 'In Progress'
    },{
      id:'Completed',
      name : 'Completed'
    },{
      id:'Partially Complete',
      name : 'Partially Complete'
    },{
      id:'Failed',
      name : 'Failed'
    },
  ]

  ranges: any = {
    'Today': [dayjs(), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')]
  };
  ngOnInit(): void {
    this.getTransportRouteList()
    this.initForm()
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      scrollX: true,
      stateSaveCallback: function(settings,data) {
        localStorage.setItem('DataTables_' + URLConstants.VEHICLE_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.VEHICLE_LIST)
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
        { data: 'transfer_date' }, 
        { data: 'from_route' }, 
        { data: 'from_stop' }, 
        { data: 'pickup_route' }, 
        { data: 'pickup_stop' }, 
        { data: 'drop_route' }, 
        { data: 'drop_stop' }, 
        { data: 'total_students' }, 
        { data: 'transferred_students' }, 
        { data: 'status' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  getlist(dataTablesParameters?: any, callback?:any ){
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.params.value
    }
    this.transportService.getTransportTransferList(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getTransportRouteList(){
    this.transportService.getTransportRouteList().subscribe((resp:any) => {
      this.routes = [{id: "", name: "All"}, ...resp.data]
    })
  }


  handleStop(event:any, action:any, num?:any){
    if(num == 0){
      this.params.patchValue({
        from_stop: null
      })
    }
    let data = {
      route_id: event.id
    }
    this.transportService.getTransportStopList(data).subscribe((resp:any) => {
      if(action == 'from'){
        this.from_stops = [{id: "", name: "All"}, ...resp.data]
      }
      if(action == 'to'){
        if(num == 1){
          this.pickup_stops = [{id: "", name: "All"}, ...resp.data]
          this.drop_stops = resp.data
            this.params.patchValue({
              pickup_stop: null
            })
            this.params.patchValue({
              drop_stop: null
            })
            
        }
        if(num == 2){
          this.drop_stops =[{id: "", name: "All"}, ...resp.data]
          this.params.patchValue({
            drop_stop: null
          })
        }
      }
    }) 
    this.reloadData();
  }

  handleStopChange(event:any, stop:any){
    if(this.params.value.pickup_route == this.params.value.drop_route){
      this.params.patchValue({
        drop_stop: event.id
      })
    }
    this.reloadData();
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  datesUpdated(event:any){
    let startDate = event.startDate ? event.startDate.format('YYYY-MM-DD') : null
    let endDate = null;
    // this.endDate = event.endDate ?event.endDate.format('YYYY-MM-DD') : null
    if(event.endDate?.$d == 'Invalid Date') {
      this.selectedDates= {
        startDate: event.startDate,
        endDate: event.startDate
      };
      endDate = event.startDate ? event.startDate.format('YYYY-MM-DD') : null
    } else {
      endDate  = event.endDate ?event.endDate.format('YYYY-MM-DD') : null
    }
    if(startDate && endDate) {
      this.params.value.dates = [startDate, endDate]
      this.reloadData();
      
    }else{
      this.params.value.dates = null
      this.reloadData();
    }
  }

  clear(){
    
    this.params.reset();
    this.params.patchValue({
      status: ""
    })
    this.reloadData();
  }

  initForm() {
    this.params = this._fb.group({
      dates: [null],
      from_route: [null],
      from_stop: [null],
      pickup_route: [null],
      pickup_stop: [null],
      drop_route: [null],
      drop_stop: [null],
      status: [""],
      selectedDates : [null]
    })
  }
}
