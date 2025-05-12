import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { months } from 'src/app/common-config/static-value';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FeesService } from '../../fees.service';

@Component({
  selector: 'app-fee-reminder-details',
  templateUrl: './fee-reminder-details.component.html',
  styleUrls: ['./fee-reminder-details.component.scss']
})
export class FeeReminderDetailsComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  reminderDetailsF : FormGroup = new FormGroup({});
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  filter: boolean = true;
  isShowLoading: boolean = false;
  isResetLoading: boolean = false;
  isTableLoading: boolean = false;
  tbody: any [] = [];
  months = months.map((month) => {
    return {
      id: month.value,
      name: month.name
    }
  });
  indexStart: any = 1;

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _fb : FormBuilder,
    private toastr: Toastr,
    private feeService: FeesService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.initDataTable();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  onShow(){
    this.isShowLoading = true;
    this.reloadData();
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.reminderDetailsF = this._fb.group({
      month: [null]
    })
  }

  initDataTable(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true, 
      searching: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      }
    }
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    const startDate = this.reminderDetailsF?.value?.date?.startDate ?? null;
    const endDate = this.reminderDetailsF?.value?.date?.endDate ?? null;
    const payload = {
      ...dataTablesParameters,
      start_date: startDate?.format('DD-MM-YYYY'),
      end_date: endDate?.format('DD-MM-YYYY'),
      months: this.getID(this.reminderDetailsF?.value?.fee_category)
    }
    this.isTableLoading = true;
    this.feeService.getAutoFeeReminderList(payload).subscribe(
      (res: any) => {
        this.isTableLoading = false;
        this.isShowLoading = false;
        this.isResetLoading = false
        this.tbody = res?.data?.original?.data;
        this.indexStart =  (dataTablesParameters.start / dataTablesParameters.length) * dataTablesParameters.length
        callback({
          recordsTotal: res?.data?.original?.recordsTotal,
          recordsFiltered: res?.data?.original?.recordsFiltered,
          data: []
        });
        setTimeout(() => {
          this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.columns.adjust();
          });
        }, 10);
      },(error)=> {
        this.isTableLoading = false;
        this.isShowLoading = false;
        this.isResetLoading = false
        this.toastr.showError(error?.error?.message ?? error?.message);
      }
    )
  }

  reloadData(){
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
	
  getID(obj:any){
    if(!obj || obj?.length ==0 ){
      return
    }
    const ids = obj?.map(obj => obj.id) ?? []
    return ids
  }
  //#endregion Private methods
}