import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject, takeUntil } from 'rxjs';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ExamServiceService } from '../../exam/exam-service.service';
import { TransportService } from '../../transport-management/transport.service';
import { CommonService } from 'src/app/core/services/common.service';
import { UserService } from '../user.service';
import { FeesService } from '../../fees/fees.service';
import { HomeworkService } from '../../homework/homework.service';

@Component({
  selector: 'app-assign-batches',
  templateUrl: './assign-batches.component.html',
  styleUrls: ['./assign-batches.component.scss']
})
export class AssignBatchesComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  assignBatchForm : FormGroup = new FormGroup({})
  sectionList: any = []
  classList: any = []
  batchList: any = []
  isShowData : boolean = false
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  // @ViewChild('table1', { static: false }) table!: ElementRef;
  dtRendered=true
  batchData: any = []
  empId : any = null
  URLConstants = URLConstants
  userName : string = ''
  tbody : any = []
  isAssignBatch : boolean = false
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      private _transportService : TransportService,
      private _formValidationService : FormValidationService,
      private _toastr : Toastr,
      private _activatedRoute : ActivatedRoute,
      private _userService : UserService,
      private feesService : FeesService,
      private homeWorkService : HomeworkService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.empId = this._activatedRoute.snapshot.paramMap.get('id') || null
    this.initForm();
    this.setUserName();
    this.getSectionList();
    this.isAssignBatch = true
    this.initBatchTable();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  ngAfterViewInit(): void {
    // Initialize DataTable
    // setTimeout(() => {
    //   const table = $(this.table.nativeElement).DataTable();
    //   table.columns.adjust();
    // }, 200);
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  clearData() {
    this.assignBatchForm.reset();
    this.assignBatchForm.get('section_id')?.setValue("");
    this.reloadData()
    // this.clearDataTable();
    // if (this.empId) {
    //   this._router.navigate([this.CommonService.setUrl(URLConstants.STUDENT_RANK_LIST)])
    // }
  }

  getClasses() {
    this.assignBatchForm.controls['class_id'].reset();
    this.assignBatchForm.controls['batch_id'].reset();
    this.classList = []
    this.batchList = []

    const payload = {
      academic_year_id : this._transportService.getAcademicYear ,
      branch_id        : this._transportService.getBranch(),
      user_id          : this.empId,
      ...(this.assignBatchForm?.value && {section_id: this.assignBatchForm?.value?.section_id ?? ""}) ,
    }
    this.homeWorkService.getClass(payload,this.empId).pipe(takeUntil(this.$destroy))?.subscribe((res: any) => {
      if (res.status) {
        this.classList = res.data
      } else {
        this._toastr.showError(res?.message)
      }
    })
  }

  getBatches() {
    this.batchList = []
    this.assignBatchForm.controls['batch_id'].reset();
    const classes = this.assignBatchForm.value ? this.assignBatchForm.value.class_id : ''
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
    if(this.assignBatchForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.assignBatchForm);
      return;
    }
    this.isShowData = true
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

  deleteBatchFromEmp(item) {
    let conf = confirm("Are you sure ? You want to delete it ?");

    if (conf) {
      const payload = {
        class_id:item.batch.classes_id,
        section_id:item?.batch?.class?.section_id,
        user_id:item.user_id,
        batch_id : item.batch_id
      }

      this._userService.deleteAssignBatchRecord(payload).subscribe((res: any) => {
        if (res?.status) {
          this._toastr.showSuccess(res?.message);
          this.reloadData();
        } else {
          this._toastr.showError(res?.message);
        }
      }, (error: any) => {
        this._toastr.showError(error?.error?.message ?? error?.message)
      });
    }


  }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
    initForm() {
      this.assignBatchForm = this._fb.group({
        section_id: [""],
        class_id: [null], //[Validators.required]
        batch_id: [ null], //[Validators.required]
      })

      this.assignBatchForm.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res) => {
        this.assignBatchForm.controls['batch_id'].markAsPristine();
        this.assignBatchForm.controls['batch_id'].markAsUntouched();
      })
    }
    
    getSectionList() {
      const data ={
        user_id : this.empId
      }
      this._transportService.getUserWiseSectionList(data).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.sectionList = [{id : "", name:'All Section'}, ...res.data]
          this.getClasses();
        }
      })
    }

       /**
   * @ngdoc method
   * @name initBatchTable
   * @description
   * init. student data-table
   */
   initBatchTable () {
    // console.log('cols: ', cols);
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      // deferLoading: 0,
      // destroy: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadStudentData(dataTablesParameters, callback);
      },
      columns: [
        { 
          name: "Sr No.",
          data: 'id' 
        },
        { 
          name: "Class",
          data: 'id' 
        },
        {
          name: 'Batch',
          data: "id",
          // orderable:false, 
        },
        { 
          name: "Action",
          data: 'id',
          // orderable:false, 
        },
      ],
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
      this.assignBatchForm.get('format')?.setValue("")

      dataTablesParameters = {
        ...dataTablesParameters,
       ...this.assignBatchForm.value
      };
      dataTablesParameters.user_id = this.empId
      dataTablesParameters.batch_id = dataTablesParameters.batch_id ? dataTablesParameters.batch_id.map(ele => ele.id) : []
      this._userService.getbatchListonEmployee(
        dataTablesParameters
      ).subscribe((resp: any) => {
        this.batchData = resp.data
        this.isShowData = false
        this.isAssignBatch = false
        callback({
          recordsTotal: resp.recordsTotal,
          recordsFiltered: resp.recordsFiltered,
          // data: resp.data,
        });
        if(!resp.data.length) {
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

  setUserName(){
    this._userService.getUserName(this.empId).subscribe((res:any) => {
      if(res.status==true){
       this.userName=res.data.full_name;
      }
    });
  }
	
  //#endregion Private methods
}