import { Component, ViewChild} from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ReportService } from 'src/app/modules/report/report.service';
import { TransportService } from 'src/app/modules/transport-management/transport.service';
import { DataTableDirective } from 'angular-datatables';
import { SendMessageComponent } from '../send-message/send-message.component';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-application-report',
  templateUrl: './application-report.component.html',
  styleUrls: ['./application-report.component.scss']
})
export class ApplicationReportComponent {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  
  public isSchool:any = ('; '+document.cookie)?.split(`; ISSCHOOL=`)?.pop()?.split(';')[0];
  
  sections = [{ id: '', name: 'All' }];  
  classes: any = [];
  batches: any = [];
  schools:any = [{ id: '', name: 'All' }];
  params:any = {
    section: null,
    school:null,
    class: null,    
  };
  selectedBatches: any = [];
  selectedClasses: any = [];
  selectedStatus: any = '';
  is_school=true;
  tbody:any = [];
  selectAll:any = false;

  selectedIds:any = []
  closeResult: string | undefined;
  android_url : any = ""
  iso_url : any = ""
  oneTime : any = false

  message : any = {
    send_father   : false ,
    send_mother   : false ,
    send_student  : false ,
  }
  is_admissionLoading : boolean = false
  is_showLoading : boolean = false

  constructor(
    private reportService:ReportService,
    private transportService: TransportService,
    public modalService: NgbModal,
    public toastr: Toastr,
    public CommonService: CommonService
  ){
  }
  public modalRef:any;
  URLConstants = URLConstants;
  dropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  ngOnInit() {

    this.reportService.getSchoolList().subscribe((res: any) => {
      if (res.status) {
        this.schools = this.schools.concat(res.data);
      }
    });

    this.reportService.getSectionList(this.sections).subscribe((res: any) => {
      if (res.status) {
        this.sections = this.sections.concat(res.data);
      }
    });

    this.reportService.getClassList().subscribe((res:any) => {
      this.classes = res.data;
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100, 200],
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'action',orderable:false,searchable:false },
        { data: 'section' },
        { data: 'class' }, 
        { data: 'batch' }, 
        { data: 'full_name' }, 
        { data: 'phone_number' }, 
        { data: 'username' },  
        { data: 'password' },  
        { data: 'status' },  
      ]
    };     
  }

  
  loadData(dataTablesParameters?: any, callback?:any ){
    Object.assign(dataTablesParameters,{school:this.params.school,section:this.params.section,classes:this.selectedClasses,batches:this.selectedBatches,status:this.selectedStatus});
    this.reportService.getApplicationReport(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;
      this.is_showLoading = false        
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

  sectionChange()
  {   
      this.reportService.getClassList(this.params.section).subscribe((res: any) => {    
      this.classes = res.data;      
      this.onClassSelect();      
    });    
  }

  class_array:any = [];
  onClassSelect(event?: any) {
    if(event){
      this.class_array = event;
    }else{
      this.class_array = this.selectedClasses;
    }
    let ids = this.class_array.map((item:any) => item.id);
    this.reportService.getBatchesList({'classes':ids}).subscribe((res:any)=>{
      this.batches = res.data;
    });
  }

  onBatchSelect() {}
  changeStatus() {}

  show(){
    this.is_showLoading = true
    this.reloadData();
  }
  clear(){
    this.selectedClasses = this.selectedBatches = [];
    this.selectedStatus = '';
    this.reloadData();
  }

  selectAllCheckbox(event:any){
    if(event){
      this.tbody.map((item:any) => item.selected = true);
    }else{
      this.tbody.map((item:any) => item.selected = false);
    }
    this.selectedStudentIds()
  }

  selectSingle(){
    const non_selected = this.tbody.filter((item:any) => item.selected == false || item.selected == undefined);
    if(non_selected.length > 0){
      this.selectAll = false;
    }else{
      this.selectAll = true;
    }
    this.selectedStudentIds()
  }

  selectedStudentIds(){
    this.selectedIds = this.tbody
        .filter(item => item.selected === true)
        .map(item => item.id);
  }
  qrCode(format:string){
    this.oneTime = true
    const params = {
      students : this.selectedIds
    }

    if( this.selectedIds.length > 0 ){
      this.reportService.qrCode(params,format).subscribe((res: any) => {
        this.downloadFile(res,'QR-Code-report', format);
        this.oneTime = false
      });      
    }
    else {
      this.toastr.showInfo("Please select Students ","INFO")
      this.oneTime = false
    }
  }

  urlUpdate(){
    const params = {
      android_url : this.android_url,
      ios_url : this.iso_url
    }
    if( this.android_url==null && this.iso_url == null ){
      this.toastr.showError("Please Enter At Least One Url")
    }
    else{

      this.reportService.updateURL(params).subscribe((res: any) => {
        if(res.status==true){
          this.modalService.dismissAll();
          this.toastr.showSuccess(res.message);
        }   
      },(err:any)=>{
        this.toastr.showError("Please enter at least Android or IOS URL");
      });          
    }
  }
            
            
  // this.downloadFile(res,'QR-Code-report', format);
  // this.UserService.addUser(payload).subscribe((res:any) => {


  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.reportService.getURL().subscribe((res: any) => {
      if(res.status){
        this.android_url = res?.data?.android_url || null
        this.iso_url     = res?.data?.ios_url || null
      }
    })
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  export(format:string){
    const params = {
      'section': this.params.section,
      'school': this.params.school,
      'classes':this.selectedClasses != '' ? this.selectedClasses?.map((item:any) => item.id) : [],
      'batches':this.selectedBatches != '' ? this.selectedBatches?.map((item:any) => item.id) : [],
      'status':this.selectedStatus
    };
    if((this.params.school != "" && this.params.school != undefined) || this.isSchool != 1 ){
    this.reportService.getExport(params,format).subscribe((res: any) => {
        this.downloadFile(res,'Application-report', format);
    });
  }else{
    this.toastr.showInfo("Please select school","INFO");
  }
  }

  sendMessage(){
    this.modalRef = this.modalService.open(SendMessageComponent,{
      size: 'md',
      windowClass: 'send-msg-modal',
      backdrop: 'static',
      centered: true,
    });
    this.modalRef.componentInstance.students = this.getSelectedStudents();
  }

  getSelectedStudents(){
    const selected = this.tbody?.filter((item:any) => item.selected == true);
    const students = selected?.map((item:any) => item.id);
    return students;
  }

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

  schoolChange(){
    this.getSectionList();
    this.reloadData();
  }

  getSectionList(){
    this.reportService.getSectionList({school:this.params.school}).subscribe((res: any) => {
      if (res.status) {
        this.sections = [{ id: '', name: 'All' }].concat(res.data);
      }
    });
  }
  closeModel(){
    this.tbody.forEach(element => {
      element.selected = false
    });
    this.selectAll = false


    this.is_admissionLoading = false
    
    this.message.send_father = false
    this.message.send_mother = false
    this.message.send_student  = false

    this.modalService.dismissAll()
  }

  openSMSModal(modalName:any){
    const student = this.getSelectedStudents() || []
    if(student?.length == 0){
      this.toastr.showError('Please select at least one student');
    }
    else{
      this.modalService.open(modalName)
    }
  }
  SendSMS(){
    this.is_admissionLoading = true
    const params = {
      students : this.getSelectedStudents(),
      send_father  : this.message.send_father ? 1 : 0 ,
      send_mother  : this.message.send_mother ? 1 : 0 ,
      send_student : this.message.send_student ? 1 : 0 ,
    };
    this.reportService.sendMessage(params).subscribe((res: any) => {
      this.toastr.showSuccess("Message Send Successfully");
      this.closeModel()
      this.is_admissionLoading = false
    },(err:any)=>{
      this.is_admissionLoading = false
      this.toastr.showError(err.error.message);
    });
  }
}
