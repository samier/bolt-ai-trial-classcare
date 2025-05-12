import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CustomFieldService } from '../custom-field.service';
import { Toastr } from 'src/app/core/services/toastr';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-custom-field-list',
  templateUrl: './custom-field-list.component.html',
  styleUrls: ['./custom-field-list.component.scss']
})
export class CustomFieldListComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  dtOptionsForCustomField: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  customFieldList :any = []
  isCustomField:boolean = false
  URLConstants = URLConstants
  
  isOpenByClick: boolean = true

  tableCols= [
    { 
      title: "Field Title",
      data: 'field_title' 
    },
    { 
      title: "Field Name",
      data: 'field_name',
    },
    {
      title: 'Field Type',
      data: "field_type",
    },
    {
      title: 'Required',
      data: "required",
    },
    {
      title: 'Where To Use',
      data: "where_to_use",
    },
    {
      title: 'Action',
      data: "id",
      searchable: false,
      orderable: false,
      class: 'action-btn-sticky'
    },
  ]
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      public customFieldService : CustomFieldService,
      private toastr:Toastr,
      private _router : Router
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initCustomFieldTable(this.tableCols)
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

    deleteCustomField (id) {
      this.customFieldService.deleteCustomField(id).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        if(res.status) {
          this.reloadData(); 
          this.toastr.showSuccess(res.message)
        } else {
          this.toastr.showError(res.message)
        }
      } ,(error)=> {
        this.toastr.showError(error?.error ?? error?.error?.message)
      })
    }

    editCustomField(id) {
      this._router.navigate([this.customFieldService.setUrl(URLConstants.CUSTOM_FIELD),id])
    }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

    /**
   * @ngdoc method
   * @name initStudentTable
   * @description
   * init. student data-table
   */
    initCustomFieldTable (cols) {
      this.isCustomField = true
      this.dtOptionsForCustomField = {
        pagingType: 'full_numbers',
        pageLength: 50,
        serverSide: true,
        processing: true,
        searching: true,
        // scrollX: true,
        scrollCollapse: true,
        ajax: (dataTablesParameters: any, callback: any) => {
          this.loadCustomFieldDataData(dataTablesParameters, callback);
        },
        columns:cols
      };
    }

    /**
   * @ngdoc method
   * @name loadStudentData
   * @description
   * load student data
   */
    loadCustomFieldDataData(dataTablesParameters?: any, callback?: any) {
   
     dataTablesParameters = {
      ...dataTablesParameters
    };
    this.customFieldService.getCustomFieldList(dataTablesParameters).subscribe(
      (resp: any) => {
        this.isCustomField = false
        this.customFieldList = resp?.data;
        callback({
          recordsTotal: resp?.recordsTotal,
          recordsFiltered: resp?.recordsFiltered,
          data: [],
        });
        // setTimeout(() => {
        //   this.datatableElementGender?.dtInstance.then(
        //     (dtInstance: DataTables.Api) => {
        //       dtInstance.columns.adjust();
        //     }
        //   );
        // }, 10);
      }
    );
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

  
  //#endregion Private methods
}