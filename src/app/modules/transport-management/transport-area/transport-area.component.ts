import { Component,ViewChild, OnInit } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../transport.service';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-transport-area',
  templateUrl: './transport-area.component.html',
  styleUrls: ['./transport-area.component.scss']
})
export class transportAreaComponent implements OnInit {
  
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  TransportArea: FormGroup;
  tbody:any

  
  isOpenByClick: boolean = true

  constructor(
    private transportService: TransportService,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    private modalService: NgbModal,
    private _fb: FormBuilder,
    private toastr: Toastr,
  ) {
    this.TransportArea = this._fb.group({
      id: [null],
      name: [null, Validators.required],
      stops: [null],
    });
  }

  URLConstants = URLConstants;
  stops: any = [];
  errors:any = [];

  ngOnInit(): void {
    this.getStops();
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      stateSaveCallback: function(settings,data) {
        localStorage.setItem('DataTables_' + URLConstants.STOPS_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.STOPS_LIST)
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
        { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
        { data: 'name' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  getStops(){
    this.transportService.getStops().subscribe((resp:any) =>{
      this.stops = resp.data
    })
  }
  
  getlist(dataTablesParameters?: any, callback?:any ){
    this.transportService.TransportAreaList(dataTablesParameters).subscribe((resp:any) => {
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

  remove(id:any): void{
    if(confirm('are you sure you want to delete this stop ?')){
      this.transportService.deleteTransportArea(id).subscribe((resp:any) => {  
        if(resp.status){
          this.toastr.showSuccess(resp.message);
          this.reloadData(); 
        }else{
          this.toastr.showError(resp.message);
        }
      }, (error:any) => {
          console.log(error);
          
      }); 
    }
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  save(){
    this.transportService.storeTransportArea(this.TransportArea.value).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message);
          this.reloadData()
          this.modalService.dismissAll();
        }else{
          this.toastr.showError(resp.message);
        }
    }, (error:any) => {
      this.errors = error.error.errors
    })
  }

  open(content:any, record:any){
    this.TransportArea.reset();
    if(record){
      this.TransportArea.controls['id'].patchValue(record.id);
      this.TransportArea.controls['name'].patchValue(record.name);
      this.TransportArea.controls['stops'].patchValue(record.stops);
    }
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title',  size: 'lg',centered:true })
      .result.then((result) => {
        
      });
  }

}
