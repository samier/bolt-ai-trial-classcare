import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../transport.service';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Toastr } from '../../../core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateFormatService } from 'src/app/service/date-format.service';
@Component({
  selector: 'app-assign-transport-list',
  templateUrl: './assign-transport-list.component.html',
  styleUrls: ['./assign-transport-list.component.scss']
})
export class AssignTransportListComponent {
  
  URLConstants = URLConstants;
  assign_transports: any = [];
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  sections = [{ id: '', name: 'Select Section' }];
  for:string = "student";
  classes: any = [];
  batches: any = [];
  params:any = {
    section: null,
    class: null,    
  };
  selectedBatches: any = [];
  selectedClasses: any = [];
  classDropdownSettings: IDropdownSettings = {};
  vehicleDropdownSettings: IDropdownSettings = {};
  vehicles:any = [];
  selectedVehicle:any = [];
  routes:any = [];
  selectedRoute:any = [];
  modelAttachments:any = [];

  fileIcons:any = {
    "pdf" : './assets/img/files/file.png',
    "png" : './assets/img/files/image.png',
    "jpg" : './assets/img/files/image.png',
    "jpeg" : './assets/img/files/image.png',
    "gif" : './assets/img/files/image.png',
    "webp" : './assets/img/files/image.png',
  };
  
  constructor(
    private transportService: TransportService,
    public CommonService: CommonService,
    private toastr: Toastr,
    public activatedRouteService: ActivatedRoute,
    private modalService: NgbModal,
    public  dateFormateService : DateFormatService,
  ) {}


  ngOnInit(): void {
    this.transportService.getSectionList(this.sections).subscribe((res: any) => {
      if (res.status) {
        this.sections = this.sections.concat(res.data);
      }
    });


    this.transportService.getClassList(this.params.section).subscribe((res) => {
      this.classes = res;
    });
    this.transportService.getVehicleAndRouteList().subscribe((res:any) => {
      this.routes = res.data.routes;
      this.vehicles = res.data.vehicles;
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
    this.vehicleDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'vehicle_no',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      scrollX: true,
      stateSaveCallback: function(settings,data) {
        Object.assign(data,{
          section : that.params.section,
          class : that.selectedClasses,
          batch : that.selectedBatches,
          bus   : that.selectedVehicle,
          route : that.selectedRoute, 
        })
        localStorage.setItem('DataTables_' + URLConstants.ASSIGN_TRANSPORT_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.ASSIGN_TRANSPORT_LIST)
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
        this.getlist(dataTablesParameters,callback)
      },
     columns: [
        { data: 'id' },
        { data: 'section' },  
        { data: 'class' }, 
        { data: 'batch' }, 
        { data: 'student' }, 
        { data: 'employee' }, 
        { data: 'transport_mode' }, 
        { data: 'pickup_route' }, 
        { data: 'pickup_stand' }, 
        { data: 'drop_route' }, 
        { data: 'drop_stand' }, 
        { data: 'fare' },
        { data: 'Detail', orderable: false },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }
  setFormState(state) {
    this.params.section = state?.section
    this.selectedClasses = state?.class
    this.selectedBatches = state?.batch
    this.selectedVehicle = state?.bus
    this.selectedRoute = state?.route
  }

  getlist(dataTablesParameters?: any, callback?:any ){
    Object.assign(dataTablesParameters,{for:this.for,section:this.params.section,classes:this.selectedClasses,batches:this.selectedBatches,vehicles:this.selectedVehicle,routes:this.selectedRoute});
    this.transportService.getAssignTransportList(dataTablesParameters).subscribe((resp:any) => {
      this.assign_transports = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }

  get_for(t_for:any){
    this.for = t_for;
    this.reloadData();
  }
  
  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  sectionChange()
  {   
      this.transportService.getClassList(this.params.section).subscribe((res: any) => {    
      this.classes = res;      
      this.onClassSelect();      
    });    
  }

  class_array:any = [];
  onClassSelect() {
    setTimeout(()=>{
      this.class_array = this.selectedClasses;
      let ids = this.class_array.map((item:any) => item.id);
      this.transportService.getBatchesList({'classes':ids}).subscribe(res=>{
        this.batches = res;
        this.selectedBatches = [];
      });
    },100);
    this.reloadData();
  }

  onBatchSelect() {
    this.reloadData();
  }
  
  onVehicleSelect() {
    this.reloadData();
  }
  
  onRouteSelect() {
    this.reloadData();
  }
  genrateExportFile(type:any){
    const params = {
      for: this.for,
      section: this.params.section,
      classes: this.selectedClasses,
      batches: this.selectedBatches,
      vehicles: this.selectedVehicle,
      routes: this.selectedRoute
    };
    if(this.params.section == null){
      this.toastr.showError("Please select section");
    }else{
      this.transportService.genrateExportFile(params,type).subscribe((res: any) => { 
        this.downloadFile(res,'transport-list', type);
      },(err:any)=>{
        this.toastr.showError(err.error.message);
      });
    } 
  }

  downloadFile(res: any,file: any, format:any) {
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if(format == 'PDF') {
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
    } else {
      let a = document.createElement('a');
      a.download = fileName;
      a.href =  pdfSrc
      a.click();
    }
  } 

  remove(id:any): void{
    if(confirm('are you sure you want to delete this assign transport ?')){
      this.transportService.deleteAssignTransport(id).subscribe((res:any) => {  
        if(res.status == true){
          this.toastr.showSuccess(res.message)
          this.reloadData(); 
        }
        else if(res.status == 'warn'){
          this.toastr.showWarning(res.message, 'WARNING')
        }else{
          this.toastr.showError(res.message)
        }
      }, (error:any) => {
        console.log(error);
        this.toastr.showError('Something went wrong');
      }); 
    }
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
  
  deleteAttachment(attachment_id:any){
    let confirm = window.confirm('Are you sure you want to delete this attachment');
    if(confirm){
      this.transportService.deleteAttachment(attachment_id).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
            this.modelAttachments = resp.data
        }else{
          this.toastr.showError(resp.message)
        }
      })
    }
  }

  attachment(content:any, row:any){
    this.modelAttachments = row.transport_attachments
    this.modalService.open(content,{
      size: 'lg',
      centered: true
    }).result.then((result) => {
    },(reason:any) => {
    });
  }

  closeModal() {
    this.modalService.dismissAll();
  }
}
