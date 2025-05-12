import { Component, ViewChild, ElementRef } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../transport.service';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
import { Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Toastr } from 'src/app/core/services/toastr';
@Component({
  selector: 'app-area-list',
  templateUrl: './area-list.component.html',
  styleUrls: ['./area-list.component.scss']
})
export class AreaListComponent {

  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  @ViewChild('createMdl') createMdl: ElementRef | undefined;

  URLConstants = URLConstants;
  routes: any = [];
  areaList:any = []
  isAreaCreate: boolean = false;
  selectedArea: any = null;
  isEditing: boolean = false;
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    private transportService: TransportService,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    private modalService: NgbModal,
    private toastr: Toastr,
  ) { }

   //#endregion constructor


  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initAreaList()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  initAreaList () {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ordering: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadAreaList(dataTablesParameters, callback);
      },
      columns: [
        { 
          title: "Sr. No.",
          data: 'id'
        },
        { 
          title: "Area Name",
          data: 'name'
        },
        { 
          title: "Action",
          data: 'name'
        },
      ],
      // language: {
      //   info: '',
      //   zeroRecords: 'No records found!'
      // }
    };
  }

  loadAreaList(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {
      ...dataTablesParameters,
    };
    this.transportService.getAreaList(
      dataTablesParameters
    ).subscribe((resp: any) => {
      this.areaList = resp?.data?.original.data
      callback({
        recordsTotal: resp?.data?.original.recordsTotal,
        recordsFiltered: resp?.data?.original.recordsFiltered,
        data: [],
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  openModel(createMdl,id:any) { 
    if(id)
    {
      this.transportService.showDetail(id).subscribe((res: any) => {
        this.selectedArea = res?.data;
        this.isEditing = true;
        this.modalService.open(createMdl).result.finally(() => {
          this.isAreaCreate = false;
          this.selectedArea = null;
          this.isEditing = false;
        });
      });
    }else
    {
      this.isAreaCreate = true
      this.selectedArea = null;
      this.isEditing = false;
      this.modalService.open(createMdl);
      this.isAreaCreate  = false;
    }    
  }

  remove(id:any)
  {
    if(confirm('are you sure you want to delete this area ?')){
      this.transportService.deleteArea(id).subscribe((res:any) => { 
        if(res?.status == true)
        {
          this.toastr.showSuccess(res.message);
          this.reloadData(); 
        }else
        {
          this.toastr.showError(res.message);
        }
      },(err:any)=>{
        this.toastr.showError(err.error.message);
      }); 
    }
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  onCheckboxChange(event: any) {
    const checkboxElement = event.target;
    const isChecked = checkboxElement.checked;
    const checkboxId = checkboxElement.id;
    
    if (isChecked) {
      this.updateAreaStatus(checkboxId, 1);
    } else {
      this.updateAreaStatus(checkboxId, 0);
    }
  }

  updateAreaStatus(id:number, status:number): void {
    if(id){
      const param = {status:status};
      this.transportService.updateAreaStatus(param, id).subscribe((res:any) => {
        if(res.success == true) {
          this.toastr.showSuccess(res.message);
        } else {
          this.toastr.showError(res.message);
        }
        this.reloadData();        
      },(err:any)=>{
        this.toastr.showError(err.error.message);
        this.reloadData();
      }); 
    }
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  //#endregion Private methods
}
