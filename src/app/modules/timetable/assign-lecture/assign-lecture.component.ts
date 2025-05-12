import { Component, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { HraService } from 'src/app/modules/hra/hra.service';
import { DataTableDirective } from 'angular-datatables';
import { TimetableService } from '../timetable.service';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-assign-lecture',
  templateUrl: './assign-lecture.component.html',
  styleUrls: ['./assign-lecture.component.scss'],
})
export class AssignLectureComponent implements OnInit {
  URLConstants = URLConstants;

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody: any;
  constructor(
    private TimetableService: TimetableService,
    private toastr: Toastr,
    private modalService: NgbModal,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
  ) {}

  
  isOpenByClick: boolean = true

  
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  ngOnInit() {
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50,100,200] ,
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      // stateSave: true,
      stateSaveCallback: function(settings,data) {
        localStorage.setItem('DataTables_' + URLConstants.ASSIGN_LECTURE, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.ASSIGN_LECTURE)
          let dataTableState = JSON.parse(state)
          return dataTableState
        } else {
          that.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.state.clear();
          });
          return null;
        }
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
        { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
        { data: 'section_name', name: 'section.name' },
        { data: 'class_name',  name: 'class.name' },
        { data: 'batch_name',  name: 'batch.name' },
        { data: 'subjects', name: 'lecture_subjects.subject.name',  width: '300px', orderable: false },
        { data: 'action', orderable: false, searchable: false },
      ],
    };
  }


  loadData(dataTablesParameters?: any, callback?: any) {
    this.TimetableService.SubjectLecturesList(dataTablesParameters).subscribe(
      (resp: any) => {
        this.tbody = resp.data;
        callback
          ? callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: [],
            })
          : null;
          setTimeout(() => {
            this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.columns.adjust();
            });
          }, 10);
      }
    );
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }


  
  deleteLecture(lecture_id: any) {
    var result = confirm('Are you sure you want delete this record?');
    if (result == true) {
      this.TimetableService.deleteSubjectLectures(lecture_id).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.toastr.showSuccess(resp.message);
            this.reloadData();
          } else {
            this.toastr.showError(resp.message);
          }
        }
      );
    }
  }

  
}
