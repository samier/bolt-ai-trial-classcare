import {Component, OnInit, TemplateRef, ViewChild, inject} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { StudentService } from "../student.service";
import { UserService } from '../../user/user.service';
import { ReportService } from "../../report/report.service";
import { enviroment } from 'src/environments/environment.staging';
import { Toastr } from 'src/app/core/services/toastr';
import { studentCategoryType } from 'src/app/common-config/static-value';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UploadProfilePictureComponent } from '../upload-profile-picture/upload-profile-picture.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit {
  //#region Public | Private Variables
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  tbody: any;
  sectionList: any = [];
  category: any = [{ id: "", name: 'All Categories' }];
  filterCount: any = 0;
  genderCounter: any;
  search:any = {
    batch_name : '',
    section_name : '',
    rollno : '',
    studentId : '',
    full_name : '',
    cast : '',
    phone_number : '',
    username : '',
    password : '',
    unique_id : '',
    created_by: '',
  };
  symfonyHost = enviroment.symfonyHost;
  filter:any = false;
  allChecked:any = false;
  classes: any = [];
  batches: any = [];
  selectedStudentIds:any = []
  studentType = studentCategoryType.map((item:any)=>{return {name:item.name, id:item.value}});
  searchTerms = new Subject<any>();
  isPdfLoading: boolean = false;
  isExcelLoading: boolean = false;
  isBoysPdfLoading: boolean = false;
  isGirlsPdfLoading: boolean = false;
  // formGroup!:FormGroup
  studentFilterForm: FormGroup | any;

  message : any = {
    is_father_message   : false ,
    is_mother_message   : false ,
    is_student_message  : false ,
  }
  is_admissionLoading : boolean = false
  // isActionMenu: boolean = true
  isOpenByClick: boolean = true

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(private studentService: StudentService,
              private UserService: UserService,
              private ReportService: ReportService,
              private formBuilder: FormBuilder,
              private toaster:Toastr,
              private modalService:NgbModal,
              public commonService: CommonService,
              public CommonService: CommonService,
              public activatedRouteService: ActivatedRoute,
              public sanitizer: DomSanitizer
            ) {
    this.searchTerms.pipe(
      debounceTime(300), 
    ).subscribe(search => {
      this.reloadData();
    });
  }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this.initDatatable();
    this.getSectionList();
    this.getClassesList();
    this.getCategoryList();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  initDatatable(){
    const that = this
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
      processing: true,
      searching: true,
      order: [[4, 'asc']],

      lengthChange: true,
      stateSave: true,
      // scrollX: true, it's not uncommented due to custom css implemented
      stateSaveCallback: function(settings,data) {
        Object.assign(data,{
          section : that.studentFilterForm.value.section ,
          class   : that.studentFilterForm.value.class ,
          batch   : that.studentFilterForm.value.batch ,
          categories : that.studentFilterForm.value.categories ,
          date : that.studentFilterForm.value.date ,
          right_to_education : that.studentFilterForm.value.right_to_education,
          old_new : that.studentFilterForm.value.old_new ,
          status : that.studentFilterForm.value.status,
        })
        localStorage.setItem('DataTables_' + URLConstants.STUDENT_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.STUDENT_LIST)
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
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        {data: 'checkbox', orderable: false, searchable: false},
        {data: 'profile_url', orderable: false, searchable: false},
        // {data: 'father image', orderable: false, searchable: false},
        // {data: 'mother image', orderable: false, searchable: false},
        {data: 'batch_name', name : 'batch.name'},
        {data: 'section_name', name : 'sections.name'},
        {data: 'rollno', name : 'rollno'},
        {data: 'studentId', name : 'studentId'},
        {data: 'full_name', name: 'full_name'},
        {data: 'cast', name: 'cast'},
        {data: 'phone_number', name: 'phone_number'},
        {data: 'username', name: 'username'},
        {data: 'password', name: 'password'},
        {data: 'unique_id', name: 'unique_id'},
        {data: 'created_by', name: 'created_by'},
        {data: 'action', orderable: false, searchable: false},
      ]
    };
  }
  setFormState(state) {
    this.studentFilterForm.controls['section'].patchValue(state?.section || null )
    this.studentFilterForm.controls['class'].patchValue(state?.class || null )
    this.studentFilterForm.controls['batch'].patchValue(state?.batch || null )
    this.studentFilterForm.controls['categories'].patchValue(state?.categories || null )
    this.studentFilterForm.controls['date'].patchValue(state?.date || null )
    this.studentFilterForm.controls['right_to_education'].patchValue(state?.right_to_education || "" )
    this.studentFilterForm.controls['old_new'].patchValue(state?.old_new || "" )
    this.studentFilterForm.controls['status'].patchValue(state?.status || true )
  }

  initForm() {
    this.studentFilterForm = this.formBuilder.group({
      section: [],
      class: [],
      batch: [],
      categories: [],
      date: [],
      right_to_education: [""],
      old_new: [""],
      status: [true],
    });
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  setsymfonyUrl(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
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

  loadData(dataTablesParameters?: any, callback?: any) {
    this.countFilters();
    const customSearchData = {
      custom_search: this.studentFilterForm.value
    };
    Object.keys(this.search).forEach((column:any) => {
      dataTablesParameters.columns.find((dtcolumn:any) => dtcolumn.data == column).search.value = this.search[column];
    });
    this.studentService.getStudentsList(Object.assign(dataTablesParameters,customSearchData)).subscribe((resp: any) => {
      this.tbody = resp?.data?.original?.data;
      this.genderCounter = resp?.data?.counter;
      this.tbody = this.tbody.map(product => ({ ...product, selected: false }));

      this.tbody.forEach(element => {
        if(element.profile_url){
          element.profile_url = element.profile_url.replace(/&amp;/g, '&');
        }
      });

      this.allChecked = false;
      this.selectedStudentIds = [];
      callback({
        recordsTotal: resp?.data?.original?.recordsFiltered,
        recordsFiltered: resp?.data?.original?.recordsFiltered,
        data: []
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

  inlineSearch(){
    this.searchTerms.next(this.search);
  }

  getSectionList() {
    this.ReportService.getSectionList({school:""}).subscribe((res: any) => {
      if (res.status) {
        this.sectionList = [{ id: '', name: 'All Section' }].concat(res?.data);
      }
    });
  }

  getClassesList(){
    // this.classes = [];
    this.batches = [];
    this.studentFilterForm.get('class').setValue(null);
    this.studentFilterForm.get('batch').setValue(null);
    this.ReportService.getStudentClassList(this.studentFilterForm.value.section).subscribe((res: any) => {
      this.classes = [{ id: '', name: 'All Class' }].concat(res?.data);
    });

    let data : any = localStorage.getItem("DataTables_student/student-list");

    if (data) {
      data = JSON.parse(data);
      this.studentFilterForm.controls['class'].patchValue(data.class)
      this.getBatchList()
    } 
  }

  getBatchList(){
    // this.batches = [];
    this.studentFilterForm.get('batch').setValue(null);
    let payload = 0

    if(!this.studentFilterForm.value.class){
      payload =  this.classes.map(ele => ele.id)
    } else {
      payload = this.studentFilterForm.value.class
    }
    
    this.ReportService.getBatchesByClass(payload).subscribe((res: any) => {
      this.batches = [{ id: '', name: 'All Batch' }].concat(res?.data);
    });
  }

  getCategoryList(){
    this.ReportService.getCategoryList().subscribe((res: any) => {
      this.category = [...this.category, ...res?.data.map((item:any)=>{return {name:item.category, id:item.id}})];
    });
  }

  studentIdGeneration(format: any, zip:boolean = false) {
    if (!this.checkRecordsSelected()) {
      this.toaster.showError("Please Select Student");
      return;
    }
    this.studentService.studentIdGeneration({students: this.selectedStudentIds},zip).subscribe((res: any) => {
      this.downloadFile(res, 'Student Id', zip ? 'zip' : format);
    });
  }

  checkRecordsSelected() {
    return this.selectedStudentIds.length > 0
  }

  downloadFile(res: any,file: any, format:any) {
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if(format == 'pdf'){
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      setTimeout(function(){
        iframe.contentWindow?.print();
      },200)

    }else{
      let a = document.createElement('a');
      a.download = fileName;
      a.href =  pdfSrc
      a.click();
    }
  }

  /**
   * Handle select all
   * @param event
   */
  handleSelectAll(event: any) {
    const checked = event.target.checked;
    this.tbody.forEach(product => {
      product.selected = checked;
      if (checked) {
        this.selectedStudentIds.push(product.id);
      } else {
        const index: number = this.selectedStudentIds.indexOf(product.id);
        if (index !== -1) {
          this.selectedStudentIds.splice(index, 1);
        }
      }
    });
  }

  /**
   * Handle single select
   * @param event
   * @param id
   */
  handleSelect(event: any, id: any) {
    if (event.target.checked) {
      this.selectedStudentIds.push(id);
    } else {
      const index: number = this.selectedStudentIds.indexOf(id);
      if (index !== -1) {
        this.selectedStudentIds.splice(index, 1);
      }
    }
    this.allChecked = this.selectedStudentIds.length == this.tbody?.length;
  }

  bonafiedCertificate(format:string)
  {
    if(!this.checkRecordsSelected()){
      this.toaster.showError("Please Select Student");
      return;
    }
    this.ReportService.getBonafiedCertificate({student_ids:this.selectedStudentIds.join(',')}).subscribe((res: any) => {
      this.downloadFile(res,'Bonafied Certificate', format);
    });
  }

  bankReport(format:string)
  {
    let param = {
      admission_start_date : this.studentFilterForm.value.date?.startDate,
      batch_id : this.studentFilterForm.value.batch,
      categoryId : this.studentFilterForm.value.categories,
      rightToEducation : this.studentFilterForm.value.right_to_education,
      sectionId : this.studentFilterForm.value.section,
      status : this.studentFilterForm.value.status,
      school_id : this.studentFilterForm.value.school
    }
    this.ReportService.bankReport(param).subscribe((res: any) => {
      this.downloadFile(res,'Bank Report', format);
    });
  }

  clearAll(){
    this.studentFilterForm.reset();
    this.studentFilterForm.get('right_to_education').setValue("");
    this.studentFilterForm.get('old_new').setValue("");
    this.studentFilterForm.get('status').setValue(true);
    this.reloadData();
  }

  downloadStudentFullReport(id:any){
    const payload = {
      is_full_report: true
    };
    this.studentService.downloadStudentFullBasicReport(id,payload).subscribe((res: any) => {
      this.downloadFile(res,'Student Full Report', 'pdf');
    });
  }

  downloadStudentBasicReport(id:any){
    const payload = {
      is_full_report: false
    };
    this.studentService.downloadStudentFullBasicReport(id,payload).subscribe((res: any) => {
      this.downloadFile(res,'Student Basic Report', 'pdf');
    });
  }

  deleteStudent(id:any){
    this.studentService.deleteStudent(id,{studentId: id}).subscribe((res: any) => {
      if(res.status){
        this.reloadData();
        this.toaster.showSuccess(res.msg);
      }else{
        this.toaster.showError(res.msg);
      }
    });
  }

  updateProfile(student:any, image_for:any = 'student'){
    const modalRef = this.modalService.open(UploadProfilePictureComponent,{
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.image_for = image_for;
    modalRef.componentInstance.student = student;
    modalRef.result?.then((response:any) => {
      if(response){
        this.reloadData();
      }
    });
  }

  downloadPdfAndExcel(format)
  {
    if (format == 'pdf') {
      this.isPdfLoading = true;
    } else {
      this.isExcelLoading = true;
    }
    
    if(this.checkRecordsSelected())
    {
      const payload = {
        studentIds : this.selectedStudentIds,
      }
  
      this.studentService.getPdfAndExcel(payload, format).subscribe(
        (res: any) => {
          this.isPdfLoading = false;
          this.isExcelLoading = false;
          this.commonService.downloadFile(res, 'student-detail', format);
        },
        (error) => {
          this.isPdfLoading = false;
          this.isExcelLoading = false;
        }
      );
    }else
    {
      this.toaster.showError("Please Select Student");
      this.isPdfLoading = false;
      this.isExcelLoading = false;
    }      
  }

  downloadExcel(format: any){

    const payload = {
      "type" : "students",
    }
    this.toaster.showInfo("Please Wait!", "Downloading your file!");
    this.studentService.getExcel(payload).subscribe(
      (res: any) => {
        this.commonService.downloadFile(res, 'students-attendance-id', format);
      },
      (error)=> {
        this.toaster.showError(error?.error?.message ?? error?.message);
      });
  }

  printData(format)
  {    
    if(this.checkRecordsSelected())
    {
      const payload = {
        studentIds : this.selectedStudentIds,
      }
  
      this.studentService.printData(payload, format).subscribe(
        (res: any) => {
          this.isPdfLoading = false;
          this.isExcelLoading = false;
          this.commonService.downloadFile(res, 'student-detail', format);
        },
        (error) => {
          this.isPdfLoading = false;
          this.isExcelLoading = false;
        }
      );
    }else
    {
      this.toaster.showError("Please Select Student");
    }
  }

  bulkDelete()
  {
    if(this.checkRecordsSelected())
    {
      this.studentService.bulkDelete({studentIds: this.selectedStudentIds}).subscribe((res: any) => {
        if(res.status == true){
          this.reloadData();
          this.toaster.showSuccess(res.message);
        }else{
          this.toaster.showError(res.message);
        }
      });
    }else
    {
      this.toaster.showError("Please Select Student");
    }    
  }

  // SEND SMS FUNCTION 
  sendAdmissionSms() {
    if (this.checkRecordsSelected()) {
      this.is_admissionLoading = true
      const payload = {
        studentIds: this.selectedStudentIds,
        is_father_message: this.message.is_father_message ? 1 : 0,
        is_mother_message: this.message.is_mother_message ? 1 : 0,
        is_student_message: this.message.is_student_message ? 1 : 0,
      }
      this.studentService.sendAdmissionSms(payload).subscribe((res: any) => {
        if (res.status == true) {
          this.reloadData();
          this.toaster.showSuccess(res.message);
          this.is_admissionLoading = false
          this.closeModel()
        } else {
          this.toaster.showError(res.message);
          this.is_admissionLoading = false
        }
      }, (error: any) => {
        this.is_admissionLoading = false
        this.toaster.showError(error?.error?.message ?? error?.message)
      });
    }
    else {
      this.toaster.showError("Please Select Student");
    }
  }

  boysGirlsCountPdf(format,value)
  {
    const payload = {      
      gender: value,      
      custom_search: this.studentFilterForm.value
    }
    if(value == 'm')
    {
      this.isBoysPdfLoading = true;
    }else
    {
      this.isGirlsPdfLoading = true;
    }
    this.studentService.boysGirlsCountPdf(payload,format).subscribe((res: any) => {            
      this.commonService.downloadFile(res, 'boys-girls-count', format);
      this.isBoysPdfLoading = false;
      this.isGirlsPdfLoading = false;
    },
    (error) => {
      this.isBoysPdfLoading = false;
      this.isGirlsPdfLoading = false;
    });
  }

  girls(format)
  {

  }

  // POP AND WHATSAPP RELATED

  // CLOSE MODAL 
  closeModel(){

    this.is_admissionLoading = false
    
    this.message.is_father_message = false
    this.message.is_mother_message = false
    this.message.is_student_message = false

    this.modalService.dismissAll()
  }

  // OPEN MODAL 
  sendAdmissionPopUp(modalName:any){

    if(this.checkRecordsSelected()){
      this.modalService.open( modalName );
    }
    else{
      this.toaster.showError("Please Select Student");
      this.closeModel()
    }
  }

  //#endregion Public methods
}

