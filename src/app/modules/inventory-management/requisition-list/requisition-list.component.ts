import { Component, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { InventoryService } from '../inventory.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { DateFormatService } from 'src/app/service/date-format.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { priorities, requisitionsFor, requisitionStatus } from 'src/app/common-config/static-value';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-requisition-list',
  templateUrl: './requisition-list.component.html',
  styleUrls: ['./requisition-list.component.scss']
})
export class RequisitionListComponent {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  isOpenByClick: boolean = true
  tbody: any;

  requisition_modal_data: any;
  reasonForRejection: any = '';

  URLConstants = URLConstants;

  filter: any = false;
  filterCount: any = 0;
  filterForm: FormGroup | any;

  requisitions_for = requisitionsFor
  priorities = priorities
  item_types:any = []
  items:any = []
  measurement_types:any = []
  status = requisitionStatus

  constructor(private inventorySerivce: InventoryService,
    private modalService: NgbModal,
    public CommonService: CommonService,
    public dateFormateService: DateFormatService,
    private formBuilder: FormBuilder,
    private toastr: Toastr,
  ) {
  }




  ngOnInit(): void {
    this.initForm()
    this.getItemTypes()
    this.getMeasurementTypes();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: false,
      // scrollX:true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
        { data: 'requisition_title' },
        { data: 'requisition_date' },
        { data: 'requisition_for' },
        { data: 'name', name:'name' },
        { data: 'expected_date' },
        { data: 'priority' },
        { data: 'status' },
        { data: 'approve_reject_by_user' },
        { data: 'action', orderable: false, searchable: false }
      ],
      order: [[1, 'desc']]
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {
      ...dataTablesParameters, ...this.filterForm.value
    }
    this.inventorySerivce.getRequisitionList(dataTablesParameters).subscribe((resp: any) => {
      this.tbody = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 100);
    });

  }


  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  delete(id: number) {
    let c = confirm("Are you sure, You want to delete it ?");
    if (c) {
      this.inventorySerivce.deleteRequisition(id).subscribe((res: any) => {
        if(res.status){
          this.toastr.showSuccess(res.message);
        }else{
          this.toastr.showError(res.message);
        }
        this.reloadData();
      });
    }
  }

  open(content: any, id: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {

      //this.approve(id,2);
      let data = { id: id, status: 2, reject_reason: this.reasonForRejection };
      this.inventorySerivce.approveOrRejectRequisition(data).subscribe((res: any) => {
        if(res.status){
          this.toastr.showSuccess(res.message)
        }
        this.reloadData();
      });
    }, (reason) => {
    });
  }


  // to display requisition informations
  open2(content: any, id: any) {
    this.inventorySerivce.getRequisitionFullDetail(id).subscribe((res: any) => {
      this.requisition_modal_data = res.data;
      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
        let data = { id: id, status: 2, reject_reason: this.reasonForRejection }
      }, (reason) => {
      });
    });
  }

  approve(id: number, status: number) {
    if (confirm("Are you sure, You want to approve the selected requisition ?")) {
      let data = { id: id, status: status }
      this.inventorySerivce.approveOrRejectRequisition(data).subscribe((res: any) => {
        if(res.status){
          this.toastr.showSuccess(res.message)
        }
        this.reloadData();
      });
    }
  }

  getItemTypes(){
    this.inventorySerivce.getItemTypeList().subscribe((resp:any) => {
      this.item_types = resp.data
    })
  }

  getMeasurementTypes(){
    this.inventorySerivce.getMeasurementTypeList().subscribe((resp:any) => {
      this.measurement_types = resp.data
    })
  }

  handleItemTypeChange(){
    this.filterForm.controls['item'].setValue(null); 
    this.inventorySerivce.fetchItemList(this.filterForm.value.item_type).subscribe((resp:any) => {
      this.items = resp.data.map((el:any) => {
        return {id: el.id, name:el.item_name}
      })
    });     
  }

  countFilters() {
    this.filterCount = 0;
    Object.keys(this.filterForm.value).forEach((item: any) => {
      if ((this.filterForm.value[item] != '' && this.filterForm.value[item] != null)) {
        this.filterCount++;
      }
    })
    if (this.filterForm.value?.requisition_date && this.filterForm.value?.requisition_date?.startDate == null) {
      this.filterCount--;
    }
    if (this.filterForm.value?.expected_date && this.filterForm.value?.expected_date?.startDate == null) {
      this.filterCount--;
    }
  }

  clearAll() {
    this.filterForm.reset();
    this.items = [];
    this.countFilters()
    this.reloadData();
  }

  initForm() {
    this.filterForm = this.formBuilder.group({
      requisition_date: [],
      requisition_for: [null],
      expected_date: [],
      priority: [],
      item_type: [],
      item: [],
      measurement_type_id: [],
      status: [],
    });
    this.countFilters()
  }
}
