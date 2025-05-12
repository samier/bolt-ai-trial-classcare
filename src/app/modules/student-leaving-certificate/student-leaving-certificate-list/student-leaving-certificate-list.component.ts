import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { TransportService } from '../../transport-management/transport.service';
import { StudentLeavingCertificateService } from '../student-leaving-certificate.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Toastr } from '../../../core/services/toastr';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import dayjs from 'dayjs';
import { enviroment } from 'src/environments/environment.staging';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-student-leaving-certificate-list',
  templateUrl: './student-leaving-certificate-list.component.html',
  styleUrls: ['./student-leaving-certificate-list.component.scss']
})

export class StudentLeavingCertificateListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  constructor(
    private transportService: TransportService,
    private leavingCertificateService: StudentLeavingCertificateService,
    private toastr: Toastr,
    public CommonService: CommonService,
    private modalService: NgbModal,
    public activatedRouteService: ActivatedRoute,
    private _dateFormateService : DateFormatService
  ) {}

  symfonyHost = enviroment.symfonyHost;
  filter:any = false;
  URLConstants = URLConstants;
  students: any = [];
  classes: any = [];
  batches: any = [];
  academicYears: any = [];
  academicYearKeys: any = null;
  selectedBatches: any = [];
  selectedClasses: any = [];
  studentStatus: any = "";
  startDate: any = null;
  endDate: any = null;
  academicYear: any = "";
  sections: any = [];
  lc_type:any = ''
  selected_date_range:any = null
  selectedSection: any = [];
  generate = false;
  attachment_loading = false;
  classDropdownSettings: IDropdownSettings = {};
  fileIcons:any = {
    "pdf" : './assets/img/files/file.png',
    "png" : './assets/img/files/image.png',
    "jpg" : './assets/img/files/image.png',
    "jpeg" : './assets/img/files/image.png',
    "gif" : './assets/img/files/image.png',
    "webp" : './assets/img/files/image.png',
  };
  pdfLoading = false;
  excelLoading = false;
  lc_start_date:any = null
  lc_end_date:any = null
  dateConfig: any = {
    applyLabel: 'Apply',
    format: 'YYYY-MM-DD',
    displayFormat: this._dateFormateService.getFormat(),
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

  attachments:any = [];
  filterCount : number = 0
  isOpenByClick: boolean = true

  ngOnInit(): void {
    this.leavingCertificateService.getSectionListByBranch().subscribe((res:any) => {  
      this.sections = res;
    });
    
    this.leavingCertificateService.getClassList().subscribe((res: any) => {
        this.classes = res;          
    });
    this.leavingCertificateService.getAcademicYearIdName().subscribe((res:any) => {  
      this.academicYears = res?.data;
      this.academicYearKeys = Object.keys(this.academicYears);
    });
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      // scrollX: true,
      stateSaveCallback: function(settings,data) {
        Object.assign(data,{
          classes:that.selectedClasses, 
          batches:that.selectedBatches, 
          start_date:that.startDate, 
          end_date:that.endDate, 
          lc_status:that.studentStatus, 
          academic_year:that.academicYear, 
          sections: that.selectedSection
        });
        localStorage.setItem('DataTables_' + URLConstants.LEAVING_CERTIFICATE_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.LEAVING_CERTIFICATE_LIST)
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
        { data: 'leaving_date' },
        { data: 'class' },
        { data: 'batch' },
        { data: 'gr_number' }, 
        { data: 'student_full_name', name: 'student.first_name' }, 
        { data: 'action',orderable:false,searchable:false },
        { data: 'action_lc',orderable:false,searchable:false }
      ],
      responsive:true,
    };

    this.classDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }
  countFilter(){
  const obj = {
    selectedSection : this.selectedSection || null,
    selectedClasses : this.selectedClasses || null,
    selectedBatches : this.selectedBatches || null,
    studentStatus   : this.studentStatus || null,
    startDate       : this.startDate || null,
    endDate         : this.endDate || null,
    academicYear    : this.academicYear || null,
    lc_type         : this.lc_type || null,
    selected_date_range : this.selected_date_range || null,
  }
  this.filterCount = 0;
  Object.keys(obj)?.forEach((key) => {
    const value = obj[key];
    
    if (value !== null && value !== '' && value !== undefined) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const allNull = Object.values(value).every(val => val === null);
        
        if (!allNull) {
          this.filterCount++;
        }
      } 
      else if (Array.isArray(value) && value?.length > 0) {
        this.filterCount++;
      } 
      else if (!Array.isArray(value)) {
        this.filterCount++;
      }
    }
  });

}

  setFormState(state) {
    this.selectedClasses= state?.classes
    this.selectedBatches = state?.batches
    this.startDate = state?.start_date
    this.endDate = state?.end_date
    this.studentStatus = state?.lc_status
    this.academicYear= state?.academic_year
    this.selectedSection = state?.sections
  }

  getlist(dataTablesParameters?: any, callback?:any ){
    this.countFilter()
    Object.assign(dataTablesParameters,{classes:this.selectedClasses, batches:this.selectedBatches, start_date:this.startDate, end_date:this.endDate, lc_status:this.studentStatus, academic_year:this.academicYear, sections: this.selectedSection, lc_type: this.lc_type, lc_start_date: this.lc_start_date, lc_end_date: this.lc_end_date});
    this.leavingCertificateService.getStudentList(dataTablesParameters).subscribe((resp:any) => {
      this.students = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
    });
  }

  download(format:any){
    if(format == 'pdf'){
      this.pdfLoading = true;
    }
    if(format == 'excel'){
      this.excelLoading = true;
    }
    let data = {classes:this.selectedClasses, batches:this.selectedBatches, start_date:this.startDate, end_date:this.endDate, lc_status:this.studentStatus, academic_year:this.academicYear, sections: this.selectedSection, lc_type: this.lc_type, length: -1, lc_start_date: this.lc_start_date, lc_end_date: this.lc_end_date}
    this.leavingCertificateService.studentLCListDownload(data, format).subscribe((resp:any) => {
      this.pdfLoading = false;
      this.excelLoading = false;
      this.downloadFile(resp, 'student-lc-list', format)
    }, (error:any) => {
      console.log(error);
      this.pdfLoading = false;
      this.excelLoading = false;
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  remove(id:any): void{
    if(confirm('Are you sure you want to delete this LC ?')){
      this.leavingCertificateService.removeLc(id).subscribe((res:any) => { 
        if(res.status) {
          this.toastr.showSuccess(res.message);
        } else {
          this.toastr.showError(res.message);
        }
        this.reloadData();
      }); 
    }
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  section_array:any = [];  
  onSectionSelect(){
    setTimeout(()=>{
      this.section_array = this.selectedSection;
      let ids = this.section_array.map((item:any) => item.id);
      this.leavingCertificateService.getClassesList({'section_id': ids}).subscribe((res:any) => {
        this.classes = res;
        this.selectedClasses = [];
        // console.log("hello ", this.classes);
      });
    },100);
    // this.reloadData();
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
    // this.reloadData();
  }

  batch_array:any = [];
  onBatchSelect() {
    this.batch_array = this.selectedBatches;
    let ids = this.batch_array.map((item:any) => item.id); 
    // this.reloadData();
  }

  onAcademicYearChange(event: any) {
    this.academicYear = event.target.value;
    // this.reloadData();
  }

  onStatusChange(event: any) {
    this.studentStatus = event.target.value;
    // this.reloadData();
  }

  onStartDateChange(event: any) {
    this.startDate = event.target.value;
    // this.reloadData();
  }

  onEndDateChange(event: any) {
    this.endDate = event.target.value;
    // this.reloadData();
  }

  onLcTypeChange(event:any){
    this.lc_type = event.target.value;
    // this.reloadData();
  }

  //Inline LC status change time update status
  onLcStatusChange(event: any, student_id:any) {
    let lc_status = event.target.value;
    if(lc_status) {
      const data = {
        'lc_status': lc_status
      }
      this.leavingCertificateService.updateLCStatus(student_id,data).subscribe((res:any) => {
        if(res.status) {
          this.toastr.showSuccess(res.message);
        } else {
          this.toastr.showError(res.message);
        }
        // this.reloadData();
      })
    } else {
      this.toastr.showError("Please select valid option");
      // this.reloadData();
    }
  }

  //Clear all filter when click on clear button
  clearAllFilter() {
    this.selectedClasses = [];
    this.selectedBatches = [];
    this.selectedSection = [];
    this.startDate = null;
    this.endDate = null;
    this.studentStatus = null;
    this.academicYear = null;
    this.lc_type = "";
    this.selected_date_range = null;
    this.lc_start_date = null;
    this.lc_end_date = null;
    this.reloadData();
  }

  makeDateFormat(leavingDate:any) {
    return moment(leavingDate).format(this._dateFormateService.getFormat());
  }

  view(student_id:any)
  {
    this.leavingCertificateService.view(student_id).subscribe(async(res:any) => {        
      if(res?.body?.type == 'application/json') {
        const data = JSON.parse(await res.body.text());
        if(data.status == false){
          this.toastr.showError(data.message);
        }
      } else {        
        this.downloadFile(res,'leaving-certificate', "pdf");        
      }  
      this.generate = false;    
    });
  }


  downloadFile(res: any,file: any, format:any) {
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if(format == 'pdf') {
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
    this.generate = false;
  } 

  attachment(content:any, row:any){
    this.attachment_loading = true;
    this.attachments = null;
    this.leavingCertificateService.getLcAttachment({id : row.id}).subscribe((resp:any) => {
      if(resp.status){
        this.attachments = resp.data
      }else{
        this.toastr.showError(resp.message)
      }
      this.attachment_loading = false;
    })
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

  deleteAttachment(file:any){
    let confirm = window.confirm('Are you sure you want to delete this attachment?')
    if(confirm){
      this.leavingCertificateService.deleteAttachment(file.id).subscribe((resp:any) => {
        if(resp.status){
          this.attachments = resp.data;
          this.toastr.showSuccess(resp.message)
        }else{
          this.toastr.showError(resp.message)
        }
      }), (error:any) => {
        console.log(error);
      }
    }
    
  }

  setsymfonyUrl(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }

  datesUpdated(event) {
    if (event.startDate) {
      this.lc_start_date = event.startDate.format('YYYY-MM-DD')
    }
    else{
      this.lc_start_date = null;
    }
    if (event.endDate) {
      this.lc_end_date = event.endDate.format('YYYY-MM-DD')
    }else{
      this.lc_end_date = null;
    }
    if(event.endDate?.$d == 'Invalid Date') {
      this.selected_date_range= {
        startDate: event.startDate,
        endDate: event.startDate
      };
      this.lc_end_date = event.startDate.format('YYYY-MM-DD')
    } else {
      this.lc_end_date  = event.endDate ?event.endDate.format('YYYY-MM-DD') : null
    }
    // this.reloadData();

  }
}

