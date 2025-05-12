import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivityLogService } from '../activity-log.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateFormatService } from 'src/app/service/date-format.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-activity-log-list',
  templateUrl: './activity-log-list.component.html',
  styleUrls: ['./activity-log-list.component.scss']
})
export class ActivityLogListComponent implements OnInit {
  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  $destroy: Subject<void> = new Subject<void>();
  activityLofFilterF: FormGroup = new FormGroup({});
  filter: boolean = false;
  filterCount: any = 0;

  dtOptions : DataTables.Settings = {}
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null

  is_loading : boolean = false
  tbody : any = []
  viewChangesData : any = [];
  isShowLoading: boolean = false;
  isResetLoading: boolean = false;

  actionDPList : any[] = []
  moduleDPList : any[] = []
  employeeDPList : any[] = []

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private toaster : Toastr,
    private ActivityLogService : ActivityLogService,
    private _modalService: NgbModal,
    public dateFormateService: DateFormatService,
    private _fb: FormBuilder,
  ) { }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.fetchModuleNameList()
    this.fetchEmployeeList()
    this.initForm();
    this.initDataTable();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------


  openViewChangesModal (modalname:any,item:any) {
    this.viewChangesData = item
    this._modalService.open(modalname);
  }
  closeViewChangesModel() {
    this.viewChangesData = []
    this._modalService.dismissAll()
  }

  onReset(event: any){
    if(event){
      event.stopPropagation();
    }
    this.isResetLoading = true;
    this.activityLofFilterF.reset()
    this.reloadData()
  }

  onShow(){
    this.isShowLoading = true
    this.reloadData()
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.activityLofFilterF = this._fb.group({
      nameFC: [''],
      moduleFC : [null],
      actionFC :[null],
      dateFC : [null],
      employeeFC : [null],
    })

    this.activityLofFilterF.valueChanges.subscribe((value:any)=>{
      this.filterCount = this.CommonService.countFilters(value)
    })
  }

  fetchModuleNameList(){
    this.ActivityLogService.moduleDropDownList().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if(res.status){
        this.actionDPList = res.data?.action?.map((obj:any,index:number)=>({
          id : index,
          name : obj
        }))
        const moduleObj = res.data.module
        this.moduleDPList = Object.keys(moduleObj).map((obj:any,index:number)=>({
          id : index ,
          name : moduleObj[obj],
          value : obj
        }))
      }
    })
  }


  fetchEmployeeList(){
    
    this.ActivityLogService.employeeDropDownList().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if(res.status){
        this.employeeDPList = res.data
      }
    })
  }

  getChangedValues(oldValue: any, newValue: any): any {
    let data : any = []
  
    for (const key in newValue) {
      if (newValue.hasOwnProperty(key)) {
        if (oldValue[key] !== newValue[key]) {
          const temp = {
            keyName : key ,
            old: oldValue[key],
            new: newValue[key]
          }
          data.push(temp)
        }
      }
    }
    return data;
  }

  getModuleValue(){
    return this.activityLofFilterF?.value.moduleFC?.map((selected:any)=> this.moduleDPList?.find((list:any)=>list.id==selected.id).value)
  }

  initDataTable(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50,100,200],
      scrollX : true,
      serverSide: true,
      processing: true,
      searching: true,
      order: [[1, 'desc']],
      ajax: (dataTablesParameters: any, callback:any) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        // {data: 'id'  },
        {data: 'device_ip' , name:'device_ip' ,orderable:false,searchable:false },
        {data: 'created_at', name:'created_at'},
        {data: 'module_name', name:'module_name' },
        // {data: 'module_key'  },
        {data: 'action', name:'action'  },
        {data: 'user.full_name' , name:'user.full_name' },
        {data: 'action' ,orderable:false,searchable:false },
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {

    const payload = {

      user_id: this.activityLofFilterF?.value.employeeFC?.length > 0 ? this.CommonService.getID(this.activityLofFilterF?.value.employeeFC ) : [] ,
      start_date : this.activityLofFilterF?.value?.dateFC?.startDate?.format('DD-MM-YYYY') || '',
      end_date :   this.activityLofFilterF?.value?.dateFC?.endDate?.format('DD-MM-YYYY') || '',
      module: this.activityLofFilterF?.value.moduleFC?.length > 0 ? this.getModuleValue() : [] ,
      action: this.activityLofFilterF?.value.actionFC?.length > 0 ? this.activityLofFilterF?.value.actionFC.map((data:any)=>data.name) : [] 
    }


    this.ActivityLogService.activityLoglList({ ...payload ,...dataTablesParameters}).subscribe((resp: any) => {

      this.tbody = []
      this.tbody = resp.data?.map((obj:any)=>( {...obj,changesValue : this.getChangedValues(obj.old_value,obj.new_value)}))
      this.isShowLoading = false
      this.isResetLoading = false

      callback({
        recordsTotal: resp?.recordsTotal,
        recordsFiltered: resp?.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
    },(error)=>{
      this.isResetLoading = false
      this.isShowLoading = false
      this.toaster.showError(error?.error?.message ?? error?.message)
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------
}
