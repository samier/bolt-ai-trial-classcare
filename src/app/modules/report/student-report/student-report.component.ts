import { map } from 'rxjs';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ReportService } from '../report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { DataTableDirective } from 'angular-datatables';
import { StudentLeavingCertificateService } from '../../student-leaving-certificate/student-leaving-certificate.service';
import columns from './student.service';
import { CommonService } from 'src/app/core/services/common.service';


@Component({
  selector: 'app-student-report',
  templateUrl: './student-report.component.html',
  styleUrls: ['./student-report.component.scss'],
})
export class StudentReportComponent {
  constructor(
    private ReportService: ReportService,
    private activatedRouteService: ActivatedRoute,
    private router: Router,
    private toastr: Toastr,
    private leavingCertificateService: StudentLeavingCertificateService,
    public CommonService: CommonService
  ) {}

  dtOptions: DataTables.Settings = {};
  // dtOptionsForCategory: DataTables.Settings = {};
  // dtOptionsForGender: DataTables.Settings = {};
  // dtOptionsForActiveStatus: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  // datatableElementCategory: DataTableDirective | null = null;
  // datatableElementGender: DataTableDirective | null = null;
  // datatableElemenActiveStatus: DataTableDirective | null = null;

  URLConstants = URLConstants;
  download_format: string = '';
  report_type = 1;
  dtRendered = false;
  dtRendered2 = true;
  dropdownList = [];
  selectedItems = [];
  public isSchool: any = ('; ' + document.cookie)
    ?.split(`; ISSCHOOL=`)
    ?.pop()
    ?.split(';')[0];
  commonDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
    // limitSelection: 10,
  };

  tbody: any[] = [];
  sections = [];
  classes: any = [];
  schools: any = [{ id: '', name: 'All' }];
  batches: any = [];
  selectedBatches: any = [];
  selectedSections: any[] = [];
  selectedClasses: any = [];
  classDropdownSettings: IDropdownSettings = {};
  student_status = [
    { id: '', name: 'All' },
    { id: '1', name: 'Active' },
    { id: '0', name: 'InActive' },
  ];
  //student_field_list: = [{ id: '', name: 'All' }];
  student_field_list: any = [];
  list: any = [];
  field_list: any = [];
  selectedStudentField: any = [];
  params:any = {
    section: '',
    class: null,
    // school: 0,
    batch: null,
    status: null,
    rte: '',
    old_new: '',
    admission_start_date: null,
    admission_end_date: null,
    student_field: [],
    is_mobile_report : false
  };
  loading = false;
  templateList: any[] = [];
  selectedTemplate: any;
  tamplateName: string = '';
  queryParams;
  isPdfLoading: boolean = false;
  isExcelLoading: boolean = false;
  isSubmitTamplate: boolean = false;
  isDelete: boolean = false;
  isStudentReportLoad: boolean = false;
  columns : any

  ngOnInit(): void {
    this.loading = true;

    this.ReportService.getSchoolList().subscribe((res: any) => {
      if (res.status) {
        this.schools = this.schools.concat(res.data);
      }
    });

    this.getSectionList();

    // this.getClasses('');

    this.classDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };

    this.ReportService.getStudentTableAllFieldList().subscribe((res: any) => {
      this.columns = {...columns, ...res.data.custome_fields}
      this.dropdownList = res?.data?.static_field;
      this.list = res?.data?.dynamic_field;
    });


    this.activatedRouteService.queryParamMap.subscribe((ele) => {
      this.queryParams = ele.get('isDefaultTemplate') || null;
      this.getTemplateList();
      this.resetTemplateData();
      if(this.sections.length > 1) {
        // const classesId = this.sections.map(ele => ele.id).filter((ele)=>{ Number(ele)});
          if(!this.queryParams) {
            this.getAllClasses()
          }
      }
      // if(!this.queryParams) {
        // this.setDatatable(null, this.dropdownList);
      // }
    });
  }

  field_list_for_html = [];
  default_list = [
    { data: 'id' },
    { data: 'first_name' },
    { data: 'secondary_first_name' },
    { data: 'middle_name' },
    { data: 'secondary_middle_name' },
    { data: 'last_name' },
    { data: 'secondary_last_name' },
    { data: 'student_display_name' },
    { data: 'section_name' },
    { data: 'class_name' },
    { data: 'batch_name' },
    { data: 'address' },
    { data: 'school' },
    { data: 'previous_school_category' },
    { data: 'previous_school_city_village' },
    { data: 'date_of_birth' },
    { data: 'email' },
    { data: 'gender' },
    { data: 'admission_date' },
    { data: 'admission_year' },
    { data: 'rollno',class:'orange-text-color' },
    { data: 'username' },
    { data: 'password' },
    { data: 'phone_number' },
    { data: 'payOnDate' },
    { data: 'categories' },
    { data: 'percentage' },
    { data: 'bankname' },
    { data: 'branchifsc' },
    { data: 'adharcard' },
    { data: 'apaar_id'},
    { data: 'othernumber' },
    { data: 'accountnumber' },
    { data: 'ifsccode' },
    { data: 'gr_number' },
    { data: 'hall_ticket_SID_number'},
    { data: 'mother_name' },
    { data: 'residential_area' },
    { data: 'hometown' },
    { data: 'college_area' },
    { data: 'reference' },
    { data: 'ssc' },
    { data: 'hsc' },
    { data: 'rightToEducation' },
    { data: 'old_new' },
    { data: 'father_name' },
    { data: 'mother_occupation' },
    { data: 'father_occupation' },
    { data: 'father_number' },
    { data: 'mother_number' },
    { data: 'send_sms_number' },
    { data: 'status' },
    { data: 'uidNo' },
    { data: 'studentWhatsappNo' },
    { data: 'bloodGroup' },
    { data: 'birthPlace' },
    { data: 'religion' },
    { data: 'nationality' },
    { data: 'parentWhatsappNo' },
    { data: 'parentEmail' },
    { data: 'permanentAddress' },
    { data: 'sameAddress' },
    { data: 'currentCity' },
    { data: 'siblingInfo' },
    { data: 'leaving_date' },
    { data: 'progress' },
    { data: 'conduct' },
    { data: 'working_days_school' },
    { data: 'reason_leaving_school' },
    { data: 'result_last_examination' },
    { data: 'age' },
    { data: 'permanentCity' },
    { data: 'remark' },
  ];
  setDatatable(fields: any = null, htmlFields: any) {
    if (fields == null) {
      fields = this.default_list;
    }
    this.field_list_for_html = htmlFields;

    const index = fields.findIndex(item => item.data === "rollno");
    const sorting = index > 0 ? index : 0;

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      order: [[sorting, 'asc']],
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: fields,
    };
  }

  onItemSelect(item: any) {
    this.dtRendered = false;
    this.dtRendered2 = false;
    let data_array: any = [];
    let data_array2: any = [];
    let headerColumns: any = [];
    this.selectedItems.forEach((value) => {
      if(value == 'GR Number' || value == 'Student Id'){
        data_array.push({ data: "studentId" });
      }else {
        data_array.push({ data: this.columns[value] });
      }
      headerColumns.push({ data: value });
      data_array2.push(value);
    });
    this.field_list = data_array2;
    this.setDatatable(data_array, headerColumns);
    setTimeout(() => {
      this.dtRendered = true;
    }, 100);
    this.params.student_field = this.selectedItems;
    // this.reloadData();
    //this.field_list_for_html=this.selectedItems;
  }

  onSelectAll(items: any) {
    this.params.student_field = [];
    this.params.student_field = this.student_field_list;
    this.reloadData();
  }

  // onItemDeSelect(item: any) {
  //   this.dtRendered = false;
  //   this.dtRendered2 = false;
  //   let data_array: any = [];
  //   let data_array2: any = [];
  //   let headerColumns: any = [];
  //   this.selectedItems.forEach(function (value) {
  //     data_array.push({ data: columns[value] });
  //     headerColumns.push({ data: value });
  //     data_array2.push(value);
  //   });

  //   this.field_list = data_array2;
  //   if (data_array2.length > 0) {
  //     this.setDatatable(data_array, headerColumns);
  //     setTimeout(() => {
  //       this.dtRendered = true;
  //     }, 100);
  //     this.params.student_field = this.selectedItems;
  //     this.reloadData();
  //   } else {
  //     this.dtRendered2 = true;
  //     this.setDatatable(null, headerColumns);
  //     this.reloadDataForGenderReport();
  //   }
  // }

  // onDeSelectAll() {
  //   this.params.student_field = [];
  //   this.reloadData();
  // }

  downloadFile(res: any, file: any, format: any) {
    if (this.tbody.length == 0) {
      return this.toastr.showInfo('There is no records', 'INFO');
    }
    let fileName = file;
    let blob: Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob);
    if (format == 'pdf') {
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      setTimeout(() => {
        iframe.contentWindow?.print();
      }, 200);
      //iframe.contentWindow?.print();
    } else {
      let a = document.createElement('a');
      a.download = fileName;
      a.href = pdfSrc;
      a.click();
    }
  }

  // downloadPdf(value: any) {
  //   this.download_format = value;
  //   this.ReportService.getStudentCategoryReport(
  //     this.download_format
  //     // this.params.school
  //   ).subscribe((res: any) => {
  //     this.downloadFile(res, 'Student-category-report', value);
  //   });
  // }

  // downloadExcel(value: any) {
  //   this.download_format = value;
  //   this.ReportService.getStudentCategoryReport(
  //     this.download_format
  //     // this.params.school
  //   ).subscribe((res: any) => {
  //     this.downloadFile(res, 'Student-category-report', value);
  //   });
  // }

  // downloadGenderPdf(value: any) {
  //   this.download_format = value;
  //   this.ReportService.downloadClasswiseStudentGenderSummaryReport(
  //     this.download_format
  //     // this.params.school
  //   ).subscribe((res: any) => {
  //     this.downloadFile(res, 'class-wise-gender-report', 'pdf');
  //   });
  // }

  // downloadGenderExcel(value: any) {
  //   this.download_format = value;
  //   this.ReportService.downloadClasswiseStudentGenderSummaryReport(
  //     this.download_format
  //     // this.params.school
  //   ).subscribe((res: any) => {
  //     this.downloadFile(res, 'class-wise-gender-report', 'excel');
  //   });
  // }

  // downloadActiveInActivePdf(value: any) {
  //   this.download_format = value;
  //   this.ReportService.downloadClasswiseStudentActiveInActiveSummaryReport(
  //     this.download_format
  //     // this.params.school
  //   ).subscribe((res: any) => {
  //     this.downloadFile(res, 'student-active-inactive-report', 'pdf');
  //   });
  // }

  // downloadActiveInActiveExcel(value: any) {
  //   this.download_format = value;
  //   this.ReportService.downloadClasswiseStudentActiveInActiveSummaryReport(
  //     this.download_format
  //     // this.params.school
  //   ).subscribe((res: any) => {
  //     this.downloadFile(res, 'student-active-inactive-report', 'excel');
  //   });
  // }

  // setUrl(url: string) {
  //   return '/' + window.localStorage.getItem('branch') + '/' + url;
  // }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.params.section = this.selectedSections.length == 0 ? this.sections.filter((el:any) => el.id != "").map((x:any) => x.id) : this.selectedSections
    this.isStudentReportLoad = true
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.params,
      class: this.selectedClasses,
      batch: this.selectedBatches,
    };

    if (this.queryParams == 'student-call-report' && this.isDelete) {
      dataTablesParameters.is_mobile_report = true;
    }
    this.ReportService.generateStudentGrReport(dataTablesParameters).subscribe(
      (resp: any) => {
        this.isStudentReportLoad = false
        this.tbody = resp?.data?.record?.original?.data;
        this.list = resp?.data?.studentField;
        this.loading = false;
        callback({
          recordsTotal: resp?.data?.record?.original?.recordsTotal,
          recordsFiltered: resp?.data?.record?.original?.recordsFiltered,
          data: [],
        });
        setTimeout(() => {
          this.datatableElement?.dtInstance.then(
            (dtInstance: DataTables.Api) => {
              dtInstance.columns.adjust();
            }
          );
        }, 10);
      }
    );
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  // fromDateChange(e: any) {
  //   this.params.admission_start_date = e.target.value;
  //   this.reloadData();
  // }

  // toDateChange(e: any) {
  //   this.params.admission_end_date = e.target.value;
  //   this.reloadData();
  // }

  sectionChange(event:any, type:any) {
    this.params.class = null
    this.selectedClasses = []
    let sections: any[];
    if(type=='all'){
      sections = event.length == 0 ? event.map((x:any) => x.id) : event.map((el:any) => el.id);
    }else{
      sections = this.selectedSections.length == 0 ? this.sections.filter((el:any) => el.id != "").map((x:any) => x.id) : this.selectedSections.map((el:any) => el.id);
    }
    this.ReportService.getClassListForMaster(sections, this.ReportService.getBranch(), this.ReportService.getAcademicYearIs()).subscribe(
      (res: any) => {
        this.classes = res.data;
        this.onClassSelect();
      }
    );
  }

  // class_array: any = [];
  onClassSelect() {
    setTimeout(() => {
      // this.class_array = this.selectedClasses;
      let ids = this.selectedClasses.map((item: any) => item.id);
      this.ReportService.getBatchesList({ classes: ids }).subscribe(
        (res: any) => {
          this.batches = res.data;
          this.selectedBatches = [];
        }
      );
    }, 100);
    // this.reloadData();
  }

  onBatchSelect() {
    // this.reloadData();
  }

  student_field_array: any = [];
  onStudentFieldSelect() {
    this.params.student_field = this.selectedStudentField;
    // this.reloadData();
  }
  onStudentFieldSelectAll() {
    this.params.student_field = [];
    this.params.student_field = this.student_field_list;
    // this.reloadData();
  }
  onStudentFieldDeSelectAll() {
    this.params.student_field = [];
    // this.reloadData();
  }

  // downloadGrReportPdf(format: string) {
  //   if (this.params.school == 0 && this.isSchool == 1) {
  //     this.toastr.showError('Please select school');
  //   } else {
  //     switch (this.report_type) {
  //       case 2: // for studentCategoryReport
  //         if (format == 'pdf') this.downloadPdf('pdf');
  //         else this.downloadExcel('excel');
  //         break;
  //       case 3: // for studentGenderReport
  //         if (format == 'pdf') this.downloadGenderPdf('pdf');
  //         else this.downloadGenderExcel('excel');
  //         break;
  //       case 4: // for studentActiveStatusReport
  //         if (format == 'pdf') this.downloadActiveInActivePdf('pdf');
  //         else this.downloadActiveInActiveExcel('excel');
  //         break;
  //       default:
  //         this.downloadStudentReportCall(format);
  //         break;
  //     }
  //   }
  // }

  downloadStudentReportCall(format: string) {
    // this.params.student_field = this.selectedStudentField;
    this.params.class = this.selectedClasses;
    this.params.batch = this.selectedBatches;
    this.ReportService.downloadStudentReport(this.params, format).subscribe(
      (res: any) => {
        if (format == 'pdf') {
          this.downloadFile(res, 'student-details-report', format);
        } else {
          if (res.status) {
            this.downloadFile(res, 'student-details-report', format);
          } else {
            this.toastr.showError(res.message);
          }
        }
      }
    );
  }

  downloadPdfAndExcel(value: string) {
    if (value == 'pdf') {
      this.isPdfLoading = true;
    } else {
      this.isExcelLoading = true;
    }
    if(this.queryParams == 'student-call-report' && this.isDelete){
      this.params.is_mobile_report = true
    }

    this.params.class = this.selectedClasses;
    this.params.batch = this.selectedBatches;
    this.params.student_field = this.selectedItems;

    this.ReportService.downloadStudentReport(this.params, value).subscribe(
      (res: any) => {
        this.isPdfLoading = false;
        this.isExcelLoading = false;
        if(this.queryParams == 'student-call-report' && this.isDelete){
          this.downloadFile(res, 'student-call-report', value);
        } else {
          this.downloadFile(res, 'student-report', value);
        }
      },
      (error) => {
        if(this.selectedItems.length > 10) {
          this.toastr.showError('The Student Field not contain more than 10 fields.');
        }
        this.isPdfLoading = false;
        this.isExcelLoading = false;
      }
    );
  }

  setReportType(type: any) {
    // switch (type) {
    //   case 2:
    //     this.tbody = null;
    //     this.defineDtoptionForCategoryReport();
    //     this.reloadDataForCategoryReport();
    //     this.report_type = type;
    //     break;
    //   case 3:
    //     this.defineDtoptionForGenderReport();
    //     this.reloadDataForGenderReport();
    //     this.report_type = type;
    //     break;
    //   case 4:
    //     this.tbody = null;
    //     this.defineDtoptionForActiveStatusReport();
    //     this.reloadDataForActiveStatusReport();
    //     this.report_type = type;
    //     break;
    //   default:
    //     this.report_type = type;
    //     break;
    // }
  }

  // reloadDataForCategoryReport() {
  //   this.datatableElementCategory?.dtInstance.then(
  //     (dtInstance: DataTables.Api) => {
  //       dtInstance.ajax.reload();
  //     }
  //   );
  // }

  // loadDataForCategoryReport(dataTablesParameters?: any, callback?: any) {
  //   dataTablesParameters = {
  //     ...dataTablesParameters,
  //     ...this.params,
  //   };

  //   this.ReportService.getStudentReportByCategory(
  //     dataTablesParameters
  //   ).subscribe((resp: any) => {
  //     this.tbody = resp?.data;
  //     this.list = resp?.data?.studentField;
  //     callback({
  //       recordsTotal: resp?.recordsTotal,
  //       recordsFiltered: resp?.recordsFiltered,
  //       data: [],
  //     });
  //     setTimeout(() => {
  //       this.datatableElementCategory?.dtInstance.then(
  //         (dtInstance: DataTables.Api) => {
  //           dtInstance.columns.adjust();
  //         }
  //       );
  //     }, 10);
  //   });
  // }

  // defineDtoptionForCategoryReport() {
  //   this.dtOptionsForCategory = {
  //     pagingType: 'full_numbers',
  //     pageLength: 50,
  //     serverSide: true,
  //     processing: true,
  //     searching: false,
  //     scrollX: true,
  //     scrollCollapse: true,
  //     ajax: (dataTablesParameters: any, callback: any) => {
  //       this.loadDataForCategoryReport(dataTablesParameters, callback);
  //     },
  //     columns: [
  //       { data: 'id' },
  //       { data: 'class_name' },
  //       { data: 'batch_name' },
  //       { data: 'address' },
  //       { data: 'school' },
  //       { data: 'date_of_birth' },
  //       { data: 'email' },
  //       { data: 'email' },
  //       { data: 'email' },
  //       { data: 'email' },
  //       { data: 'email' },
  //     ],
  //   };
  // }

  // reloadDataForGenderReport() {
  //   this.datatableElementCategory?.dtInstance.then(
  //     (dtInstance: DataTables.Api) => {
  //       dtInstance.ajax.reload();
  //     }
  //   );
  // }
  // loadDataForGenderReport(dataTablesParameters?: any, callback?: any) {
  //   dataTablesParameters = {
  //     ...dataTablesParameters,
  //     ...this.params,
  //   };
  //   this.ReportService.getStudentReportByGender(dataTablesParameters).subscribe(
  //     (resp: any) => {
  //       this.tbody = resp?.data;
  //       callback({
  //         recordsTotal: resp?.recordsTotal,
  //         recordsFiltered: resp?.recordsFiltered,
  //         data: [],
  //       });
  //       setTimeout(() => {
  //         this.datatableElementGender?.dtInstance.then(
  //           (dtInstance: DataTables.Api) => {
  //             dtInstance.columns.adjust();
  //           }
  //         );
  //       }, 10);
  //     }
  //   );
  // }
  // defineDtoptionForGenderReport() {
  //   this.dtOptionsForGender = {
  //     pagingType: 'full_numbers',
  //     pageLength: 10,
  //     serverSide: true,
  //     processing: true,
  //     searching: false,
  //     scrollX: true,
  //     scrollCollapse: true,
  //     ajax: (dataTablesParameters: any, callback: any) => {
  //       this.loadDataForGenderReport(dataTablesParameters, callback);
  //     },
  //     columns: [
  //       { data: 'class_name' },
  //       { data: 'boys' },
  //       { data: 'girls' },
  //       { data: 'total' },
  //     ],
  //   };
  // }

  // reloadDataForActiveStatusReport() {
  //   this.datatableElemenActiveStatus?.dtInstance.then(
  //     (dtInstance: DataTables.Api) => {
  //       dtInstance.ajax.reload();
  //     }
  //   );
  // }

  // loadDataForActiveStatusReport(dataTablesParameters?: any, callback?: any) {
  //   dataTablesParameters = {
  //     ...dataTablesParameters,
  //     ...this.params,
  //   };
  //   this.ReportService.getStudentReportByActiveStatus(
  //     dataTablesParameters
  //   ).subscribe((resp: any) => {
  //     this.tbody = resp?.data;
  //     callback({
  //       recordsTotal: resp?.recordsTotal,
  //       recordsFiltered: resp?.recordsFiltered,
  //       data: [],
  //     });
  //     setTimeout(() => {
  //       this.datatableElemenActiveStatus?.dtInstance.then(
  //         (dtInstance: DataTables.Api) => {
  //           dtInstance.columns.adjust();
  //         }
  //       );
  //     }, 10);
  //   });
  // }
  // defineDtoptionForActiveStatusReport() {
  //   this.dtOptionsForActiveStatus = {
  //     pagingType: 'full_numbers',
  //     pageLength: 10,
  //     serverSide: true,
  //     processing: true,
  //     searching: false,
  //     scrollX: true,
  //     scrollCollapse: true,
  //     ajax: (dataTablesParameters: any, callback: any) => {
  //       this.loadDataForActiveStatusReport(dataTablesParameters, callback);
  //     },
  //     columns: [
  //       { data: 'class_name' },
  //       { data: 'gender' },
  //       { data: 'active' },
  //       { data: 'inactive' },
  //       { data: 'total' },
  //     ],
  //   };
  // }
  // indexOffun(item: any) {
  //   return this.field_list.indexOf(item);
  // }

  // schoolChange() {
  //   this.getSectionList();
  //   this.reloadData();
  // }

  getSectionList() {
    let data = {
      branches : this.ReportService.getBranch()
    }
    this.ReportService.getSections(data).subscribe((res: any) => {
      if (res.status) {
        this.sections = res?.data;
        if(!this.queryParams && this.classes.length == 0) {
          this.getAllClasses()
        }
      }
    });
  }

  /**
   * get template List
   */
  getTemplateList() {
    const data: any = {
      type: 2,
    };
    this.ReportService.getTemplateList(data).subscribe((resp: any) => {
      if (resp.status) {
        this.templateList = resp.data;
        if (this.queryParams) {
          this.selectedTemplate = this.templateList.find(
            (ele) => ele.slug == this.queryParams
          )?.id;
          if (this.selectedTemplate) {
            this.templateSelectionChange();
          }
        }
      }
    });
  }

  /**
   * save new template
   */
  saveTemplate() {
    this.isSubmitTamplate = true;
    if (this.tamplateName == '' || this.tamplateName == null) {
      return;
    }

    this.params.section = this.selectedSections;
    this.params.class = this.selectedClasses;
    this.params.batch = this.selectedBatches;
    this.params.student_field = this.selectedItems;

    let data = {
      template_name: this.tamplateName,
      template_data: this.params,
      type: 2,
    };

    if (this.selectedTemplate) {
      this.ReportService.updateTemplate(this.selectedTemplate, data).subscribe(
        (resp: any) => {
          this.isSubmitTamplate = false;
          if (resp.status) {
            this.toastr.showSuccess(resp.message);
          }
          this.tamplateName = '';
          this.selectedTemplate = null;
          this.getTemplateList();
        }
      );
    } else {
      this.ReportService.storeMasterTemplate(data).subscribe((resp: any) => {
        this.isSubmitTamplate = false;
        if (resp.status) {
          this.toastr.showSuccess(resp.message);
        }
        this.tamplateName = '';
        this.selectedTemplate = null;
        this.getTemplateList();
      });
    }
  }

  /**
   * save new template
   */
  templateSelectionChange() {
    const selectedTemplate = this.templateList.find(
      (ele) => ele.id == this.selectedTemplate
    );
    if (selectedTemplate) {
      this.selectedBatches = [];
      this.selectedClasses = [];
      this.batches = [];
      this.classes = []
      this.tamplateName = selectedTemplate.template_name;
      this.isDelete = selectedTemplate.is_system ? true : false;
      this.params = selectedTemplate.template_fields;
      if(this.params.rte == null){
        this.params.rte = '';
      }
      if(this.params.old_new == null){
        this.params.old_new = '';
      }
      this.selectedSections = selectedTemplate.template_fields.section ?? []
      this.selectedItems = selectedTemplate.template_fields.student_field;
      this.getClasses(selectedTemplate.template_fields.class);
    }
  }
  /**
   * Get Classes
   */
  getClasses(selectedClass) {
    this.ReportService.getClassListForMaster(this.selectedSections.map((el:any) => el.id), this.ReportService.getBranch(), this.ReportService.getAcademicYearIs()).subscribe(
      (res: any) => {
        if (res.status) {
          this.classes = res.data;
          if (selectedClass) {
            this.selectedClasses = selectedClass;
            this.getBatches(this.params.batch);
          }
        }
      }
    );
  }

  getBatches(batches) {
    const selectedClassIds = this.selectedClasses.map((ele) => ele.id);
    this.ReportService.getBatchesByClass(selectedClassIds).subscribe(
      (res: any) => {
        this.batches = res.data;
        this.selectedBatches = batches;
      }
    );
  }

  getStudentReport() {
    this.onItemSelect('');
  }

  deleteTemplate() {
    if (this.selectedTemplate) {
      this.ReportService.deleteTemplateList(this.selectedTemplate).subscribe(
        (res: any) => {
          if (res.status) {
            this.toastr.showSuccess(res.message);
            this.getTemplateList();
            this.resetTemplateData();
          }
        }
      );
    }
  }

  resetTemplateData() {
    if(!this.queryParams) {
      this.selectedTemplate = null;
      this.tamplateName = '';
      this.selectedItems = []
    }
    this.selectedBatches = [];
    this.selectedClasses = [];
    this.classes = []
    this.batches = []
    this.selectedSections = []
    this.params = {
      section: '',
      class: null,
      batch: null,
      status: null,
      rte: '',
      old_new: '',
      admission_start_date: null,
      admission_end_date: null,
      student_field: this.queryParams ? this.selectedItems : [],
      is_mobile_report : false
    };

    this.tbody = []
    this.field_list_for_html = []
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
    this.getAllClasses()
  }

  getAllClasses() {
    let sections = this.sections.filter((x:any) => x.id != "").map((el:any) => el.id);
    this.ReportService.getClassListForMaster(sections, this.ReportService.getBranch(), this.ReportService.getAcademicYearIs()).subscribe(
      (res: any) => {
        if (res.status) {
          this.classes = res.data;
        }
      })
  }
}
