import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { HraService } from 'src/app/modules/hra/hra.service';
import { DataTableDirective } from 'angular-datatables';
import { ReportService } from '../report.service';
import { Toastr } from 'src/app/core/services/toastr';
import { DatePipe } from '@angular/common';
import { enviroment } from '../../../../environments/environment.staging';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { CommonService } from 'src/app/core/services/common.service';
@Component({
  selector: 'app-transport-report',
  templateUrl: './transport-report.component.html',
  styleUrls: ['./transport-report.component.scss'],
})
export class TransportReportComponent implements OnInit {
  private API_URL = enviroment.apiUrl;

  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  tbody: any;
  constructor(
    private ReportService: ReportService,
    private toastr: Toastr,
    public datePipe: DatePipe,
    private httpRequest: HttpClient,
    public CommonService: CommonService
  ) {}
  public isSchool:any = ('; '+document.cookie)?.split(`; ISSCHOOL=`)?.pop()?.split(';')[0];
  sections = [{ id: '', name: 'All' }];
  schools:any = [{ id: '', name: 'All' }];
  classes: any = [];
  batches: any = [];
  selectedBatches: any = [];
  selectedClasses: any = [];  
  classDropdownSettings: IDropdownSettings = {}; 
  vehicles = [{ id: '', vehicle_no: 'All' }];
  routes = [{ id: '', name: 'All' }];

  stops = [{ id: '', name: 'All' }];

  status = [
    { id: '', name: 'All' },
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' },
  ];
  params = {
    from_date: '',
    to_date: '',
    section: null,
    school: null,
    class: null,
    batch: null,
    vehicle: null,
    route: null,
    stop: null,
    status: null,
  };
  ngOnInit() {

    this.ReportService.getSchoolList().subscribe((res: any) => {
      if (res.status) {
        this.schools = this.schools.concat(res.data);
      }
    });

    this.ReportService.getSectionList(this.sections).subscribe((res: any) => {
      if (res.status) {
        this.sections = this.sections.concat(res.data);
      }
    });
    
    this.ReportService.getClassList(this.params.section).subscribe((res: any) => {
      if (res.status) {
        this.classes = res.data;
      }
    });

    this.classDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

    this.ReportService.getVehicleAndRouteList().subscribe((res: any) => {
      if (res.status) {
        this.vehicles = this.vehicles.concat(res.data['vehicles']);
        this.routes = this.routes.concat(res.data['routes']);
      }
    });
    this.ReportService.getStopList().subscribe((res: any) => {
      if (res.status) {
        this.stops = this.stops.concat(res.data);
      }
    });
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
        { data: 'no' },
        { data: 'start_date' },
        { data: 'route_name' },
        { data: 'stop' },
        { data: 'section' },
        { data: 'class' },
        { data: 'batch' },
        { data: 'student' },
        { data: 'student_mobile_number' },
        { data: 'father_number' },
        { data: 'mother_number' },
        { data: 'address' },
        { data: 'created_at' },
        // { data: 'action',orderable:false,searchable:false },
      ],
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.params,
      class:this.selectedClasses,
      batch:this.selectedBatches,
    };
    this.ReportService.getTransportStudentReport(
      dataTablesParameters
    ).subscribe((resp: any) => {
      this.tbody = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: [],
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

  // downloadDriverFile(res: any) {
  //   let fileName = 'Driver-Report.pdf';
  //   let blob:Blob = res.body as Blob;
  //   let a = document.createElement('a');
  //   a.download = fileName;
  //   a.href =  window.URL.createObjectURL(blob) 
  //   a.click();
  // }

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
      iframe.contentWindow?.print();
    }else{
      let a = document.createElement('a');
      a.download = fileName;
      a.href =  pdfSrc
      a.click();
    }
  }

  downloadVehicleReport() {
    this.ReportService.getVehicleReport().subscribe((res:  any) => {
      this.downloadFile(res,'Vehicle-Report', 'pdf');
    });
  }
  downloadDriverReport() {
    this.ReportService.getDriverReport().subscribe((res: any) => {
      this.downloadFile(res,'Driver-Report','pdf');
    });
  }
  downloadRouteReport() {
    this.ReportService.getRouteReport().subscribe((res: any) => {
      this.downloadFile(res,'Route-report','pdf');
    });
  }
  downloadStudentCountReport() {
    this.ReportService.getRouteWiseStudentCountReport().subscribe((res: any) => {
        this.downloadFile(res,'Route-wise-student-count-report','pdf');
      }
    );
  }

  downloadStudentTransportReport(format: any) {
    if((this.params.school != "" && this.params.school != undefined) || this.isSchool != 1)
    {      
      this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
        this.params.class = this.selectedClasses;
        this.params.batch = this.selectedBatches;        
        let params:any = {
          ...dtInstance.ajax.params(),
          ...this.params,
        };
        params['length'] = -1;
        this.ReportService.downloadStudentTransportReport(
          params,
          format
        ).subscribe((res: any) => {
          this.downloadFile(res,'Student-transport-report', format);
        });
      });    
    }
    else
    this.toastr.showInfo("Please select school",'INFO');    
  }

  clear() {
    this.params.from_date = '';
    this.params.to_date = '';
    this.params.class = null;
    this.params.batch = null;
    this.params.route = null;
    this.params.stop = null;
    this.params.vehicle = null;
    this.params.status = null;
    this.reloadData();
  }

  fromDateChange(e: any) {
    this.params.from_date = e.target.value;
    this.reloadData();
  }

  toDateChange(e: any) {
    this.params.to_date = e.target.value;
    this.reloadData();
  }

  sectionChange()
  { 
      this.ReportService.getClassList(this.params.section).subscribe((res: any) => {      
      this.classes = res.data;      
      this.onClassSelect();        
    });    
  }

  class_array:any = [];
  onClassSelect() {
    setTimeout(()=>{
      this.class_array = this.selectedClasses;
      let ids = this.class_array.map((item:any) => item.id);
      console.log(ids);
      this.ReportService.getBatchesList({'classes':ids}).subscribe((res:any)=>{
        this.batches = res.data;
        this.selectedBatches = [];
      });
    },100);
    this.reloadData();
  }

  onBatchSelect() {
    this.reloadData();
  }

  routeChange() {
    this.params.stop = null;
    if (this.params.route != '') {
      this.ReportService.getStopListByRouteList(this.params.route).subscribe(
        (res: any) => {
          const stopData = res.data.map((x: any) => {
            return { id: x.item_id, name: x.item_text };
          });

          this.stops = [{ id: '', name: 'All' }];
          this.stops = this.stops.concat(stopData);
        }
      );
    } else {
      this.ReportService.getStopList().subscribe((res: any) => {
        if (res.status) {
          this.params.stop = null;
          this.stops = this.stops.concat(res.data);
        }
      });
    }

    this.reloadData();
  }

  schoolChange(){
    this.getSectionList();
    this.reloadData();
  }

  getSectionList(){
    this.ReportService.getSectionList({school:this.params.school}).subscribe((res: any) => {
      if (res.status) {
        this.sections = [{ id: '', name: 'All' }].concat(res.data);
      }
    });
  }  
}
