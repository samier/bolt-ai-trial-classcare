import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { EventTypeServiceService } from '../../event-type/event-type-service.service';
import { EventTypeModelComponent } from '../event-type-model/event-type-model.component';
import { Toastr } from 'src/app/core/services/toastr';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-event-type-list',
  templateUrl: './event-type-list.component.html',
  styleUrls: ['./event-type-list.component.scss']
})
export class EventTypeListComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  tableBody:any;
  section: any = [];
  id: any;
  boundHandleTableClick: any;
  isEdit: any;
  $destroy: Subject<void> = new Subject<void>();
  hasEdit = this.CommonService.hasPermission(`administrator_event_type`, 'has_edit');
  hasDelete = this.CommonService.hasPermission(`administrator_event_type`, 'has_delete');
  URLConstants = URLConstants

  constructor(
    private eventTypeService:EventTypeServiceService,
    private modalService : NgbModal,
    private toastr: Toastr,
    public CommonService: CommonService
    
  ) { 
    this.boundHandleTableClick = this.handleTableClick.bind(this);

  }

  ngOnInit(): void {
    this.initDataTable();
    const table = document.querySelector('.table-responsive');
    if (table) {
      table.removeEventListener('click', this.boundHandleTableClick);
    }
  }

  initDataTable() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100, 200],
      serverSide: true,
      processing: true,
      searching: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
        { title: 'Event Type Name',
           data: 'name',
           render: (data, type, row) =>{
            return `<span style="color:${row.color}">${data}</span>`
           }
           },
        ...this.hasEdit || this.hasDelete ? [{
          title: 'Action',
          orderable: false,
          searchable: false,
          render: (data, type, row) => {
            let actionButtons = '<div class="btn-group">';
            if (this.hasEdit) {
              actionButtons += `<button class="btn action-edit" data-id="${row.id}" data-toggle="tooltip" title="Edit"> 
                                  <i class="fa fa-pencil-alt"></i> 
                                </button>`;
            }
            if (this.hasDelete) {
              actionButtons += `<button class="btn action-delete" data-id="${row.id}" data-toggle="tooltip" title="Delete"> 
                                  <i class="fa fa-trash-alt"></i> 
                                </button>`;
            }
            actionButtons += '</div>';
            return actionButtons;
          }
        }] : []
      ] ,
      drawCallback: () => {
        this.bindActionEvents();
      },
      language: { 
        emptyTable: 'No data available', 
        zeroRecords: 'No matching records found'
      }
    };
  }
  loadData(dataTablesParameters?: any, callback?: any) {
    this.eventTypeService.eventTypeList(dataTablesParameters).subscribe((res: any) => {

      this.tableBody = res.data 
      if(callback){
        callback({
          recordsTotal: res?.recordsTotal,
          recordsFiltered: res?.recordsFiltered,
          data: res?.data,
        });
      }
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 200);
    },
    (error: any) => {
      this.toastr.showError('Error occurred while fetching data');
    });
  }
  reloadTable() {
    this.datatableElement?.dtInstance?.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  bindActionEvents() {
    const table = document.querySelector('.table-responsive');
    if (table) {
      table.removeEventListener('click', this.boundHandleTableClick);
      table.addEventListener('click', this.boundHandleTableClick);
    }
    ($('[data-toggle="tooltip"]') as any).tooltip();
  }

  handleTableClick(event: any) {
    const target = event.target.closest('button');
    if (!target) return;
    const id = target.getAttribute('data-id');
    if (target.classList.contains('action-edit')) {
        this.addEditEventType(id);
    } else if (target.classList.contains('action-delete')) {
      this.delete(Number(id));
    }
  }

  async addEditEventType( id: any) {
    const selectedObj = this.tableBody.find((holiday: any) => holiday.id == id); 
    const modalRef = this.modalService.open(EventTypeModelComponent, {
      size: 'sm',
      backdrop: true,
      windowClass: 'duplicate-modal-section latest-design-modal',
      backdropClass: 'duplicate-modal-backdrop'
    });
  
    modalRef.componentInstance.selectedObj = selectedObj; // Pass selectedObj here

    await modalRef.result.then((res) => {
      if(res?.status){
        this.reloadTable();
      }
    })
  }
  
  delete(id:number){
    let c = confirm("Are you sure you want to delete it ?");
    if(c){
      this.eventTypeService.deleteRecord(id).pipe(takeUntil(this.$destroy)).subscribe((res:any) => {              
        if(res.status){
          this.toastr.showSuccess(res?.message)
          this.reloadTable();
        }else{
          this.toastr.showError(res?.message)
        }
      },
      (error: any) => {
        this.toastr.showError(error?.message ?? error?.error?.message);
      });          
    }
  } 

}
