import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { DateFormatService } from 'src/app/service/date-format.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HomeworkService } from '../../homework/homework.service';

@Component({
  selector: 'app-user-notice-history',
  templateUrl: './user-notice-history.component.html',
  styleUrls: ['./user-notice-history.component.scss']
})
export class UserNoticeHistoryComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  dtRender: boolean = true;
  tbody: any;
  isShowLoading: boolean = false
  type: number = 1;
  search: any = {
    title: '',
    attachment_type: ''
  };
  userId : string | null = null

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    public homeworkService: HomeworkService,
    public _activatedRoute: ActivatedRoute,
    private toastr: Toastr,
    public dateFormateService : DateFormatService
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.userId = this._activatedRoute.snapshot.params['id'];
    this.initializeDatatable()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  /**
 * @ngdoc method
 * @name switch_to
 * @description
 * switch tabs and content
 */
  switch_to(type: any, preType?) {
    const that = this
    this.type = type;
    this.reloadData()
    
    // if (this.type == 3 || preType == 3) {
    //   this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
    //     dtInstance.destroy()
    //     this.dtRender = false;
    //     setTimeout(() => {
    //       that.dtRender = true
    //     }, 10);
    //   });
    //   this.initializeDatatable()
    // } else {
    //   this.reloadData()
    // }
  }


  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initializeDatatable() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100, 200],
      serverSide: true,
      processing: true,
      searching: true,
      order: [[1, 'desc']],
      scrollX : true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
          { data: 'id', orderable: false, searchable: false },
          { data: 'create_at', name:'notes.create_at'},
          { data: 'title', name: 'notes.title' },
          { data: 'description', name: 'notes.description' },
          { data: 'created_by', name: 'createdBy', orderable: false, searchable: false },
          { data: 'id', name: 'id', orderable: false, searchable: false },
        ]
    };
  }

  loadData(dataTablesParameters: any, callback: any): void {
    Object.keys(this.search).forEach((column: any) => {
      const columnIndex = dataTablesParameters.columns.findIndex((dtColumn: any) => dtColumn.data === column);
      if (columnIndex !== -1) {
        dataTablesParameters.columns[columnIndex].search.value = this.search[column];
      }
    });

    const payload = {
      ...dataTablesParameters,
      user_type: 'users',
      type:this.type,
      ids: this.userId ?  [this.userId] : []
      // ids: [4898, 4900, 4901] 
    }

    this.homeworkService.typeWiseNoticeHistory(payload).subscribe(
      (res: any) => {
        this.isShowLoading = false;
        this.tbody = res?.data?.original?.data
        callback({
          recordsTotal: this.tbody?.length,
          recordsFiltered: this.tbody?.length,
          data: []
        });
        setTimeout(() => {
          this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.columns.adjust();
          });
        }, 10);
      },
      (error) => {
        this.isShowLoading = false;
        this.toastr.showError(error?.error?.message ?? error?.message);
      }
    );
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  //#endregion Private methods
}