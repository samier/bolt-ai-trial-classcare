import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import dayjs from 'dayjs';
import moment from 'moment'
import { ReportService } from '../report.service';
import { Toastr } from 'src/app/shared/services/toastr';
import { UserService } from '../../user/user.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { DateFormatService } from 'src/app/service/date-format.service';
@Component({
  selector: 'app-birthday-list',
  templateUrl: './birthday-list.component.html',
  styleUrls: ['./birthday-list.component.scss']
})
export class BirthdayListComponent implements OnInit { 
  
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  dtOptions2: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  @ViewChild('table1', { static: false }) table!: ElementRef;

  classDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  }

  columnDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'name',
    textField: 'column',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  selectedRange: any =   {
    startDate: moment().startOf('day'),
    endDate: moment().add(7, 'days').startOf('day')
  };
  
  columns = [
    {column: 'Phone Number', name: "phone_number"},
    {column: 'Father Number', name: "father_number"},
    {column: 'Mother Number', name: "mother_number"},
  ];

  type:number= 1;
  classes = [];
  batches = [];
  selectedClasses: any = [];  
  selectedBatches: any = [];
  selectedRole: any = [];
  roles: any = []
  column:any = []
  startDate = moment().startOf('day').format('DD-MM-YYYY');
  endDate = moment().add(7, 'days').startOf('day').format('DD-MM-YYYY');
  dateConfig: any = {
    applyLabel: 'Apply',
    format: 'YYYY-MM-DD',
    displayFormat: this.dateFormateService.getFormat(),
    cancelLabel: 'Cancel',
    clearLabel: 'Clear',
    parentEl:"body"
  }
  dtRendered=true

  ranges: any = {
    'Today': [dayjs(), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')]
  };

  studentCols= [
    { 
      title: "Class",
      data: 'class_room.name',
      class:'orange-text-color'
    },
    { 
      title: "Batch",
      // data: 'batch_detail.name' 
      data: 'batches_name',
    },
    { 
      title: "Name",
      data: 'full_name',
      class:'name_hover'
    },
    {
      title: 'Phone Number',
       data: "phone_number",
       visible: false,
       "render": function (phone_number) {
        return  phone_number != null && phone_number != "" ? phone_number : '-'
      } 
    },
    {
      title: 'Father Number', 
      data: "father.number",
      visible: false,
      "render": function (father_number) {
        return  father_number ?? '-'
      } 
    },
    {
      title: 'Mother Number', 
      data: "mother.number",
      visible: false,
      "render": function (mother_number) {
        return  mother_number ?? '-'
      } 
    },
    { 
      title: "D.O.B(DD-MM-YYYY)",
      data: 'date_of_birth', 
      "render": function (data) {
        return  moment(data).format('DD-MM-YYYY')
      } 
    },
    { 
      title: "Age(year)",
      data: 'age_data',
      class:'green-text-color' 
    },
  ]

  userCols= [
    { 
      title: "Role",
      data: 'role'
    },
    { 
      title: "Name",
      data: 'full_name' 
    },
    { 
      title: "D.O.B(DD-MM-YYYY)",
      data: 'birth_date', 
      "render": function (data) {
        return  moment(data).format('DD-MM-YYYY')
      } 
    },
  ]
  query : any

  constructor(
    private ReportService: ReportService,
    private toastr: Toastr,
    public commonService: CommonService,
    private UserService: UserService,
    public cdr: ChangeDetectorRef,
    private _activatedRoute:ActivatedRoute,
    public  dateFormateService : DateFormatService
  ){}
  
  ngOnInit(): void {
    const that = this
    this.getClassList()
    this._activatedRoute.queryParams.subscribe(params => {
      if(params['type'] == 1){
        this.switch_to(1)
      }
      else if(params['type'] == 2){
        this.switch_to(2)
      }
      else{
        this.switch_to(1, true);
      }
    });
  }

  ngAfterViewInit(): void {
    // Initialize DataTable
    setTimeout(() => {
      const table = $(this.table.nativeElement).DataTable();
      table.columns.adjust();
    }, 200);
  }

  /**
   * @ngdoc method
   * @name switch_to
   * @description
   * switch tabs and content
   */
  switch_to (type:any, isInit?) {
    // if(!isInit) {
    //   this.clearData()
    // }
    this.type = type;
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy()
    });
    if(type == 2) {
      this.getUserRoles()
      this.initUserTable(this.userCols)
    } else {
      this.getClassList()
      this.initStudentTable(this.studentCols)
    }
  }

  /**
   * @ngdoc method
   * @name initStudentTable
   * @description
   * init. student data-table
   */
  initStudentTable (cols) {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      deferLoading: 0,
      destroy: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadStudentData(dataTablesParameters, callback);
      },
      columns: cols,
      language: {
        info: '',
        zeroRecords: 'No records found!'
      }
    };
  }

  /**
   * @ngdoc method
   * @name initUserTable
   * @description
   * init. user data-table
   */
  initUserTable (cols) {
    this.dtOptions2 = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      deferLoading: 0,
      destroy: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadUserData(dataTablesParameters, callback);
      },
      columns: cols,
      language: {
        info: '',
        zeroRecords: 'No records found!'
      }
    };
  }

  /**
   * @ngdoc method
   * @name loadStudentData
   * @description
   * load student data
   */
  loadStudentData(dataTablesParameters?: any, callback?: any) {
    if(!this.startDate || !this.endDate) {
      return
    }
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.selectedClasses.length > 0 ? {class_id: this.selectedClasses.map((c) => c.id)} : {},
      ...this.selectedBatches.length > 0 ? {batch_id: this.selectedBatches.map((b) => b.id)} : {},
      start_date: this.startDate,
      end_date: this.endDate
    };
    this.ReportService.getStudentBirthdayList(
      dataTablesParameters
    ).subscribe((resp: any) => {
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: resp.data,
      });
      if(!resp.data.length) {
        this.toastr.showError("No records found!");    
      }
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
    });
  }

  /**
   * @ngdoc method
   * @name loadUserData
   * @description
   * load user data
   */
  loadUserData(dataTablesParameters?: any, callback?: any) {
    if(!this.startDate || !this.endDate) {
      return
    }
    dataTablesParameters = {
      ...dataTablesParameters,
      start_date: this.startDate,
      end_date: this.endDate,
      ...(this.selectedRole && {role_id: this.selectedRole})
    };
    this.ReportService.getUserBirthdayList(
      dataTablesParameters
    ).subscribe((resp: any) => {
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: resp.data,
      });
      if(!resp.data.length) {
        this.toastr.showError("No records found!");    
      }
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
    });
  }

  /**
   * @ngdoc method
   * @name getClassList
   * @description
   * get class list data
   */
  getClassList() {
    this.ReportService.getClassList().subscribe((res: any) => {
      if (res.status) {
        this.classes = res.data;
      }
    });
  }

  /**
   * @ngdoc method
   * @name getUserRoles
   * @description
   * get user roles list data
   */
  getUserRoles() {
    this.UserService.getRoleList().subscribe((resp:any) => {
      if(resp.status){
        this.roles = resp.data
      }
    })
  }

  /**
   * @ngdoc method
   * @name onClassSelect
   * @description
   * on class select from the list
   */
  onClassSelect(event) {
    let ids = []
    if (event.length > 0) {
      ids = event.map((item: any) => item.id);
    } else if (event.length === 0) {
      ids = []
    } else {
      ids = this.selectedClasses.map((item: any) => item.id);
    }
    
    this.ReportService.getBatchesList({'classes':ids}).subscribe((res:any)=>{
      this.batches = res.data;
      this.selectedBatches = [];
    });
  }

  /**
   * @ngdoc method
   * @name getReport
   * @description
   * get report by filter
   */
  getReport() {
    if(!this.startDate || !this.endDate) {
      this.toastr.showError("Please select valid date range");    
      return
    }
    this.reloadData();
    setTimeout(() => {
      this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
        for (const col of this.columns) {
          this.studentCols.forEach((el:any, key:any) => {
            if (col.column.toLowerCase() === el.title.toLowerCase()) {
              let column = dtInstance.column(key);
              column.visible(false)
            }
          })
        }
        for (const col of this.column) {
          this.studentCols.forEach((el:any, key:any) => {
            if (col.column.toLowerCase() === el.title.toLowerCase()) {
              let column = dtInstance.column(key);
              column.visible(true)
            }
          })
        }
        
      })
    }, 100);
  }

  /**
   * @ngdoc method
   * @name getPdfReport
   * @description
   * get file report
   */
  getPdfReport(format) {
    if(!this.startDate || !this.endDate) {
      this.toastr.showError("Please select valid date range");    
      return
    }
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      if(this.type === 1) {
        let params:any = {
          ...dtInstance.ajax.params(),
          ...{
            ...this.selectedClasses.length > 0 ? {class_id: this.selectedClasses.map((c) => c.id)} : {},
            ...this.selectedBatches.length > 0 ? {batch_id: this.selectedBatches.map((b) => b.id)} : {},
            start_date: this.startDate,
            end_date: this.endDate,
            columns: this.column
          }
        };
        this.ReportService.getStudentBirthdayPdf(
          params,
          format
        ).subscribe((res: any) => {
          this.downloadFile(res,'Student-birthday-report', format);
        });
      } else {
        let params:any = {
          ...dtInstance.ajax.params(),
          ...{
            start_date: this.startDate,
            end_date: this.endDate,
          },
          ...(this.selectedRole && {role_id: this.selectedRole})
        };
        this.ReportService.getUserBirthdayPdf(
          params,
          format
        ).subscribe((res: any) => {
          this.downloadFile(res,'User-birthday-report', format);
        });
      }
     
    });    
  }

  /**
   * @ngdoc method
   * @name downloadFile
   * @description
   * fire download event on report fetched
   */
  downloadFile(res: any,file: any, format:any) {
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

  /**
   * @ngdoc method
   * @name clearData
   * @description
   * clear data-table and state
   */
  clearData() {
    this.selectedClasses = []
    this.selectedBatches = []
    this.startDate = moment().startOf('day').format('DD-MM-YYYY');
    this.endDate = moment().add(7, 'days').startOf('day').format('DD-MM-YYYY');
    this.selectedRange =   {
      startDate: moment().startOf('day'),
      endDate: moment().add(7, 'days').startOf('day')
    };
    this.selectedRole = null
    this.clearDataTable();
  }

  /**
   * @ngdoc method
   * @name datesUpdated
   * @description
   * on date change event
   */
  datesUpdated(event) {
    this.startDate = event.startDate ? event.startDate.format('DD-MM-YYYY') : moment().startOf('day').format('DD-MM-YYYY')
    if(event.endDate?.$d == 'Invalid Date') {
      this.selectedRange= {
          startDate: event.startDate,
          endDate: event.startDate
        };
        this.endDate = event.startDate ? event.startDate.format('DD-MM-YYYY') : null
    } else {
      this.endDate  = event.endDate ?event.endDate.format('DD-MM-YYYY') : moment().add(7, 'days').startOf('day').format('DD-MM-YYYY')
    }
  }

  /**
   * @ngdoc method
   * @name reloadData
   * @description
   * reload data-table
   */
  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  } 

  /**
   * @ngdoc method
   * @name reloadData
   * @description
   * clear and destory data-table
   */
  clearDataTable(){
    const that = this
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.clear().draw();
      dtInstance.destroy()
      this.dtRendered = false;
      setTimeout(() => {
        that.dtRendered = true
      }, 10);
    });
  }
}
