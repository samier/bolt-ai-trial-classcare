import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { FeeCollectionCenterService } from '../fee-collection-center.service';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';


@Component({
  selector: 'app-fees-centers',
  templateUrl: './fees-centers.component.html',
  styleUrls: ['./fees-centers.component.scss']
})
export class FeesCentersComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  datatableElement: DataTableDirective | null = null;
  dtTrigger: Subject<any> = new Subject();
  listenerFn;

  constructor(
    private feeCollectionCenterService: FeeCollectionCenterService,
    private renderer: Renderer2,
    private router: Router,
    private toaster:Toastr,
    public commonService : CommonService,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute
  ) { }
  URLConstants = URLConstants;

  
  isOpenByClick: boolean = true

  ngOnInit(): void {
    const that = this;
    this.dtOptions = {
      order: [[0, 'desc']],
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      responsive : true,
      lengthChange: true,
      stateSave: true,
      // scrollX: true,
      stateSaveCallback: function(settings,data) {
        localStorage.setItem('DataTables_' + URLConstants.FEES_CENTER, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.FEES_CENTER)
          let dataTableState = JSON.parse(state)
          return dataTableState
        } else {
          that.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.state.clear();
          });
          return null;
        }
      },
      ajax: (dataTablesParameters: any, callback) => that.fetchFeeCenterData(dataTablesParameters, callback),
      columns: [
        {
          title: 'ID',
          data: 'id',
          visible: false
        }, 
        {
          title: 'Center Name',
          data: 'center_name',
          render: (data, type, full) => {
            return  `<a href="javascript:void(0)" details-target-id="${full.id}">${data}</a>`;
          },
          searchable: true
        }, 
        {
          title: 'Employees',
          data: 'employees_name',
          render: (data, type, full) => {
            const emp = data.split(',')
            let renderItems = '';
            for(let i = 0; i < emp.length ; i++) {
              renderItems += `<span >${emp[i]}</span>`
            }
            return  renderItems;
          },
          searchable:false
        },
        {
          title: 'Action',
          data: 'id',
          searchable: false,
          orderable: false,
          className:'action-btn-sticky text-center',
          render(data: any, type: any, full: any) {
            return `<div class="btn-group">
                      <button *ngIf="commonService.hasPermission('finance_fees_collection_center', 'has_delete')" class="lt-btn-icon action-delete" title="Delete" delete-target-id="${data}"></button>
                      <button *ngIf="commonService.hasPermission('finance_fees_collection_center', 'has_edit')"  class="lt-btn-icon action-edit" title="Edit" edit-target-id="${data}"></button>
                    </div>`
          }
        },
      ]
    };
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
    this.listenerFn = this.renderer.listen('document', 'click', (event) => {
      if (event.target.hasAttribute('delete-target-id')) {
        const centerId = event.target.getAttribute('delete-target-id')
        this.deleteFeeCenterData(centerId)
      }
      if (event.target.hasAttribute('edit-target-id')) {
        const centerId = event.target.getAttribute('edit-target-id')
        this.router.navigate([this.setUrl(`${URLConstants.EDIT_CENTER}/${centerId}`)]);
      }
      if (event.target.hasAttribute('details-target-id')) {
        const centerId = event.target.getAttribute('details-target-id')
        this.router.navigate([this.setUrl(`${URLConstants.FEES_COLLECTION_DETAIL}/${centerId}`)]);
      }
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    if (this.listenerFn) {
      this.listenerFn();
    }
  }

  renderTable(){
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw('page');
    });
  }

  setUrl(url: string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  fetchFeeCenterData(dataTablesParameters, callback) {
    this.feeCollectionCenterService.fetchCollectionCenterList(dataTablesParameters).then((response: any) => {
      callback({
        recordsTotal: response.recordsTotal,
        recordsFiltered: response.recordsFiltered,
        data: response.data
      });
    }).catch((error) => {
    });
  }

  deleteFeeCenterData(id) {
    this.feeCollectionCenterService.deleteCollectionCenter(id).then((response: any) => {
      this.toaster.showSuccess("Record deleted successfully!");
      this.renderTable()
    }).catch((error) => {
      // if(error.message) {
      //   this.toaster.showError(error.message);
      // } else {
      //   this.toaster.showError("Something went wrong, Please try again later");
      // }
    });
  }
}
