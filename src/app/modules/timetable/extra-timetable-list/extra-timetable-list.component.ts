import { Component, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { TimetableService } from '../timetable.service';
import { Toastr } from 'src/app/core/services/toastr';
import { DataTableDirective } from 'angular-datatables';
import { HttpResponse } from '@angular/common/http';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-extra-timetable-list',
  templateUrl: './extra-timetable-list.component.html',
  styleUrls: ['./extra-timetable-list.component.scss']
})
export class ExtraTimetableListComponent {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  constructor(
    private TimetableService: TimetableService,
    private toastr: Toastr,
    public CommonService: CommonService
  ) {
    
  }
  
  URLConstants = URLConstants;
  currentDate:string | null = null;
  checkDate = true;
  loading = false;
  format = ''
  tbody:any = [];

  
  isOpenByClick: boolean = true

  pdfLoading= false;
  excelLoading= false;

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
      columns: [
        { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
        { data: 'date', },
        { data: 'batch', name: 'batch.name' },
        { data: 'lecture_time', searchable: false},
        { data: 'week_day'},
        { data: 'teacher_name' },
        { data: 'subject', name: 'subject.name' },
        { data: 'room', name: 'room.room.name' },
        { data: 'action', orderable: false, searchable: false },
      ],
    };
  }
  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }
  loadData(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {
      ...dataTablesParameters,
      date: this.currentDate,
    };

    this.TimetableService.getExtraLectureTimetableList(dataTablesParameters).subscribe(
      (resp: any) => {
        this.tbody = resp.data;
        callback ? callback({
          recordsTotal: resp.recordsTotal,
          recordsFiltered: resp.recordsFiltered,
          data: [],
        }) : null;
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

  download(format:any){
    if(format == 'pdf'){
      this.pdfLoading = true;
    }
    if(format == 'excel'){
      this.excelLoading = true;
    }
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      let dataTablesParameters = {
        ...dtInstance.ajax.params(),
        date: this.currentDate,
        length: -1,
      };
      this.TimetableService.downloadExtraLecture(dataTablesParameters, format).subscribe((response:  HttpResponse<any>) => {
        this.downloadFile(response, 'proxy-teacher-timetable', format)
        this.pdfLoading = false;
        this.excelLoading = false;
       }, (error:any) =>{
        console.log(error);
        this.pdfLoading = false;
        this.excelLoading = false;
       }) 
    });
  }

  downloadFile(res: any,file: any, format:any) {
    if(this.tbody.length == 0){
      return this.toastr.showInfo('There is no records','INFO');
    }
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if(format == 'pdf'){
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
    }else{
      let a = document.createElement('a');
      a.download = fileName;
      a.href =  pdfSrc
      a.click();
    }
  }



  handleDateChange(){
    this.reloadData()
  }

  delete(id:any){
    let confirm = window.confirm('Are you sure you want to delete this record?')
    if(confirm){
      let data = {
        extra_lecture_id : id,
      }
        this.TimetableService.clearExtraLecture(data).subscribe((resp:any) => {
          if(resp.status){
            this.toastr.showSuccess(resp.message)
            this.reloadData();
          }else{
            this.toastr.showError(resp.message)
          }
        }, (error:any) => {
          console.log(error);
        })
    }
  }

  getTime(item: any) {
    const time =
      item.substring(0, 2) <= 12
        ? item.substring(0, 5)
        : item.substring(0, 2) - 12 + item.substring(2, 5);

    const ampm = item.substring(0, 2) < 12 ? 'AM' : 'PM';

    return time + ' ' + ampm;
  }
}
