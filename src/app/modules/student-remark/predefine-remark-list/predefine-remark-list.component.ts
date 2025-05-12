import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { StudentRemarkService } from '../student-remark.service';
import { PredefineRemarkFormComponent } from '../predefine-remark-form/predefine-remark-form.component';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-predefine-remark-list',
  templateUrl: './predefine-remark-list.component.html',
  styleUrls: ['./predefine-remark-list.component.scss']
})
export class PredefineRemarkListComponent implements OnInit {
  //#region Public | Private Variables
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;

  @ViewChild('titleMdl') walletMdl: ElementRef | undefined;

  tbody: any;

//#endregion Public | Private Variables

// --------------------------------------------------------------------------------------------------------------
// #region constructor
// --------------------------------------------------------------------------------------------------------------


  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    public studentRemarkService: StudentRemarkService,
    private toaster:Toastr,
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {        
    this.initDatatable();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  initDatatable()
  {
    this.dtOptions = {      
      pagingType: 'full_numbers',
      lengthMenu:[50,100,200],
      pageLength: 50,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      order: [[1, 'asc']],

      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        {data: 'remark_type'},
        {data: 'remark'},
        {data: 'action', orderable: false, searchable: false},
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {    
    this.studentRemarkService.getRemarkTitle(dataTablesParameters).subscribe((resp: any) => {   
      this.tbody = resp?.data;
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
    });
  }

  deleteTitle(id:any)
  {
    let confirm = window.confirm('Are you sure you want to delete?')
    if(confirm){
      this.studentRemarkService.deleteTitle(id).subscribe((res: any) => {
        if(res.status){
          this.reloadData();
          this.toaster.showSuccess(res.message);
        }else{
          this.toaster.showError(res.message);
        }
      });
    }
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  openTitleMdl(isEdit:boolean = false , editData:any={})
  {
    const modalRef = this.modalService.open(PredefineRemarkFormComponent,{
      size: 'md',
      windowClass: 'duplicate-modal-section',
      backdropClass: 'duplicate-modal-backdrop',
      backdrop: true,
    });
    modalRef.componentInstance.isEdit = isEdit
    modalRef.componentInstance.editData = editData

    modalRef.result.then((response: any) => {
      if(response.status) {
        this.reloadData();
      }
    })
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------


  //#endregion Private methods
}