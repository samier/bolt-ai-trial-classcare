import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../transport.service';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Toastr } from '../../../core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-assign-transport',
  templateUrl: './assign-transport.component.html',
  styleUrls: ['./assign-transport.component.scss']
})
export class AssignTransportComponent {
  
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
  studentFilterForm: FormGroup | any;
  filter:any = true;
  filterCount: any = 0;
  areas:any = [];
  transport_stops:any = [];
  transport_routes:any = [];
  total_fare:any = 0;

  academicYear:any;
  calculation_type:any 

  is_saving:boolean = false;
  
  isOpenByClick: boolean = true

  transport_mode:any = [
    {name:"Two Way Transport",value:"two way transport"},
    {name:"One Way Pickup",value:"one way pickup"},
    {name:"One Way Drop",value:"one way drop"}
  ];

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
    private formBuilder: FormBuilder,
  ) {}


  initForm() {
    this.studentFilterForm = this.formBuilder.group({
      section: [],
      class: [],
      batch: [],
      status: [""],
    });
    this.countFilters()
  }

  ngOnInit(): void {
    this.transportService.systemSetting('fees_calculation_type').subscribe((res: any) => {             
      // value 0 = day wise calculation
      // value 1 = month wise calculation
      this.calculation_type = res
    });

    this.transportService.getAcademicYear().subscribe((res:any) => {
      this.academicYear = res.data;
    });
    this.initForm();
    this.transportService.getSectionList(this.sections).subscribe((res: any) => {
      if (res.status) {
        this.sections = this.sections.concat(res.data);
      }
    });
    
    this.transportService.getClassList(this.params.section).subscribe((res) => {
      this.classes = res;
    });
    
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      lengthMenu : [10, 50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      stateSaveCallback: function(settings,data) {
        Object.assign(data,{
          section : that.params.section,
          class : that.selectedClasses,
          batch : that.selectedBatches,
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
        { data: 'created_at', name: 'assign_transport_created_at' },
        { data: 'id' }, 
        { data: 'gr_number', name:'gr_number' },
        { data: 'roll_no', name:'student_roll_number.rollno' },  
        { data: 'student_name', name:'student_name' }, 
        { data: 'employee_name' }, 
        { data: 'transport_facility',orderable:false,searchable:false }, 
        { data: 'area',orderable:false,searchable:false }, 
        { data: 'transport_mode',orderable:false,searchable:false }, 
        { data: 'pickup_stand',orderable:false,searchable:false }, 
        { data: 'pickup_route',orderable:false,searchable:false }, 
        { data: 'drop_stand',orderable:false,searchable:false }, 
        { data: 'drop_route',orderable:false,searchable:false }, 
        { data: 'start_date',orderable:false,searchable:false, },
        { data: 'end_date',orderable:false,searchable:false, },
        { data: 'fare',orderable:false,searchable:false, },
        { data: 'detail',orderable:false,searchable:false, },
        { data: 'action',orderable:false,searchable:false }
      ],
      order: [[0, 'desc']]
    };
  }

  clearAll(){
    this.studentFilterForm.reset();
    this.studentFilterForm.get('status').setValue("");
    this.countFilters()
    this.reloadData();
  }

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.studentFilterForm.value).forEach((item:any)=>{
      if((this.studentFilterForm.value[item] != '' && this.studentFilterForm.value[item] != null) || item == 'status'){
        this.filterCount++;
      }
    })
    if(this.studentFilterForm.value?.date && this.studentFilterForm.value?.date?.startDate == null){
      this.filterCount--;
    }
  }

  setFormState(state) {
    this.params.section = state?.section
    this.selectedClasses = state?.class
    this.selectedBatches = state?.batch
    this.selectedVehicle = state?.bus
    this.selectedRoute = state?.route
  }

  getlist(dataTablesParameters?: any, callback?:any ){
    dataTablesParameters = { ...dataTablesParameters, ...this.studentFilterForm.value, ...{for: this.for}}
    
    this.transportService.studentTransportList(dataTablesParameters).subscribe((resp:any) => {
      this.assign_transports = resp.data;
      this.areas = resp.transport_areas;
      this.transport_stops = resp.transport_stops;
      this.transport_routes = resp.transport_routes;
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
      this.studentFilterForm.get('class').patchValue(null);
      this.studentFilterForm.get('batch').patchValue(null);
      this.countFilters();        
      this.batches = [];
      this.transportService.getClassList(this.studentFilterForm.value.section).subscribe((res: any) => {    
      this.classes = res;   
      
    });    
  }

  onClassSelect() {
    this.studentFilterForm.get('batch').patchValue(null);
    this.batches = [];
    this.countFilters();
      this.transportService.getBatchesList({'classes': [this.studentFilterForm.value.class]}).subscribe(res=>{
        this.batches = res;
        this.selectedBatches = [];
      });
  }

  handleAreaChange(item:any){
    let stands = this.transport_stops.filter((x:any) => {
      return x.area.find(el => el.id == item.area_id)
    })
    item.pickup_stand = null;
    item.pickup_route = null;
    item.drop_stand = null;
    item.drop_route = null;
    item.pickup_stand_list = stands
    item.drop_stand_list = stands
    
  }

  handleStopChange(item:any, type:any){
    let routes = this.transport_routes.filter((x:any) => {
      return x.route_stops.find(el => el.id == (type == 'pickup' ? item.pickup_stand : item.drop_stand))
    })
    if(type == 'pickup'){
      item.pickup_route = null
      item.pickup_route_list = routes
    }

    if(type == 'drop'){
      item.drop_route = null
      item.drop_route_list = routes
    }
  
    this.get_fare(item);
  }

  save(item:any){
    this.get_fare(item)

    let validation  = this.checkValidation(item);
    // if(validation.status){
      let data = {
        "section": this.for == 'student' ? item.class.section_id : null,
        "classes": this.for == 'student' ? [{"id": item.class.id}] : null,
        "batches":  this.for == 'student' ? [{"id": item.batch_detail.id}] : null,
        "students": this.for == 'student' ? [{"id": item.id, name: item.student_name}] : null,
        "employees": this.for == 'employee' ? [{"id": item.id, name: item.employee_name}] : null,
        "transport_mode": item.transport_mode,
        "pickup_route": item.transport_mode != 'one way drop' ? item.pickup_route : null,
        "pickup_stand": item.transport_mode != 'one way drop' ? item.pickup_stand : null,
        "drop_route": item.transport_mode != 'one way pickup' ? item.drop_route : null,
        "drop_stand": item.transport_mode != 'one way pickup' ? item.drop_stand : null,
        "fare": item.fare,
        "start_date": item.start_date,
        "end_date": item.end_date,
        "reason": null,
        "attachment": [],
        "id": item.transport_id,
        "section_id": this.for == 'student' ? item.class.section_id : null,
        "total_fare": this.total_fare,
        "for" : this.for,
        "area_id" : item.area_id ?? null,
        "transport_facility" : true
    }
    this.is_saving = true;
    this.transportService.saveAssignTransport(data, item.transport_id).subscribe((resp:any) => {
      if(resp.status){
        this.toastr.showSuccess(resp.message)
        this.reloadData();
      }else{
        this.toastr.showError(resp.message)
      }
      this.is_saving = false;
    },(error:any) => {
      console.log(error);
      this.is_saving = false;
    })
    // }else{
    //   this.toastr.showError('Please Select '+validation.key)
    // }
    
  }

  checkValidation(item:any) {
    let status = true;
    let keyName:any = null;
    for(let key in item){
      if(key != 'area_id'){
        if(item[key] == null || item[key] == ""){
          keyName = key
          status = false
          break;
        }
      }
    }

    let data = {
      status: status,
      key: keyName ? keyName.replaceAll('_', ' ') : null,
    }

    return data
  }

  get_fare(item:any){
    this.total_fare = 0;
    if(item.transport_mode != 'one way drop' && item.pickup_stand){
      let pickup_stand = this.transport_stops.find((el:any) => el.id == item.pickup_stand);
      this.total_fare += pickup_stand.fare
    }

    if(item.transport_mode != 'one way pickup' && item.drop_stand){
      let drop_stand = this.transport_stops.find((el:any) => el.id == item.drop_stand);
      this.total_fare += drop_stand.fare
    }

    this.getCalculatedFair(item);
  }

  getCalculatedFair(item:any){
    const AYstartTime = this.academicYear.start_time;
    const AYendTime = this.academicYear.end_time;
    const startDate = new Date(AYstartTime);
    const endDate = new Date(AYendTime);
    let fare:any = 0;
    if(item.start_date)
    {
        const asd = item.start_date?.toString();
        const tstartDate = new Date(asd);
        if(tstartDate < startDate || tstartDate > endDate){
          this.toastr.showError('please select start date in between academic year');
          return false;
        }
        var tendDate = new Date(AYendTime);
        if(item.end_date)
        {
          const aed = item.end_date?.toString();
          tendDate = new Date(aed);
          if(tendDate < startDate || tendDate > endDate){
            this.toastr.showError('please select end date in between academic year');
            return false;
          }
        }
        if(this.calculation_type == 0){
          const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))+1;
          
          const ttimeDiff = Math.abs(tendDate.getTime() - tstartDate.getTime());
          const tdaysDiff = Math.ceil(ttimeDiff / (1000 * 3600 * 24))+1;
          const percentage = tdaysDiff/daysDiff*100;
          fare = Number(this.total_fare * (percentage/100)).toFixed(0);
          
        }else if (this.calculation_type == 1){
          let monthArray:any = this.getMonths(AYstartTime, AYendTime, true);
          
          let transportMonthArray:any = this.getMonths(tstartDate, tendDate, false);


          let amount:any = 0;
          transportMonthArray.forEach((month:any) => {
            if (monthArray.includes(month)) {
              let amt = parseFloat((this.total_fare / monthArray.length).toFixed(2));
              if(tstartDate.getDate() > 15 && tstartDate.toLocaleString('default', { month: 'long' }) == month){
                amt = amt / 2;
              }
              if(tendDate.getDate() <= 15 && tendDate.toLocaleString('default', { month: 'long' }) == month){
                amt = amt / 2;
              }
              amount = amount + amt;
            }
          });
          fare = Number(amount).toFixed(0);
        }
        item.fare = fare;
    }
    return true;
  }

  getMonths(start_date:any, end_date:any, end_date_update:any){
    const start = new Date(start_date);
        const end = new Date(end_date);
        let months:any = [];
  
        if(end_date_update == true){
          end.setDate(1);
        }
  
        while (start <= end) {
            let month = start.toLocaleString('default', { month: 'long' });
            months.push(`${month}`);
  
            start.setMonth(start.getMonth() + 1);
        }
        return months
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
