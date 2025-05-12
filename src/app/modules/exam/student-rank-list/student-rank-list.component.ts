import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { TransportService } from '../../transport-management/transport.service';
import { ExamServiceService } from '../exam-service.service';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute, Router } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-student-rank-list',
  templateUrl: './student-rank-list.component.html',
  styleUrls: ['./student-rank-list.component.scss']
})
export class StudentRankListComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  studentRankForm : FormGroup = new FormGroup({})
  sectionList: any = []
  classList: any = []
  batchList: any = []
  isShowData : boolean = false
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  @ViewChild('table1', { static: false }) table!: ElementRef;
  dtRendered=true
  examTypeList: any = []
  examNameList: any = []
  studentRankData: any = []
  isExcelLoading : boolean = false
  isPdfLoading : boolean = false
  examID : string | null = null
  URLConstants = URLConstants

  studentCols= [
    { 
      title: "SR No.",
      render: (data, type, row, meta) => {
        // Use the row index (meta.row) to display a serial number
        return meta.row + 1; // Starts numbering from 1
      },
      orderable:false,
    },
    { 
      title: "Roll No.",
      data: 'student_rollno' 
    },
    { 
      title: "Student",
      data: 'student_name',
      orderable:false,
    },
    {
      title: 'Batch',
      data: "batch_name",
      orderable:false, 
    },
    { 
      title: "Marks",
      data: 'total_obtain_marks',
      orderable:false, 
    },
    { 
      title: "Percentage",
      data: 'percentage',
      orderable:false, 
    },
    { 
      title: "Rank",
      data: 'rank' 
    },
  ]

  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      private _transportService : TransportService,
      private _examService : ExamServiceService,
      private _formValidationService : FormValidationService,
      private _toastr : Toastr,
      private _activatedRoute : ActivatedRoute,
      private _router : Router
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.examID = this._activatedRoute.snapshot.paramMap.get('id') || null
    this.initForm();
    this.getSectionList();
    this.initStudentTable(this.studentCols);
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  ngAfterViewInit(): void {
    // Initialize DataTable
    setTimeout(() => {
      const table = $(this.table.nativeElement).DataTable();
      table.columns.adjust();
    }, 200);
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  clearData() {
    this.studentRankForm.reset();
    this.studentRankForm.get('section_id')?.setValue("")
    // this.clearDataTable();
    if (this.examID) {
      this._router.navigate([this.CommonService.setUrl(URLConstants.STUDENT_RANK_LIST)])
    }
  }

  getClasses() {
    this.studentRankForm.controls['class_id'].reset();
    this.studentRankForm.controls['batch_id'].reset();
    this.classList = []
    this.batchList = []

    const section = this.studentRankForm.value ? this.studentRankForm.value.section_id : ''
    this._transportService.getClassList(section).pipe(takeUntil(this.$destroy))?.subscribe((res: any) => {
      if (res.status) {
        this.classList = res.data
        if (this.examID) {
          this.getFilterData()
        }
      } else {
        this._toastr.showError(res?.message)
      }
    })
  }

  getBatches() {
    this.batchList = []
    this.studentRankForm.controls['batch_id'].reset();
    const classes = this.studentRankForm.value ? this.studentRankForm.value.class_id : ''
    if (classes) {
      const payload = {
        classes: [classes]
      }
      this._transportService.getBatchesList(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.batchList = res.data
        } else {
          this._toastr.showError(res?.message)
        }
      });
    }
  }

  showData() {
    if(this.studentRankForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.studentRankForm);
      return;
    }

    this.reloadData()
  }
  
  /**
   * @ngdoc method
   * @name reloadData
   * @description
   * clear and destory data-table
   */
  // clearDataTable(){
    // const that = this
    // this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
    //   // dtInstance.clear().draw();
    //   dtInstance.destroy()
    //   this.dtRendered = false;
    //   setTimeout(() => {
    //     that.dtRendered = true
    //   }, 10);
    // });
  // }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
    initForm() {
      this.studentRankForm = this._fb.group({
        section_id: [""],
        class_id: [null,[Validators.required]], //[Validators.required]
        batch_id: [ null,[Validators.required]], //[Validators.required]
        exam_type_id: [ null,[Validators.required]], //[Validators.required]
        exam_name_id: [ null,[Validators.required]], //[Validators.required]
        format: [""],
      })

      this.studentRankForm.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res) => {
        this.studentRankForm.controls['batch_id'].markAsPristine();
        this.studentRankForm.controls['batch_id'].markAsUntouched();
      })
    }
    
    getSectionList() {
      this._transportService.getSectionList("").pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.sectionList = [{id : "", name:'All Section'}, ...res.data]
          this.getClasses();
        }
      })
    }

    downloadPdfAndExcel(value: string) {
      if (this.studentRankData.length == 0) {
        return this._toastr.showInfo('No records found!', 'INFO');
      }

      if(value == 'pdf'){
        this.isPdfLoading = true
      }else {
        this.isExcelLoading = true
      }
      this.studentRankForm.get('format')?.setValue(value)
      const payload = {
        ...this.studentRankForm.value
      }

      payload.batch_id = this.studentRankForm?.value?.batch_id ? this.studentRankForm?.value?.batch_id.map(ele=>ele.id) : [];
      
      this._examService.getStudentRankListPdfExcel(payload).subscribe((res: any) => {
        this.isPdfLoading = false
        this.isExcelLoading = false
        this.downloadFile(res, 'student-rank-list-report', value);
      },(error)=>{
        this.isPdfLoading = false
        this.isExcelLoading = false
      });
    }
  
    downloadFile(res: any, file: any, format: any) {
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
      scrollX: true,
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
   * @name loadStudentData
   * @description
   * load student data
   */
    loadStudentData(dataTablesParameters?: any, callback?: any) {
      this.studentRankForm.get('format')?.setValue("")

      dataTablesParameters = {
        ...dataTablesParameters,
       ...this.studentRankForm.value
      };
      dataTablesParameters.batch_id = dataTablesParameters.batch_id ? dataTablesParameters.batch_id.map(ele => ele.id) : [] 
      this._examService.getStudentRankList(
        dataTablesParameters
      ).subscribe((resp: any) => {
        this.studentRankData = resp.data.original.data 
        callback({
          recordsTotal: resp.data.original.recordsTotal,
          recordsFiltered: resp.data.original.recordsFiltered,
          data: resp.data.original.data,
        });
        if(!resp.data.original.data.length) {
          this._toastr.showError("No records found!");    
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
   * @name reloadData
   * @description
   * reload data-table
   */
  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getFilterData() {
    const payload = {
      batch_id : this.studentRankForm?.value?.batch_id ? this.studentRankForm?.value?.batch_id.map(ele=>ele.id) : [],
      exam_name_id : this.examID
    }
    this._examService.getStudentRankDrpData(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if (res.status) {
        this.examNameList = res.data.exam_name_ids
        this.examTypeList = res.data.exam_type_ids
        if(this.examID) {
          this.batchList = res.data.batch_ids
          this.studentRankForm.patchValue({
            batch_id : res.data.batch_ids,
            ...res.data
          })
          this.reloadData()
        }
      } else {
        this._toastr.showError(res.message);
      }
    },(error)=>{
      this._toastr.showError(error?.message ?? error?.error?.message);
    })
  }
	
  //#endregion Private methods
}