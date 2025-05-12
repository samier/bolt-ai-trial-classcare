import { Component, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { LeaveManagmentService } from '../../leave-management/leave-managment.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-leave-list',
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.scss'],
})
export class LeaveListComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody: any;
  p: number = 1;
  reasonForRejection = '';
  type: number = 1;
  title = 'appBootstrap';
  closeResult: string = '';
  public branch = window.localStorage?.getItem('branch');
  user_id = null;
  constructor(
    private leaveManagementSerivce: LeaveManagmentService,
    public datePipe: DatePipe,
    private activatedRouteService: ActivatedRoute
  ) {}

  URLConstants = URLConstants;
  ngOnInit(): void {
    this.user_id = this.activatedRouteService.snapshot.params['id'];
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.getList(dataTablesParameters, callback);
      },
      columns: [
        { data: 'id' },
        // { data: 'name' },
        { data: 'leave_type' },
        { data: 'start_date' },
        { data: 'end_date' },
        { data: 'status' },
      ],
    };
    $('#mymodal').css('z-index', '0');
  }

  getList(dataTablesParameters?: any, callback?: any) {
    Object.assign(dataTablesParameters, { faculty_id: this.user_id });
    this.leaveManagementSerivce
      .getUserListById(dataTablesParameters)
      .subscribe((resp: any) => {
        this.tbody = resp.data;
        callback({
          recordsTotal: resp.recordsTotal,
          recordsFiltered: resp.recordsFiltered,
          data: [],
        });
      });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  paginatedRecords(url: any): void {
    this.leaveManagementSerivce.paginatedRecords(url).subscribe((res: any) => {
      this.tbody = res.data;
    });
  }

  trackByFn(index: any, item: any) {
    return item.id; // or item.id
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }
}
