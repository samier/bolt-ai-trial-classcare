import {Component, OnInit, TemplateRef, ViewChild, inject} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Toastr } from 'src/app/core/services/toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransportService } from '../transport.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Subject } from 'rxjs';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-vehicle-document-list',
  templateUrl: './vehicle-document-list.component.html',
  styleUrls: ['./vehicle-document-list.component.scss']
})
export class VehicleDocumentListComponent implements OnInit {
  // ------------------------------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
 // ------------------------------------------------------------------------------------------------------------------------------------

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  filterCount: any = 0;
  
  filter:any = false;

  documentListForm : FormGroup | any;

  branch_id: any = window.localStorage.getItem('branch');
  user_id  : any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
   ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  vehicleNoList: any = [{id:"",name:"All Vehicle"}]
  documentTypeList  : any = [ {id:"",name:"All Document Type"} ]

  is_form : boolean = false

  tbody: any = [ ];
  vehicleNumberList : any = [ ];

  is_show : boolean = false
  is_showBTN : boolean = false
  is_loading : boolean = false

  statusList :any = [
    { id : "" , name : "All Status" },
    { id : 1 , name : "Active" },
    { id : 2 , name : "Expire Soon" },
    { id : 3 , name : "Expired" },
  ]

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;
  $destroy: Subject<void> = new Subject<void>();
   
 // ------------------------------------------------------------------------------------------------------------------------------------
 //#endregion Public | Private Variables
 // ------------------------------------------------------------------------------------------------------------------------------------

 // ------------------------------------------------------------------------------------------------------------------------------------
 // #region Lifecycle hooks
 // ------------------------------------------------------------------------------------------------------------------------------------

  constructor(
    private transportService : TransportService ,
    private formBuilder : FormBuilder ,
    private toaster:Toastr,
    public  dateFormateService : DateFormatService,
  ) { }

  ngOnInit(): void {
    this.formInit()
    this.initDatatable()
    this.documentTypeLists()
    this.numberList()
  }
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  // ------------------------------------------------------------------------------------------------------------------------------------
  // #endregion Lifecycle hooks
  // ------------------------------------------------------------------------------------------------------------------------------------

  // ------------------------------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // ------------------------------------------------------------------------------------------------------------------------------------
  
  formInit(){
    this.documentListForm = this.formBuilder.group({ 
      vehicle_no : [ "" ] ,
      document_type : [ "" ] ,
      date : [ null ] ,
      status : [ "" ] ,
    })
  }

  initDatatable(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      lengthMenu:[
        [50,100,200],
        ['Show 50 entries','Show 100 entries','Show 200 entries']
      ],
      language: {
        lengthMenu: "_MENU_"
      },
      pageLength: 50,
      serverSide: true,
      processing: false,
      searching: true,
      order: [[3, 'asc']],

      lengthChange: true,
      stateSave: true,
      scrollX: true,

      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        { data: 'id', orderable: false , searchable: false },
        { data: 'vehicle.vehicle_no'  },
        { data: 'document_type.name' },
        { data: 'start_date' },
        { data: 'end_date' },
        { data: 'status' , orderable: false , searchable: false },
      ]
    };
  }
 
  loadData(dataTablesParameters?: any, callback?: any) {
    this.is_loading = true
    this.countFilters();

    let payload = {
      branch_id        : this.branch_id ,
      academic_year_id : this.currentYear_id ,
      document_type_id : this.documentListForm?.value?.document_type || "" ,
      vehicle_number   : this.documentListForm?.value?.vehicle_no || ""  ,
      status           : this.documentListForm?.value?.status || "" ,
      start_date       : this.documentListForm?.value?.date?.startDate?.format("YYYY-MM-DD") || null  ,
      end_date         : this.documentListForm?.value?.date?.endDate?.format("YYYY-MM-DD")   || null 
    }

    this.transportService.documentList(Object.assign(dataTablesParameters,payload)).subscribe((resp: any) => {

      this.tbody = resp?.data?.original?.data

      this.tbody?.forEach(element => {
        element['statusName']= this.statusList.find((ele:any)=>{
          return ele.id === +element.status
        }).name
      });

      callback({
        recordsTotal    : resp?.data?.original?.recordsTotal,
        recordsFiltered : resp?.data?.original?.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);

      this.is_loading = false
      this.is_showBTN = false

    },(error:any)=>{

      this.toaster.showError(error.error)
      this.is_loading = false
      this.is_showBTN = false

    });
  }

  countFilters() {
    this.filterCount = 0;
    Object.keys(this.documentListForm.value).forEach((item: any) => {
      const value = this.documentListForm.value[item];
      
      if (value !== "" && value !== null) {
        if (item === 'date') {
          if (value.startDate && value.startDate !== "" && value.endDate && value.endDate !== "") {
            this.filterCount++;
          }
        } else {
          this.filterCount++;
        }
      }
    });
  }

  documentTypeLists(){
    this.transportService.getDocumentTypes('vehicle').subscribe((res:any) => {  
      if(res.status){
        this.documentTypeList = [ ...this.documentTypeList , ...res.data];
      }
    });
  }

  numberList(){
    this.transportService.getVehicleNumbers().subscribe((res:any) => {
      if(res?.status){
        this.vehicleNoList =  [ ...this.vehicleNoList , ...res.data ]
      }
    })
  }

  // ------------------------------------------------------------------------------------------------------------------------------------
  // #endregion  Private methods
  // ------------------------------------------------------------------------------------------------------------------------------------

  // ------------------------------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // ------------------------------------------------------------------------------------------------------------------------------------

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  onFormSubmit(){
    this.is_showBTN = true
    this.reloadData()
  }

  clearAll(){
    this.filterCount = 0;
    // this.documentListForm.reset()
    this.documentListForm?.controls['vehicle_no']?.patchValue("")
    this.documentListForm?.controls['document_type']?.patchValue("")
    this.documentListForm?.controls['status']?.patchValue("")
    this.documentListForm?.controls['date']?.patchValue( null )

    this.reloadData()
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }
  // ------------------------------------------------------------------------------------------------------------------------------------
  // #endregion Public methods
  // ------------------------------------------------------------------------------------------------------------------------------------

}