import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HostelManagementService } from '../hostel-management.service';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, CdkDropList, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-hostel-report',
  templateUrl: './hostel-report.component.html',
  styleUrls: ['./hostel-report.component.scss']
})
export class HostelReportComponent implements OnInit {
  URLConstants = URLConstants;
  hostelRoomReportForm:FormGroup = new FormGroup({})
  dropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
    enableCheckAll: true,
  };
  dropdownSettingsRoomType:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'type',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
    enableCheckAll: true,
  };
  dropdownSettingsRoom:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'room_number',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
    enableCheckAll: true,
  };
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  @ViewChild('createMdl') createMdl: ElementRef | undefined;
  tbody: any;
  errors:any = [];
  Hostels = [];
  selectedHostel:any = null;
  hostel_id: any = null;
  wings = [];
  roomTypes = [];
  room = [];
  floors:any = [];
  isPdfLoading: boolean = false;
  isExcelLoading: boolean = false;
  isReportLoading: boolean = false;
  isSendMessage: boolean = false;
  isReport = false;
  isSubmit: boolean = false
  isGetReport: boolean = false
  checked:any = false;
  recordsTotal = 0;
  selected:any = []
  students: any;
  constructor(
    private HostelManagementService: HostelManagementService,
    public commonService: CommonService,
    private fb: FormBuilder, 
    private activatedRouteService: ActivatedRoute,
    private router: Router,
    private toastr: Toastr,
    private modalService: NgbModal,
  ) { }

  // form:any = this.fb.group({
  //   hostel_id: ['',[Validators.required]],
  // });
  ngOnInit(): void {
    this.formInit();
    this.isReport = false;
    this.isPdfLoading = false;
    this.isExcelLoading = false;
    this.isReportLoading = false;
    this.isSendMessage = false;
    this.getHostelList();
    this.roomTypeList();


  }

  formInit(){
    this.hostelRoomReportForm = this.fb.group({
      hostel_id : null,
      wing_id : [],
      floor_id : [],
      room_type_id : [],
      room_id : [],
      status : "",
    })
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  getHostelList(){
    this.HostelManagementService.getHostelDropdownList().subscribe((resp:any) => {
      if(resp.status){
        this.Hostels = resp.data
      }
    })
  }

  roomTypeList(){
    this.HostelManagementService.roomTypeList().subscribe((resp:any) => {
      if(resp.status){
        this.roomTypes = resp.data;
      }
    })
  }

  handleWingChange() {
    this.hostelRoomReportForm.controls['floor_id'].reset()
    const payload = { wing_id: this.hostelRoomReportForm.value.wing_id && this.hostelRoomReportForm.value.wing_id.length > 0 ? this.hostelRoomReportForm.value.wing_id.map(ele => ele.id) : [] }
    this.HostelManagementService.hostelFloorList(payload).subscribe((resp: any) => {

      if (resp?.status) {
        this.floors = resp?.data;
        this.handleFloorChange();
      }
    })
  }

  getWingList(){
    const data = {
      hostel_id : this.hostelRoomReportForm.value.hostel_id
    };
    this.HostelManagementService.wingList(data).subscribe((resp:any) => {
      if(resp.status){
        this.wings = resp.data
        this.handleFloorChange();
      }
    })
  }

  handleFloorChange() {
    this.hostelRoomReportForm.controls['room_id'].reset();
    const payload = {
      hostel_id: this.hostelRoomReportForm.value.hostel_id,
      wing_id: this.hostelRoomReportForm.value.wing_id && this.hostelRoomReportForm.value.wing_id.length > 0 ? this.hostelRoomReportForm.value.wing_id.map(ele => ele.id) : [],
      floor_id: this.hostelRoomReportForm.value.floor_id && this.hostelRoomReportForm.value.floor_id.length > 0 ? this.hostelRoomReportForm.value.floor_id.map(ele => ele.id) : [] ,
    }
    this.HostelManagementService.roomListData(payload).subscribe((resp: any) => {
      if (resp.status) {
        this.room = resp.data
      }
    })
  }

  handleHostelChange(){
    this.hostelRoomReportForm.controls['wing_id'].reset();
    this.hostelRoomReportForm.controls['floor_id'].reset();
    this.hostelRoomReportForm.controls['wing_id'].reset();
    this.getWingList()
  }

  clear() {
    this.hostelRoomReportForm.reset()
    this.isGetReport = false
    this.tbody = []
  }

  downloadPdfAndExcel(format: any) {
    if (format == 'pdf') {
      this.isPdfLoading = true;
    } else {
      this.isExcelLoading = true;
    }

      const selectedValue = this.tbody.map(ele => ele.isSelect)
      const studentIds = this.tbody.filter((ele )=> ele.isSelect).map((ele)=> ele.student_id);
      const payload = {
        hostel_id : this.hostel_id,
        wing_id : this.hostelRoomReportForm.value.wing_id && this.hostelRoomReportForm.value.wing_id.length > 0 ? this.hostelRoomReportForm.value.wing_id.map(ele => ele.id) : [],
        floor_id : this.hostelRoomReportForm.value.floor_id && this.hostelRoomReportForm.value.floor_id.length > 0 ? this.hostelRoomReportForm.value.floor_id.map(ele => ele.id) : [] ,
        room_type_id : this.hostelRoomReportForm.value.room_type_id && this.hostelRoomReportForm.value.room_type_id.length > 0 ? this.hostelRoomReportForm.value.room_type_id?.map((item: any) => item.id) : [],
        room_id : this.hostelRoomReportForm.value.room_id && this.hostelRoomReportForm.value.room_id.length > 0 ? this.hostelRoomReportForm.value.room_id?.map((item: any) => item.id) : [],
        status : this.hostelRoomReportForm.value.status,
        studentIds : studentIds
      }
  
      this.HostelManagementService.getPdfAndExcelReport(payload, format).subscribe(
        (res: any) => {
          this.isPdfLoading = false;
          this.isExcelLoading = false;
          this.commonService.downloadFile(res, 'hostel-room-report', format);
        },
        (error) => {
          this.isPdfLoading = false;
          this.isExcelLoading = false;
        }
      );
  }

  getReport() {
    if (this.hostelRoomReportForm.invalid) {
      this.isSubmit = true;
      return
    } else {
      this.isReportLoading = true
      this.isGetReport = true      
      this.setDatatable()
      this.reloadData()
    }
  }

  setDatatable() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu:[50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
        { data: 'check',orderable:false,searchable:false},
        { data: 'created_at' },
        { data: 'hostel.name' },
        { data: 'room.wing.name'},
        { data: 'room.floor.name'},
        { data: 'room.room_type.name' },
        { data: 'student.unique_id' },
        { data: 'student.full_name' },
        { data: 'student.phone_number' },        
        { data: 'student.father_number' },
        { data: 'paid_fees' },
        { data: 'discount_fees' },
        { data: 'remaining_fees' },
      ],
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    const payload = {
      hostel_id : this.hostel_id,
      wing_id : this.hostelRoomReportForm.value.wing_id && this.hostelRoomReportForm.value.wing_id.length > 0 ? this.hostelRoomReportForm.value.wing_id.map(ele => ele.id) : [],
      floor_id : this.hostelRoomReportForm.value.floor_id && this.hostelRoomReportForm.value.floor_id.length > 0 ? this.hostelRoomReportForm.value.floor_id.map(ele => ele.id) : [] ,
      room_type_id : this.hostelRoomReportForm.value.room_type_id && this.hostelRoomReportForm.value.room_type_id.length > 0 ? this.hostelRoomReportForm.value.room_type_id?.map((item: any) => item.id) : [],
      room_id : this.hostelRoomReportForm.value.room_id && this.hostelRoomReportForm.value.room_id.length > 0 ? this.hostelRoomReportForm.value.room_id?.map((item: any) => item.id) : [],
      status : this.hostelRoomReportForm.value.status
    }
    dataTablesParameters = {
      ...dataTablesParameters,
      ...payload
    };
    this.HostelManagementService.getHostelRoomReport(dataTablesParameters).subscribe(
      (resp: any) => {
        this.isSubmit = false;
        this.tbody = resp?.data
        this.tbody.forEach(element => {
          element.isSelect = false
        });
        this.recordsTotal = resp?.recordsTotal;
        callback({
          recordsTotal: resp?.recordsTotal,
          recordsFiltered: resp?.recordsFiltered,
          data: [],
        });
        setTimeout(() => {
          this.datatableElement?.dtInstance.then(
            (dtInstance: DataTables.Api) => {
              dtInstance.columns.adjust();
            }
          );
        }, 10);
        this.isReportLoading = false;
      }
    );
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  openSMSModel(createMdl) {
    this.isSendMessage = true 
    const selectedValue = this.tbody.map(ele => ele.isSelect)
    if(this.checked || selectedValue?.filter(ele => ele == true).length > 0)
    {
      this.students = this.tbody.filter((ele )=> ele.isSelect).map((ele)=> ele.student_id)
      this.modalService.open(createMdl);
      this.isSendMessage  = false;
    }else
    {
      alert("Please Select Student");
      this.isSendMessage  = false;
    }
  }

  handleSelectAll(){
    if(this.checked) {
      this.tbody.map(ele => ele.isSelect = true)
      this.selected = this.tbody?.length ?? 0
      
    } else {
      this.tbody.map(ele => ele.isSelect = false)
      this.selected = 0
    }    
  }

  handleSelect(){
    const selectedValue = this.tbody.map(ele => ele.isSelect)   
    if(selectedValue.includes(false)){
      this.selected = selectedValue?.filter(ele => ele == true).length
      this.checked = false
    } else {
      this.checked = true
      this.selected = this.tbody?.length ?? 0
    }
  }

}
