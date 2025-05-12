import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { HostelManagementService } from '../hostel-management.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-floor',
  templateUrl: './floor.component.html',
  styleUrls: ['./floor.component.scss']
})
export class FloorComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  @ViewChild('createMdl') createMdl: ElementRef | undefined;
  wingId: any;

  constructor(
    private HostelManagementService: HostelManagementService,
    private toastr: Toastr,
    private modalService: NgbModal,
    private router:Router,private route: ActivatedRoute,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute
  ) {
    this.wingId = this.route.snapshot.paramMap.get('id');
  }
  URLConstants = URLConstants;

  tbody: any;
  floors: any = [];
  floor: any = [];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 4,
    allowSearchFilter: true,
  };
  validationError: any = [];

  ngOnInit(): void {
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.getlist(dataTablesParameters, callback)
      },
      columns: [
        { data: 'id' },
        { data: 'hostel_name' },
        { data: 'name' },
        { data: 'action', orderable: false, searchable: false },
      ],
    };
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getlist(dataTablesParameters?: any, callback?: any) {
    this.HostelManagementService.getFloorList(dataTablesParameters, this.wingId).subscribe((resp: any) => {
      this.floors = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }
  openEditMdl(editMdl, wing = {}) {
    this.modalService.open(editMdl);
    this.floor = wing
  }

  deleteFloor(floor_id:any){
    let confirm = window.confirm('Are you sure you want to delete this record?');
    if(confirm){
      this.HostelManagementService.deleteFloor(floor_id).subscribe((resp:any)=>{
        if(resp.status){
          this.toastr.showSuccess(resp.message)
          this.reloadData()
        }
        else{
          this.toastr.showError(resp.message)
        }
      })
    }
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

}
